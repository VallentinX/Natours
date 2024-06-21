/** Modules */
import express from 'express';

/** Developer's Modules */
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
  getMe,
} from '../controllers/userController.js';
import {
  signUp,
  logIn,
  forgotenPassword,
  resetPassword,
  protectRoutes,
  updatePassword,
  restrictRoute,
  logOut,
} from '../controllers/authController.js';

/** Others */

/** Tours Mounting */
const router = express.Router();

/** Users Route: Authentication */
router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/logout', logOut);
router.post('/forgot-password', forgotenPassword);
router.patch('/reset-password/:token', resetPassword);
// router.patch();

router.use(protectRoutes);

/** Get Me */
router.get('/me', getMe, getUser);

/** Users Route: Update Users */
router.patch('/update-user-password', updatePassword);
router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/delete-me', deleteMe);
router.use(restrictRoute('admin'));

/** Users Route: Get All & Post */
router.route(`/`).get(getAllUsers).post(createUser);

/** Users Route: Get & Patch & Delete */
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

/** Exports */
export default router;
