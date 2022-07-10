const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// Start Express app
const app = express();

// app.enable('trust proxy'); // only for heroku deployment

// Define view engine for GUI
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
// Sets Access-Control-Allow-Origin header to *
app.use(cors());
// api.natours.com, front-end natorus.com
// app.use(
//   cors({
//     origin: 'http://www.natours.com/',
//   })
// );

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Serving static files from folders
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Limit requests for same API
const limiter = rateLimit({
  max: 100,
  windwosMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Development Logger
// Morgan Logger - logs to console API Request verb, route, status code, time taken by request and size of response
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser - Express.JSON middleware - convert all requests to json
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL Query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Middleware to write to console
// app.use((req, res, next) => {
//   console.log('Hello from the middleware in App👋🏻');
//   next(); // next should always be called, otherwise code will be stuck here
// });

// Test Middleware
// Adds requestTime to request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // eslint-disable-next-line no-console
  // console.log('cookie details from middleware ===>', req.cookies);
  next();
});

// 3) ROUTES

app.use('/', viewRouter); // view Router
app.use('/api/v1/tours', tourRouter); // This is a middleware. app.use is used to mount them
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handle invalid routes
app.all('*', (req, res, next) => {
  /*
  // Sending error messages in response
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl}`,
  });
  const err = new Error(
    `Can't find ${req.originalUrl} on this server!`
  );
  err.status = 'fail';
  err.statusCode = 404;
  */
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

// Error handling MIDDLEWARE, Runs module export of Error Handler
app.use(globalErrorHandler);

module.exports = app;
