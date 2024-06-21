/** Modules */
import {Router} from 'express';

/** Developer's Modules */
import {
  getOverview,
  getTour,
  logInForm,
  getAccount,
  updateUserData,
  getMyTours,
} from '../controllers/viewsController.js';
import {protectRoutes, isLogedIn} from '../controllers/authController.js';
import {createBookingCheckout} from '../controllers/bookingController.js';

/** Others */
const router = Router();

router.get('/', createBookingCheckout, isLogedIn, getOverview);
router.get('/tour/:slug', isLogedIn, getTour);
router.get('/login', isLogedIn, logInForm);
router.get('/me', isLogedIn, getAccount);
router.get('/my-tours', createBookingCheckout, protectRoutes, getMyTours);
router.post('/submit-user-data', protectRoutes, updateUserData);

export default router;
