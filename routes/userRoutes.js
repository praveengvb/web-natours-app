const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Routes
const router = express.Router(); // create router for each user

// Signup users
router.post('/signup', authController.signup);
// login/logout
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware for routes after this point
router.use(authController.protect);

// All below routes should be authenticated
router.patch('/updateMyPassword/', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// Routes after this point are protected and restricted to admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
