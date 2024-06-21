/** Modules */

/** Developer's Modules */
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';

export const getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find();

  response.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findOne({slug: request.params.slug}).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  const readableTitle = request.params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!tour) {
    return next(new AppError(`${readableTitle} tour does not exist!`, 404));
  }

  response.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

export const logInForm = function (request, response) {
  response.status(200).render('login', {
    title: 'Log into your account!',
  });
};

export const getAccount = function (request, response) {
  response.status(200).render('account', {
    title: 'Your account!',
  });
};

export const getMyTours = catchAsync(async (request, response, next) => {
  const booking = await Booking.find({user: request.user.id});
  const tourIDs = booking.map(tourId => tourId.tour);
  const tours = await Tour.find({_id: {$in: tourIDs}});

  response.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

export const updateUserData = catchAsync(async (request, response) => {
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    {
      name: request.body.name,
      email: request.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  response.status(200).render('account', {
    title: 'Your account!',
    user: updatedUser,
  });
});
