# Product Comment/Review System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Authenticated users can post star-rated reviews with images, like other reviews, and see real review data on product pages — replacing all mock/hardcoded review data.

**Architecture:** Backend follows Controller → Service → Repository pattern (plain JS, Mongoose). Frontend is Next.js 16 App Router with React 19, local `useState` state, native fetch API client. Images upload via multer memory storage → Cloudinary stream. Auth via JWT HTTP-only cookies.

**Tech Stack:** Express 4.18, Mongoose 8, Cloudinary, Next.js 16, React 19, Tailwind CSS 4

**Discovery Level:** 0 (Skip) — all work follows established codebase patterns, no new libraries.

**Context Budget:** 4 phases × ~25% each. Execute in order.

---

## Must-Haves

### Observable Truths

1. User sees real reviews (not mock data) on product detail page
2. User can submit a review with 1-5 star rating, comment text, and up to 3 images
3. User can like/unlike any review with count updating
4. User can delete their own review (admin can delete any)
5. Product shows accurate average rating and review count
6. Unauthenticated users see login prompt instead of review form
7. One review per user per product enforced (409 on duplicate)

### Required Artifacts

| Artifact                 | Provides                                        | Path                                                |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------- |
| Review Model             | Data schema + unique compound index             | `backend/src/models/Review.js`                      |
| Product Model update     | avgRating, reviewCount fields                   | `backend/src/models/Product.js`                     |
| Optional Auth Middleware | Extract userId without throwing 401             | `backend/src/middlewares/optionalAuthMiddleware.js` |
| Review Repository        | Data access (CRUD, pagination, helpful)         | `backend/src/repositories/reviewRepository.js`      |
| Review Service           | Business logic, Cloudinary upload/delete, stats | `backend/src/services/reviewService.js`             |
| Review Controller        | HTTP request handlers                           | `backend/src/controllers/reviewController.js`       |
| Review Routes            | API endpoint definitions                        | `backend/src/routes/reviewRoutes.js`                |
| Upload Middleware update | `uploadReviewImages` (array, max 3)             | `backend/src/middlewares/uploadMiddleware.js`       |
| Route registration       | Mount `/reviews` routes                         | `backend/src/routes/index.js`                       |
| Frontend types + API     | Review interface + fetch/create/delete/helpful  | `frontend/src/lib/api.ts`                           |
| ProductReviews component | Complete review UI section                      | `frontend/src/components/ProductReviews.tsx`        |
| Page integration         | Replace mock sampleReviews                      | `frontend/src/app/products/[id]/page.tsx`           |
| Modal integration        | Replace inline mock reviews                     | `frontend/src/components/ProductDetailModal.tsx`    |

### Key Links

| From                       | To                             | Via                          | Risk                                              |
| -------------------------- | ------------------------------ | ---------------------------- | ------------------------------------------------- |
| Review Form submit         | POST /api/products/:id/reviews | FormData with `images` field | Field name mismatch with multer → no files parsed |
| ReviewService.createReview | Cloudinary                     | upload_stream Promise        | Upload failure → partial review (must rollback)   |
| Create/Delete review       | Product.avgRating              | aggregate pipeline           | Stats drift if aggregate fails silently           |
| GET reviews                | Like status                    | optionalAuth → req.userId    | null userId → skip like check (not error)         |
| Compound unique index      | Duplicate prevention           | MongoDB E11000 error         | Must catch and throw ConflictError                |

### Task Dependencies

```
Task 1 (Review Model):     needs nothing,    creates backend/src/models/Review.js, modifies Product.js
Task 2 (Optional Auth):    needs nothing,    creates backend/src/middlewares/optionalAuthMiddleware.js
Task 3 (Repository):       needs Task 1,     creates backend/src/repositories/reviewRepository.js
Task 4 (Upload MW):        needs nothing,    modifies backend/src/middlewares/uploadMiddleware.js
Task 5 (Service):          needs Task 1,3,4, creates backend/src/services/reviewService.js
Task 6 (Controller+Routes):needs Task 2,5,   creates controller + routes, modifies index.js + productRoutes.js
Task 7 (Frontend API):     needs Task 6,     modifies frontend/src/lib/api.ts
Task 8 (Components):       needs Task 7,     creates frontend/src/components/ProductReviews.tsx
Task 9 (Integration):      needs Task 7,8,   modifies page.tsx + ProductDetailModal.tsx + ProductCard.tsx
Task 10 (E2E Validation):  needs Task 9,     no files

Wave 1: Tasks 1, 2, 4 (parallel — independent)
Wave 2: Task 3 (depends on Task 1)
Wave 3: Task 5 (depends on Tasks 1, 3, 4)
Wave 4: Task 6 (depends on Tasks 2, 5)
Wave 5: Task 7 (depends on Task 6)
Wave 6: Tasks 8, 9 (depend on Task 7)
Wave 7: Task 10 (depends on Task 9)
```

