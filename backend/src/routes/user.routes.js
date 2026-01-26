const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

const updateValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

router.get('/', userController.getAllUsers);
router.get('/:id', idValidation, validate, userController.getUserById);
router.put('/:id', idValidation, updateValidation, validate, userController.updateUser);
router.delete('/:id', idValidation, validate, userController.deleteUser);

module.exports = router;
