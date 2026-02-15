# Cloudinary Product Image Upload, Seed Data & Frontend Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Integrate Cloudinary image upload for products, seed categories/products with baby-themed images, and migrate customer-facing frontend from mock data to DB-backed APIs.

**Architecture:** Backend adds `multer` + `cloudinary` for image upload via `POST /api/products/:id/images`, a seed script creates 6 categories + 16 products with Cloudinary-uploaded images, and frontend components (`FeaturedProducts`, `Categories`, `products/page`) switch from hardcoded mock arrays to API fetches. `ProductCard` gains image URL rendering with SVG illustration fallback.

**Tech Stack:** Express.js (CommonJS), Mongoose, Cloudinary SDK, Multer, Next.js (App Router, TypeScript).

---

## Task 1: Install backend dependencies & configure Cloudinary

**Files:**

- Modify: `backend/package.json` (add `cloudinary`, `multer` dependencies)
- Modify: `backend/.env.example` (add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` placeholders)
- Create: `backend/src/config/cloudinary.js`

**Step 1: Install cloudinary and multer**

Run:

```bash
cd backend && npm install cloudinary multer
```

Expected: `cloudinary` and `multer` appear in `dependencies` in `package.json`.

**Step 2: Add Cloudinary env vars to `.env.example`**

Add these 3 lines at the end of `backend/.env.example` (after line 5):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Step 3: Verify `.env` has real Cloudinary values**

Check that `backend/.env` (gitignored) contains real values for these 3 variables. If not, add them manually from the Cloudinary dashboard. **Do NOT commit real values.**

**Step 4: Create Cloudinary config module**

Create `backend/src/config/cloudinary.js`:

```js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

**Step 5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/.env.example backend/src/config/cloudinary.js
git commit -m "feat(backend): add cloudinary + multer deps and config (bd-1wc)"
```

---

## Task 2: Build image upload endpoint `POST /api/products/:id/images`

**Files:**

- Create: `backend/src/middlewares/uploadMiddleware.js`
- Modify: `backend/src/services/productService.js` (add `uploadImage` method)
- Modify: `backend/src/repositories/productRepository.js` (add `addImage` method)
- Modify: `backend/src/controllers/productController.js` (add `uploadImage` handler)
- Modify: `backend/src/routes/productRoutes.js` (add upload route)

**Step 1: Create multer upload middleware**

Create `backend/src/middlewares/uploadMiddleware.js`:

```js
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

module.exports = upload;
```

**Step 2: Add `addImage` to productRepository**

In `backend/src/repositories/productRepository.js`, add this method **before** the `existsBySku` method (before line 126):

```js
  async addImage(id, imageUrl) {
    return Product.findByIdAndUpdate(
      id,
      { $push: { images: imageUrl } },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
  }
```

**Step 3: Add `uploadImage` to productService**

In `backend/src/services/productService.js`, add this import at the top (after line 2):

```js
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
```

Then add this method **before** `deleteProduct` (before line 93):

```js
  async uploadImage(productId, fileBuffer, mimetype) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with id ${productId} not found`);
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      const readable = Readable.from(fileBuffer);
      readable.pipe(uploadStream);
    });

    return productRepository.addImage(productId, result.secure_url);
  }
```

**Step 4: Add `uploadImage` controller handler**

In `backend/src/controllers/productController.js`, add this handler **after** `deleteProduct` (after line 71):

```js
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const { ValidationError } = require("../errors");
    throw new ValidationError("Image file is required");
  }
  const product = await productService.uploadImage(
    req.params.id,
    req.file.buffer,
    req.file.mimetype,
  );
  sendSuccess(res, product, "Image uploaded successfully");
});
```

**Step 5: Add upload route**

In `backend/src/routes/productRoutes.js`, add the import for upload middleware at line 6 (after `requireRole`):

```js
const upload = require("../middlewares/uploadMiddleware");
```

Then add the upload route **before** `module.exports` (before line 17):

```js
router.post(
  "/:id/images",
  authMiddleware,
  requireRole("admin"),
  upload.single("image"),
  productController.uploadImage,
);
```

**Step 6: Verify upload works manually**

Run:

```bash
cd backend && npm run start
```

Test with curl (requires running backend, valid admin cookie, valid product ID, and a test image):

```bash
curl -X POST -b "accessToken=<admin_jwt>" -F "image=@./test-image.jpg" http://localhost:3001/api/products/<productId>/images
```

Expected: 200 response with product containing new image URL in `images` array, URL starts with `https://res.cloudinary.com/`.

**Step 7: Commit**

```bash
git add backend/src/middlewares/uploadMiddleware.js backend/src/repositories/productRepository.js backend/src/services/productService.js backend/src/controllers/productController.js backend/src/routes/productRoutes.js
git commit -m "feat(backend): add POST /api/products/:id/images upload endpoint (bd-1wc)"
```

---

## Task 3: Create seed script for categories, products, and images

**Files:**

- Create: `backend/src/seed.js`
- Modify: `backend/package.json` (add `seed` script)

**Step 1: Add seed script to package.json**

In `backend/package.json`, add this script entry inside `"scripts"` (after line 8, the `lint:fix` line):

```json
    "seed": "node src/seed.js",
```

**Step 2: Create the seed script**

Create `backend/src/seed.js` with the following content. This script:

- Connects to MongoDB
- Creates 6 categories matching the mock data names
- Creates 16 products matching mock data, each with an illustration mapping
- Downloads a placeholder baby-themed image from Unsplash and uploads to Cloudinary for each product
- Is idempotent (skips if categories/products already exist by name)

```js
require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("./config/cloudinary");
const Category = require("./models/Category");
const Product = require("./models/Product");

const SEED_CATEGORIES = [
  { name: "Quần áo", description: "Quần áo cho bé từ sơ sinh đến 5 tuổi" },
  { name: "Bình sữa", description: "Bình sữa và phụ kiện cho bé bú" },
  { name: "Đồ chơi", description: "Đồ chơi an toàn phát triển trí tuệ" },
  { name: "Xe đẩy", description: "Xe đẩy và ghế ngồi ô tô cho bé" },
  { name: "Tã & Bỉm", description: "Tã bỉm cao cấp cho bé" },
  { name: "Phụ kiện", description: "Ti giả, yếm, và phụ kiện cho bé" },
];

// Publicly available baby-themed placeholder images (Unsplash URLs)
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=400&fit=crop", // baby clothes
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop", // baby bottle
  "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop", // teddy bear
  "https://images.unsplash.com/photo-1586048018531-0ced4ebca428?w=400&h=400&fit=crop", // baby diaper
  "https://images.unsplash.com/photo-1590862300985-87c4e36e35a5?w=400&h=400&fit=crop", // stroller
  "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop", // baby crib
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop", // skincare
  "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop", // baby shoes
];

const SEED_PRODUCTS = [
  {
    name: "Bộ quần áo Cotton Organic cho bé sơ sinh",
    price: 299000,
    quantity: 50,
    categoryName: "Quần áo",
    imageIdx: 0,
  },
  {
    name: "Bình sữa chống đầy hơi Pigeon",
    price: 189000,
    quantity: 100,
    categoryName: "Bình sữa",
    imageIdx: 1,
  },
  {
    name: "Gấu bông Teddy Bear siêu mềm mại",
    price: 159000,
    quantity: 80,
    categoryName: "Đồ chơi",
    imageIdx: 2,
  },
  {
    name: "Tã dán cao cấp Bobby Extra Soft",
    price: 249000,
    quantity: 200,
    categoryName: "Tã & Bỉm",
    imageIdx: 3,
  },
  {
    name: "Xe đẩy gấp gọn đa năng",
    price: 2490000,
    quantity: 15,
    categoryName: "Xe đẩy",
    imageIdx: 4,
  },
  {
    name: "Nôi điện tự động ru ngủ",
    price: 1890000,
    quantity: 20,
    categoryName: "Phụ kiện",
    imageIdx: 5,
  },
  {
    name: "Bộ chăm sóc da cho bé Johnson",
    price: 329000,
    quantity: 60,
    categoryName: "Phụ kiện",
    imageIdx: 6,
  },
  {
    name: "Giày tập đi mềm chống trơn",
    price: 199000,
    quantity: 75,
    categoryName: "Quần áo",
    imageIdx: 7,
  },
  {
    name: "Ti giả silicon mềm cho bé",
    price: 89000,
    quantity: 150,
    categoryName: "Phụ kiện",
    imageIdx: 1,
  },
  {
    name: "Lục lạc đồ chơi phát triển giác quan",
    price: 129000,
    quantity: 90,
    categoryName: "Đồ chơi",
    imageIdx: 2,
  },
  {
    name: "Bột ăn dặm Gerber organic",
    price: 175000,
    quantity: 120,
    categoryName: "Phụ kiện",
    imageIdx: 6,
  },
  {
    name: "Áo khoác giữ ấm lông cừu",
    price: 450000,
    quantity: 35,
    categoryName: "Quần áo",
    imageIdx: 0,
  },
  {
    name: "Bình sữa thủy tinh cao cấp Comotomo",
    price: 320000,
    quantity: 55,
    categoryName: "Bình sữa",
    imageIdx: 1,
  },
  {
    name: "Thú nhồi bông hình thỏ dễ thương",
    price: 189000,
    quantity: 65,
    categoryName: "Đồ chơi",
    imageIdx: 2,
  },
  {
    name: "Tã quần Huggies Dry Pants",
    price: 289000,
    quantity: 180,
    categoryName: "Tã & Bỉm",
    imageIdx: 3,
  },
  {
    name: "Xe đẩy siêu nhẹ travel system",
    price: 3200000,
    quantity: 10,
    categoryName: "Xe đẩy",
    imageIdx: 4,
  },
];

async function uploadImageFromUrl(imageUrl, productName) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "products",
      resource_type: "image",
      public_id: `seed-${productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}-${Date.now()}`,
    });
    return result.secure_url;
  } catch (error) {
    console.warn(`  ⚠ Failed to upload image for "${productName}": ${error.message}`);
    return null;
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // 1. Seed categories
    console.log("\n📦 Seeding categories...");
    const categoryMap = {};
    for (const catData of SEED_CATEGORIES) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await new Category(catData).save();
        console.log(`  ✅ Created category: ${catData.name}`);
      } else {
        console.log(`  ⏭ Category exists: ${catData.name}`);
      }
      categoryMap[catData.name] = category._id;
    }

    // 2. Seed products with Cloudinary images
    console.log("\n🍼 Seeding products with images...");
    for (const prodData of SEED_PRODUCTS) {
      const existing = await Product.findOne({ name: prodData.name });
      if (existing) {
        console.log(`  ⏭ Product exists: ${prodData.name}`);
        continue;
      }

      const categoryId = categoryMap[prodData.categoryName];
      if (!categoryId) {
        console.warn(`  ⚠ Category not found for product: ${prodData.name}`);
        continue;
      }

      // Upload placeholder image to Cloudinary
      const imageUrl = await uploadImageFromUrl(
        PLACEHOLDER_IMAGES[prodData.imageIdx],
        prodData.name,
      );

      const product = new Product({
        name: prodData.name,
        price: prodData.price,
        quantity: prodData.quantity,
        category: categoryId,
        description: `${prodData.name} - Sản phẩm chất lượng cao cho bé yêu`,
        images: imageUrl ? [imageUrl] : [],
        isActive: true,
      });

      await product.save();
      console.log(
        `  ✅ Created product: ${prodData.name}${imageUrl ? " (with image)" : " (no image)"}`,
      );
    }

    console.log("\n🎉 Seed completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
```

**Step 3: Run the seed script**

Run:

```bash
cd backend && npm run seed
```

Expected: Console output showing categories created/skipped, products created with Cloudinary image URLs.

**Step 4: Verify seeded data via API**

Run:

```bash
curl http://localhost:3001/api/categories | jq '.data | length'
# Expected: 6

curl http://localhost:3001/api/products | jq '.data.products | length'
# Expected: 16 (or up to default limit of 10, use ?limit=20)

curl "http://localhost:3001/api/products?limit=20" | jq '.data.products[0].images'
# Expected: Array with Cloudinary URL(s)
```

**Step 5: Run seed again to verify idempotency**

Run:

```bash
cd backend && npm run seed
```

Expected: All items show "exists" / "⏭" messages, no duplicates created.

**Step 6: Commit**

```bash
git add backend/src/seed.js backend/package.json
git commit -m "feat(backend): add seed script for categories, products, and Cloudinary images (bd-1wc)"
```

---

## Task 4: Configure Next.js for Cloudinary images

**Files:**

- Modify: `frontend/next.config.ts`

**Step 1: Add Cloudinary domain to Next.js image config**

Replace the entire content of `frontend/next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

**Step 2: Commit**

```bash
git add frontend/next.config.ts
git commit -m "feat(frontend): add Cloudinary + Unsplash image domains to Next.js config (bd-1wc)"
```

---

## Task 5: Update ProductCard to support image URLs with illustration fallback

**Files:**

- Modify: `frontend/src/components/ProductCard.tsx`

**Step 1: Update the Product interface**

In `frontend/src/components/ProductCard.tsx`, replace the `Product` interface (lines 10–20) with:

```tsx
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  illustration: ProductIllustrationType;
  imageUrl?: string;
  rating: number;
  reviews: number;
  badge?: "new" | "sale" | "bestseller";
  category: string;
}
```

The only change is adding `imageUrl?: string;` after `illustration`.

**Step 2: Add Next.js Image import**

At the top of the file, add the Image import (after `import Link from 'next/link';` on line 4):

```tsx
import Image from "next/image";
```

**Step 3: Update the product illustration section to prefer imageUrl**

Replace the "Product Illustration" section (lines 121–130) with:

```tsx
{
  /* Product Image or Illustration */
}
<div className="w-full h-full flex items-center justify-center">
  <div className={`transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"}`}>
    {product.imageUrl ? (
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={200}
        height={200}
        className="object-contain w-full h-full rounded-lg"
        sizes="(max-width: 640px) 50vw, 200px"
      />
    ) : (
      <IllustrationComponent size={100} />
    )}
  </div>
</div>;
```

**Step 4: Verify no TypeScript errors**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

**Step 5: Commit**

```bash
git add frontend/src/components/ProductCard.tsx
git commit -m "feat(frontend): ProductCard renders image URL with illustration fallback (bd-1wc)"
```

---

## Task 6: Migrate FeaturedProducts from mock data to API

**Files:**

- Modify: `frontend/src/components/FeaturedProducts.tsx`

**Step 1: Replace the entire FeaturedProducts component**

Replace the full content of `frontend/src/components/FeaturedProducts.tsx` with the following. Key changes:

- Remove static `featuredProducts` array
- Fetch from `/api/products/active?limit=8` on mount
- Map API `Product` to `ProductCard.Product` with `imageUrl` from `images[0]`
- Add loading skeleton and error states

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard, { type Product as CardProduct } from "./ProductCard";
import { ArrowRightIcon, SparkleIcon } from "./icons";
import { type Product as ApiProduct, fetchProducts } from "@/lib/api";

// Map illustration based on category name for fallback
const categoryIllustrationMap: Record<string, CardProduct["illustration"]> = {
  "Quần áo": "clothes",
  "Bình sữa": "bottle",
  "Đồ chơi": "teddy",
  "Tã & Bỉm": "diaper",
  "Xe đẩy": "stroller",
  "Giường & Nôi": "crib",
  "Chăm sóc": "skincare",
  "Giày dép": "shoes",
  "Phụ kiện": "pacifier",
  "Ăn dặm": "food",
};

function mapApiProductToCard(p: ApiProduct): CardProduct {
  const categoryName = typeof p.category === "string" ? "" : p.category?.name || "";
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    imageUrl: p.images?.[0],
    illustration: categoryIllustrationMap[categoryName] || "teddy",
    rating: 4.5 + Math.random() * 0.5, // placeholder rating until rating system exists
    reviews: Math.floor(Math.random() * 300) + 50,
    category: categoryName,
  };
}

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ limit: 8 })
      .then((data) => {
        setProducts(data.products.map(mapApiProductToCard));
      })
      .catch((err) => {
        console.error("Failed to fetch featured products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 bg-[var(--warm-white)] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
          <div className="text-center sm:text-left mb-6 sm:mb-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
              <SparkleIcon size={16} className="animate-sparkle" />
              <span>Sản phẩm nổi bật</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Được yêu thích nhất
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-md">
              Những sản phẩm được các bà mẹ tin tưởng lựa chọn cho bé yêu
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              aria-label="Cuộn sang trái"
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-pink-100 text-[var(--text-secondary)] hover:text-pink-500 hover:border-pink-300 transition-all duration-300"
            >
              <ArrowRightIcon size={20} className="rotate-180" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Cuộn sang phải"
              className="p-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowRightIcon size={20} />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px]">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 animate-pulse">
                    <div className="aspect-square bg-pink-50" />
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-pink-50 rounded w-3/4" />
                      <div className="h-3 bg-pink-50 rounded w-1/2" />
                      <div className="h-5 bg-pink-50 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))
            : products.map((product, index) => (
                <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px]">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary inline-flex items-center gap-2 group">
            <span>Xem tất cả sản phẩm</span>
            <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add frontend/src/components/FeaturedProducts.tsx
git commit -m "feat(frontend): FeaturedProducts fetches from API instead of mock data (bd-1wc)"
```

---

## Task 7: Migrate Categories component from mock data to API

**Files:**

- Modify: `frontend/src/components/Categories.tsx`

**Step 1: Replace the Categories component**

Replace the full content of `frontend/src/components/Categories.tsx` with the following. Key changes:

- Remove static `categories` array
- Fetch from `/api/categories` on mount
- Map API Category to display format with illustration icons
- Preserve promo banner section unchanged
- Add loading and empty states

```tsx
"use client";

import { useEffect, useState } from "react";
import { SparkleIcon } from "./icons";
import {
  BottleIllustration,
  ClothesIllustration,
  DiaperIllustration,
  PacifierIllustration,
  StrollerIllustration,
  TeddyIllustration,
} from "./icons/ProductIllustrations";
import { type Category as ApiCategory, fetchCategories } from "@/lib/api";

// Map category names to illustration components
const categoryIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "Quần áo": ClothesIllustration,
  "Bình sữa": BottleIllustration,
  "Đồ chơi": TeddyIllustration,
  "Xe đẩy": StrollerIllustration,
  "Tã & Bỉm": DiaperIllustration,
  "Phụ kiện": PacifierIllustration,
};

const categoryColorMap: Record<string, { color: string; hoverColor: string }> = {
  "Quần áo": {
    color: "from-pink-100 to-pink-200",
    hoverColor: "group-hover:from-pink-200 group-hover:to-pink-300",
  },
  "Bình sữa": {
    color: "from-blue-100 to-blue-200",
    hoverColor: "group-hover:from-blue-200 group-hover:to-blue-300",
  },
  "Đồ chơi": {
    color: "from-amber-100 to-amber-200",
    hoverColor: "group-hover:from-amber-200 group-hover:to-amber-300",
  },
  "Xe đẩy": {
    color: "from-purple-100 to-purple-200",
    hoverColor: "group-hover:from-purple-200 group-hover:to-purple-300",
  },
  "Tã & Bỉm": {
    color: "from-cyan-100 to-cyan-200",
    hoverColor: "group-hover:from-cyan-200 group-hover:to-cyan-300",
  },
  "Phụ kiện": {
    color: "from-rose-100 to-rose-200",
    hoverColor: "group-hover:from-rose-200 group-hover:to-rose-300",
  },
};

const defaultColor = {
  color: "from-gray-100 to-gray-200",
  hoverColor: "group-hover:from-gray-200 group-hover:to-gray-300",
};

export default function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Failed to fetch categories:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--warm-white)] to-pink-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4 animate-bounce-soft">
            <SparkleIcon size={16} />
            Khám phá
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Danh mục sản phẩm
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Tìm kiếm sản phẩm phù hợp cho bé yêu theo từng danh mục
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 sm:p-8 rounded-3xl bg-white shadow-md animate-pulse">
                  <div className="flex justify-center mb-4">
                    <div className="w-[70px] h-[70px] bg-pink-50 rounded-full" />
                  </div>
                  <div className="h-5 bg-pink-50 rounded w-3/4 mx-auto mb-1" />
                  <div className="h-4 bg-pink-50 rounded w-1/2 mx-auto" />
                </div>
              ))
            : categories.map((category, index) => {
                const IconComponent = categoryIconMap[category.name] || TeddyIllustration;
                const colors = categoryColorMap[category.name] || defaultColor;
                return (
                  <button
                    key={category._id}
                    className="group animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                      animationFillMode: "forwards",
                    }}
                  >
                    <div className="relative p-6 sm:p-8 rounded-3xl bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden">
                      {/* Background Gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${colors.color} ${colors.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      ></div>

                      {/* Icon */}
                      <div className="relative z-10 flex justify-center mb-4">
                        <div className="transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                          <IconComponent size={70} />
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="relative z-10 font-semibold text-[var(--text-primary)] text-lg mb-1 transition-colors duration-300">
                        {category.name}
                      </h3>

                      {/* Description */}
                      <p className="relative z-10 text-sm text-[var(--text-muted)] transition-colors duration-300">
                        {category.description || "Khám phá ngay"}
                      </p>

                      {/* Hover Ring */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-300/50 rounded-3xl transition-all duration-500"></div>
                    </div>
                  </button>
                );
              })}
        </div>

        {/* Promo Banner */}
        <div className="mt-16 relative">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-1">
            <div className="relative rounded-[22px] bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-8 sm:p-12 overflow-hidden">
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white font-medium text-sm mb-4">
                    Ưu đãi đặc biệt
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                    Giảm đến 50% cho bé yêu
                  </h3>
                  <p className="text-white/80 max-w-lg">
                    Đăng ký thành viên ngay để nhận ưu đãi độc quyền và cập nhật những sản phẩm mới
                    nhất
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="px-6 py-4 rounded-full w-full sm:w-72 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/30 focus:border-white focus:outline-none transition-all duration-300"
                  />
                  <button className="px-8 py-4 rounded-full bg-white text-pink-500 font-semibold hover:bg-pink-50 transition-all duration-300 hover:shadow-lg whitespace-nowrap">
                    Đăng ký ngay
                  </button>
                </div>
              </div>

              {/* Floating Elements - SVG based */}
              <div className="absolute top-4 left-4 animate-float opacity-30">
                <TeddyIllustration size={50} />
              </div>
              <div className="absolute bottom-4 right-4 animate-float-reverse opacity-30">
                <PacifierIllustration size={45} />
              </div>
              <div className="absolute top-1/2 right-1/4 animate-bounce-soft opacity-20">
                <SparkleIcon size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add frontend/src/components/Categories.tsx
git commit -m "feat(frontend): Categories fetches from API instead of mock data (bd-1wc)"
```

---

## Task 8: Migrate Products page from mock data to API

**Files:**

- Modify: `frontend/src/app/products/page.tsx`

**Step 1: Replace the ProductsPage component**

This is the most complex migration. Replace the entire content of `frontend/src/app/products/page.tsx`. Key changes:

- Remove static `allProducts` array (190 lines) and derived `categories` array
- Fetch products from API on mount using `fetchProducts`
- Fetch categories from API using `fetchCategories`
- Map API types to ProductCard types with `imageUrl`
- Preserve all existing UI: search, category filter, price filter, sort, view mode, mobile filter modal
- Move filtering/sorting to client-side on fetched data (later can be server-side)

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  CloseIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/icons";
import {
  BottleIllustration,
  ClothesIllustration,
  DiaperIllustration,
  PacifierIllustration,
  StrollerIllustration,
  TeddyIllustration,
} from "@/components/icons/ProductIllustrations";
import ProductCard, { type Product as CardProduct } from "@/components/ProductCard";
import {
  type Category as ApiCategory,
  type Product as ApiProduct,
  fetchCategories,
  fetchProducts,
} from "@/lib/api";

// Map category name → illustration for fallback
const categoryIllustrationMap: Record<string, CardProduct["illustration"]> = {
  "Quần áo": "clothes",
  "Bình sữa": "bottle",
  "Đồ chơi": "teddy",
  "Tã & Bỉm": "diaper",
  "Xe đẩy": "stroller",
  "Giường & Nôi": "crib",
  "Chăm sóc": "skincare",
  "Giày dép": "shoes",
  "Phụ kiện": "pacifier",
  "Ăn dặm": "food",
};

// Map category name → icon component for category tabs
const categoryIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "Quần áo": ClothesIllustration,
  "Bình sữa": BottleIllustration,
  "Đồ chơi": TeddyIllustration,
  "Tã & Bỉm": DiaperIllustration,
  "Xe đẩy": StrollerIllustration,
  "Phụ kiện": PacifierIllustration,
};

