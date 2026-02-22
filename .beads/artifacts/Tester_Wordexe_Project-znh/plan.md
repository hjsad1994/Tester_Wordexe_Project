# Coupon System + Checkout Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Add a complete promotion/coupon code system (backend + frontend + admin) and fix the checkout redirect bug so users see the success page after ordering.

**Architecture:** Backend gets new Coupon model/service/controller/routes following existing Category/Order patterns. Order model extended with discount fields. Frontend checkout page gets coupon input UI and redirect fix. Success page shows discount. Admin panel gets new "Khuyến mãi" section. All API calls use existing `api.ts` fetch pattern with `credentials: 'include'`.

**Tech Stack:** Express 4.x + JavaScript + MongoDB/Mongoose (backend), Next.js + React 19 + TypeScript + Tailwind CSS 4 (frontend)

---

## Must-Haves

**Goal:** Users can apply coupon codes at checkout for discounts; admins can manage coupons; checkout redirects to success page reliably.

### Observable Truths

1. Admin can create/edit/delete/toggle coupons via `/admin/coupons`
2. User can enter a coupon code at checkout and see the discount applied to their total
3. User can select from available (valid) coupons shown on checkout page
4. Order is created with correct discount calculation (server-side validated)
5. User sees success page (not empty cart page) after completing checkout
6. Success page shows discount breakdown when a coupon was used
7. Invalid/expired coupons show clear Vietnamese error messages

### Required Artifacts

| Artifact | Provides | Path |
|----------|----------|------|
| Coupon Model | Mongoose schema for coupon data | `backend/src/models/Coupon.js` |
| Coupon Service | Business logic + validation + atomic redemption | `backend/src/services/couponService.js` |
| Coupon Controller | Thin HTTP handlers | `backend/src/controllers/couponController.js` |
| Coupon Routes | REST endpoints | `backend/src/routes/couponRoutes.js` |
| Route Registration | Mount coupon routes | `backend/src/routes/index.js` (modify) |
| Order Model Extension | `couponCode` + `discountAmount` fields | `backend/src/models/Order.js` (modify) |
| Order Service Extension | Coupon validation in createOrder | `backend/src/services/orderService.js` (modify) |
| Order Controller Extension | Pass couponCode through | `backend/src/controllers/orderController.js` (modify) |
| Frontend API Functions | TypeScript interfaces + fetch functions | `frontend/src/lib/api.ts` (modify) |
| Checkout Redirect Fix | `isOrderCompleteRef` flag | `frontend/src/app/checkout/page.tsx` (modify) |
| Checkout Coupon UI | Collapsible coupon input + available coupons | `frontend/src/app/checkout/page.tsx` (modify) |
| Success Page Discount | "Giảm giá" line item | `frontend/src/app/checkout/success/page.tsx` (modify) |
| Admin Coupons Panel | CRUD table + modals | `frontend/src/components/admin/AdminCouponsPanel.tsx` |
| Admin Coupons Page | Page wrapper | `frontend/src/app/admin/coupons/page.tsx` |
| Admin Sidebar Update | "Khuyến mãi" nav item | `frontend/src/components/admin/AdminSidebar.tsx` (modify) |

### Key Links

| From | To | Via | Risk |
|------|-----|-----|------|
| Checkout UI | Coupon Validation API | `POST /api/coupons/validate` | Network errors, stale coupons |
| Order Creation | Coupon Service | `validateCoupon()` + `redeemCoupon()` | Race condition on usage count |
| Cart clearing | Success redirect | `isOrderCompleteRef` | Guard fires before navigation |

### Task Dependencies

```
Task 1 (Coupon Model): needs nothing, creates backend/src/models/Coupon.js
Task 2 (Order Model Extension): needs nothing, creates modification to backend/src/models/Order.js
Task 3 (Coupon Service): needs Task 1, creates backend/src/services/couponService.js
Task 4 (Coupon Controller+Routes): needs Task 3, creates controller + routes + route registration
Task 5 (Order Integration): needs Task 3 + Task 2, modifies orderService + orderController
Task 6 (Frontend API): needs Task 4, modifies frontend/src/lib/api.ts
Task 7 (Checkout Redirect Fix): needs nothing, modifies frontend/src/app/checkout/page.tsx
Task 8 (Checkout Coupon UI): needs Task 6 + Task 7, modifies frontend/src/app/checkout/page.tsx
Task 9 (Success Page): needs Task 6, modifies frontend/src/app/checkout/success/page.tsx
Task 10 (Admin Panel): needs Task 6, creates AdminCouponsPanel + page + sidebar modification

Wave 1: Tasks 1, 2, 7 (parallel — no file overlap)
Wave 2: Task 3 (depends on Task 1)
Wave 3: Tasks 4, 5 (parallel — depend on Wave 2, different files)
Wave 4: Task 6 (depends on Task 4)
Wave 5: Tasks 8, 9, 10 (parallel — depend on Wave 4, different files except Task 8 shares checkout/page.tsx with Task 7 but Task 7 is done by now)
```

---

## Task 1: Create Coupon Model

**Tier:** worker

**Files:**
- Create: `backend/src/models/Coupon.js`

**Step 1: Create the Coupon model**

Create `backend/src/models/Coupon.js` following the Category.js pattern but with coupon-specific fields:

```javascript
const mongoose = require('mongoose');

const DISCOUNT_TYPES = ['percentage', 'fixed_amount', 'free_shipping'];

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
      match: [/^[A-Z0-9]+$/, 'Coupon code must contain only letters and numbers'],
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
      maxlength: [100, 'Coupon name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: DISCOUNT_TYPES,
        message: 'Discount type must be percentage, fixed_amount, or free_shipping',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maximumDiscount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative'],
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per-user limit must be at least 1'],
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.virtual('isCurrentlyValid').get(function () {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return false;
  return true;
});

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
```

