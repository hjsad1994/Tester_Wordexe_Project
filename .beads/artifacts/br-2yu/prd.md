# PRD: Multi-Image Support — Product Detail Display + Admin Upload

## Bead Metadata

```yaml
bead_id: br-2yu
title: "Multi-image support: product detail display + admin upload (up to 4)"
type: feature
priority: 1
status: open
created: 2026-02-23
```

## Problem Statement

The product detail page displays **4 hardcoded thumbnail placeholders** (`[1,2,3,4].map()`) that all show identical SVG illustrations. These thumbnails are non-functional — no click handlers, no image switching, no connection to actual product data. Only the first image from the API (`product.images?.[0]`) is used; all remaining images are discarded at the mapping layer.

On the admin side, the product create/edit modal only supports **single image upload** (`selectedImageFile: File | null`). Admins cannot upload multiple product images despite the backend already storing an `images: [String]` array.

**Impact:** Products appear visually identical regardless of uploaded images. Admins cannot showcase multiple angles/variants, reducing product appeal and conversion potential.

## Scope

### In Scope

- **Product detail page:** Dynamic thumbnails (1–4) based on actual `product.images[]` from API
- **Product detail page:** Main image switching on thumbnail click
- **Admin modal:** Multi-image upload (up to 4 files) with preview grid
- **Admin modal:** Remove individual images (existing + newly selected)
- **Admin modal:** Image reordering (drag or button-based, first = main image)
- **Backend:** Update upload middleware from `upload.single('image')` to `upload.array('images', 4)` for products
- **Backend:** Bulk image upload endpoint + individual image delete endpoint
- **Bug fix:** Align GIF MIME type between frontend (allows GIF) and backend (rejects GIF)
- **API layer:** New `uploadProductImages()` function for multi-file upload

### Out of Scope

- Image cropping/editing within the modal
- Product detail modal (`ProductDetailModal.tsx`) — keeps single image
- Product card grid view — keeps single image
- Image CDN optimization (already handled by Cloudinary)
- Zoom/lightbox functionality on product detail page

## Proposed Solution

### Frontend — Product Detail Page

Transform the hardcoded thumbnail strip into a dynamic image gallery:

1. **Data mapping** (`line 57`): Change from `imageUrl: product.images?.[0]` to `imageUrls: product.images ?? []` — preserve the full array
2. **Product type**: Add `imageUrls?: string[]` alongside existing `imageUrl` for backward compat
3. **Main image state**: `useState(0)` to track selected image index
4. **Thumbnails**: Render `imageUrls.map()` (1–4 items) instead of hardcoded `[1,2,3,4].map()`
5. **Thumbnail click**: Set selected index, swap main `<Image>` src
6. **Fallback**: If `imageUrls` is empty, show single SVG illustration (no thumbnails)
7. **Active state**: Highlight selected thumbnail with border/ring

### Frontend — Admin Product Modal

Extend single-file upload to multi-file with preview grid:

1. **State**: `selectedImageFiles: File[]` (max 4) + `existingImages: string[]` (for edit mode)
2. **File input**: `multiple` attribute, `onChange` appends to array (capped at 4 total)
3. **Preview grid**: 2×2 grid showing file blob URLs + existing Cloudinary URLs
4. **Remove button**: Per-image remove (for both new files and existing images)
5. **Validation**: Same rules per file (MIME types, 5MB max), total count ≤ 4
6. **Submit flow**:
   - Create: POST product JSON → upload all images via new bulk endpoint
   - Edit: PUT product JSON → upload new images + delete removed existing images

### Backend

1. **Upload middleware**: Add `upload.array('images', 4)` preset for products
2. **Bulk upload endpoint**: `POST /:id/images` accepts up to 4 files, loops Cloudinary upload (follow review pattern)
3. **Delete endpoint**: `DELETE /:id/images/:imageUrl` removes specific image from array
4. **GIF fix**: Add `image/gif` to multer's `fileFilter` allowed MIME types
5. **Repository**: Add `removeImage(productId, imageUrl)` using `$pull`

### API Layer (`frontend/src/lib/api.ts`)

