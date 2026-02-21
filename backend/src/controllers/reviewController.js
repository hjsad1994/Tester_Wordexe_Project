const reviewService = require("../services/reviewService");
const { sendSuccess, sendCreated } = require("../utils/responseHelper");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getReviews = asyncHandler(async (req, res) => {
	const { productId } = req.params;
	const { page, limit } = req.query;
	const options = {
		page: parseInt(page) || 1,
		limit: Math.min(parseInt(limit) || 10, 50),
	};

	// req.userId is set by optionalAuthMiddleware (may be undefined)
	const result = await reviewService.getReviews(
		productId,
		options,
		req.userId || null,
	);
	sendSuccess(res, result, "Reviews retrieved successfully");
});

exports.createReview = asyncHandler(async (req, res) => {
	const { productId } = req.params;
	const review = await reviewService.createReview(
		req.userId,
		productId,
		req.body,
		req.files || [],
	);
	sendCreated(res, review, "Đánh giá đã được tạo thành công");
});

exports.deleteReview = asyncHandler(async (req, res) => {
	await reviewService.deleteReview(req.params.id, req.userId, req.userRole);
	sendSuccess(res, null, "Đánh giá đã được xóa thành công");
});

exports.toggleHelpful = asyncHandler(async (req, res) => {
	const result = await reviewService.toggleHelpful(req.params.id, req.userId);
	sendSuccess(res, result, "Cập nhật thành công");
});
