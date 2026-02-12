# 🍼 Baby Products E-commerce Platform

A full-stack e-commerce application for baby products, built with Node.js/Express backend, Next.js frontend, and Playwright test framework. Features a beautiful, responsive UI with Vietnamese localization.

## 📁 Project Structure

```
project/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── constants/      # HTTP status codes
│   │   ├── controllers/    # Request handlers
│   │   ├── errors/         # Custom error classes (AppError, ClientError, ServerError, RedirectError)
│   │   ├── middlewares/    # Express middlewares (asyncHandler)
│   │   ├── models/         # Mongoose schemas (Product, Category)
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── .env                # Environment variables
│
├── frontend/               # Next.js 16 application
│   └── src/
│       ├── app/           # App Router pages (Home, Products, Product Detail)
│       ├── components/    # React components (Header, Hero, Features, etc.)
│       └── lib/           # Utilities and API client
│
└── playwright/            # Playwright test suite
    ├── tests/
    │   ├── demo-user-01/  # Homepage navigation tests
    │   ├── demo-user-02/  # Test case list tests
    │   ├── demo-user-03/  # Click interaction tests
    │   ├── demo-user-04/  # Form interaction tests
    │   ├── demo-user-05/  # API response tests
    │   ├── demo-user-06/  # Navigation link tests
    │   ├── demo-user-07/  # Responsive design tests
    │   ├── demo-user-08/  # Accessibility tests
    │   ├── demo-user-09/  # Screenshot tests
    │   └── demo-user-10/  # Error state tests
    ├── pages/             # Page Object Model
    ├── fixtures/          # Test fixtures
    ├── data/              # Test data
    └── utils/             # Test utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (see `.nvmrc`)
- npm
- MongoDB (connection string provided)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:3001

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Application runs on http://localhost:3000

### 3. Playwright Setup
```bash
cd playwright
npm install
npx playwright install
```

## 🧪 Running Tests

### Run all tests
```bash
cd playwright
npx playwright test
```

### Run specific demo user tests
```bash
npx playwright test tests/demo-user-01
npx playwright test tests/demo-user-05
```

### Run tests with UI mode
```bash
npx playwright test --ui
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### View test report
```bash
npx playwright show-report
```

## 👥 Demo User Assignments

| User | Test Focus | Test File |
|------|------------|-----------|
| Demo User 01 | Homepage Navigation | `tests/demo-user-01/test-cases.spec.ts` |
| Demo User 02 | Test Case List Display | `tests/demo-user-02/test-cases.spec.ts` |
| Demo User 03 | Click Interactions | `tests/demo-user-03/test-cases.spec.ts` |
| Demo User 04 | Form Interactions | `tests/demo-user-04/test-cases.spec.ts` |
| Demo User 05 | API Response Mocking | `tests/demo-user-05/test-cases.spec.ts` |
| Demo User 06 | Navigation & URLs | `tests/demo-user-06/test-cases.spec.ts` |
| Demo User 07 | Responsive Design | `tests/demo-user-07/test-cases.spec.ts` |
| Demo User 08 | Accessibility Basics | `tests/demo-user-08/test-cases.spec.ts` |
| Demo User 09 | Screenshot Testing | `tests/demo-user-09/test-cases.spec.ts` |
| Demo User 10 | Error State Handling | `tests/demo-user-10/test-cases.spec.ts` |

## 📡 API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/active` | Get active products only |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/category/:categoryId` | Get products by category |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/slug/:slug` | Get product by slug |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/active` | Get active categories only |
| GET | `/api/categories/:id` | Get category by ID |
| GET | `/api/categories/slug/:slug` | Get category by slug |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

### Example Requests

```bash
# Create a product
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baby Bottle 250ml",
    "description": "BPA-free baby bottle",
    "price": 250000,
    "category": "<category_id>",
    "quantity": 100
  }'

# Get all products
curl http://localhost:3001/api/products

# Create a category
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Feeding",
    "description": "Baby feeding products"
  }'

# Get active categories
curl http://localhost:3001/api/categories/active
```

## 🏗️ Architecture

### Backend (Layered Architecture)
- **Model**: Mongoose schemas with validation (Product, Category)
- **Repository**: Data access layer (CRUD operations)
- **Service**: Business logic layer
- **Controller**: HTTP request/response handling
- **Routes**: API endpoint definitions

### Data Models

#### Product
```javascript
{
  name: String,          // Required, max 200 chars
  description: String,   // Max 2000 chars
  price: Number,         // Required, min 0
  category: ObjectId,    // Reference to Category
  slug: String,          // Auto-generated from name
  sku: String,           // Unique product code
  quantity: Number,      // Stock count, default 0
  images: [String],      // Array of image URLs
  isActive: Boolean      // Default true
}
```

#### Category
```javascript
{
  name: String,          // Required, unique, max 100 chars
  description: String,   // Max 500 chars
  slug: String,          // Auto-generated from name
  isActive: Boolean      // Default true
}
```

### Error Handling
- `AppError`: Base error class
- `ClientError`: 4xx errors (BadRequest, NotFound, etc.)
- `ServerError`: 5xx errors (InternalServerError, etc.)
- `RedirectError`: 3xx redirects
- Centralized error middleware

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Database**: MongoDB with Mongoose 8.x
- **Logging**: Morgan
- **Environment**: dotenv

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS 4
- **Styling**: Custom CSS variables, animations

### Testing
- **Framework**: Playwright 1.49+
- **Language**: TypeScript
- **Pattern**: Page Object Model

### Code Quality
- **Linting**: ESLint 9
- **Formatting**: Prettier 3.4
- **CI/CD**: GitHub Actions

## 🎨 Frontend Features

- Responsive design (mobile-first)
- Vietnamese localization
- Modern UI with animations
- Product catalog with filtering
- Category browsing
- Product detail pages with modal view
- Hero section with parallax effects
- Featured products carousel
- Testimonials section

## 🤝 Contributing

1. Choose your assigned demo-user folder
2. Modify/add tests in your folder
3. Run tests locally to verify
4. Run linting: `npm run lint`
5. Run formatting: `npm run format`
6. Share results with the team

---

Made with ❤️ for Baby Products E-commerce Demo
