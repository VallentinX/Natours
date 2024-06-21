/** Modules */
import express, {static as static_, json, urlencoded} from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import {contentSecurityPolicy} from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import cookieParser from 'cookie-parser';
import compression from 'compression';

/** Developer's Modules */
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import AppError from './utils/appError.js';
import ErrorHandler from './controllers/errorController.js';
import viewRouter from './routes/viewRoutes.js';

/** Others */
import {version} from './utils/server.js'

const app = express();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

/** Serving Static Files */
app.use(static_(join(__dirname, 'public')));

/** MiddleWares */
/** Security HTTP Headers */
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.2.3/axios.min.js',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'ws://localhost:1234/',
  'ws://localhost:8000/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

/** Development Environment */
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

/** Request Limiter For The same API */
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'You reached maximum request, please try again in an hour!',
});

app.use('/api', limiter);

/** Body Parser. (request.body) */
app.use(json({limit: '10kb'}));
app.use(urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

/** Data Sanitization: Against NoSQL Query Injection */
app.use(mongoSanitize());

/** Data Sanitization: Against XSS */
app.use(xss());

/** Prevent Parameter Pollution */
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
      'name',
    ],
  })
);

app.use(compression());

app.use(`/`, viewRouter);

/** Tours Mounting */
app.use(`/api/${version}/tours`, tourRouter);

/** Users Mounting */
app.use(`/api/${version}/users`, userRouter);

/** Reviews Mounting */
app.use(`/api/${version}/reviews`, reviewRouter);

/** Booking Mounting */
app.use(`/api/${version}/booking`, bookingRouter);

/** Unexisting Routes / URLs */
app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on the server!`, 404));
});

app.use(ErrorHandler);

export default app;