**Step 2: Verify**

Run: `cd backend && node -e "const m = require('./src/models/Coupon'); console.log(Object.keys(m.schema.paths).join(', '))"`
Expected: Lists all fields including `code, name, description, discountType, discountValue, maximumDiscount, minimumOrderAmount, usageLimit, usageCount, perUserLimit, usedBy, isActive, validFrom, validUntil, createdBy, _id, createdAt, updatedAt`

Run: `cd backend && node -e "const m = require('./src/models/Coupon'); console.log(m.schema.path('code').options.unique)"`
Expected: `true`

**Step 3: Commit**

```bash
git add backend/src/models/Coupon.js
git commit -m "feat(znh): add Coupon Mongoose model with validation and indexes"
```

**Handoff Contract:**
- **Produces:** `backend/src/models/Coupon.js` — Mongoose model with all coupon fields
- **Consumed By:** Task 3 (Coupon Service), Task 5 (Order Integration)

---

## Task 2: Extend Order Model with Discount Fields

**Tier:** worker

**Files:**
- Modify: `backend/src/models/Order.js`

**Step 1: Add discount fields to Order schema**

In `backend/src/models/Order.js`, add these fields to `orderSchema` AFTER the `shippingFee` field and BEFORE the `total` field:

```javascript
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative'],
    },
```

The existing `total`, `customerInfo`, and all other fields remain unchanged.

**Step 2: Verify**

Run: `cd backend && node -e "const m = require('./src/models/Order'); console.log(m.schema.path('couponCode').instance, m.schema.path('discountAmount').instance)"`
Expected: `String Number`

**Step 3: Commit**

```bash
git add backend/src/models/Order.js
git commit -m "feat(znh): add couponCode and discountAmount fields to Order model"
```

**Handoff Contract:**
- **Produces:** Modified `backend/src/models/Order.js` with `couponCode` and `discountAmount` fields
- **Consumed By:** Task 5 (Order Integration)

---

## Task 3: Create Coupon Service

**Tier:** worker

**Files:**
- Create: `backend/src/services/couponService.js`

**Step 1: Create the service**

Create `backend/src/services/couponService.js` following the categoryService.js class-based singleton pattern:

```javascript
const Coupon = require('../models/Coupon');
const { NotFoundError, ValidationError } = require('../errors');

class CouponService {
  async createCoupon(data) {
    if (!data.code) {
      throw new ValidationError('Coupon code is required');
    }
    if (!data.name) {
      throw new ValidationError('Coupon name is required');
    }
    if (!data.discountType) {
      throw new ValidationError('Discount type is required');
    }

    const normalizedCode = String(data.code).trim().toUpperCase();
    const exists = await Coupon.findOne({ code: normalizedCode });
    if (exists) {
      throw new ValidationError(`Coupon with code '${normalizedCode}' already exists`);
    }

    return Coupon.create({
      ...data,
      code: normalizedCode,
    });
  }

  async getAllCoupons() {
    return Coupon.find().sort('-createdAt').lean();
  }

  async getCouponById(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    return coupon;
  }

  async updateCoupon(id, data) {
    if (data.code) {
      data.code = String(data.code).trim().toUpperCase();
      const existing = await Coupon.findOne({ code: data.code, _id: { $ne: id } });
      if (existing) {
        throw new ValidationError(`Coupon with code '${data.code}' already exists`);
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      throw new NotFoundError(`Coupon with id ${id} not found`);
    }
    if (coupon.usageCount > 0) {
      throw new ValidationError(
        'Cannot delete a coupon that has been used. Deactivate it instead.'
      );
    }
    await Coupon.findByIdAndDelete(id);
    return coupon;
  }

  async validateCoupon(code, subtotal, userId) {
    if (!code) {
      throw new ValidationError('Coupon code is required');
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      throw new ValidationError('Mã khuyến mãi không tồn tại');
    }

    if (!coupon.isActive) {
      throw new ValidationError('Mã khuyến mãi đã bị vô hiệu hóa');
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      throw new ValidationError('Mã khuyến mãi chưa có hiệu lực');
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      throw new ValidationError('Mã khuyến mãi đã hết hạn');
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError('Mã khuyến mãi đã hết lượt sử dụng');
    }

    if (userId && coupon.perUserLimit) {
      const userUsageCount = coupon.usedBy.filter(
        (uid) => String(uid) === String(userId)
      ).length;
      if (userUsageCount >= coupon.perUserLimit) {
        throw new ValidationError('Bạn đã sử dụng mã khuyến mãi này');
      }
    }

    if (coupon.minimumOrderAmount > 0 && subtotal < coupon.minimumOrderAmount) {
      throw new ValidationError(
        `Đơn hàng tối thiểu ${coupon.minimumOrderAmount.toLocaleString('vi-VN')}đ để sử dụng mã này`
      );
    }

    const discountAmount = this._calculateDiscount(coupon, subtotal);

    return {
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maximumDiscount: coupon.maximumDiscount,
      },
      discountAmount,
    };
  }

  _calculateDiscount(coupon, subtotal) {
    if (coupon.discountType === 'free_shipping') {
      return 0;
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maximumDiscount !== null && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.discountType === 'fixed_amount') {
      discount = coupon.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    return discount;
  }

  async redeemCoupon(couponId, userId) {
    const update = {
      $inc: { usageCount: 1 },
    };
    if (userId) {
      update.$push = { usedBy: userId };
    }

    const coupon = await Coupon.findOneAndUpdate(
      {
        _id: couponId,
        isActive: true,
        $or: [
          { usageLimit: null },
          { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
        ],
      },
      update,
      { new: true }
    );

    if (!coupon) {
      throw new ValidationError('Mã khuyến mãi đã hết lượt sử dụng');
    }

    return coupon;
  }

  async getAvailableCoupons() {
    const now = new Date();
    return Coupon.find({
      isActive: true,
      $or: [{ validFrom: null }, { validFrom: { $lte: now } }],
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    })
      .sort('-createdAt')
      .lean();
  }
}

module.exports = new CouponService();
```