function mapApiProductToCard(p: ApiProduct): CardProduct {
  const categoryName = typeof p.category === "string" ? "" : p.category?.name || "";
  return {
    id: p._id,
    name: p.name,
    price: p.price,
    imageUrl: p.images?.[0],
    illustration: categoryIllustrationMap[categoryName] || "teddy",
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 300) + 50,
    category: categoryName,
  };
}

const sortOptions = [
  { id: "popular", name: "Phổ biến nhất" },
  { id: "newest", name: "Mới nhất" },
  { id: "price-asc", name: "Giá thấp → cao" },
  { id: "price-desc", name: "Giá cao → thấp" },
  { id: "rating", name: "Đánh giá cao" },
];

const priceRanges = [
  { id: "all", name: "Tất cả", min: 0, max: Infinity },
  { id: "under-200k", name: "< 200K", min: 0, max: 200000 },
  { id: "200k-500k", name: "200K - 500K", min: 200000, max: 500000 },
  { id: "500k-1m", name: "500K - 1M", min: 500000, max: 1000000 },
  { id: "over-1m", name: "> 1M", min: 1000000, max: Infinity },
];

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<CardProduct[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    Promise.all([fetchProducts({ limit: 100 }), fetchCategories()])
      .then(([productData, categoryData]) => {
        setAllProducts(productData.products.map(mapApiProductToCard));
        setApiCategories(categoryData);
      })
      .catch((err) => console.error("Failed to load products/categories:", err))
      .finally(() => setLoading(false));
  }, []);

  // Build category tabs from API data
  const categories = useMemo(() => {
    const tabs: Array<{
      id: string;
      name: string;
      Icon: React.ComponentType<{ size?: number; className?: string }>;
      count: number;
    }> = [{ id: "all", name: "Tất cả", Icon: SparkleIcon, count: allProducts.length }];

    for (const cat of apiCategories) {
      const count = allProducts.filter((p) => p.category === cat.name).length;
      tabs.push({
        id: cat._id,
        name: cat.name,
        Icon: categoryIconMap[cat.name] || TeddyIllustration,
        count,
      });
    }

    return tabs;
  }, [apiCategories, allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== "all") {
      const selectedCat = apiCategories.find((c) => c._id === selectedCategory);
      if (selectedCat) {
        result = result.filter((p) => p.category === selectedCat.name);
      }
    }

    const priceRange = priceRanges.find((r) => r.id === selectedPriceRange);
    if (priceRange && priceRange.id !== "all") {
      result = result.filter((p) => p.price >= priceRange.min && p.price < priceRange.max);
    }

    switch (selectedSort) {
      case "newest":
        result = result.reverse();
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [allProducts, apiCategories, searchQuery, selectedCategory, selectedSort, selectedPriceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setSelectedSort("popular");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "all" || selectedPriceRange !== "all";

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />

      {/* Compact Header Section */}
      <section className="bg-gradient-to-r from-pink-50 via-white to-purple-50 pt-6 pb-4 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Sản phẩm cho <span className="text-gradient">Bé yêu</span>
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {loading ? "..." : `${filteredProducts.length} sản phẩm`}
              </p>
            </div>

            {/* Search Bar - Compact */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                aria-label="Tìm kiếm sản phẩm"
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-pink-200 focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none bg-white text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
              />
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-pink-500 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none rounded"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs - Horizontal Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => {
              const IconComponent = category.Icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md"
                      : "bg-white border border-pink-100 text-[var(--text-secondary)] hover:border-pink-300 hover:bg-pink-50"
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {category.id === "all" ? (
                      <IconComponent
                        size={16}
                        className={isActive ? "text-white" : "text-pink-500"}
                      />
                    ) : (
                      <IconComponent size={24} />
                    )}
                  </div>
                  <span>{category.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/25" : "bg-pink-100 text-pink-500"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-pink-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {/* Left Side - Filters */}
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-lg bg-pink-50 text-pink-600 text-sm font-medium hover:bg-pink-100 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                <FilterIcon size={16} />
                <span>Lọc</span>
              </button>

              {/* Price Filter Select */}
              <div className="hidden sm:block">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  aria-label="Lọc theo giá"
                  className={`px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors appearance-none bg-no-repeat bg-[length:14px] bg-[right_8px_center] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ec4899%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] pr-7 cursor-pointer focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    selectedPriceRange !== "all"
                      ? "bg-pink-500 text-white"
                      : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                  }`}
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  aria-label="Xóa tất cả bộ lọc"
                  className="flex items-center gap-1 px-3 py-2.5 min-h-[44px] rounded-lg text-xs text-pink-500 hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                >
                  <CloseIcon size={12} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>

            {/* Right Side - Sort & View */}
            <div className="flex items-center gap-2">
              {/* Sort Select */}
              <div>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  aria-label="Sắp xếp sản phẩm"
                  className="px-3 py-2.5 min-h-[44px] rounded-lg bg-white border border-pink-200 text-sm text-[var(--text-secondary)] hover:border-pink-300 transition-colors appearance-none bg-no-repeat bg-[length:14px] bg-[right_8px_center] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ec4899%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] pr-7 cursor-pointer focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border border-pink-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Xem dạng lưới"
                  aria-pressed={viewMode === "grid"}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    viewMode === "grid"
                      ? "bg-pink-500 text-white"
                      : "bg-white text-[var(--text-muted)] hover:bg-pink-50"
                  }`}
                >
                  <GridIcon size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="Xem dạng danh sách"
                  aria-pressed={viewMode === "list"}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    viewMode === "list"
                      ? "bg-pink-500 text-white"
                      : "bg-white text-[var(--text-muted)] hover:bg-pink-50"
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 animate-pulse"
                >
                  <div className="aspect-square bg-pink-50" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-pink-50 rounded w-3/4" />
                    <div className="h-3 bg-pink-50 rounded w-1/2" />
                    <div className="h-5 bg-pink-50 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                <SearchIcon size={32} className="text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 min-h-[44px] rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Load More */}
          {!loading && filteredProducts.length > 0 && (
            <div className="text-center mt-8">
              <button className="px-6 py-2.5 min-h-[44px] rounded-xl border-2 border-pink-300 text-pink-500 text-sm font-medium hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none">
                Xem thêm sản phẩm
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-pink-100 p-4 flex items-center justify-between">
              <h2 id="filter-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
                Bộ lọc
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                aria-label="Đóng bộ lọc"
                className="p-3 min-w-[44px] min-h-[44px] rounded-full hover:bg-pink-50 text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Danh mục</h3>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => {
                    const IconComponent = category.Icon;
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex flex-col items-center gap-1 p-3 min-h-[44px] rounded-xl transition-all text-xs focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                          isActive
                            ? "bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-md"
                            : "bg-pink-50 text-[var(--text-secondary)]"
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {category.id === "all" ? (
                            <IconComponent
                              size={18}
                              className={isActive ? "text-white" : "text-pink-500"}
                            />
                          ) : (
                            <IconComponent size={28} />
                          )}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">
                  Khoảng giá
                </h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                        selectedPriceRange === range.id
                          ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md"
                          : "bg-pink-50 text-[var(--text-secondary)]"
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-pink-100 p-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 min-h-[44px] rounded-xl border-2 border-pink-300 text-pink-500 font-medium text-sm focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                Xóa lọc
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium text-sm shadow-md focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run:

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Commit**

```bash
git add frontend/src/app/products/page.tsx
git commit -m "feat(frontend): products page fetches from API instead of mock data (bd-1wc)"
```

---

## Verification

How to confirm the entire plan succeeded:

1. **Upload endpoint works**: `POST /api/products/:id/images` returns product with Cloudinary URL in `images` array
2. **Seed creates data**: `npm run seed` creates 6 categories + 16 products with Cloudinary image URLs
3. **Seed is idempotent**: Running `npm run seed` again creates no duplicates
4. **Frontend renders DB data**: Homepage and `/products` show API-backed content (no mock arrays in source)
5. **ProductCard renders images**: Products with `images[0]` show `<Image>`, those without show `<IllustrationComponent>`
6. **Next.js config**: Cloudinary domain in `remotePatterns`
7. **TypeScript clean**: `npx tsc --noEmit` passes in frontend
8. **No secrets committed**: `git diff --cached` shows no real Cloudinary credentials

## Next Command

`/ship bd-1wc`
