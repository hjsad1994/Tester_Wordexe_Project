const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

router.post('/', orderController.createOrder);
router.get(
	'/',
	authMiddleware,
	requireRole('admin'),
	orderController.getAdminOrders,
);
router.get('/:id', orderController.getOrderById);
router.patch(
	'/:id/status',
	authMiddleware,
	requireRole('admin'),
	orderController.updateOrderStatus,
);
router.delete(
	'/:id',
	authMiddleware,
	requireRole('admin'),
	orderController.softDeleteOrder,
);

module.exports = router;
