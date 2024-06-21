/** Models */

/** Developer's Models */
import Review from '../models/reviewModel.js';
import {
  handleGetAll,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
} from './handlerFactory.js';

/** Others */

/** Route Handlers (CallBack Functions) */
/** Get All */
export const getAllReviews = handleGetAll(Review);

/** Get */
export const getReview = handleGet(Review);

/** Post */
export const createReview = handleCreate(Review);

export const setToursUserIds = (request, response, next) => {
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;

  next();
};

/** Patch */
export const updateReview = handleUpdate(Review);

/** Delete */
export const deleteReview = handleDelete(Review);
