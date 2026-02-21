const Review = require("../models/Review");
const Product = require("../models/Product");

class ReviewRepository {
	async create(data) {
		const review = new Review(data);
		await review.save();
		return review.populate("user", "name email avatar");
	}

	async findByProduct(productId, options = {}) {
		const { page = 1, limit = 10 } = options;
		const skip = (page - 1) * limit;

		const filter = { product: productId };

		const [reviews, total] = await Promise.all([
			Review.find(filter)
				.populate("user", "name email avatar")
				.sort("-createdAt")
				.skip(skip)
				.limit(limit),
			Review.countDocuments(filter),
		]);

		return {
			reviews,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		};
	}

	async findById(id) {
		return Review.findById(id).populate("user", "name email avatar");
	}

	async findByUserAndProduct(userId, productId) {
		return Review.findOne({ user: userId, product: productId });
	}

	async deleteById(id) {
		return Review.findByIdAndDelete(id);
	}

	async addHelpful(reviewId, userId) {
		return Review.findOneAndUpdate(
			{ _id: reviewId, helpfulBy: { $ne: userId } },
			{
				$addToSet: { helpfulBy: userId },
				$inc: { helpfulCount: 1 },
			},
			{ new: true },
		);
	}

	async removeHelpful(reviewId, userId) {
		return Review.findOneAndUpdate(
			{ _id: reviewId, helpfulBy: userId },
			{
				$pull: { helpfulBy: userId },
				$inc: { helpfulCount: -1 },
			},
			{ new: true },
		);
	}

	async calculateProductStats(productId) {
		const result = await Review.aggregate([
			{ $match: { product: productId } },
			{
				$group: {
					_id: null,
					avgRating: { $avg: "$rating" },
					reviewCount: { $sum: 1 },
				},
			},
		]);

		const stats = result[0] || { avgRating: 0, reviewCount: 0 };

		await Product.findByIdAndUpdate(productId, {
			avgRating: Math.round(stats.avgRating * 10) / 10,
			reviewCount: stats.reviewCount,
		});

		return stats;
	}

	async getRatingDistribution(productId) {
		const result = await Review.aggregate([
			{ $match: { product: productId } },
			{ $group: { _id: "$rating", count: { $sum: 1 } } },
			{ $sort: { _id: -1 } },
		]);

		const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		for (const item of result) {
			distribution[item._id] = item.count;
		}
		return distribution;
	}
}

module.exports = new ReviewRepository();
