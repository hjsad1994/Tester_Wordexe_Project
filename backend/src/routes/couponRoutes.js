const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');
const optionalAuthMiddleware = require('../middlewares/optionalAuthMiddleware');
const requireRole = require('../middlewares/requireRole');

// Public/Auth routes
router.get('/available', optionalAuthMiddleware, couponController.getAvailableCoupons);
router.post('/validate', authMiddleware, couponController.validateCoupon);

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), couponController.getAllCoupons);
router.get('/:id', authMiddleware, requireRole('admin'), couponController.getCouponById);
router.post('/', authMiddleware, requireRole('admin'), couponController.createCoupon);
router.put('/:id', authMiddleware, requireRole('admin'), couponController.updateCoupon);
router.delete('/:id', authMiddleware, requireRole('admin'), couponController.deleteCoupon);

module.exports = router;
