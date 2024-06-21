import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

export function handleGetAll(Model) {
  return catchAsync(async (request, response, next) => {
    let filter = {};

    if (request.params.tourId) filter = {tour: request.params.tourId};

    const features = new APIFeatures(Model.find(filter), request.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    // const document = await features.query.explain();
    const document = await features.query.explain();

    response.status(200).json({
      status: 'Success!',
      resaults: document.length,
      data: {
        data: document,
      },
    });
  });
}

export function handleGet(Model, populateOption) {
  return catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);

    if (populateOption) query = await query.populate(populateOption);

    const document = await query;

    if (!document) return next(new AppError('No document found with that ID', 404));

    response.status(200).json({
      status: 'Success!',
      data: document,
    });
  });
}

export function handleCreate(Model) {
  return catchAsync(async (request, response, next) => {
    const document = await Model.create(request.body);

    response.status(201).json({
      status: 'Success!',
      data: {
        data: document,
      },
    });
  });
}

export function handleUpdate(Model) {
  return catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!document) return next(new AppError('No document found with that ID', 404));

    response.status(200).json({
      status: 'Success!',
      data: document,
    });
  });
}

export function handleDelete(Model) {
  return catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);

    if (!document) return next(new AppError('No document found with that ID', 404));

    response.status(204).json({
      status: 'Success!',
      data: null,
    });
  });
}