1. New `uploadProductImages(id: string, files: File[])` — sends `FormData` with `images` field (array)
2. New `deleteProductImage(id: string, imageUrl: string)` — DELETE request
3. Keep existing `uploadProductImage()` for backward compat (deprecated)

## Requirements

### R1: Dynamic Thumbnail Display

- **WHEN** a product has 1–4 images in `images[]`
- **THEN** show exactly that many thumbnails below the main image, each displaying the corresponding image
- **AND** the first image is selected by default as the main display

### R2: Thumbnail Click Switching

- **WHEN** a user clicks a thumbnail
- **THEN** the main product image updates to show the clicked thumbnail's full-size image
- **AND** the clicked thumbnail shows an active/selected visual indicator

### R3: Empty Images Fallback

- **WHEN** a product has 0 images in `images[]`
- **THEN** show the SVG illustration fallback for the main image
- **AND** do not render any thumbnail strip

### R4: Admin Multi-Image Upload

- **WHEN** an admin creates or edits a product
- **THEN** the modal shows an image upload area supporting up to 4 images
- **AND** each selected image shows a preview with a remove button

### R5: Admin Image Count Limit

- **WHEN** the total image count (existing + new) would exceed 4
- **THEN** prevent additional file selection
- **AND** show a message indicating the maximum has been reached

### R6: Admin Image Validation

- **WHEN** an admin selects an image file
- **THEN** validate MIME type (jpeg, png, webp, gif) and file size (≤ 5MB)
- **AND** show an error toast for invalid files without adding them

### R7: Admin Existing Image Management (Edit Mode)

- **WHEN** an admin opens the edit modal for a product with existing images
- **THEN** show existing Cloudinary images in the preview grid
- **AND** allow removing individual existing images

### R8: Backend Bulk Upload

- **WHEN** a bulk image upload request arrives with 1–4 files
- **THEN** upload each to Cloudinary sequentially
- **AND** append all URLs to the product's `images[]` array
- **AND** if any upload fails, rollback previously uploaded images in that batch

### R9: Backend Image Delete

- **WHEN** a delete image request arrives with a valid image URL
- **THEN** remove the URL from the product's `images[]` array
- **AND** delete the image from Cloudinary

### R10: GIF MIME Alignment

