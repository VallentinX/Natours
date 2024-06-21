/** Models */
import multer from 'multer';
import sharp from 'sharp';

/** Developer's Models */
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {handleGetAll, handleGet, handleUpdate, handleDelete} from './handlerFactory.js';

/** Others */
const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, callBackFunction) => {
  if (file.mimetype.startsWith('image')) callBackFunction(null, true);
  else
    callBackFunction(
      new AppError('The file you are trying to upload is not an image!', 400),
      false
    );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (request, response, next) => {
  if (!request.file) return next();

  console.log(request.user._id);

  request.file.filename = `user-${request.user._id}-${Date.now()}.jpeg`;

  await sharp(request.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${request.file.filename}`);

  next();
});

const filterObj = (object, ...allowedFields) => {
  const newObject = {};

  Object.keys(object).forEach(el => {
    if (allowedFields.includes(el)) newObject[el] = object[el];
  });

  return newObject;
};

export const getAllUsers = handleGetAll(User);

export const getUser = handleGet(User);

/** Post */
export function createUser(request, response) {
  response.status(500).json({
    status: 'Error',
    message: 'createUser ROUTE is not defined!',
  });
}

export const updateUser = handleUpdate(User);

export const deleteUser = handleDelete(User);

export const updateMe = catchAsync(async (request, response, next) => {
  if (request.body.password || request.body.confirmPassword)
    return next(
      new AppError('This route is not for password updates. Please use /update-user-password!', 400)
    );

  const filteredBody = filterObj(request.body, 'name', 'email');
  if (request.file) filteredBody.photo = request.file.filename;

  const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    status: 'Success!',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, {active: false});

  response.status(204).json({
    status: 'Success!',
    data: null,
  });
});

/** Get Me */
export function getMe(request, response, next) {
  request.params.id = request.user.id;

  next();
}