---

## Phase 1: Backend Foundation

### Task 1: Create Review Model + Update Product Model

**Files:**

- Create: `backend/src/models/Review.js`
- Modify: `backend/src/models/Product.js`

**Step 1: Create Review Mongoose model**

Create `backend/src/models/Review.js`:

```javascript
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
```

**Step 2: Add avgRating and reviewCount to Product model**

Modify `backend/src/models/Product.js` — add two fields inside the schema definition, after the `isActive` field (line 68):

```javascript
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
```

**Verification:**

- `node -e "const Review = require('./backend/src/models/Review'); console.log(Object.keys(Review.schema.paths).join(', '))"` → shows product, user, rating, comment, images, helpfulBy, helpfulCount, createdAt, updatedAt, \_id
- `node -e "const Product = require('./backend/src/models/Product'); console.log(Product.schema.paths.avgRating.instance, Product.schema.paths.reviewCount.instance)"` → `Number Number`

---

### Task 2: Create Optional Auth Middleware

**Files:**

- Create: `backend/src/middlewares/optionalAuthMiddleware.js`

**Why:** The GET reviews endpoint needs to optionally identify the user to check if they liked each review. The existing `authMiddleware` throws `UnauthorizedError` when no token is present. We need a variant that extracts `userId` if a valid token exists but does NOT throw otherwise.

**Step 1: Create optionalAuthMiddleware**

Create `backend/src/middlewares/optionalAuthMiddleware.js`:

```javascript
const jwt = require("jsonwebtoken");

module.exports = (req, _res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.userRole = payload.role === "admin" ? "admin" : "user";
  } catch {
    // Invalid token — continue as unauthenticated
  }

  return next();
};
```

**Verification:**

- File exists at `backend/src/middlewares/optionalAuthMiddleware.js`
- Exports a single middleware function with (req, res, next) signature

---

### Task 3: Create Review Repository

**Files:**

- Create: `backend/src/repositories/reviewRepository.js`

**Reference pattern:** `backend/src/repositories/productRepository.js` — singleton class export, Promise.all for count+find, pagination object `{ items, pagination: { page, limit, total, pages } }`

**Step 1: Create ReviewRepository**

Create `backend/src/repositories/reviewRepository.js`:

```javascript
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
    return Review.findByIdAndUpdate(
      reviewId,
      {
        $addToSet: { helpfulBy: userId },
        $inc: { helpfulCount: 1 },
      },
      { new: true },
    );
  }

  async removeHelpful(reviewId, userId) {
    return Review.findByIdAndUpdate(
      reviewId,
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
```

**Verification:**

- `node -e "const r = require('./backend/src/repositories/reviewRepository'); console.log(typeof r.create, typeof r.findByProduct, typeof r.findByUserAndProduct, typeof r.deleteById, typeof r.addHelpful, typeof r.removeHelpful, typeof r.calculateProductStats, typeof r.getRatingDistribution)"` → all `function`

---

### Task 4: Update Upload Middleware

**Files:**

- Modify: `backend/src/middlewares/uploadMiddleware.js`

**Step 1: Add uploadReviewImages middleware**

Add after the `uploadAvatarImage` definition (after line 46), before the `module.exports`:

```javascript
const uploadReviewImages = (req, res, next) => {
  upload.array("images", 3)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new ValidationError("Mỗi ảnh đánh giá không được vượt quá 5MB"));
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE") {
      next(new ValidationError("Chỉ được tải lên tối đa 3 ảnh"));
      return;
    }

    next(error);
  });
};
```

**Step 2: Update exports**

Replace the current exports block (lines 48-49):

```javascript
// OLD:
// module.exports = uploadProductImage;
// module.exports.uploadAvatarImage = uploadAvatarImage;

// NEW:
module.exports = uploadProductImage;
module.exports.uploadAvatarImage = uploadAvatarImage;
module.exports.uploadReviewImages = uploadReviewImages;
```

