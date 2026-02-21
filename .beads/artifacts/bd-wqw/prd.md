# Product Comment/Review System

- **Bead:** bd-wqw
- **Created:** 2026-02-21
- **Status:** open

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 16
```

---

## Problem Statement

**What:** The product detail page currently displays hardcoded mock reviews (`sampleReviews` array in `frontend/src/app/products/[id]/page.tsx:291-331`). Users cannot submit real reviews, rate products, like helpful comments, or upload review images. The `ProductDetailModal.tsx` also contains separate mock data (lines 306-339). Product ratings shown on `ProductCard.tsx` are randomly generated (`Math.random()`).

**Why:** A real review system builds social proof, helps purchasing decisions, and increases user engagement. Without it, the product pages lack credibility and user-generated content.

**Who:** All authenticated users (both `admin` and `user` roles). No purchase requirement — any logged-in user can leave one review per product.

---

## Scope

### In Scope

- Mongoose `Review` model with rating (1-5), comment text, up to 3 images, like tracking
- Backend CRUD API for reviews (create, read, update, delete own review)
- Like/unlike toggle endpoint with duplicate prevention
- Cloudinary image upload for review photos (reuse existing multer → cloudinary pattern)
- Denormalized `avgRating` and `reviewCount` on Product model
- Frontend review submission form with star rating selector and image upload
- Frontend review list replacing mock data with paginated API data
- Like button with optimistic UI
- Rating summary display (average + distribution bar chart)
- Update both product detail page and ProductDetailModal

### Out of Scope

- Verified purchase badges (Order ↔ Review relationship)
- Review moderation / admin approval workflow
- Reply/thread system (comments on comments)
- Rich text editor for review comments
- Review sorting/filtering UI (by rating, date, helpful)
- Review editing after submission
- Email notifications for review activity
- Admin dashboard for review management
- SEO structured data (JSON-LD review schema)

---

## Proposed Solution

### Overview

Add a full review system following the existing Controller → Service → Repository architecture on the backend, and React Context-free component pattern on the frontend. Reviews are fetched per-product via API and displayed in the existing Reviews tab. Authenticated users see a review form; unauthenticated users see a login prompt.

### User Flow

1. User navigates to product detail page → Reviews tab
2. System fetches reviews from `GET /api/products/:productId/reviews`
3. Reviews display with star ratings, comment text, images, like counts, timestamps
4. Rating summary shows average rating + star distribution bars
5. **If authenticated:** User sees review form with star selector, comment textarea, image upload (max 3)
6. **If not authenticated:** User sees "Đăng nhập để đánh giá" prompt
7. User fills form → selects stars → writes comment → optionally uploads images
8. Submit → `POST /api/products/:productId/reviews` with FormData (images via multer)
9. On success: review appears at top of list, rating summary updates
10. User can like/unlike any review → `POST /api/reviews/:id/helpful` toggles like
11. User can delete own review → `DELETE /api/reviews/:id`

---

## Requirements

### Functional

#### FR-1: Review Model

- **WHEN** the system starts, **THEN** a `Review` Mongoose model exists with fields: `product` (ObjectId ref), `user` (ObjectId ref), `rating` (Number 1-5 required), `comment` (String required, max 1000 chars), `images` (array of `{ publicId: String, url: String }`, max 3), `helpfulBy` (array of ObjectId refs), `helpfulCount` (Number, default 0), timestamps
- **WHEN** a user tries to create a second review for the same product, **THEN** the system rejects with 409 Conflict (enforced by compound unique index `{ product: 1, user: 1 }`)

#### FR-2: Create Review

- **WHEN** an authenticated user submits a review with valid rating (1-5), comment (10-1000 chars), and optional images (0-3, max 5MB each, jpg/png/webp), **THEN** the system creates the review, uploads images to Cloudinary `reviews/` folder, increments Product `reviewCount`, recalculates Product `avgRating`, and returns the created review with populated user info
- **WHEN** an unauthenticated user tries to create a review, **THEN** the system returns 401 Unauthorized

#### FR-3: List Reviews

- **WHEN** any user requests reviews for a product, **THEN** the system returns paginated reviews (10 per page, sorted by newest first) with user name/avatar populated, image URLs, helpful count, and whether the requesting user (if authenticated) has liked each review
- **WHEN** `page` query param is provided, **THEN** offset-based pagination is used (consistent with existing product pagination pattern)

#### FR-4: Delete Review

- **WHEN** an authenticated user deletes their own review, **THEN** the system removes the review, deletes associated Cloudinary images, decrements Product `reviewCount`, recalculates Product `avgRating`
- **WHEN** a user tries to delete another user's review, **THEN** the system returns 403 Forbidden
- **WHEN** an admin deletes any review, **THEN** the system allows it (admin override)

#### FR-5: Like/Unlike Review

- **WHEN** an authenticated user likes a review they haven't liked, **THEN** the system adds user to `helpfulBy` array, increments `helpfulCount`
- **WHEN** an authenticated user unlikes a review they've already liked, **THEN** the system removes user from `helpfulBy` array, decrements `helpfulCount`
- **WHEN** the response returns, **THEN** it includes the updated `helpfulCount` and the user's like status

#### FR-6: Review Image Upload

- **WHEN** a user uploads images with their review, **THEN** images are uploaded to Cloudinary in `reviews/` folder via multer memory storage → cloudinary upload_stream (same pattern as product/avatar uploads)
- **WHEN** a user uploads more than 3 images, **THEN** the system rejects with 400 Bad Request
- **WHEN** a user uploads a file exceeding 5MB or non-image format, **THEN** the system rejects with validation error

#### FR-7: Product Rating Aggregation

- **WHEN** a review is created or deleted, **THEN** Product `avgRating` and `reviewCount` are recalculated atomically
- **WHEN** a product has no reviews, **THEN** `avgRating` is 0 and `reviewCount` is 0

#### FR-8: Frontend Review Display

- **WHEN** the product detail page loads, **THEN** the Reviews tab fetches and displays real reviews instead of mock `sampleReviews`
- **WHEN** the rating summary renders, **THEN** it shows: average rating (1 decimal), total review count, star distribution bars (5-star to 1-star percentages)
- **WHEN** a review has images, **THEN** they display as thumbnails that can be clicked to view full size

#### FR-9: Frontend Review Form

- **WHEN** an authenticated user views the Reviews tab, **THEN** a review form appears with: interactive star rating selector (1-5, required), comment textarea (min 10 chars, max 1000), image upload button (max 3 images with preview)
- **WHEN** the user has already reviewed this product, **THEN** the form is hidden and their existing review is highlighted
- **WHEN** the user is not authenticated, **THEN** a "Đăng nhập để đánh giá" message with login link appears instead of the form

#### FR-10: Frontend Like Button

- **WHEN** an authenticated user clicks the like button on a review, **THEN** the UI optimistically updates the count and icon, then sends the API request
- **WHEN** the API request fails, **THEN** the UI reverts to the previous state
- **WHEN** a non-authenticated user clicks like, **THEN** they are prompted to log in

### Non-Functional

- **NFR-1: Performance** — Review list API response < 500ms for 100 reviews with populated user data
- **NFR-2: Image Size** — Cloudinary uploads limited to 5MB per image, validated both client-side and server-side
- **NFR-3: Data Integrity** — Compound unique index prevents duplicate reviews per user/product at database level
- **NFR-4: Consistency** — Follow existing code patterns: Controller → Service → Repository, response format `{ status, message, data }`, error classes from `backend/src/errors/`
- **NFR-5: Vietnamese UI** — All user-facing text in Vietnamese, consistent with existing UI language

---

## Success Criteria

1. Authenticated user can submit a review with 1-5 star rating and comment text
   - **Verify:** `curl -X POST http://localhost:3001/api/products/:id/reviews -b cookies.txt -F "rating=5" -F "comment=Sản phẩm rất tốt" | jq '.status'` returns `"success"`

