const express = require('express');
const authController = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../validators/authValidator');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authController.logout);

module.exports = router;