**Verification:**

- `node -e "const m = require('./backend/src/middlewares/uploadMiddleware'); console.log(typeof m, typeof m.uploadAvatarImage, typeof m.uploadReviewImages)"` → `function function function`

---

## Phase 2: Backend API

### Task 5: Create Review Service

**Files:**

- Create: `backend/src/services/reviewService.js`

**Reference pattern:** `backend/src/services/productService.js` — singleton class, imports repo + cloudinary + errors, validation in service layer, Cloudinary upload_stream pattern (lines 135-162).

**Step 1: Create ReviewService**

Create `backend/src/services/reviewService.js`:

```javascript
const reviewRepository = require("../repositories/reviewRepository");
const productRepository = require("../repositories/productRepository");
const cloudinary = require("../config/cloudinary");
const { NotFoundError, ValidationError, ConflictError, ForbiddenError } = require("../errors");

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
      throw new ConflictError("Bạn đã đánh giá sản phẩm này rồi");
    }

    // Validate rating
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5");
    }

    // Validate comment
    if (!data.comment || data.comment.trim().length < 10) {
      throw new ValidationError("Đánh giá phải có ít nhất 10 ký tự");
    }
    if (data.comment.trim().length > 1000) {
      throw new ValidationError("Đánh giá không được vượt quá 1000 ký tự");
    }

    // Validate image count
    if (files.length > 3) {
      throw new ValidationError("Chỉ được tải lên tối đa 3 ảnh");
    }

    // Upload images to Cloudinary
    const images = [];
    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "reviews",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(uploadResult);
          },
        );
        uploadStream.end(file.buffer);
      });

      images.push({
        publicId: result.public_id,
        url: result.secure_url,
      });
    }

    // Create review
    const review = await reviewRepository.create({
      product: productId,
      user: userId,
      rating,
      comment: data.comment.trim(),
      images,
    });

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
      },
    };
  }

  async deleteReview(reviewId, userId, userRole) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Đánh giá không tồn tại");
    }

    // Check ownership (admin can delete any)
    const isOwner = review.user._id.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Bạn không có quyền xóa đánh giá này");
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
      throw new NotFoundError("Đánh giá không tồn tại");
    }

    const alreadyLiked = review.helpfulBy.some((id) => id.toString() === userId.toString());

    let updated;
    if (alreadyLiked) {
      updated = await reviewRepository.removeHelpful(reviewId, userId);
    } else {
      updated = await reviewRepository.addHelpful(reviewId, userId);
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
```

**Verification:**

- `node -e "const s = require('./backend/src/services/reviewService'); console.log(typeof s.createReview, typeof s.getReviews, typeof s.deleteReview, typeof s.toggleHelpful)"` → all `function`

---

### Task 6: Create Review Controller, Routes & Registration

**Files:**

- Create: `backend/src/controllers/reviewController.js`
- Create: `backend/src/routes/reviewRoutes.js`
- Modify: `backend/src/routes/productRoutes.js` (add product-nested review routes)
- Modify: `backend/src/routes/index.js` (register standalone review routes)

**Reference pattern:** `backend/src/controllers/productController.js` — `exports.method = asyncHandler(async (req, res) => {...})`, parse pagination from `req.query`, use `sendSuccess`/`sendCreated`.

**Step 1: Create Review Controller**

Create `backend/src/controllers/reviewController.js`:

```javascript
const reviewService = require("../services/reviewService");
const { sendSuccess, sendCreated } = require("../utils/responseHelper");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page, limit } = req.query;
  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  };

  // req.userId is set by optionalAuthMiddleware (may be undefined)
  const result = await reviewService.getReviews(productId, options, req.userId || null);
  sendSuccess(res, result, "Reviews retrieved successfully");
});

exports.createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const review = await reviewService.createReview(req.userId, productId, req.body, req.files || []);
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
```

**Step 2: Create Review Routes (standalone)**

Create `backend/src/routes/reviewRoutes.js`:

```javascript
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

// DELETE /api/reviews/:id — delete own review (or admin)
router.delete("/:id", authMiddleware, reviewController.deleteReview);

// POST /api/reviews/:id/helpful — toggle like
router.post("/:id/helpful", authMiddleware, reviewController.toggleHelpful);

module.exports = router;
```

**Step 3: Add product-nested review routes to productRoutes.js**

Modify `backend/src/routes/productRoutes.js`:

Add imports at top (after line 6):

```javascript
const reviewController = require("../controllers/reviewController");
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");
const { uploadReviewImages } = require("../middlewares/uploadMiddleware");
```

Add review routes BEFORE the `/:id` catch-all route (before line 13 `router.get('/:id', ...)`):

```javascript
// Product reviews (nested under /products/:productId)
router.get("/:productId/reviews", optionalAuthMiddleware, reviewController.getReviews);
router.post(
  "/:productId/reviews",
  authMiddleware,
  uploadReviewImages,
  reviewController.createReview,
);
```

**Step 4: Register standalone review routes in index.js**

Modify `backend/src/routes/index.js`:

Add import (after line 7):

```javascript
const reviewRoutes = require("./reviewRoutes");
```

Add route registration (after line 13):

```javascript
router.use("/reviews", reviewRoutes);
```

**Verification:**

- Start backend: `cd backend && npm run dev`
- `curl http://localhost:3001/api/products/<VALID_PRODUCT_ID>/reviews | jq '.status'` → `"success"`
- `curl http://localhost:3001/api/products/<VALID_PRODUCT_ID>/reviews | jq '.data.summary'` → shows avgRating, reviewCount, distribution
- `curl -X POST http://localhost:3001/api/reviews/invalidid/helpful` → returns 401 (no auth)

---

## Phase 3: Frontend Foundation

### Task 7: Add Review Types & API Functions

**Files:**

- Modify: `frontend/src/lib/api.ts`

**Reference pattern:** Existing fetch functions in api.ts — `credentials: 'include'`, `cache: 'no-store'`, `parseError` for error messages, `ApiResponse<T>` wrapper.

**Step 1: Update Product interface**

Find the `Product` interface in `frontend/src/lib/api.ts` and add two fields:

```typescript
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: string | Pick<Category, "_id" | "name" | "slug">;
  sku?: string;
  quantity: number;
  images?: string[];
  isActive: boolean;
  avgRating: number; // ADD
  reviewCount: number; // ADD
  createdAt: string;
  updatedAt: string;
}
```

**Step 2: Add Review types**

Add after the `CreateOrderPayload` interface (before the `OrderListData` interface):

```typescript
// ─── Reviews ────────────────────────────────────────────────────────

export interface ReviewImage {
  publicId: string;
  url: string;
}

export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Review {
  _id: string;
  product: string;
  user: ReviewUser;
  rating: number;
  comment: string;
  images: ReviewImage[];
  helpfulCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewSummary {
  avgRating: number;
  reviewCount: number;
  distribution: RatingDistribution;
}

export interface ReviewListData {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: ReviewSummary;
}
```

**Step 3: Add Review API functions**

Add at the end of `frontend/src/lib/api.ts`:

```typescript
// ─── Review API ─────────────────────────────────────────────────────

export async function fetchReviews(
  productId: string,
  params?: { page?: number; limit?: number },
): Promise<ReviewListData> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const res = await fetch(
    `${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews${suffix}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, "Không thể tải đánh giá"));
  }

  const body = (await res.json()) as ApiResponse<ReviewListData>;
  return body.data;
}

export async function createReview(
  productId: string,
  data: { rating: number; comment: string },
  images: File[] = [],
): Promise<Review> {
  const formData = new FormData();
  formData.append("rating", String(data.rating));
  formData.append("comment", data.comment);
  for (const image of images) {
    formData.append("images", image);
  }

  const res = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Không thể gửi đánh giá"));
  }

  const body = (await res.json()) as ApiResponse<Review>;
  return body.data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Không thể xóa đánh giá"));
  }
}

export async function toggleReviewHelpful(
  reviewId: string,
): Promise<{ helpfulCount: number; isLiked: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(reviewId)}/helpful`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Không thể cập nhật"));
  }

  const body = (await res.json()) as ApiResponse<{ helpfulCount: number; isLiked: boolean }>;
  return body.data;
}
```

**Verification:**

- `cd frontend && npx tsc --noEmit` — no errors related to Review types
- All new types and functions are exported

---

### Task 8: Build ProductReviews Component

**Files:**

- Create: `frontend/src/components/ProductReviews.tsx`

**This component contains all review UI:** RatingSummary, StarRating (display + input), ReviewForm, ReviewCard, ReviewList, and the main ProductReviews container.

**Step 1: Create ProductReviews.tsx**

