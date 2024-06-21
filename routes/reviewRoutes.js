/** Modules */
import express from 'express';

/** Developer's Modules */
import {
  getAllReviews,
  getReview,
  setToursUserIds,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewsController.js';
import {protectRoutes, restrictRoute} from '../controllers/authController.js';

/** Others */

/** Tours Mounting */
const router = express.Router({mergeParams: true});

router.use(protectRoutes);

/** Tour Route: Get All & Post  */
router.route('/').get(getAllReviews).post(restrictRoute('user'), setToursUserIds, createReview);

/** Tour Route: Get & Patch & Delete */
router
  .route('/:id')
  .get(getReview)
  .patch(restrictRoute('user', 'admin'), updateReview)
  .delete(restrictRoute('user', 'admin'), deleteReview);

/** Exports */
export default router;