**IMPORTANT NOTE:** The `getAvailableCoupons` method has duplicate `$or` keys which won't work in MongoDB. Fix by using `$and`:

```javascript
  async getAvailableCoupons() {
    const now = new Date();
    return Coupon.find({
      isActive: true,
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
        {
          $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
      ],
    })
      .sort('-createdAt')
      .lean();
  }
```

Use this corrected version in the actual implementation.

**Step 2: Verify**

Run: `cd backend && node -e "require('./src/services/couponService')"`
Expected: No errors

Run: `cd backend && node -e "const s = require('./src/services/couponService'); console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(s)).filter(m => m !== 'constructor').join(', '))"`
Expected: Lists `createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon, _calculateDiscount, redeemCoupon, getAvailableCoupons`

**Step 3: Commit**

```bash
git add backend/src/services/couponService.js
git commit -m "feat(znh): add CouponService with validation, discount calculation, and atomic redemption"
```

**Handoff Contract:**
- **Produces:** `backend/src/services/couponService.js` — Singleton service
- **Consumed By:** Task 4 (Controller+Routes), Task 5 (Order Integration)

---

## Task 4: Create Coupon Controller and Routes

**Tier:** worker

**Files:**
- Create: `backend/src/controllers/couponController.js`
- Create: `backend/src/routes/couponRoutes.js`
- Modify: `backend/src/routes/index.js`

**Step 1: Create the controller**

Create `backend/src/controllers/couponController.js` following `categoryController.js` pattern:

```javascript
const couponService = require('../services/couponService');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  sendSuccess(res, coupons, 'Coupons retrieved successfully');
});

exports.getCouponById = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  sendSuccess(res, coupon, 'Coupon retrieved successfully');
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon({
    ...req.body,
    createdBy: req.userId || null,
  });
  sendCreated(res, coupon, 'Coupon created successfully');
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  sendSuccess(res, coupon, 'Coupon updated successfully');
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  sendSuccess(res, null, 'Coupon deleted successfully');
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await couponService.validateCoupon(code, subtotal, req.userId);
  sendSuccess(res, result, 'Coupon validated successfully');
});

exports.getAvailableCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getAvailableCoupons();
  sendSuccess(res, coupons, 'Available coupons retrieved successfully');
});
```

**Step 2: Create the routes**

Create `backend/src/routes/couponRoutes.js` following `categoryRoutes.js` pattern:

```javascript
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/requireRole');

// Public/Auth routes
router.get('/available', authMiddleware, couponController.getAvailableCoupons);
router.post('/validate', authMiddleware, couponController.validateCoupon);

// Admin routes
router.get('/', authMiddleware, requireRole('admin'), couponController.getAllCoupons);
router.get('/:id', authMiddleware, requireRole('admin'), couponController.getCouponById);
router.post('/', authMiddleware, requireRole('admin'), couponController.createCoupon);
router.put('/:id', authMiddleware, requireRole('admin'), couponController.updateCoupon);
router.delete('/:id', authMiddleware, requireRole('admin'), couponController.deleteCoupon);

module.exports = router;
```

**Step 3: Register routes in index.js**

In `backend/src/routes/index.js`, add after the existing requires:

```javascript
const couponRoutes = require('./couponRoutes');
```

And add this line after `router.use('/categories', categoryRoutes);`:

```javascript
router.use('/coupons', couponRoutes);
```

The final file should have imports:
```javascript
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const couponRoutes = require('./couponRoutes');
const orderRoutes = require('./orderRoutes');
const productRoutes = require('./productRoutes');
const reviewRoutes = require('./reviewRoutes');
const userRoutes = require('./userRoutes');
```

And routes:
```javascript
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/coupons', couponRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
```

**Step 4: Verify**

Run: `grep "coupons" backend/src/routes/index.js`
Expected: Shows the coupon route registration lines

**Step 5: Commit**

```bash
git add backend/src/controllers/couponController.js backend/src/routes/couponRoutes.js backend/src/routes/index.js
git commit -m "feat(znh): add coupon controller, routes, and register in route index"
```

**Handoff Contract:**
- **Produces:** Controller + routes + route registration
- **Consumed By:** Task 6 (Frontend API Functions)

---

## Task 5: Integrate Coupon into Order Creation Flow

**Tier:** worker

**Files:**
- Modify: `backend/src/services/orderService.js`
- Modify: `backend/src/controllers/orderController.js`

**Step 1: Modify orderService.js**

Add the couponService require at the top of `backend/src/services/orderService.js`, after the existing requires:

```javascript
const couponService = require('./couponService');
```

Then modify the `createOrder` method. After the `shippingFee` validation block and BEFORE the `const status = ...` line, add coupon handling:

```javascript
    // Coupon handling
    let couponCode = null;
    let discountAmount = 0;
    let finalShippingFee = shippingFee;
    let redeemedCoupon = null;

    if (payload.couponCode) {
      const validation = await couponService.validateCoupon(
        payload.couponCode,
        subtotal,
        context.userId || null
      );
      couponCode = validation.coupon.code;
      discountAmount = validation.discountAmount;

      // Check if free_shipping type
      const coupon = await couponService.getCouponById(validation.coupon._id);
      if (coupon.discountType === 'free_shipping') {
        finalShippingFee = 0;
      }

      // Atomic redemption
      redeemedCoupon = await couponService.redeemCoupon(
        validation.coupon._id,
        context.userId || null
      );
    }
```

Then modify the `Order.create()` call to include coupon data. Change the `total` calculation and add the new fields:

Replace:
```javascript
      shippingFee,
      total: subtotal + shippingFee,
```

With:
```javascript
      shippingFee: payload.couponCode ? finalShippingFee : shippingFee,
      couponCode,
      discountAmount,
      total: subtotal - discountAmount + (payload.couponCode ? finalShippingFee : shippingFee),
```

**Step 2: Modify orderController.js**

In `backend/src/controllers/orderController.js`, the `createOrder` handler already passes `req.body` to `orderService.createOrder()` which means `couponCode` from the request body will automatically flow through. No changes needed to the controller since `payload.couponCode` is accessed directly in the service.

Verify the controller passes the full `req.body`: 
```javascript
exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, {
    userId: req.userId,
  });
  sendCreated(res, order, 'Order created successfully');
});
```

This already works — `req.body` includes `couponCode` when sent from frontend.

**Step 3: Verify**

Run: `cd backend && node -e "require('./src/services/orderService')"`
Expected: No errors (file loads without crashing)

**Step 4: Commit**

```bash
git add backend/src/services/orderService.js
git commit -m "feat(znh): integrate coupon validation and discount into order creation flow"
```

**Handoff Contract:**
- **Produces:** Modified order creation with coupon support
- **Consumed By:** Task 8 (Checkout Coupon UI sends `couponCode` in API call)

---

## Task 6: Add Coupon API Functions to Frontend

**Tier:** worker

**Files:**
- Modify: `frontend/src/lib/api.ts`

**Step 1: Add Coupon interfaces**

Add these TypeScript interfaces AFTER the `Order` interface and BEFORE the `CreateOrderPayload` interface in `frontend/src/lib/api.ts`:

```typescript
// ─── Coupons ────────────────────────────────────────────────────────

export type CouponDiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maximumDiscount: number | null;
  minimumOrderAmount: number;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  isCurrentlyValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponPayload {
  code: string;
  name: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maximumDiscount?: number | null;
  minimumOrderAmount?: number;
  usageLimit?: number | null;
  perUserLimit?: number;
  isActive?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon: {
    _id: string;
    code: string;
    name: string;
    discountType: CouponDiscountType;
    discountValue: number;
    maximumDiscount: number | null;
  };
  discountAmount: number;
}
```

**Step 2: Extend Order and CreateOrderPayload interfaces**

Add `couponCode` and `discountAmount` to the `Order` interface. After the `shippingFee` field:

```typescript
  couponCode: string | null;
  discountAmount: number;
```

Add `couponCode` to `CreateOrderPayload` interface. After `shippingFee?`:

```typescript
  couponCode?: string;
```

**Step 3: Add Coupon API functions**

Add these functions AFTER the `softDeleteOrder` function and BEFORE the `// ─── Review API` section:

```typescript
// ─── Coupon API ─────────────────────────────────────────────────────

export async function fetchCouponsApi(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE_URL}/api/coupons`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Không thể tải danh sách mã khuyến mãi'));
  }

  const body = (await res.json()) as ApiResponse<Coupon[]>;
  return body.data;
}

export async function fetchAvailableCouponsApi(): Promise<Coupon[]> {
  const res = await fetch(`${API_BASE_URL}/api/coupons/available`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Không thể tải mã khuyến mãi'));
  }

  const body = (await res.json()) as ApiResponse<Coupon[]>;
  return body.data;
}

export async function createCouponApi(payload: CouponPayload): Promise<Coupon> {
  const res = await fetch(`${API_BASE_URL}/api/coupons`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Không thể tạo mã khuyến mãi'));
  }

  const body = (await res.json()) as ApiResponse<Coupon>;
  return body.data;
}

