# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Baby Bliss** — A full-stack Vietnamese e-commerce platform for baby products. Three independent sub-projects: `backend/`, `frontend/`, `playwright/`.

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

## Development Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start with nodemon (hot reload)
npm run seed         # Seed sample data into MongoDB
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check (used in CI)
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run lint         # ESLint
npm run format       # Prettier format
npm run format:check # Prettier check (used in CI)
```

### Playwright (`cd playwright`)
```bash
npx playwright test                        # Run all tests
npx playwright test tests/demo-user-01     # Run specific test suite
npx playwright test tests/rbac             # Run RBAC tests
npx playwright test --ui                   # Interactive UI mode
npx playwright show-report                 # View HTML report
```

### Before every commit
Run lint + format check in both backend and frontend to pass CI:
```bash
# Backend
cd backend && npm run lint && npm run format:check

# Frontend
cd frontend && npm run lint && npm run format:check && npm run typecheck
```

## Architecture

### Backend: Strict Layered Architecture
```
Routes → Controllers → Services → Repositories → Models
```
- **Models** (`src/models/`): Mongoose schemas — `User`, `Product`, `Category`, `Order`, `Coupon`, `Review`
- **Repositories** (`src/repositories/`): Raw DB access layer (CRUD only, no business logic)
- **Services** (`src/services/`): All business logic lives here (coupon validation, order state machine, etc.)
- **Controllers** (`src/controllers/`): Parse request → call service → call `sendSuccess`/`sendCreated` from `responseHelper`
- **Middlewares** (`src/middlewares/`): `authMiddleware` (JWT), `optionalAuthMiddleware`, `requireRole` (RBAC), `uploadMiddleware` (Multer+Cloudinary), `asyncHandler`
- **Errors** (`src/errors/`): Custom error hierarchy — `AppError` → `ClientError` / `ServerError` / `RedirectError`. The global `errorHandler` in `errors/errorHandler.js` catches these
- **Validators** (`src/validators/`): `express-validator` chains — currently only `authValidator.js`

API response envelope: `{ status: "success"|"error", message: string, data: T }`

### Frontend: Next.js 16 App Router + React Context
- **App Router pages** (`src/app/`): `products/`, `cart/`, `checkout/`, `wishlist/`, `profile/`, `login/`, `register/`, `about/`, `admin/`
- **Admin pages** (`src/app/admin/`): `products/`, `categories/`, `orders/`, `coupons/`, `inventory/` — all protected, render corresponding panel components
- **Components** (`src/components/`): Flat structure; admin panels are in `src/components/admin/`
- **Contexts** (`src/contexts/`): `AuthContext` (JWT cookie-based session), `CartContext` (per-user localStorage), `WishlistContext` (per-user localStorage)
- **API client** (`src/lib/api.ts`): Single file with all typed fetch wrappers and TypeScript interfaces for every entity. All requests use `credentials: 'include'` for cookie auth

### Coupon (Khuyến Mãi) System
Three discount types: `percentage`, `fixed_amount`, `free_shipping`. Key fields: `usageLimit`, `usageCount`, `perUserLimit`, `usedBy[]`, `validFrom`, `validUntil`, `minimumOrderAmount`, `maximumDiscount`.

The `redeemCoupon` in `couponService.js` uses a single atomic `findOneAndUpdate` to prevent race conditions on concurrent redemptions.

### Order Flow
Orders store `couponCode`, `discountAmount`, `subtotal`, `shippingFee`, `total`. Status machine: `pending → paid/processing/cancelled`, `paid → processing/cancelled`, `processing → shipped/cancelled`, `shipped → delivered`. Orders support soft-delete (`deletedAt`/`deleteReason`). Guest orders use `publicAccessToken` for access without login.

### Playwright Tests
Tests use Page Object Model. Base classes in `playwright/pages/`. Tests are assigned per team member (`demo-user-01` through `demo-user-12`, `rbac`). Each `tests/demo-user-XX/` directory covers a specific testing concern (navigation, forms, responsive, accessibility, mock API, screenshots, etc.).

## Environment Setup

**Backend** (`backend/.env`):
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Code Style

Prettier config (enforced in CI): `singleQuote: true`, `semi: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: "es5"`, `endOfLine: "lf"`.

Backend is CommonJS (`require`/`module.exports`). Frontend is TypeScript ESM.