- **WHEN** a GIF file is uploaded via any product image endpoint
- **THEN** the backend accepts it (add `image/gif` to multer's allowed types)

## Success Criteria

### SC1: Thumbnails render dynamically

```
Verify: Upload 3 images to a product via admin. Open product detail page. Confirm exactly 3 thumbnails appear.
```

### SC2: Main image switches on click

```
Verify: On product detail page with multiple images, click each thumbnail. Confirm main image changes to match clicked thumbnail.
```

### SC3: Fallback works for zero images

```
Verify: View a product with no uploaded images. Confirm SVG illustration shows with no thumbnail strip.
```

### SC4: Admin can upload 4 images

```
Verify: In admin create modal, select 4 images. Confirm all 4 show preview. Submit and verify product has 4 images.
```

### SC5: Admin cannot exceed 4 images

```
Verify: With 3 existing images in edit mode, try to add 2 new images. Confirm only 1 is accepted, max reached message appears.
```

### SC6: Existing images shown in edit mode

```
Verify: Edit a product with 2 existing images. Confirm both appear in preview grid with remove buttons.
```

### SC7: Image deletion works end-to-end

```
Verify: In edit modal, remove an existing image. Save. Reopen modal. Confirm image is gone. Confirm Cloudinary deletion.
```

### SC8: GIF uploads accepted

```
Verify: Upload a GIF file as a product image. Confirm backend accepts it and image displays correctly.
```

## Technical Context

### Architecture

- **Frontend:** Next.js 16.1.6 (App Router), React 19.2.3, TypeScript, Tailwind CSS v4 (OKLCH colors)
- **Backend:** Express.js, Mongoose, Cloudinary for image storage
- **State:** React Context + useReducer (no external state library)
- **Image hosting:** Cloudinary (auto-optimization via URL transforms)
- **Image rendering:** `next/image` with Cloudinary loader
- **UI locale:** Vietnamese

### Existing Patterns to Follow

- **Multi-upload pattern:** `ProductReviews.tsx` uses `ImageUploadPreview` component with grid layout, remove buttons, blob URL cleanup via `URL.revokeObjectURL()`
- **Backend multi-upload:** `reviewService.js` loops files, uploads to Cloudinary, rollback on failure
- **Multer config:** `upload.array('images', N)` already used for reviews
- **Error handling:** `sonner` toast for user-facing errors

### Key Files

| Layer    | File                                                   | Role                            |
| -------- | ------------------------------------------------------ | ------------------------------- |
| Frontend | `frontend/src/app/products/[id]/page.tsx`              | Product detail page             |
| Frontend | `frontend/src/components/admin/AdminProductsPanel.tsx` | Admin product create/edit modal |
| Frontend | `frontend/src/components/ProductCard.tsx`              | Product type definition         |
| Frontend | `frontend/src/lib/api.ts`                              | API client functions            |
| Backend  | `backend/src/middlewares/uploadMiddleware.js`          | Multer config                   |
| Backend  | `backend/src/controllers/productController.js`         | Product controller              |
| Backend  | `backend/src/services/productService.js`               | Cloudinary upload logic         |
| Backend  | `backend/src/repositories/productRepository.js`        | MongoDB operations              |
| Backend  | `backend/src/routes/productRoutes.js`                  | Route definitions               |
| Backend  | `backend/src/models/Product.js`                        | Mongoose schema                 |
| Pattern  | `frontend/src/components/ProductReviews.tsx`           | Multi-upload reference          |
| Pattern  | `backend/src/services/reviewService.js`                | Backend multi-upload reference  |

## Affected Files

### Modified

| File                                                   | Change                                              |
| ------------------------------------------------------ | --------------------------------------------------- |
| `frontend/src/app/products/[id]/page.tsx`              | Dynamic thumbnails, image switching, data mapping   |
| `frontend/src/components/admin/AdminProductsPanel.tsx` | Multi-file upload, preview grid, remove, validation |
| `frontend/src/components/ProductCard.tsx`              | Add `imageUrls?: string[]` to Product type          |
| `frontend/src/lib/api.ts`                              | Add `uploadProductImages()`, `deleteProductImage()` |
| `backend/src/middlewares/uploadMiddleware.js`          | Add `upload.array('images', 4)` + GIF MIME fix      |
| `backend/src/controllers/productController.js`         | Bulk upload handler, delete image handler           |
| `backend/src/services/productService.js`               | Multi-file upload logic, delete logic               |
| `backend/src/repositories/productRepository.js`        | Add `removeImage()` method                          |
| `backend/src/routes/productRoutes.js`                  | Add DELETE route for image removal                  |

### New Files

None — all changes fit within existing file structure.

## Tasks

### Task 1: Backend — GIF MIME fix + multi-upload middleware

```yaml
type: backend
estimated_effort: small
depends_on: []
files:
  - backend/src/middlewares/uploadMiddleware.js
```

- Add `image/gif` to multer's `fileFilter` allowed MIME types
- Add `uploadProductImages` export using `upload.array('images', 4)`

### Task 2: Backend — Bulk upload + delete endpoints

```yaml
type: backend
estimated_effort: medium
depends_on: [1]
files:
  - backend/src/controllers/productController.js
  - backend/src/services/productService.js
  - backend/src/repositories/productRepository.js
  - backend/src/routes/productRoutes.js
```

- Add `uploadImages` controller: validate `req.files`, loop Cloudinary upload with rollback
- Add `deleteImage` controller: validate image URL, remove from array, delete from Cloudinary
- Add `removeImage(productId, imageUrl)` to repository using `$pull`
- Add `DELETE /:id/images` route with admin auth
- Update `POST /:id/images` to use `upload.array('images', 4)` middleware

### Task 3: Frontend API — Multi-upload + delete functions

```yaml
type: frontend
estimated_effort: small
depends_on: [2]
files:
  - frontend/src/lib/api.ts
```

- Add `uploadProductImages(id: string, files: File[]): Promise<Product>` — loop `FormData.append('images', file)` for each
- Add `deleteProductImage(id: string, imageUrl: string): Promise<void>` — DELETE request
- Keep existing `uploadProductImage()` (single) for backward compat

### Task 4: Frontend — Product type update

```yaml
type: frontend
estimated_effort: small
depends_on: []
files:
  - frontend/src/components/ProductCard.tsx
```

- Add `imageUrls?: string[]` to UI `Product` type interface

### Task 5: Frontend — Admin multi-image upload modal

```yaml
type: frontend
estimated_effort: large
depends_on: [3, 4]
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
```

- Replace `selectedImageFile: File | null` with `selectedImageFiles: File[]`
- Add `existingImages: string[]` state, populated from `product.images` in edit mode
- Add `removedImages: string[]` state to track existing images marked for deletion
- Update file input: `multiple` attribute, `onChange` appends files (cap at 4 total)
- Build 2×2 preview grid showing existing Cloudinary images + new file blob URLs
- Add per-image remove button (X overlay) for both existing and new images
- Validate each file on select (MIME, size), toast on invalid
- Show disabled state / message when 4 images reached
- Update submit flow:
  - On save: upload new files via `uploadProductImages()`
  - On save: delete removed existing images via `deleteProductImage()`
  - Clean up blob URLs via `URL.revokeObjectURL()` on unmount / removal
- Reference `ProductReviews.tsx` `ImageUploadPreview` for pattern

### Task 6: Frontend — Product detail dynamic thumbnails + image switching

```yaml
type: frontend
estimated_effort: medium
depends_on: [4]
files:
  - frontend/src/app/products/[id]/page.tsx
```

- Update data mapping: `imageUrls: product.images ?? []` (preserve full array)
- Add `const [selectedImageIndex, setSelectedImageIndex] = useState(0)` state
- Update main image section: use `imageUrls[selectedImageIndex]` as src
- Replace hardcoded `[1,2,3,4].map()` with `imageUrls.map((url, i) => ...)`:
  - Show `<Image>` with Cloudinary URL for each
  - `onClick` → `setSelectedImageIndex(i)`
  - Active state: ring/border on selected thumbnail (e.g., `ring-2 ring-primary`)
- If `imageUrls.length === 0`: show SVG illustration, hide thumbnail strip
- If `imageUrls.length === 1`: show image as main, hide thumbnail strip (no switching needed)

### Task 7: Verification + cleanup

```yaml
type: verification
estimated_effort: small
depends_on: [5, 6]
files: []
```

- Test all success criteria (SC1–SC8)
- Verify no TypeScript errors (`npm run typecheck`)
- Verify no lint errors (`npm run lint:fix`)
- Test edge cases: 0 images, 1 image, 4 images, invalid files, large files

## Risks

| Risk                                                   | Likelihood | Impact | Mitigation                                                          |
| ------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------- |
| Cloudinary upload timeout on 4 large images            | Medium     | Medium | Sequential upload with per-file error handling, rollback on failure |
| Blob URL memory leak in admin modal                    | Low        | Low    | `URL.revokeObjectURL()` on file removal and component unmount       |
| Race condition if user saves while uploads in progress | Medium     | High   | Disable save button during upload, show progress indicator          |
| Breaking existing single-image products                | Low        | High   | Backward-compat: `imageUrls` falls back to `[imageUrl]` if needed   |

## Open Questions

| #   | Question                                                          | Impact       | Default if Unanswered                              |
| --- | ----------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| 1   | Should image order be user-controllable (drag to reorder)?        | UX           | No reordering in v1 — upload order = display order |
| 2   | Should we limit total upload size (e.g., 20MB across all 4)?      | Backend load | No — keep per-file 5MB limit only                  |
| 3   | Should deleted Cloudinary images be soft-deleted or hard-deleted? | Storage cost | Hard delete (immediate Cloudinary removal)         |

## Notes

- The review system already has a working multi-upload pattern (`upload.array('images', 3)` + `ImageUploadPreview`). This feature should follow the same patterns for consistency.
- The `ProductDetailModal.tsx` (quick-view modal) is intentionally out of scope — it keeps single image display for simplicity.
- Vietnamese locale: any new user-facing strings (e.g., "Tối đa 4 ảnh", "Xóa ảnh") should be in Vietnamese.