2. Reviews display on product detail page with real data from API
   - **Verify:** Navigate to any product page → Reviews tab shows API-fetched reviews (no hardcoded data)

3. User can upload up to 3 images with a review
   - **Verify:** Submit review with 3 images → all 3 appear in review → images accessible via Cloudinary URLs

4. User can like/unlike reviews with count updating
   - **Verify:** Click like button → count increments → click again → count decrements

5. Product average rating and review count update after review submission
   - **Verify:** `curl http://localhost:3001/api/products/:id | jq '.data.avgRating, .data.reviewCount'` returns correct values

6. Duplicate review prevention works
   - **Verify:** Submit second review for same product → returns 409 error

7. Review deletion removes review and updates product stats
   - **Verify:** Delete review → review gone from list → product avgRating/reviewCount recalculated

---

## Technical Context

### Patterns to Follow

- **Backend architecture:** Controller → Service → Repository (see `backend/src/services/productService.js`, `backend/src/repositories/productRepository.js`)
- **Route registration:** Add to `backend/src/routes/index.js` following existing pattern
- **Auth middleware:** `authMiddleware` for protected routes, optional auth for read routes (to check like status)
- **Upload middleware:** Reuse multer pattern from `backend/src/middlewares/uploadMiddleware.js` with new `uploadReviewImages` for multiple files (`upload.array('images', 3)`)
- **Cloudinary upload:** Stream upload pattern from `backend/src/services/productService.js:135-162`
- **Error handling:** Use existing error classes (ValidationError, NotFoundError, ConflictError, ForbiddenError)
- **Response format:** `sendSuccess()`, `sendCreated()` from `backend/src/utils/responseHelper.js`
- **Frontend API client:** Add review functions to `frontend/src/lib/api.ts` following existing fetch patterns with `credentials: 'include'`
- **Frontend state:** Local component state (useState) — no new Context needed
- **Styling:** Tailwind CSS 4 with existing OKLCH color variables (pink palette)

