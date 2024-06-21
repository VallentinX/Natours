import AppError from '../utils/appError.js';

const handleCastErrorDB = error => {
  const message = `Invalid ${error.path} : ${error.value}.`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = error => {
  const key = {...Object.keys(error.keyValue)};
  const value = {...Object.values(error.keyValue)};
  const message = `Duplicate '${key[0]}' field, the '${value[0]}' is taken. Use another ${key[0]}!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(value => value.message);
  const message = `Invalid input data! ${errors.join(' * ')}`;

  return new AppError(message, 400);
};

const handlJWTError = () => new AppError('Invalid token, log in again!', 401);

const handlExpiredJWT = () => new AppError('Token has expired, log in again!', 401);

const errorDev = (error, request, response) => {
  if (request.originalUrl.startsWith('/api'))
    return response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });

  console.error('🔴 Error! 🔴', error);

  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message,
    code: error.statusCode,
  });
};

const errorProd = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    if (error.isOperational)
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });

    console.error('🔴 Error! 🔴', error);

    return response.status(500).json({
      status: 'Error!',
      message: 'Something went wrong!',
    });
  }
  if (error.isOperational)
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
      code: error.statusCode,
    });

  console.error('🔴 Error! 🔴', error);

  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!',
    code: error.statusCode,
  });
};

export default (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'Error!';

  if (process.env.NODE_ENV === 'development') errorDev(error, request, response);
  if (process.env.NODE_ENV === 'production') {
    let err = JSON.stringify(error);
    err = JSON.parse(err);
    // err.message = error.message;

    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handlJWTError(err);
    if (err.name === 'TokenExpiredError') err = handlExpiredJWT();

    errorProd(err, request, response);
  }
};
