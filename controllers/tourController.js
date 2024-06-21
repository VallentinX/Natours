/** Models */
import multer from 'multer';
import sharp from 'sharp';

/** Developer's Models */
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import {
  handleGetAll,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
} from './handlerFactory.js';

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

export const uploadTourImages = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3},
]);

export const resizeTourImages = catchAsync(async (request, response, next) => {
  if (!request.files.imageCover || !request.files.images) return next();

  request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpg`;

  await sharp(request.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${request.body.imageCover}`);

  request.body.images = [];

  await Promise.all(
    request.files.images.map(async (file, i) => {
      const fileName = `tour-${request.params.id}-${Date.now()}-${i + 1}.jpg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${fileName}`);

      request.body.images.push(fileName);
    })
  );

  next();
});

export const aliasTopTours = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

/** Route Handlers (CallBack Functions) */
/** Get All */
export const getAllTours = handleGetAll(Tour);

/** Get */
export const getTour = handleGet(Tour, {path: 'reviews'});

/** Post */
export const createTour = handleCreate(Tour);

/** Patch */
export const updateTour = handleUpdate(Tour);

/** Delete */
export const deleteTour = handleDelete(Tour);

export const getTourStats = catchAsync(async (request, response, next) => {
  const stats = await Tour.aggregate([
    {$match: {ratingsAverage: {$gte: 4.5}}},
    {
      $group: {
        _id: {$toUpper: '$difficulty'},
        numTours: {$sum: 1},
        numRatings: {$sum: '$ratingsQuantity'},
        avgRating: {$avg: '$ratingsAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice: {$max: '$price'},
      },
    },
    {$sort: {avgPrice: 1}},
    // {$match: {_id: {$ne: 'EASY'}}},
  ]);

  response.status(200).json({
    status: 'Success!',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (request, response, next) => {
  const year = +request.params.year;
  const plan = await Tour.aggregate([
    {
      $project: {
        name: 1,
        startDates: {
          $map: {
            input: '$startDates',
            as: 'date',
            in: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    {$arrayElemAt: [{$split: ['$$date', ',']}, 0]},
                    'T',
                    {$arrayElemAt: [{$split: ['$$date', ',']}, 1]},
                    'Z',
                  ],
                },
              },
            },
          },
        },
      },
    },
    {$unwind: '$startDates'},
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {$month: '$startDates'},
        numTourStarts: {$sum: 1},
        tours: {$push: '$name'},
      },
    },
    {$addFields: {month: '$_id'}},
    {$project: {_id: 0}},
    {$sort: {numTourStarts: -1}},
    {$limit: 12},
  ]);

  response.status(200).json({
    status: 'Success!',
    data: {
      plan,
    },
  });
});

export const handleToursWithin = catchAsync(async (request, response, next) => {
  const {distance, latlng, unit} = request.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distane / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(new AppError('Please provide latitude and longitude in a format lat,lng', 400));

  const tours = await Tour.find({
    startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}},
  });

  response.status(200).json({
    status: 'Success!',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

export const getDistances = catchAsync(async (request, response, next) => {
  const {latlng, unit} = request.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    next(new AppError('Please provide latitude and longitude in a format lat,lng', 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordiantes: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  response.status(200).json({
    status: 'Success!',
    data: {
      data: distances,
    },
  });
});