### Key Files

```yaml
backend_models:
  - backend/src/models/Product.js # Add avgRating, reviewCount fields
  - backend/src/models/Review.js # NEW — Review Mongoose model

backend_routes:
  - backend/src/routes/index.js # Register review routes
  - backend/src/routes/reviewRoutes.js # NEW — Review API routes

backend_logic:
  - backend/src/controllers/reviewController.js # NEW
  - backend/src/services/reviewService.js # NEW
  - backend/src/repositories/reviewRepository.js # NEW

backend_middleware:
  - backend/src/middlewares/uploadMiddleware.js # Add uploadReviewImages

frontend_pages:
  - frontend/src/app/products/[id]/page.tsx # Replace mock reviews
  - frontend/src/components/ProductDetailModal.tsx # Replace mock reviews

frontend_api:
  - frontend/src/lib/api.ts # Add review API functions + types
```

### Affected Files

```yaml
modified:
  - backend/src/models/Product.js
  - backend/src/routes/index.js
  - backend/src/middlewares/uploadMiddleware.js
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/components/ProductDetailModal.tsx
  - frontend/src/lib/api.ts

created:
  - backend/src/models/Review.js
  - backend/src/routes/reviewRoutes.js
  - backend/src/controllers/reviewController.js
  - backend/src/services/reviewService.js
  - backend/src/repositories/reviewRepository.js
```

---

## Risks & Mitigations

| Risk                                                              | Likelihood | Impact | Mitigation                                                                                                         |
| ----------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Cloudinary upload failures on slow connections                    | Medium     | Medium | Client-side file size validation before upload; show upload progress; retry logic                                  |
| Denormalized avgRating/reviewCount drift                          | Low        | Medium | Recalculate from reviews on each create/delete (not increment/decrement) — accurate at cost of one aggregate query |
| Review spam from bots                                             | Medium     | High   | Rate limiting on review creation endpoint; require authentication; future: add CAPTCHA                             |
| Large product detail page (1105 lines) becomes harder to maintain | Medium     | Low    | Extract review section into separate component during implementation                                               |
| Multiple image upload increases request size                      | Low        | Low    | Multer 5MB per file limit; max 3 files; client-side validation                                                     |

---

## Open Questions

| Question                                       | Context                              | Blocking | Priority |
| ---------------------------------------------- | ------------------------------------ | -------- | -------- |
| Should reviews have a minimum character count? | Currently spec says 10 chars minimum | No       | Low      |
| Should admin be able to delete any review?     | Spec includes admin override         | No       | Low      |
| Should the review form be a modal or inline?   | UX decision                          | No       | Medium   |

---

## Tasks

### 1. Create Review Mongoose Model [backend]

The `Review` model exists at `backend/src/models/Review.js` with schema for product, user, rating, comment, images, helpful tracking, and compound unique index `{ product: 1, user: 1 }`.

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/models/Review.js (create)
  - backend/src/models/Product.js (modify — add avgRating, reviewCount)
