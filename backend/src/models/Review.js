const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: [true, "Product is required"],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
		rating: {
			type: Number,
			required: [true, "Vui lòng chọn số sao đánh giá"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
		},
		comment: {
			type: String,
			required: [true, "Vui lòng nhập nội dung đánh giá"],
			trim: true,
			minlength: [10, "Đánh giá phải có ít nhất 10 ký tự"],
			maxlength: [1000, "Đánh giá không được vượt quá 1000 ký tự"],
		},
		images: [
			{
				publicId: { type: String, required: true },
				url: { type: String, required: true },
			},
		],
		helpfulBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		helpfulCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
// Fast lookup by product, sorted by newest
reviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
