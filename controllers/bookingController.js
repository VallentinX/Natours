/** Models */
import Stripe from 'stripe';

/** Developer's Models */
import Tour from '../models/tourModel.js';
import catchAsync from '../utils/catchAsync.js';
import Booking from '../models/bookingModel.js';
import {
  handleGetAll,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
} from './handlerFactory.js';

/** Others */

/** Route Handlers (CallBack Functions) */
export const getAllBookings = handleGetAll(Booking);
export const getBooking = handleGet(Booking);
export const createBooking = handleCreate(Booking);
export const updateBooking = handleUpdate(Booking);
export const deleteBooking = handleDelete(Booking);

export const getCheckoutSession = catchAsync(async (request, response, next) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const tour = await Tour.findById(request.params.tourID);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${request.protocol}://${request.get('host')}/my-tours/?tour=${request.params.tourID}&user=${request.user.id}&price=${tour.price}`,
    cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
    customer_email: request.user.email,
    client_reference_id: request.params.tourID,
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            description: tour.summary,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  response.status(200).json({
    status: 'Success!',
    session,
  });
});

export const createBookingCheckout = catchAsync(async (request, response, next) => {
  const {tour, user, price} = request.query;

  if (!tour && !user && !price) return next();

  await Booking.create({tour, user, price});

  response.redirect(request.originalUrl.split('?')[0]);
});