Create `frontend/src/components/ProductReviews.tsx`:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StarIcon } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";
import {
  createReview,
  deleteReview,
  fetchReviews,
  toggleReviewHelpful,
  type Review,
  type ReviewListData,
  type ReviewSummary,
} from "@/lib/api";

// ─── Star Rating Display ─────────────────────────────────────────────

function StarRatingDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          size={size}
          className={star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

// ─── Star Rating Input ────────────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded"
          aria-label={`${star} sao`}
        >
          <StarIcon
            size={28}
            className={
              star <= (hovered || value) ? "text-amber-400 drop-shadow-sm" : "text-gray-200"
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-[var(--text-muted)] self-center">{value}/5</span>
      )}
    </div>
  );
}

// ─── Rating Summary ───────────────────────────────────────────────────

function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const total = summary.reviewCount || 1; // prevent division by zero

  return (
    <div className="flex items-start gap-8 p-6 rounded-2xl bg-pink-50/50 border border-pink-100">
      <div className="text-center">
        <div className="text-4xl font-bold text-[var(--text-primary)]">
          {summary.avgRating.toFixed(1)}
        </div>
        <StarRatingDisplay rating={summary.avgRating} size={16} />
        <div className="text-sm text-[var(--text-muted)] mt-1">{summary.reviewCount} đánh giá</div>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star as keyof typeof summary.distribution] || 0;
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)] w-6">{star}★</span>
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-[var(--text-muted)] w-10">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Image Upload Preview ─────────────────────────────────────────────

