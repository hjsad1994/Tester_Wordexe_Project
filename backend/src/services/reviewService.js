const reviewRepository = require('../repositories/reviewRepository');
const productRepository = require('../repositories/productRepository');
const cloudinary = require('../config/cloudinary');
const { NotFoundError, ValidationError, ConflictError, ForbiddenError } = require('../errors');

class ReviewService {
  async createReview(userId, productId, data, files = []) {
    // Validate product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    // Check for duplicate review
    const existing = await reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      throw new ConflictError('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Validate rating
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    // Validate comment
    if (!data.comment || data.comment.trim().length < 10) {
      throw new ValidationError('Đánh giá phải có ít nhất 10 ký tự');
    }
    if (data.comment.trim().length > 1000) {
      throw new ValidationError('Đánh giá không được vượt quá 1000 ký tự');
    }

    // Validate image count
    if (files.length > 3) {
      throw new ValidationError('Chỉ được tải lên tối đa 3 ảnh');
    }

    // Upload images to Cloudinary
    const images = [];
    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'reviews',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(uploadResult);
          }
        );
        uploadStream.end(file.buffer);
      });

      images.push({
        publicId: result.public_id,
        url: result.secure_url,
      });
    }

    // Create review — cleanup uploaded images on failure (P1-1)
    let review;
    try {
      review = await reviewRepository.create({
        product: productId,
        user: userId,
        rating,
        comment: data.comment.trim(),
        images,
      });
    } catch (error) {
      // Cleanup orphaned Cloudinary images
      for (const image of images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch {
          console.error(`Failed to cleanup Cloudinary image: ${image.publicId}`);
        }
      }
      throw error;
    }

    // Update product stats
    await reviewRepository.calculateProductStats(product._id);

    return review;
  }

  async getReviews(productId, options = {}, requestingUserId = null) {
    // Validate product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    const result = await reviewRepository.findByProduct(productId, options);

    // Get rating distribution
    const distribution = await reviewRepository.getRatingDistribution(product._id);

    // Check if requesting user has already reviewed this product
    let userHasReviewed = false;
    if (requestingUserId) {
      const existing = await reviewRepository.findByUserAndProduct(requestingUserId, productId);
      userHasReviewed = !!existing;
    }

    // Add isLiked flag for requesting user
    const reviews = result.reviews.map((review) => {
      const reviewObj = review.toObject();
      reviewObj.isLiked = requestingUserId
        ? review.helpfulBy.some((id) => id.toString() === requestingUserId.toString())
        : false;
      // Remove helpfulBy array from response (only need count + isLiked)
      delete reviewObj.helpfulBy;
      return reviewObj;
    });

    return {
      reviews,
      pagination: result.pagination,
      summary: {
        avgRating: product.avgRating || 0,
        reviewCount: product.reviewCount || 0,
        distribution,
        userHasReviewed,
      },
    };
  }

  async deleteReview(reviewId, userId, userRole) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Đánh giá không tồn tại');
    }

    // Check ownership (admin can delete any)
    const isOwner = review.user._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền xóa đánh giá này');
    }

    // Delete Cloudinary images
    for (const image of review.images) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch {
        // Log but don't fail — image cleanup is best-effort
        console.error(`Failed to delete Cloudinary image: ${image.publicId}`);
      }
    }

    const productId = review.product;
    await reviewRepository.deleteById(reviewId);

    // Update product stats
    await reviewRepository.calculateProductStats(productId);

    return { deleted: true };
  }

  async toggleHelpful(reviewId, userId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Đánh giá không tồn tại');
    }

    const alreadyLiked = review.helpfulBy.some((id) => id.toString() === userId.toString());

    let updated;
    if (alreadyLiked) {
      updated = await reviewRepository.removeHelpful(reviewId, userId);
    } else {
      updated = await reviewRepository.addHelpful(reviewId, userId);
    }

    // If atomic conditional update matched nothing (race condition),
    // the review is already in the desired state — re-read current state
    if (!updated) {
      const current = await reviewRepository.findById(reviewId);
      return {
        helpfulCount: current.helpfulCount,
        isLiked: current.helpfulBy.some((id) => id.toString() === userId.toString()),
      };
    }

    return {
      helpfulCount: updated.helpfulCount,
      isLiked: !alreadyLiked,
    };
  }

  async getUserReviewForProduct(userId, productId) {
    return reviewRepository.findByUserAndProduct(userId, productId);
  }
}

module.exports = new ReviewService();