export async function updateCouponApi(
  id: string,
  payload: Partial<CouponPayload>
): Promise<Coupon> {
  const res = await fetch(`${API_BASE_URL}/api/coupons/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Không thể cập nhật mã khuyến mãi'));
  }

  const body = (await res.json()) as ApiResponse<Coupon>;
  return body.data;
}

export async function deleteCouponApi(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/coupons/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Không thể xóa mã khuyến mãi'));
  }
}

export async function validateCouponApi(
  code: string,
  subtotal: number
): Promise<ValidateCouponResponse> {
  const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, 'Mã khuyến mãi không hợp lệ'));
  }

  const body = (await res.json()) as ApiResponse<ValidateCouponResponse>;
  return body.data;
}
```

**Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No type errors

Run: `grep -c "coupon\|Coupon" frontend/src/lib/api.ts`
Expected: Count > 0

**Step 5: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat(znh): add Coupon TypeScript interfaces and API functions to frontend"
```

**Handoff Contract:**
- **Produces:** Coupon types + API functions in `frontend/src/lib/api.ts`
- **Consumed By:** Tasks 8 (Checkout UI), 9 (Success Page), 10 (Admin Panel)

---

## Task 7: Fix Checkout Redirect Bug

**Tier:** worker

**Files:**
- Modify: `frontend/src/app/checkout/page.tsx`

**Step 1: Add useRef import**

The file already imports `{ useEffect, useMemo, useState }` from 'react'. Add `useRef` to that import:

```typescript
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
```

**Step 2: Add isOrderCompleteRef**

Inside the `CheckoutContent` function, after the `const isBuyNow = ...` line, add:

```typescript
  const isOrderCompleteRef = useRef(false);
```

**Step 3: Modify the cart-empty guard useEffect**

Find this existing code:

```typescript
  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);
```

Replace with:

```typescript
  useEffect(() => {
    if (checkoutItems.length === 0 && !isOrderCompleteRef.current) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);
```

**Step 4: Set the ref before clearing cart in completeOrder**

In the `completeOrder` function, find the section where cart is cleared and navigation happens. BEFORE the `clearCart()` / `clearBuyNowItem()` calls, add:

```typescript
      isOrderCompleteRef.current = true;
```

The relevant section should look like:

```typescript
      sessionStorage.setItem('lastOrderId', createdOrder._id);
      sessionStorage.setItem('lastOrderToken', createdOrder.publicAccessToken || '');

      isOrderCompleteRef.current = true;

      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }

      router.push(
        `/checkout/success?orderId=${encodeURIComponent(createdOrder._id)}&token=${encodeURIComponent(createdOrder.publicAccessToken || '')}`
      );
```

**Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No type errors

**Step 6: Commit**

```bash
git add frontend/src/app/checkout/page.tsx
git commit -m "fix(znh): prevent checkout redirect to /cart after successful order by using isOrderCompleteRef"
```

**Handoff Contract:**
- **Produces:** Fixed checkout redirect behavior
- **Consumed By:** Task 8 (builds on this file)

---

## Task 8: Add Coupon Input to Checkout Page

**Tier:** worker

**Files:**
- Modify: `frontend/src/app/checkout/page.tsx`

**Step 1: Add coupon-related imports**

Add to the existing imports from `@/lib/api`:

```typescript
import {
  createOrder as createOrderApi,
  fetchAvailableCouponsApi,
  validateCouponApi,
  type Coupon,
  type ValidateCouponResponse,
} from '@/lib/api';
```

**Step 2: Add coupon state variables**

Inside `CheckoutContent`, after the existing state declarations (after `const [submitError, setSubmitError] = useState<string | null>(null);`), add:

```typescript
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCouponSection, setShowCouponSection] = useState(false);
```

**Step 3: Update total calculation**

Find the existing `total` calculation:

```typescript
  const total = subtotal + SHIPPING_FEE;
```

Replace with:

```typescript
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const effectiveShippingFee =
    appliedCoupon?.coupon.discountType === 'free_shipping' ? 0 : SHIPPING_FEE;
  const total = subtotal - discountAmount + effectiveShippingFee;
```

**Step 4: Add useEffect to fetch available coupons**

After the existing `useEffect` that pre-fills form data from user profile, add:

```typescript
  // Fetch available coupons for logged-in users
  useEffect(() => {
    if (!user) return;
    const loadCoupons = async () => {
      try {
        const coupons = await fetchAvailableCouponsApi();
        setAvailableCoupons(coupons);
      } catch {
        // Silently fail - available coupons is optional
      }
    };
    void loadCoupons();
  }, [user]);
```

**Step 5: Add coupon handler functions**

After the `validate` function, add:

```typescript
  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = (code || couponCode).trim().toUpperCase();
    if (!codeToApply) {
      setCouponError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const result = await validateCouponApi(codeToApply, subtotal);
      setAppliedCoupon(result);
      setCouponCode(result.coupon.code);
      setCouponError(null);
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Mã khuyến mãi không hợp lệ');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };
```

**Step 6: Modify completeOrder to include coupon**

In the `completeOrder` function, modify the `createOrderApi` call to include couponCode. Find:

```typescript
      const createdOrder = await createOrderApi({
        items: checkoutItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
        },
        paymentMethod: method,
        shippingFee: SHIPPING_FEE,
      });
```

Replace with:

```typescript
      const createdOrder = await createOrderApi({
        items: checkoutItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
        },
        paymentMethod: method,
        shippingFee: SHIPPING_FEE,
        ...(appliedCoupon ? { couponCode: appliedCoupon.coupon.code } : {}),
      });
```

**Step 7: Add coupon UI section in order summary**

In the JSX, find the Totals section in the order summary (right column). The section starts with:

```tsx
                  {/* Totals */}
                  <div className="border-t border-pink-100 pt-4 space-y-2">