function ImageUploadPreview({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="relative group">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className="w-20 h-20 object-cover rounded-lg border border-pink-200"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Xóa ảnh ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────

function ReviewForm({
  productId,
  onReviewCreated,
}: {
  productId: string;
  onReviewCreated: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const remaining = 3 - images.length;

    if (selectedFiles.length > remaining) {
      setError(`Chỉ được tải lên tối đa 3 ảnh (còn ${remaining} ảnh)`);
      return;
    }

    // Client-side validation: 5MB per file
    const oversized = selectedFiles.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setError("Mỗi ảnh không được vượt quá 5MB");
      return;
    }

    setError("");
    setImages((prev) => [...prev, ...selectedFiles]);
    e.target.value = ""; // reset input
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Đánh giá phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview(productId, { rating, comment: comment.trim() }, images);
      setRating(0);
      setComment("");
      setImages([]);
      onReviewCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-pink-100 bg-white">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Viết đánh giá của bạn
      </h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
          Đánh giá *
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="text-sm font-medium text-[var(--text-secondary)] mb-2 block"
        >
          Nhận xét * <span className="text-[var(--text-muted)] font-normal">(10-1000 ký tự)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <div className="text-xs text-[var(--text-muted)] text-right mt-1">
          {comment.length}/1000
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
          Hình ảnh{" "}
          <span className="text-[var(--text-muted)] font-normal">(tối đa 3 ảnh, 5MB/ảnh)</span>
        </label>
        {images.length > 0 && (
          <div className="mb-2">
            <ImageUploadPreview files={images} onRemove={handleRemoveImage} />
          </div>
        )}
        {images.length < 3 && (
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-pink-300 rounded-xl text-sm text-pink-500 hover:bg-pink-50 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm ảnh
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────

function ReviewCard({
  review,
  currentUserId,
  onDelete,
  onToggleHelpful,
}: {
  review: Review;
  currentUserId: string | null;
  onDelete: (reviewId: string) => void;
  onToggleHelpful: (reviewId: string) => void;
}) {
  const isOwner = currentUserId === review.user._id;
  const initials = review.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  return (
    <>
      <div className="p-5 rounded-2xl border border-pink-100 hover:border-pink-200 transition-colors">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={review.user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-semibold text-[var(--text-primary)]">{review.user.name}</span>
              <StarRatingDisplay rating={review.rating} size={14} />
              <span className="text-sm text-[var(--text-muted)]">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <p className="text-[var(--text-secondary)] mb-3">{review.comment}</p>

            {/* Review Images */}
            {review.images.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {review.images.map((img) => (
                  <button
                    key={img.publicId}
                    type="button"
                    onClick={() => setShowFullImage(img.url)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-lg"
                  >
                    <Image
                      src={img.url}
                      alt="Review image"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg border border-pink-100 hover:border-pink-300 transition-colors cursor-pointer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onToggleHelpful(review._id)}
                className={`text-sm transition-colors ${
                  review.isLiked
                    ? "text-pink-500 font-medium"
                    : "text-[var(--text-muted)] hover:text-pink-500"
                }`}
              >
                👍 Hữu ích ({review.helpfulCount})
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => onDelete(review._id)}
                  className="text-sm text-[var(--text-muted)] hover:text-red-500 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setShowFullImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={showFullImage}
            alt="Full size review image"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}

// ─── Main ProductReviews Component ────────────────────────────────────

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviewData, setReviewData] = useState<ReviewListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasOwnReview, setHasOwnReview] = useState(false);

  const loadReviews = useCallback(
    async (pageNum = 1) => {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchReviews(productId, { page: pageNum, limit: 10 });
        setReviewData(data);
        setPage(pageNum);

        // Check if current user already has a review
        if (user) {
          const userHasReview = data.reviews.some((r) => r.user._id === user.id);
          setHasOwnReview(userHasReview);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải đánh giá");
      } finally {
        setIsLoading(false);
      }
    },
    [productId, user],
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleReviewCreated = () => {
    loadReviews(1); // Reload from first page
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await deleteReview(reviewId);
      loadReviews(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xóa đánh giá");
    }
  };

  const handleToggleHelpful = async (reviewId: string) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    try {
      const result = await toggleReviewHelpful(reviewId);

      // Optimistic update
      setReviewData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r) =>
            r._id === reviewId
              ? { ...r, helpfulCount: result.helpfulCount, isLiked: result.isLiked }
              : r,
          ),
        };
      });
    } catch (err) {
      // Revert on failure
      loadReviews(page);
    }
  };

  if (isLoading && !reviewData) {
    return <div className="text-center py-12 text-[var(--text-muted)]">Đang tải đánh giá...</div>;
  }

  if (error && !reviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => loadReviews()} className="text-pink-500 font-medium hover:underline">
          Thử lại
        </button>
      </div>
    );
  }

  const summary = reviewData?.summary;
  const reviews = reviewData?.reviews || [];
  const pagination = reviewData?.pagination;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && summary.reviewCount > 0 && <RatingSummary summary={summary} />}

      {/* Review Form or Login Prompt */}
      {user ? (
        hasOwnReview ? (
          <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100 text-center text-[var(--text-secondary)]">
            Bạn đã đánh giá sản phẩm này
          </div>
        ) : (
          <ReviewForm productId={productId} onReviewCreated={handleReviewCreated} />
        )
      ) : (
        <div className="p-6 rounded-2xl border border-pink-100 bg-white text-center">
          <p className="text-[var(--text-secondary)] mb-3">Đăng nhập để đánh giá sản phẩm</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all"
          >
            Đăng nhập
          </Link>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?.id || null}
              onDelete={handleDelete}
              onToggleHelpful={handleToggleHelpful}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--text-muted)]">
          Chưa có đánh giá nào. Hãy là người đầu tiên!
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => loadReviews(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-pink-500 text-white"
                  : "text-[var(--text-secondary)] hover:bg-pink-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Verification:**

- `cd frontend && npx tsc --noEmit` — no type errors
- Component exports `ProductReviews` as default export
- All sub-components (StarRatingInput, StarRatingDisplay, RatingSummary, ReviewForm, ReviewCard) are used

---

## Phase 4: Integration & Validation

### Task 9: Integrate Reviews into Product Detail Page & Modal

**Files:**

- Modify: `frontend/src/app/products/[id]/page.tsx`
- Modify: `frontend/src/components/ProductDetailModal.tsx`
- Modify: `frontend/src/components/ProductCard.tsx` (remove random ratings)

**Step 1: Update Product Detail Page**

In `frontend/src/app/products/[id]/page.tsx`:

1. **Add import** (at top with other imports):

```tsx
import ProductReviews from "@/components/ProductReviews";
```

2. **Update `mapApiProductToCard`** — replace the random rating/reviews lines (around lines 58-59):

```tsx
// OLD:
//   rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
//   reviews: Math.floor(Math.random() * 300) + 50,

// NEW:
    rating: product.avgRating || 0,
    reviews: product.reviewCount || 0,
```

3. **Remove `sampleReviews` array** — delete the entire `sampleReviews` array (around lines 275-313).

4. **Remove `showAllReviews` state** — delete the `const [showAllReviews, setShowAllReviews] = useState(false);` line.

5. **Replace Reviews tab content** — find the Reviews tab content block (inside `{activeTab === 'reviews' && (...)}`). Replace the ENTIRE content of that block (the rating summary + reviews list + show all button) with:

```tsx
{
  activeTab === "reviews" && (
    <div>
      <ProductReviews productId={product.id} />
    </div>
  );
}
```

**Step 2: Update ProductDetailModal**

In `frontend/src/components/ProductDetailModal.tsx`:

1. Replace the hardcoded reviews section (around lines 300-340, the inline array with mock reviews) with either:
   - A simplified display showing `product.reviewCount` and `product.avgRating`:

```tsx
{
  /* Reviews Summary */
}
<div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100">
  <div className="flex items-center gap-2 mb-2">
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          size={14}
          className={i < Math.round(product.rating) ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
    <span className="text-sm font-medium text-[var(--text-primary)]">
      {product.rating > 0 ? product.rating.toFixed(1) : "0"}
    </span>
    <span className="text-sm text-[var(--text-muted)]">({product.reviews || 0} đánh giá)</span>
  </div>
  <Link
    href={`/products/${product.slug || product.id}`}
    className="text-sm text-pink-500 font-medium hover:underline"
  >
    Xem tất cả đánh giá →
  </Link>
</div>;
```

**Step 3: Update ProductCard**

In `frontend/src/components/ProductCard.tsx`:

Find where `Math.random()` is used for rating and replace with actual product data (`product.rating` which now comes from `avgRating`).

**Verification:**

- Product detail page Reviews tab renders `<ProductReviews>` component (no mock data)
- No references to `sampleReviews` remain in the codebase
- No `Math.random()` for ratings in ProductCard
- `grep -r "sampleReviews" frontend/src/` returns no results
- `grep -r "Math.random" frontend/src/components/ProductCard.tsx` returns no results

---

### Task 10: End-to-End Validation

**No files modified — manual testing only.**

**Test Flow:**

1. **Start backend:** `cd backend && npm run dev`
2. **Start frontend:** `cd frontend && npm run dev`
3. **Login as test user** via the application

**Test 1: View Reviews (empty product)**

- Navigate to a product detail page → Reviews tab
- Expected: "Chưa có đánh giá nào" message, review form visible

**Test 2: Submit Review**

- Fill in: 5 stars, comment (10+ chars), optionally 1-3 images
- Click "Gửi đánh giá"
- Expected: Review appears in list, rating summary shows, form replaced with "Bạn đã đánh giá"

**Test 3: Verify Product Stats**

- `curl http://localhost:3001/api/products/<ID> | jq '.data.avgRating, .data.reviewCount'`
- Expected: avgRating = submitted rating, reviewCount = 1

**Test 4: Duplicate Prevention**

- Try submitting another review for the same product (open in different tab or use API)
- Expected: 409 error "Bạn đã đánh giá sản phẩm này rồi"

**Test 5: Like Toggle**

- Click "Hữu ích" button on a review
- Expected: Count increments, button highlights
- Click again → Count decrements, button unhighlights

**Test 6: Delete Review**

- Click "Xóa" on your own review
- Expected: Review removed, product stats updated

**Test 7: Unauthenticated View**

- Logout → Navigate to product page → Reviews tab
- Expected: Login prompt shown instead of review form, can still view reviews

**Test 8: Image Upload**

- Submit review with 3 images
- Expected: Images appear as thumbnails, clickable for full view
- Verify Cloudinary: images in `reviews/` folder

---

## Commit Strategy

After each phase, commit:

```bash
# Phase 1: Backend Foundation
git add backend/src/models/ backend/src/repositories/ backend/src/middlewares/
git commit -m "feat(bd-wqw): add Review model, repository, optional auth, upload middleware"

# Phase 2: Backend API
git add backend/src/services/ backend/src/controllers/ backend/src/routes/
git commit -m "feat(bd-wqw): add Review service, controller, and routes"

# Phase 3: Frontend Foundation
git add frontend/src/lib/api.ts frontend/src/components/ProductReviews.tsx
git commit -m "feat(bd-wqw): add Review types, API functions, and ProductReviews component"

# Phase 4: Integration
git add frontend/src/app/products/ frontend/src/components/ProductDetailModal.tsx frontend/src/components/ProductCard.tsx
git commit -m "feat(bd-wqw): integrate real reviews, remove mock data"
```