```

- [ ] Verify: `node -e "const m = require('./backend/src/models/Review'); console.log(m.schema.paths)"` shows all fields
- [ ] Verify: Product model has `avgRating` (Number, default 0) and `reviewCount` (Number, default 0) fields

### 2. Create Review Repository [backend]

`ReviewRepository` at `backend/src/repositories/reviewRepository.js` provides data access methods: `create`, `findByProduct` (paginated, populated), `findById`, `findByUserAndProduct`, `deleteById`, `addHelpful`, `removeHelpful`.

```yaml
depends_on: [1]
parallel: false
conflicts_with: []
files:
  - backend/src/repositories/reviewRepository.js (create)
```

- [ ] Verify: Repository module exports all required methods

### 3. Create Review Service [backend]

`ReviewService` at `backend/src/services/reviewService.js` implements business logic: create review (with image upload + product stats update), get reviews (with like status for requesting user), delete review (with image cleanup + product stats update), toggle helpful.

```yaml
depends_on: [1, 2]
parallel: false
conflicts_with: []
files:
  - backend/src/services/reviewService.js (create)
```

- [ ] Verify: Service handles duplicate review conflict (throws ConflictError)
- [ ] Verify: Service recalculates product avgRating/reviewCount on create and delete

### 4. Create Review Controller & Routes [backend]

`ReviewController` at `backend/src/controllers/reviewController.js` and routes at `backend/src/routes/reviewRoutes.js` expose: `GET /api/products/:productId/reviews`, `POST /api/products/:productId/reviews`, `DELETE /api/reviews/:id`, `POST /api/reviews/:id/helpful`. Routes registered in `backend/src/routes/index.js`.

```yaml
depends_on: [3]
parallel: false
conflicts_with: []
files:
  - backend/src/controllers/reviewController.js (create)
  - backend/src/routes/reviewRoutes.js (create)
  - backend/src/routes/index.js (modify)
  - backend/src/middlewares/uploadMiddleware.js (modify — add uploadReviewImages)
```

- [ ] Verify: `curl http://localhost:3001/api/products/:id/reviews` returns `{ status: "success", data: { reviews: [], pagination: {...} } }`
- [ ] Verify: POST with auth creates review, POST without auth returns 401
- [ ] Verify: Upload middleware accepts `images` field with max 3 files

### 5. Add Review TypeScript Types & API Functions [frontend]

`frontend/src/lib/api.ts` extended with `Review` interface, `ReviewListData` type, and functions: `fetchReviews()`, `createReview()`, `deleteReview()`, `toggleReviewHelpful()`.

```yaml
depends_on: [4]
parallel: true
conflicts_with: []
files:
  - frontend/src/lib/api.ts (modify)
```

- [ ] Verify: TypeScript compiles with no errors related to review types

### 6. Build Review Components [frontend]

Create review UI components: `StarRatingInput` (interactive 1-5 star selector), `StarRatingDisplay` (read-only stars), `ReviewForm` (form with star rating + comment + image upload), `ReviewList` (paginated review display), `ReviewCard` (single review with like button), `RatingSummary` (average + distribution bars).

```yaml
depends_on: [5]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx (modify — extract and replace mock reviews)
```

- [ ] Verify: Star rating selector allows clicking 1-5 stars with visual hover feedback
- [ ] Verify: Review form validates rating required, comment 10-1000 chars, images max 3
- [ ] Verify: Image upload shows preview thumbnails with remove button
- [ ] Verify: Like button toggles with optimistic count update

### 7. Integrate Reviews into Product Detail Page [frontend]

Replace hardcoded `sampleReviews` in `frontend/src/app/products/[id]/page.tsx` with real API data. Update rating summary section. Show review form for authenticated users, login prompt for guests. Handle loading/error states.

```yaml
depends_on: [5, 6]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx (modify)
  - frontend/src/components/ProductDetailModal.tsx (modify)
```

- [ ] Verify: Product detail page Reviews tab shows reviews from API (no mock data)
- [ ] Verify: Rating summary shows correct average and distribution from real data
- [ ] Verify: Authenticated user can submit review and see it appear in list
- [ ] Verify: ProductDetailModal shows real review count (or simplified view)

### 8. End-to-End Validation [testing]

Full flow test: login → navigate to product → submit review with images → verify review appears → like another review → delete own review → verify product stats update.

```yaml
depends_on: [7]
parallel: false
conflicts_with: []
files: []
```

- [ ] Verify: Complete review submission flow works (create → display → like → delete)
- [ ] Verify: Duplicate review returns appropriate error message
- [ ] Verify: Image upload to Cloudinary works and images display correctly
- [ ] Verify: Product avgRating and reviewCount reflect actual reviews
