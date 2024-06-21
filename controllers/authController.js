/** Models */
import {createHash} from 'crypto';
import {promisify} from 'util';
import jwt from 'jsonwebtoken';

/** Developer's Models */
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';

import { version } from '../utils/server.js';

/** Others */
const signToken = id =>
  jwt.sign({id}, process.env.JSONTOKEN, {
    expiresIn: process.env.JWTEXPIRETIME,
  });

const sendToken = (user, statusCode, response) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  response.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  response.status(statusCode).json({
    status: 'Success!',
    token,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
  });

  const url = `${request.protocol}:/${request.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  sendToken(newUser, 201, response);
});

export const logIn = catchAsync(async (request, response, next) => {
  const {email, password} = request.body;

  if (!email || !password) return next(new AppError('Email or password field empty!', 400));

  const user = await User.findOne({email}).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Email or password incorrect!', 401));

  sendToken(user, 200, response);
});

export function logOut(request, response) {
  response.cookie('jwt', 'Logged out!', {
    expire: new Date(Date.now() * 10 * 1000),
    httpOnly: true,
  });
  response.status(200).json({status: 'Success!'});
}

export const protectRoutes = catchAsync(async (request, response, next) => {
  let token;

  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer'))
    token = request.headers.authorization.split(' ')[1];
  else if (request.cookies.jwt) token = request.cookies.jwt;

  if (!token) return next(new AppError('You must be logged in to get access!', 401));

  const decoded = await promisify(jwt.verify)(request.cookies.jwt, process.env.JSONTOKEN);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) return next(new AppError('The user with this token does not exist!', 401));
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('You recently changed your password, please log in again!', 401));

  request.user = currentUser;
  response.locals.user = currentUser;

  next();
});

export async function isLogedIn(request, response, next) {
  if (request.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(request.cookies.jwt, process.env.JSONTOKEN);
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) return next();
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      response.locals.user = currentUser;

      return next();
    } catch (error) {
      return next();
    }
  }

  next();
}

export function restrictRoute(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(
        new AppError('Only lead-guide and admin staff are authorized to perform this action!', 403)
      );

    next();
  };
}

export const forgotenPassword = catchAsync(async (request, response, next) => {
  const user = await User.findOne({email: request.body.email});

  if (!user) return next(new AppError("There's no user with that email address!", 404));

  const resetToken = user.createPasswordResetToken();

  await user.save({validateBeforeSave: false});

  try {
    const resetURL = `${request.protocol}://${request.get('host')}/api/${version}/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    response.status(200).json({
      status: 'success',
      message: `An email has been sent to ${user.email}!`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({validateBeforeSave: false});

    return next(new AppError('We were unable to send you an email, please try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (request, response, next) => {
  const hashedToken = createHash('sha256').update(request.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: {$gt: Date.now()},
  });

  if (!user) return next(new AppError('Token is invalid or has expired!', 400));

  user.password = request.body.password;
  user.confirmPassword = request.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendToken(user, 200, response);
});

export const updatePassword = catchAsync(async (request, response, next) => {
  const user = await User.findById(request.user.id).select('+password');

  if (!(await user.correctPassword(request.body.currentPassword, user.password)))
    return next(new AppError('The password you introduced is wrong!', 401));

  user.password = request.body.password;
  user.confirmPassword = request.body.confirmPassword;

  await user.save();

  sendToken(user, 200, response);
});
