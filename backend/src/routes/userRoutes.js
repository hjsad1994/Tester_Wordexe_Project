const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, userController.updateMe);
router.post(
  '/me/avatar',
  authMiddleware,
  uploadMiddleware.uploadAvatarImage,
  userController.uploadAvatar
);

module.exports = router;
