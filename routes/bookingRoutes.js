/** Modules */
import express from 'express';

/** Developer's Modules */
import {
  getCheckoutSession,
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import {protectRoutes, restrictRoute} from '../controllers/authController.js';

/** Others */
const router = express.Router();

/** Tours Mounting */
router.use(protectRoutes);
router.get('/checkout-session/:tourID', protectRoutes, getCheckoutSession);
router.use(restrictRoute('admin', 'lead-guide'));

/** Tour Route: Get All & Post  */
router.route('/').get(getAllBookings).post(createBooking);

/** Tour Route: Get & Patch & Delete */

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

/** Exports */
export default router;
