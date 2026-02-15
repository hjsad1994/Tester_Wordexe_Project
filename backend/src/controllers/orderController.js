const orderService = require('../services/orderService');
const { ValidationError } = require('../errors');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendCreated, sendSuccess } = require('../utils/responseHelper');

exports.createOrder = asyncHandler(async (req, res) => {
	const order = await orderService.createOrder(req.body, {
		userId: req.userId,
	});
	sendCreated(res, order, 'Order created successfully');
});

exports.getOrderById = asyncHandler(async (req, res) => {
	const accessToken = String(req.query?.token || '').trim();
	if (!accessToken) {
		throw new ValidationError('token is required');
	}

	const order = await orderService.getOrderById(req.params.id, {
		accessToken,
	});
	sendSuccess(res, order, 'Order retrieved successfully');
});

exports.getAdminOrders = asyncHandler(async (req, res) => {
	const { page, limit, status, includeDeleted } = req.query;
	const result = await orderService.listOrders({
		page: Number(page) || 1,
		limit: Number(limit) || 20,
		status,
		includeDeleted: includeDeleted === 'true',
	});
	sendSuccess(res, result, 'Orders retrieved successfully');
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
	const nextStatus = String(req.body?.status || '').trim();
	if (!nextStatus) {
		throw new ValidationError('status is required');
	}

	const order = await orderService.updateOrderStatus(
		req.params.id,
		nextStatus,
		{
			userId: req.userId,
		},
	);

	sendSuccess(res, order, 'Order status updated successfully');
});

exports.softDeleteOrder = asyncHandler(async (req, res) => {
	const order = await orderService.softDeleteOrder(req.params.id, {
		userId: req.userId,
		reason: req.body?.reason,
	});

	sendSuccess(res, order, 'Order archived successfully');
});