```

BEFORE this Totals div, insert the coupon section:

```tsx
                  {/* Coupon Section */}
                  <div className="mb-4">
                    {!appliedCoupon ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowCouponSection(!showCouponSection)}
                          className="text-sm font-medium text-pink-500 hover:text-pink-600 transition-colors"
                        >
                          {showCouponSection ? '▾' : '▸'} Bạn có mã khuyến mãi?
                        </button>

                        {showCouponSection && (
                          <div className="mt-3 space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value.toUpperCase());
                                  setCouponError(null);
                                }}
                                placeholder="Nhập mã khuyến mãi"
                                className="flex-1 rounded-xl border border-pink-200 px-3 py-2.5 text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                              />
                              <button
                                type="button"
                                onClick={() => void handleApplyCoupon()}
                                disabled={isValidatingCoupon || !couponCode.trim()}
                                className="rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                              >
                                {isValidatingCoupon ? '...' : 'Áp dụng'}
                              </button>
                            </div>

                            {couponError && (
                              <p className="text-sm text-rose-600">{couponError}</p>
                            )}

                            {/* Available coupons */}
                            {availableCoupons.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                  Mã khuyến mãi có sẵn:
                                </p>
                                {availableCoupons.slice(0, 3).map((c) => (
                                  <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => void handleApplyCoupon(c.code)}
                                    disabled={isValidatingCoupon}
                                    className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-3 py-2.5 text-left transition-colors hover:bg-pink-50 hover:border-pink-200 disabled:opacity-50"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-semibold text-pink-600">
                                        {c.code}
                                      </span>
                                      <span className="text-xs text-[var(--text-muted)]">
                                        {c.discountType === 'percentage'
                                          ? `Giảm ${c.discountValue}%`
                                          : c.discountType === 'fixed_amount'
                                            ? `Giảm ${c.discountValue.toLocaleString('vi-VN')}đ`
                                            : 'Miễn phí vận chuyển'}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-[var(--text-secondary)] truncate">
                                      {c.name}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                        <div>
                          <span className="text-sm font-semibold text-green-700">
                            {appliedCoupon.coupon.code}
                          </span>
                          <span className="ml-2 text-xs text-green-600">
                            {appliedCoupon.coupon.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="ml-2 text-green-600 hover:text-green-800 transition-colors text-lg leading-none"
                          aria-label="Xóa mã khuyến mãi"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
```

**Step 8: Add discount line in totals**

In the Totals div, AFTER the shipping fee row and BEFORE the total row, add a discount line:

Find:
```tsx
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                      <span className="text-[var(--text-primary)]">
                        {formatPrice(SHIPPING_FEE)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-pink-100">
```

Replace the shipping fee display and insert discount line:
```tsx
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                      <span className="text-[var(--text-primary)]">
                        {appliedCoupon?.coupon.discountType === 'free_shipping' ? (
                          <span className="text-green-600 line-through mr-1">
                            {formatPrice(SHIPPING_FEE)}
                          </span>
                        ) : null}
                        {formatPrice(effectiveShippingFee)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Giảm giá</span>
                        <span className="text-green-600 font-medium">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-pink-100">
```

**Step 9: Update MoMo overlay total display**

In the MoMo overlay, the total is already using `{formatPrice(total)}` which now includes the discount calculation, so no changes needed there.

**Step 10: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No type errors

**Step 11: Commit**

```bash
git add frontend/src/app/checkout/page.tsx
git commit -m "feat(znh): add coupon input, available coupons, and discount display to checkout page"
```

**Handoff Contract:**
- **Produces:** Checkout page with full coupon UI
- **Consumed By:** None (leaf task)

---

## Task 9: Update Checkout Success Page with Discount Display

**Tier:** worker

**Files:**
- Modify: `frontend/src/app/checkout/success/page.tsx`

**Step 1: Add discount line in order details**

In the success page, find the totals section inside "Chi tiết đơn hàng". It looks like:

```tsx
            <div className="border-t border-pink-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-pink-100">
```

Insert a discount line AFTER the shipping fee row and BEFORE the total row:

```tsx
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Giảm giá{order.couponCode ? ` (${order.couponCode})` : ''}
                  </span>
                  <span className="text-green-600 font-medium">
                    -{formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-pink-100">
```

**Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No type errors (the Order interface now includes `couponCode` and `discountAmount` from Task 6)

**Step 3: Commit**

```bash
git add frontend/src/app/checkout/success/page.tsx
git commit -m "feat(znh): show discount line with coupon code on checkout success page"
```

**Handoff Contract:**
- **Produces:** Success page with conditional discount display
- **Consumed By:** None (leaf task)

---

## Task 10: Create Admin Coupons Panel

**Tier:** worker

**Files:**
- Create: `frontend/src/components/admin/AdminCouponsPanel.tsx`
- Create: `frontend/src/app/admin/coupons/page.tsx`
- Modify: `frontend/src/components/admin/AdminSidebar.tsx`

**Step 1: Update AdminSidebar**

In `frontend/src/components/admin/AdminSidebar.tsx`, add the "Khuyến mãi" nav item to the array:

```typescript
const adminNavItems = [
  { label: 'Sản phẩm', href: '/admin/products' },
  { label: 'Tồn kho', href: '/admin/inventory' },
  { label: 'Danh mục', href: '/admin/categories' },
  { label: 'Đơn hàng', href: '/admin/orders' },
  { label: 'Khuyến mãi', href: '/admin/coupons' },
];
```

**Step 2: Create AdminCouponsPanel component**

Create `frontend/src/components/admin/AdminCouponsPanel.tsx`. Follow the AdminProductsPanel pattern for modals, and AdminCategoriesPanel pattern for table layout. This is a large component — here's the complete implementation:

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Coupon,
  type CouponDiscountType,
  type CouponPayload,
  createCouponApi,
  deleteCouponApi,
  fetchCouponsApi,
  updateCouponApi,
} from '@/lib/api';

type CouponFormState = {
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  maximumDiscount: string;
  minimumOrderAmount: string;
  usageLimit: string;
  perUserLimit: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
};

const createEmptyCouponForm = (): CouponFormState => ({
  code: '',
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maximumDiscount: '',
  minimumOrderAmount: '',
  usageLimit: '',
  perUserLimit: '1',
  isActive: true,
  validFrom: '',
  validUntil: '',
});

const discountTypeLabels: Record<CouponDiscountType, string> = {
  percentage: 'Phần trăm (%)',
  fixed_amount: 'Số tiền cố định (đ)',
  free_shipping: 'Miễn phí vận chuyển',
};

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [isDeletingCoupon, setIsDeletingCoupon] = useState(false);
  const [form, setForm] = useState<CouponFormState>(createEmptyCouponForm());

  const modalRef = useRef<HTMLDivElement | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);
  const codeInputRef = useRef<HTMLInputElement | null>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement | null>(null);

  const trapFocus = useCallback((event: KeyboardEvent, container: HTMLElement | null) => {
    if (event.key !== 'Tab' || !container) return false;
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
    if (focusable.length === 0) return false;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (!active || !container.contains(active)) {
      first.focus();
      event.preventDefault();
      return true;
    }
    if (event.shiftKey && active === first) {
      last.focus();
      event.preventDefault();
      return true;
    }
    if (!event.shiftKey && active === last) {
      first.focus();
      event.preventDefault();
      return true;
    }
    return false;
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCouponsApi();
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải mã khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const resetForm = useCallback(() => {
    setEditingCouponId(null);
    setForm(createEmptyCouponForm());
  }, []);

  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    setModalOpen(false);
    resetForm();
  }, [isSubmitting, resetForm]);

  const openCreateModal = () => {
    setError(null);
    setModalOpen(true);
    resetForm();
  };

  useEffect(() => {
    if (modalOpen) {
      queueMicrotask(() => codeInputRef.current?.focus());
    }
  }, [modalOpen]);

  useEffect(() => {
    if (deletingCoupon) {
      queueMicrotask(() => deleteCancelButtonRef.current?.focus());
    }
  }, [deletingCoupon]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (deletingCoupon && trapFocus(event, deleteModalRef.current)) return;
        if (modalOpen && trapFocus(event, modalRef.current)) return;
      }
      if (event.key !== 'Escape') return;
      if (deletingCoupon && !isDeletingCoupon) {
        setDeletingCoupon(null);
        return;
      }
      if (modalOpen && !isSubmitting) closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeModal, deletingCoupon, isDeletingCoupon, isSubmitting, modalOpen, trapFocus]);

  const handleEditCoupon = (coupon: Coupon) => {
    setError(null);
    setModalOpen(true);
    setEditingCouponId(coupon._id);
    setForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maximumDiscount: coupon.maximumDiscount !== null ? String(coupon.maximumDiscount) : '',
      minimumOrderAmount: coupon.minimumOrderAmount ? String(coupon.minimumOrderAmount) : '',
      usageLimit: coupon.usageLimit !== null ? String(coupon.usageLimit) : '',
      perUserLimit: String(coupon.perUserLimit),
      isActive: coupon.isActive,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : '',
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      setError('Mã và tên khuyến mãi là bắt buộc');
      return;
    }

    const discountValue = Number(form.discountValue);
    if (!Number.isFinite(discountValue) || discountValue < 0) {
      setError('Giá trị giảm giá phải là số không âm');
      return;
    }

    const payload: CouponPayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue,
      maximumDiscount: form.maximumDiscount ? Number(form.maximumDiscount) : null,
      minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
      isActive: form.isActive,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    };

    try {
      setIsSubmitting(true);
      setError(null);

      if (editingCouponId) {
        const updated = await updateCouponApi(editingCouponId, payload);
        setCoupons((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      } else {
        const created = await createCouponApi(payload);
        setCoupons((prev) => [created, ...prev]);
      }

      setModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu mã khuyến mãi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      setError(null);
      const updated = await updateCouponApi(coupon._id, {
        ...coupon,
        isActive: !coupon.isActive,
      });
      setCoupons((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    }
  };

  const confirmDeleteCoupon = async () => {
    if (!deletingCoupon || isDeletingCoupon) return;
    try {
      setIsDeletingCoupon(true);
      setError(null);
      await deleteCouponApi(deletingCoupon._id);
      setCoupons((prev) => prev.filter((c) => c._id !== deletingCoupon._id));
      if (editingCouponId === deletingCoupon._id) {
        setModalOpen(false);
        resetForm();
      }
      setDeletingCoupon(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa mã khuyến mãi');
    } finally {
      setIsDeletingCoupon(false);
    }
  };

  return (
    <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Quản lý khuyến mãi</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Tạo, chỉnh sửa và quản lý mã khuyến mãi cho khách hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void loadCoupons()}
            className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
          >
            Làm mới dữ liệu
          </button>
          <button
            onClick={openCreateModal}
            className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600"
          >
            Tạo mã khuyến mãi
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-left text-[var(--text-muted)]">
              <th className="py-2 pr-2">Mã</th>
              <th className="py-2 pr-2">Tên</th>
              <th className="py-2 pr-2">Loại</th>
              <th className="py-2 pr-2">Giá trị</th>
              <th className="py-2 pr-2">Đã dùng</th>
              <th className="py-2 pr-2">Trạng thái</th>
              <th className="py-2 pr-2">Hiệu lực</th>
              <th className="py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={8}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={8}>
                  Chưa có mã khuyến mãi nào.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-pink-50">
                  <td className="py-3 pr-2 font-mono font-semibold text-pink-600">
                    {coupon.code}
                  </td>
                  <td className="py-3 pr-2 font-medium text-[var(--text-primary)]">
                    {coupon.name}
                  </td>
                  <td className="py-3 pr-2 text-[var(--text-muted)]">
                    {discountTypeLabels[coupon.discountType]}
                  </td>
                  <td className="py-3 pr-2">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : coupon.discountType === 'fixed_amount'
                        ? formatPrice(coupon.discountValue)
                        : '—'}
                  </td>
                  <td className="py-3 pr-2 text-[var(--text-muted)]">
                    {coupon.usageCount}
                    {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ''}
                  </td>
                  <td className="py-3 pr-2">
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(coupon)}
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
                        coupon.isActive
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {coupon.isActive ? 'Hoạt động' : 'Tắt'}
                    </button>
                  </td>
                  <td className="py-3 pr-2 text-xs text-[var(--text-muted)]">
                    {formatDate(coupon.validFrom)} — {formatDate(coupon.validUntil)}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditCoupon(coupon)}
                        className="min-h-[36px] rounded-lg border border-pink-300 px-3 py-1.5 text-pink-600 transition-colors hover:bg-pink-50"
                      >
                        Sửa
                      </button>
                      {coupon.usageCount === 0 && (
                        <button
                          onClick={() => {
                            setError(null);
                            setDeletingCoupon(coupon);
                          }}
                          className="min-h-[36px] rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Đóng modal"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/45"
          />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-modal-title"
            className="relative z-10 w-full max-w-2xl overflow-y-auto rounded-3xl border border-pink-200 bg-white p-5 shadow-2xl sm:max-h-[90vh] sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3
                  id="coupon-modal-title"
                  className="text-lg font-bold text-[var(--text-primary)]"
                >
                  {editingCouponId ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Điền thông tin để tạo hoặc cập nhật mã khuyến mãi.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="min-h-[36px] rounded-lg border border-pink-200 px-3 py-1 text-pink-500 transition-colors hover:bg-pink-50"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Mã khuyến mãi
                  <input
                    ref={codeInputRef}
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="VD: SAVE20"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Tên khuyến mãi
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Giảm 20% cho đơn đầu"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Loại giảm giá
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        discountType: e.target.value as CouponDiscountType,
                      }))
                    }
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (đ)</option>
                    <option value="free_shipping">Miễn phí vận chuyển</option>
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Giá trị giảm
                  <input
                    type="number"
                    min={0}
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, discountValue: e.target.value }))
                    }
                    placeholder={form.discountType === 'percentage' ? 'VD: 20' : 'VD: 50000'}
                    disabled={form.discountType === 'free_shipping'}
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:bg-gray-50 disabled:opacity-60"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Giảm tối đa (đ)
                  <input
                    type="number"
                    min={0}
                    value={form.maximumDiscount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, maximumDiscount: e.target.value }))
                    }
                    placeholder="Để trống = không giới hạn"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Đơn tối thiểu (đ)
                  <input
                    type="number"
                    min={0}
                    value={form.minimumOrderAmount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, minimumOrderAmount: e.target.value }))
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Giới hạn sử dụng
                  <input
                    type="number"
                    min={1}
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, usageLimit: e.target.value }))
                    }
                    placeholder="Để trống = không giới hạn"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Giới hạn / người dùng
                  <input
                    type="number"
                    min={1}
                    value={form.perUserLimit}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, perUserLimit: e.target.value }))
                    }
                    placeholder="1"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Bắt đầu
                  <input
                    type="datetime-local"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, validFrom: e.target.value }))
                    }
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Kết thúc
                  <input
                    type="datetime-local"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, validUntil: e.target.value }))
                    }
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>
              </div>

              <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                Mô tả
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Mô tả ngắn về khuyến mãi"
                  className="w-full resize-none rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 accent-pink-500"
                />
                Kích hoạt ngay
              </label>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? 'Đang lưu...'
                    : editingCouponId
                      ? 'Lưu thay đổi'
                      : 'Tạo mã khuyến mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng modal xác nhận xóa"
            onClick={() => {
              if (!isDeletingCoupon) setDeletingCoupon(null);
            }}
            className="absolute inset-0 bg-slate-900/45"
          />
          <div
            ref={deleteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-coupon-modal-title"
            className="relative z-10 w-full max-w-md rounded-3xl border border-rose-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <h3
              id="delete-coupon-modal-title"
              className="text-lg font-bold text-[var(--text-primary)]"
            >
              Xác nhận xóa mã khuyến mãi
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Bạn sắp xóa mã{' '}
              <span className="font-semibold text-rose-600">{deletingCoupon.code}</span>. Hành
              động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                ref={deleteCancelButtonRef}
                type="button"
                onClick={() => setDeletingCoupon(null)}
                disabled={isDeletingCoupon}
                className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteCoupon()}
                disabled={isDeletingCoupon}
                className="min-h-[44px] rounded-xl border border-rose-400 bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingCoupon ? 'Đang xóa...' : 'Xóa mã khuyến mãi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create the page wrapper**

Create `frontend/src/app/admin/coupons/page.tsx`:

```tsx
import AdminCouponsPanel from '@/components/admin/AdminCouponsPanel';

export default function AdminCouponsPage() {
  return <AdminCouponsPanel />;
}
```

**Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: No type errors

Run: `grep "Khuyến mãi" frontend/src/components/admin/AdminSidebar.tsx`
Expected: Shows the nav item

**Step 5: Commit**

```bash
git add frontend/src/components/admin/AdminCouponsPanel.tsx frontend/src/app/admin/coupons/page.tsx frontend/src/components/admin/AdminSidebar.tsx
git commit -m "feat(znh): add admin coupons panel with CRUD, modal, and sidebar nav"
```

**Handoff Contract:**
- **Produces:** Admin coupons management UI + page + sidebar link
- **Consumed By:** None (leaf task)

---

## Execution Summary

| Wave | Tasks | Parallel? | Files Created/Modified |
|------|-------|-----------|----------------------|
| 1 | Tasks 1, 2, 7 | Yes (3 parallel) | Coupon.js, Order.js, checkout/page.tsx |
| 2 | Task 3 | Sequential | couponService.js |
| 3 | Tasks 4, 5 | Yes (2 parallel) | controller+routes+index.js, orderService+orderController |
| 4 | Task 6 | Sequential | api.ts |
| 5 | Tasks 8, 9, 10 | Yes (3 parallel) | checkout/page.tsx, success/page.tsx, AdminCouponsPanel+page+sidebar |

**Total: 10 tasks, 5 waves, ~10 commits**
