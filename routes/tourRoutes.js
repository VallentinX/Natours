/** Modules */
import {Router} from 'express';

/** Developer's Modules */
import {
  aliasTopTours,
  getAllTours,
  getDistances,
  getTour,
  getTourStats,
  getMonthlyPlan,
  handleToursWithin,
  createTour,
  updateTour,
  deleteTour,
  uploadTourImages,
  resizeTourImages,
} from '../controllers/tourController.js';
import {protectRoutes, restrictRoute} from '../controllers/authController.js';
import reviewRouter from './reviewRoutes.js';

/** Others */

/** Tours Mounting */
const router = Router();

router.use('/:tourId/review', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protectRoutes, restrictRoute('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(handleToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

/** Tour Route: Get All & Post  */
router
  .route('/')
  .get(getAllTours)
  .post(protectRoutes, restrictRoute('admin', 'lead-guide'), createTour);

/** Tour Route: Get & Patch & Delete */
router
  .route('/:id')
  .get(getTour)
  .patch(
    protectRoutes,
    restrictRoute('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protectRoutes, restrictRoute('admin', 'lead-guide'), deleteTour);

/** Exports */
export default router;
