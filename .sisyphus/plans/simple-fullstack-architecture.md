# Simple Fullstack Architecture - Work Plan

## Context

### Original Request
Tái cấu trúc backend sử dụng layer architecture đơn giản với:
- `controllers/`, `services/`, `repositories/`, `models/`, `routes/`, `middleware/`
- Database: MongoDB với Mongoose
- Frontend: Next.js với Tailwind CSS
- Development tools: nodemon và các thư viện phổ biến

### Interview Summary
**Key Discussions**:
- Framework: Express.js (user chose over Fastify/Hono)
- Language: **JavaScript (NO TypeScript)**
- Routes: Separate `routes/` folder (not in controllers)
- Middleware: Dedicated `middleware/` folder
- Testing: Playwright (E2E + API tests)
- Authentication: JWT (login/register endpoints)
- Validation: express-validator
- Sample entity: User CRUD
- Extras: Swagger API docs + GitHub Actions CI/CD

**Research Findings**:
- Express.js simple layer architecture patterns from production codebases
- Playwright configuration for fullstack apps (API + E2E projects)
- Next.js 14 App Router with Tailwind CSS patterns
- Swagger/OpenAPI JSDoc annotation patterns
- GitHub Actions workflows for Node.js + MongoDB + Playwright

### Metis Review
**Identified Gaps** (addressed):
- JWT token storage: Use HTTP-only cookies (not localStorage)
- User entity scope: Limited to `{ name, email, password, role, createdAt, updatedAt }`
- Error response format: Consistent `{ success, message, data? }`
- Password hashing: bcrypt with 10 rounds
- Port configuration: Backend 5000, Frontend 3000
- Node.js version: 20 LTS

---

## Work Objectives

### Core Objective
Build a simple fullstack application with Express.js backend (layer architecture) and Next.js frontend, demonstrating clean separation of concerns with User CRUD, JWT authentication, Swagger documentation, and Playwright testing.

### Concrete Deliverables
- `backend/` - Express.js API with simple layer architecture
- `frontend/` - Next.js 14 App Router with Tailwind CSS
- `tests/` - Playwright tests (API + E2E)
- `.github/workflows/` - CI/CD pipeline
- Swagger documentation at `/api-docs`

### Definition of Done
- [ ] `npm run dev` starts backend on port 5000
- [ ] `npm run dev` starts frontend on port 3000
- [ ] MongoDB connects successfully on startup
- [ ] User CRUD endpoints working
- [ ] JWT authentication working
- [ ] Swagger UI accessible at `/api-docs`
- [ ] Playwright tests pass
- [ ] GitHub Actions workflow passes

### Must Have
- Simple 3-layer architecture (routes → controllers → services → models)
- User CRUD with JWT protection
- express-validator for request validation
- HTTP-only cookie for JWT storage
- Swagger/OpenAPI documentation
- Playwright tests for API and E2E
- GitHub Actions CI/CD

### Must NOT Have (Guardrails)
- NO TypeScript - JavaScript only
- NO repository layer (use Mongoose models directly in services)
- NO role-based permissions (simple user role only)
- NO refresh tokens (single JWT only)
- NO rate limiting (skip for MVP)
- NO Docker configuration
- NO deployment workflows
- NO file upload functionality
- NO email verification
- NO password reset flow
- NO Redis or caching
- NO over-engineered validation

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (creating from scratch)
- **User wants tests**: YES - Playwright
- **Framework**: Playwright for both API and E2E tests

### Manual QA + Playwright Tests

Each task includes:
1. **Manual verification commands** - curl/httpie for API, browser for frontend
2. **Playwright test requirements** - automated tests for CI/CD

---

## Target Directory Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── controllers/         # HTTP handlers (thin)
│   │   │   └── user.controller.js
│   │   ├── services/            # Business logic (heavy)
│   │   │   ├── user.service.js
│   │   │   └── auth.service.js
│   │   ├── models/              # Mongoose schemas
│   │   │   └── User.js
│   │   ├── routes/              # API route definitions
│   │   │   ├── index.js
│   │   │   ├── user.routes.js
│   │   │   └── auth.routes.js
│   │   ├── middleware/          # Auth, validation, error
│   │   │   ├── auth.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── config/              # Database, env config
│   │   │   ├── db.js
│   │   │   └── index.js
│   │   ├── utils/               # Helper functions
│   │   │   ├── catchAsync.js
│   │   │   └── ApiError.js
│   │   └── app.js               # Express app setup
│   ├── server.js                # Entry point
│   ├── package.json
│   ├── .env.example
│   └── .eslintrc.json
├── frontend/
│   ├── app/
│   │   ├── layout.js            # Root layout
│   │   ├── page.js              # Home page
│   │   ├── globals.css          # Tailwind CSS
│   │   ├── login/
│   │   │   └── page.js
│   │   ├── register/
│   │   │   └── page.js
│   │   ├── profile/
│   │   │   └── page.js
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.js
│   ├── components/
│   │   ├── ui/
│   │   │   └── Button.js
│   │   └── layout/
│   │       ├── Header.js
│   │       └── Footer.js
│   ├── lib/
│   │   └── api-client.js
│   ├── middleware.js            # Protected routes
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── package.json
│   └── .eslintrc.json
├── tests/
│   ├── api/
│   │   ├── auth.api.spec.js
│   │   └── users.api.spec.js
│   ├── e2e/
│   │   ├── auth.e2e.spec.js
│   │   └── navigation.e2e.spec.js
│   ├── fixtures/
│   │   └── test-data.js
│   └── playwright.config.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json                 # Root package.json
├── .gitignore
├── .nvmrc
└── .editorconfig
```

---

## Task Flow

```
Phase 1: Backend Foundation
  1.1 → 1.2 → 1.3 → 1.4 → 1.5

Phase 2: Backend Auth & User CRUD
  2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6

Phase 3: Backend Swagger & Cleanup
  3.1 → 3.2 → 3.3

Phase 4: Frontend Foundation
  4.1 → 4.2 → 4.3 → 4.4

Phase 5: Frontend Auth & Pages
  5.1 → 5.2 → 5.3 → 5.4

Phase 6: Testing & CI/CD
  6.1 → 6.2 → 6.3 → 6.4 → 6.5
```

---

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | Phase 1 (1.1-1.5) | Backend foundation - sequential |
| B | Phase 2 (2.1-2.6) | Depends on Phase 1 |
| C | Phase 4 (4.1-4.4) | Can start parallel with Phase 3 |
| D | Phase 5 (5.1-5.4) | Depends on Phase 4 and backend completion |
| E | Phase 6 (6.1-6.5) | Depends on all previous phases |

---

## TODOs

### Phase 1: Backend Foundation

---

- [x] 1.1. Initialize Backend Project Structure

  **What to do**:
  - Create `backend/` directory with folder structure
  - Initialize `package.json` with dependencies
  - Create `.env.example` with placeholder values
  - Create `.eslintrc.json` for linting

  **Must NOT do**:
  - NO TypeScript configuration
  - NO complex build setup

  **Parallelizable**: NO (first task)

  **References**:

  **Pattern References**:
  - Express.js boilerplate: `hagopj13/node-express-boilerplate` - folder structure pattern

  **Dependencies to install**:
  ```json
  {
    "dependencies": {
      "express": "^4.18.2",
      "mongoose": "^8.0.0",
      "dotenv": "^16.3.1",
      "cors": "^2.8.5",
      "helmet": "^7.1.0",
      "morgan": "^1.10.0",
      "bcryptjs": "^2.4.3",
      "jsonwebtoken": "^9.0.2",
      "express-validator": "^7.0.1",
      "cookie-parser": "^1.4.6",
      "http-status": "^1.7.3",
      "swagger-jsdoc": "^6.2.8",
      "swagger-ui-express": "^5.0.0"
    },
    "devDependencies": {
      "nodemon": "^3.0.2",
      "eslint": "^8.56.0"
    }
  }
  ```

  **Acceptance Criteria**:
  - [ ] `backend/` folder exists with structure: `src/controllers/`, `src/services/`, `src/models/`, `src/routes/`, `src/middleware/`, `src/config/`, `src/utils/`
  - [ ] `backend/package.json` has all dependencies listed
  - [ ] `backend/.env.example` contains:
    ```
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=mongodb://localhost:27017/fullstack_app
    JWT_SECRET=your-super-secret-jwt-key-change-in-production
    JWT_EXPIRES_IN=7d
    CORS_ORIGIN=http://localhost:3000
    ```
  - [ ] `npm install` in backend/ completes without errors

  **Commit**: YES
  - Message: `feat(backend): initialize project structure with dependencies`
  - Files: `backend/*`

---

- [x] 1.2. Create Configuration Files

  **What to do**:
  - Create `src/config/index.js` - environment config with validation
  - Create `src/config/db.js` - MongoDB connection

  **Must NOT do**:
  - NO complex config validation (simple required check only)
  - NO multiple database connections

  **Parallelizable**: NO (depends on 1.1)

  **References**:

  **Pattern References**:
  - Environment config pattern from research findings
  - Mongoose connection pattern from `mongoosejs.com` docs

  **Code Pattern - config/index.js**:
  ```javascript
  require('dotenv').config();

  module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  };
  ```

  **Code Pattern - config/db.js**:
  ```javascript
  const mongoose = require('mongoose');
  const config = require('./index');

  const connectDB = async () => {
    try {
      await mongoose.connect(config.mongoUri);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    }
  };

  module.exports = connectDB;
  ```

  **Acceptance Criteria**:
  - [ ] `src/config/index.js` exports config object
  - [ ] `src/config/db.js` exports `connectDB` function
  - [ ] No syntax errors when requiring files

  **Commit**: YES
  - Message: `feat(backend): add configuration and database connection`
  - Files: `backend/src/config/*`

---

- [x] 1.3. Create Utility Functions

  **What to do**:
  - Create `src/utils/catchAsync.js` - async error wrapper
  - Create `src/utils/ApiError.js` - custom error class

  **Must NOT do**:
  - NO complex error hierarchy
  - NO error codes system

  **Parallelizable**: YES (with 1.2)

  **References**:

  **Pattern References**:
  - `catchAsync` pattern from `hagopj13/node-express-boilerplate`

  **Code Pattern - utils/catchAsync.js**:
  ```javascript
  const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  module.exports = catchAsync;
  ```

  **Code Pattern - utils/ApiError.js**:
  ```javascript
  class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      Error.captureStackTrace(this, this.constructor);
    }
  }

  module.exports = ApiError;
  ```

  **Acceptance Criteria**:
  - [ ] `src/utils/catchAsync.js` exports function
  - [ ] `src/utils/ApiError.js` exports class
  - [ ] No syntax errors

  **Commit**: NO (groups with 1.4)

---

- [x] 1.4. Create Middleware

  **What to do**:
  - Create `src/middleware/error.middleware.js` - global error handler
  - Create `src/middleware/validate.middleware.js` - express-validator wrapper

  **Must NOT do**:
  - NO auth middleware yet (Phase 2)
  - NO rate limiting

  **Parallelizable**: NO (depends on 1.3)

  **References**:

  **Pattern References**:
  - Error handler pattern from research findings
  - express-validator integration pattern

  **Code Pattern - middleware/error.middleware.js**:
  ```javascript
  const config = require('../config');
  const ApiError = require('../utils/ApiError');

  const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!(err instanceof ApiError)) {
      statusCode = 500;
      message = config.nodeEnv === 'production' 
        ? 'Internal server error' 
        : err.message;
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  };

  const notFoundHandler = (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
    });
  };

  module.exports = { errorHandler, notFoundHandler };
  ```

  **Acceptance Criteria**:
  - [ ] `src/middleware/error.middleware.js` exports `errorHandler` and `notFoundHandler`
  - [ ] `src/middleware/validate.middleware.js` exports validation wrapper
  - [ ] No syntax errors

  **Commit**: YES
  - Message: `feat(backend): add utility functions and middleware`
  - Files: `backend/src/utils/*`, `backend/src/middleware/*`

---

- [x] 1.5. Create Express App and Server Entry Point

  **What to do**:
  - Create `src/app.js` - Express app with middleware setup
  - Create `server.js` - Server entry point with DB connection
  - Add npm scripts to `package.json`

  **Must NOT do**:
  - NO routes yet (just placeholder)
  - NO Swagger yet (Phase 3)

  **Parallelizable**: NO (depends on 1.4)

  **References**:

  **Pattern References**:
  - Express app setup from research findings

  **Code Pattern - src/app.js**:
  ```javascript
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const cookieParser = require('cookie-parser');
  const config = require('./config');
  const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  // API routes (to be added)
  // app.use('/api', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  module.exports = app;
  ```

  **Code Pattern - server.js**:
  ```javascript
  const app = require('./src/app');
  const config = require('./src/config');
  const connectDB = require('./src/config/db');

  const startServer = async () => {
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  };

  startServer();
  ```

  **Scripts to add**:
  ```json
  {
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js",
      "lint": "eslint src --ext .js",
      "lint:fix": "eslint src --ext .js --fix"
    }
  }
  ```

  **Acceptance Criteria**:
  - [ ] Run `cp .env.example .env` and configure MongoDB URI
  - [ ] Run `npm run dev` → Server starts on port 5000
  - [ ] `curl http://localhost:5000/health` → `{"success":true,"message":"Server is running"}`
  - [ ] MongoDB connected message in console
  - [ ] `curl http://localhost:5000/nonexistent` → 404 response with JSON error

  **Commit**: YES
  - Message: `feat(backend): add Express app and server entry point`
  - Files: `backend/src/app.js`, `backend/server.js`, `backend/package.json`

---

### Phase 2: Backend Auth & User CRUD

---

- [x] 2.1. Create User Model

  **What to do**:
  - Create `src/models/User.js` with Mongoose schema
  - Include password hashing pre-save hook
  - Include `isPasswordMatch` instance method

  **Must NOT do**:
  - NO extra fields beyond: name, email, password, role, createdAt, updatedAt
  - NO complex validation (basic only)

  **Parallelizable**: NO (depends on Phase 1)

  **References**:

  **Pattern References**:
  - Mongoose User model from `john-smilga/node-express-course`
  - Password hashing pattern from research findings

  **Code Pattern - models/User.js**:
  ```javascript
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');

  const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
    },
    {
      timestamps: true,
    }
  );

  // Hash password before saving
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

  // Compare password method
  userSchema.methods.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  // Remove password from JSON output
  userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
  };

  module.exports = mongoose.model('User', userSchema);
  ```

  **Acceptance Criteria**:
  - [ ] `src/models/User.js` exports Mongoose model
  - [ ] Schema has fields: name, email, password, role, timestamps
  - [ ] Password is hashed on save
  - [ ] Password excluded from JSON output

  **Commit**: YES
  - Message: `feat(backend): add User model with password hashing`
  - Files: `backend/src/models/User.js`

---

- [ ] 2.2. Create Auth Service

  **What to do**:
  - Create `src/services/auth.service.js`
  - Implement `register`, `login`, `generateToken` functions

  **Must NOT do**:
  - NO refresh tokens
  - NO email verification

  **Parallelizable**: NO (depends on 2.1)

  **References**:

  **Pattern References**:
  - JWT authentication pattern from research findings

  **Code Pattern - services/auth.service.js**:
  ```javascript
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  const ApiError = require('../utils/ApiError');
  const config = require('../config');

  const generateToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  };

  const register = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return { user, token };
  };

  const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    return { user, token };
  };

  module.exports = {
    register,
    login,
    generateToken,
  };
  ```

  **Acceptance Criteria**:
  - [ ] `src/services/auth.service.js` exports `register`, `login`, `generateToken`
  - [ ] Register throws error for duplicate email
  - [ ] Login throws error for invalid credentials
  - [ ] Token generated with JWT

  **Commit**: NO (groups with 2.3)

---

- [ ] 2.3. Create User Service

  **What to do**:
  - Create `src/services/user.service.js`
  - Implement `getAllUsers`, `getUserById`, `updateUser`, `deleteUser`

  **Must NOT do**:
  - NO pagination (simple list)
  - NO filtering/sorting

  **Parallelizable**: YES (with 2.2)

  **References**:

  **Code Pattern - services/user.service.js**:
  ```javascript
  const User = require('../models/User');
  const ApiError = require('../utils/ApiError');

  const getAllUsers = async () => {
    return User.find();
  };

  const getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  };

  const updateUser = async (id, updateData) => {
    // Prevent password update through this method
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  };

  const deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  };

  module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
  };
  ```

  **Acceptance Criteria**:
  - [ ] `src/services/user.service.js` exports CRUD functions
  - [ ] Functions throw ApiError for not found

  **Commit**: YES
  - Message: `feat(backend): add auth and user services`
  - Files: `backend/src/services/*`

---

- [ ] 2.4. Create Auth Middleware

  **What to do**:
  - Create `src/middleware/auth.middleware.js`
  - Verify JWT from HTTP-only cookie
  - Attach user to request

  **Must NOT do**:
  - NO role-based middleware (simple auth only)

  **Parallelizable**: NO (depends on 2.2)

  **References**:

  **Code Pattern - middleware/auth.middleware.js**:
  ```javascript
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  const ApiError = require('../utils/ApiError');
  const config = require('../config');

  const protect = async (req, res, next) => {
    try {
      // Get token from cookie
      const token = req.cookies.token;

      if (!token) {
        throw new ApiError(401, 'Not authorized, no token');
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(401, 'Not authorized, user not found');
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        next(new ApiError(401, 'Not authorized, invalid token'));
      } else if (error.name === 'TokenExpiredError') {
        next(new ApiError(401, 'Not authorized, token expired'));
      } else {
        next(error);
      }
    }
  };

  module.exports = { protect };
  ```

  **Acceptance Criteria**:
  - [ ] `src/middleware/auth.middleware.js` exports `protect`
  - [ ] Reads token from cookies
  - [ ] Attaches user to `req.user`
  - [ ] Returns 401 for missing/invalid token

  **Commit**: YES
  - Message: `feat(backend): add JWT auth middleware`
  - Files: `backend/src/middleware/auth.middleware.js`

---

- [ ] 2.5. Create Controllers

  **What to do**:
  - Create `src/controllers/auth.controller.js`
  - Create `src/controllers/user.controller.js`
  - Use `catchAsync` wrapper
  - Set JWT in HTTP-only cookie

  **Must NOT do**:
  - NO business logic in controllers (delegate to services)

  **Parallelizable**: NO (depends on 2.4)

  **References**:

  **Code Pattern - controllers/auth.controller.js**:
  ```javascript
  const catchAsync = require('../utils/catchAsync');
  const authService = require('../services/auth.service');
  const config = require('../config');

  const cookieOptions = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const register = catchAsync(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    
    res.cookie('token', token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  });

  const login = catchAsync(async (req, res) => {
    const { user, token } = await authService.login(req.body);
    
    res.cookie('token', token, cookieOptions);
    res.json({
      success: true,
      message: 'Login successful',
      data: { user },
    });
  });

  const logout = catchAsync(async (req, res) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
    res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  const getMe = catchAsync(async (req, res) => {
    res.json({
      success: true,
      data: { user: req.user },
    });
  });

  module.exports = { register, login, logout, getMe };
  ```

  **Code Pattern - controllers/user.controller.js**:
  ```javascript
  const catchAsync = require('../utils/catchAsync');
  const userService = require('../services/user.service');

  const getAllUsers = catchAsync(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: { users },
    });
  });

  const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json({
      success: true,
      data: { user },
    });
  });

  const updateUser = catchAsync(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  });

  const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
  ```

  **Acceptance Criteria**:
  - [ ] Auth controller sets cookie with token
  - [ ] User controller delegates to service
  - [ ] Consistent response format: `{ success, message?, data? }`

  **Commit**: YES
  - Message: `feat(backend): add auth and user controllers`
  - Files: `backend/src/controllers/*`

---

- [ ] 2.6. Create Routes and Validation

  **What to do**:
  - Create `src/routes/auth.routes.js`
  - Create `src/routes/user.routes.js`
  - Create `src/routes/index.js` - route aggregator
  - Add express-validator validation
  - Wire routes to app.js

  **Must NOT do**:
  - NO over-complicated validation rules

  **Parallelizable**: NO (depends on 2.5)

  **References**:

  **Code Pattern - routes/auth.routes.js**:
  ```javascript
  const express = require('express');
  const { body } = require('express-validator');
  const authController = require('../controllers/auth.controller');
  const { protect } = require('../middleware/auth.middleware');
  const validate = require('../middleware/validate.middleware');

  const router = express.Router();

  const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ];

  const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  router.post('/register', registerValidation, validate, authController.register);
  router.post('/login', loginValidation, validate, authController.login);
  router.post('/logout', authController.logout);
  router.get('/me', protect, authController.getMe);

  module.exports = router;
  ```

  **Code Pattern - routes/user.routes.js**:
  ```javascript
  const express = require('express');
  const { body, param } = require('express-validator');
  const userController = require('../controllers/user.controller');
  const { protect } = require('../middleware/auth.middleware');
  const validate = require('../middleware/validate.middleware');

  const router = express.Router();

  // All routes require authentication
  router.use(protect);

  const updateValidation = [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
  ];

  const idValidation = [
    param('id').isMongoId().withMessage('Invalid user ID'),
  ];

  router.get('/', userController.getAllUsers);
  router.get('/:id', idValidation, validate, userController.getUserById);
  router.put('/:id', idValidation, updateValidation, validate, userController.updateUser);
  router.delete('/:id', idValidation, validate, userController.deleteUser);

  module.exports = router;
  ```

  **Code Pattern - routes/index.js**:
  ```javascript
  const express = require('express');
  const authRoutes = require('./auth.routes');
  const userRoutes = require('./user.routes');

  const router = express.Router();

  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);

  module.exports = router;
  ```

  **Update app.js**:
  ```javascript
  const routes = require('./routes');
  // ...
  app.use('/api', routes);
  ```

  **Acceptance Criteria**:
  - [ ] `POST /api/auth/register` → Creates user, sets cookie, returns 201
  - [ ] `POST /api/auth/login` → Authenticates, sets cookie, returns 200
  - [ ] `POST /api/auth/logout` → Clears cookie, returns 200
  - [ ] `GET /api/auth/me` → Returns current user (requires auth)
  - [ ] `GET /api/users` → Returns all users (requires auth)
  - [ ] `GET /api/users/:id` → Returns user by ID (requires auth)
  - [ ] `PUT /api/users/:id` → Updates user (requires auth)
  - [ ] `DELETE /api/users/:id` → Deletes user (requires auth)
  - [ ] Validation errors return 400 with message

  **Manual Verification**:
  ```bash
  # Register
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
    -c cookies.txt

  # Login
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}' \
    -c cookies.txt

  # Get current user
  curl http://localhost:5000/api/auth/me -b cookies.txt

  # Get all users
  curl http://localhost:5000/api/users -b cookies.txt
  ```

  **Commit**: YES
  - Message: `feat(backend): add routes with validation and wire to app`
  - Files: `backend/src/routes/*`, `backend/src/app.js`

---

### Phase 3: Backend Swagger & Cleanup

---

- [ ] 3.1. Add Swagger Documentation

  **What to do**:
  - Create `src/docs/swagger.js` - Swagger configuration
  - Add JSDoc annotations to route files
  - Wire Swagger UI to app.js at `/api-docs`

  **Must NOT do**:
  - NO separate YAML files
  - NO documenting every possible error code (just 200, 201, 400, 401, 404)

  **Parallelizable**: NO (depends on Phase 2)

  **References**:

  **Pattern References**:
  - Swagger JSDoc patterns from research findings

  **Code Pattern - docs/swagger.js**:
  ```javascript
  const swaggerJsdoc = require('swagger-jsdoc');
  const config = require('../config');

  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Fullstack App API',
      version: '1.0.0',
      description: 'API documentation for the Fullstack Application',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
  };

  const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js'],
  };

  module.exports = swaggerJsdoc(options);
  ```

  **Add JSDoc to routes/auth.routes.js** (example):
  ```javascript
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, password]
   *             properties:
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@example.com
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: password123
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error or email already exists
   */
  router.post('/register', ...);
  ```

  **Update app.js**:
  ```javascript
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./docs/swagger');
  // ...
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  ```

  **Acceptance Criteria**:
  - [ ] `http://localhost:5000/api-docs` shows Swagger UI
  - [ ] All endpoints documented with request/response examples
  - [ ] Can test endpoints from Swagger UI

  **Commit**: YES
  - Message: `feat(backend): add Swagger API documentation`
  - Files: `backend/src/docs/*`, `backend/src/routes/*`, `backend/src/app.js`

---

- [ ] 3.2. Add Database Seed Script

  **What to do**:
  - Create `scripts/seed.js` - Seeds database with test users
  - Add npm script for seeding

  **Must NOT do**:
  - NO complex seed data

  **Parallelizable**: YES (with 3.1)

  **References**:

  **Code Pattern - scripts/seed.js**:
  ```javascript
  require('dotenv').config();
  const mongoose = require('mongoose');
  const User = require('../src/models/User');
  const config = require('../src/config');

  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    },
    {
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    },
  ];

  const seedDB = async () => {
    try {
      await mongoose.connect(config.mongoUri);
      console.log('Connected to MongoDB');

      await User.deleteMany({});
      console.log('Cleared users collection');

      await User.create(users);
      console.log('Seeded users:', users.map(u => u.email).join(', '));

      await mongoose.disconnect();
      console.log('Done!');
    } catch (error) {
      console.error('Seed error:', error);
      process.exit(1);
    }
  };

  seedDB();
  ```

  **Add to package.json**:
  ```json
  "scripts": {
    "seed": "node scripts/seed.js"
  }
  ```

  **Acceptance Criteria**:
  - [ ] `npm run seed` creates test users
  - [ ] Can login with seeded user credentials

  **Commit**: YES
  - Message: `feat(backend): add database seed script`
  - Files: `backend/scripts/seed.js`, `backend/package.json`

---

- [ ] 3.3. Backend Final Verification

  **What to do**:
  - Run ESLint and fix issues
  - Test all endpoints manually
  - Verify Swagger docs work
  - Ensure error handling is consistent

  **Acceptance Criteria**:
  - [ ] `npm run lint` passes with no errors
  - [ ] All endpoints return consistent JSON format
  - [ ] Swagger UI fully functional
  - [ ] Error messages are user-friendly

  **Commit**: YES (if fixes needed)
  - Message: `fix(backend): lint fixes and cleanup`

---

### Phase 4: Frontend Foundation

---

- [ ] 4.1. Initialize Next.js Project

  **What to do**:
  - Create Next.js app with App Router (JavaScript)
  - Configure Tailwind CSS
  - Set up folder structure

  **Must NOT do**:
  - NO TypeScript
  - NO complex configurations

  **Parallelizable**: YES (can start when backend Phase 2 complete)

  **References**:

  **Pattern References**:
  - Next.js 14 App Router structure from research findings

  **Commands**:
  ```bash
  npx create-next-app@latest frontend --js --app --tailwind --eslint --no-ts --src-dir --import-alias "@/*"
  ```

  **Acceptance Criteria**:
  - [ ] `frontend/` folder exists
  - [ ] `npm run dev` starts on port 3000
  - [ ] Tailwind CSS working
  - [ ] App Router structure: `app/`, `components/`, `lib/`

  **Commit**: YES
  - Message: `feat(frontend): initialize Next.js with Tailwind CSS`
  - Files: `frontend/*`

---

- [ ] 4.2. Create API Client

  **What to do**:
  - Create `lib/api-client.js` - API client for backend communication
  - Configure to use credentials (cookies)

  **Must NOT do**:
  - NO storing tokens in localStorage

  **Parallelizable**: NO (depends on 4.1)

  **References**:

  **Code Pattern - lib/api-client.js**:
  ```javascript
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  class ApiClient {
    async request(endpoint, options = {}) {
      const url = `${API_URL}${endpoint}`;
      
      const config = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Important for cookies
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    }

    get(endpoint) {
      return this.request(endpoint);
    }

    post(endpoint, body) {
      return this.request(endpoint, { method: 'POST', body });
    }

    put(endpoint, body) {
      return this.request(endpoint, { method: 'PUT', body });
    }

    delete(endpoint) {
      return this.request(endpoint, { method: 'DELETE' });
    }
  }

  export const apiClient = new ApiClient();

  // Auth API
  export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    getMe: () => apiClient.get('/auth/me'),
  };

  // Users API
  export const usersAPI = {
    getAll: () => apiClient.get('/users'),
    getById: (id) => apiClient.get(`/users/${id}`),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
  };
  ```

  **Add to .env.local**:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```

  **Acceptance Criteria**:
  - [ ] API client exports `authAPI` and `usersAPI`
  - [ ] Uses `credentials: 'include'` for cookies

  **Commit**: YES
  - Message: `feat(frontend): add API client for backend communication`
  - Files: `frontend/lib/api-client.js`, `frontend/.env.local.example`

---

- [ ] 4.3. Create Layout Components

  **What to do**:
  - Create `components/layout/Header.js`
  - Create `components/layout/Footer.js`
  - Update `app/layout.js` with layout components
  - Update `app/globals.css` with base styles

  **Must NOT do**:
  - NO complex navigation logic yet

  **Parallelizable**: NO (depends on 4.2)

  **References**:

  **Pattern References**:
  - Layout patterns from research findings

  **Code Pattern - components/layout/Header.js**:
  ```javascript
  'use client';

  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  import { useState, useEffect } from 'react';
  import { authAPI } from '@/lib/api-client';

  export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        const data = await authAPI.getMe();
        setUser(data.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const handleLogout = async () => {
      try {
        await authAPI.logout();
        setUser(null);
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    return (
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Fullstack App
            </Link>
            
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded" />
              ) : user ? (
                <>
                  <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    );
  }
  ```

  **Acceptance Criteria**:
  - [ ] Header shows login/register when not authenticated
  - [ ] Header shows user name and logout when authenticated
  - [ ] Layout applied to all pages

  **Commit**: YES
  - Message: `feat(frontend): add layout components (Header, Footer)`
  - Files: `frontend/components/layout/*`, `frontend/app/layout.js`

---

- [ ] 4.4. Create UI Components and Home Page

  **What to do**:
  - Create `components/ui/Button.js`
  - Create `components/ui/Input.js`
  - Update `app/page.js` - Home page

  **Must NOT do**:
  - NO complex component library

  **Parallelizable**: YES (with 4.3)

  **References**:

  **Code Pattern - components/ui/Button.js**:
  ```javascript
  export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    className = '',
    ...props
  }) {
    const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    return (
      <button
        type={type}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
  ```

  **Code Pattern - app/page.js**:
  ```javascript
  import Link from 'next/link';
  import Button from '@/components/ui/Button';

  export default function Home() {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Fullstack App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern full-stack application built with Next.js and Express.js
            using simple layer architecture.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  ```

  **Acceptance Criteria**:
  - [ ] Home page renders with welcome message
  - [ ] Button component works with variants
  - [ ] Input component works for forms

  **Commit**: YES
  - Message: `feat(frontend): add UI components and home page`
  - Files: `frontend/components/ui/*`, `frontend/app/page.js`

---

### Phase 5: Frontend Auth & Pages

---

- [ ] 5.1. Create Login Page

  **What to do**:
  - Create `app/login/page.js`
  - Implement login form with validation
  - Handle errors and redirect on success

  **Must NOT do**:
  - NO "remember me" functionality
  - NO social login

  **Parallelizable**: NO (depends on Phase 4)

  **References**:

  **Code Pattern - app/login/page.js**:
  ```javascript
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import Link from 'next/link';
  import Button from '@/components/ui/Button';
  import Input from '@/components/ui/Input';
  import { authAPI } from '@/lib/api-client';

  export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        await authAPI.login(formData);
        router.push('/profile');
        router.refresh();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    );
  }
  ```

  **Acceptance Criteria**:
  - [ ] Login form renders
  - [ ] Validation shows errors
  - [ ] Successful login redirects to /profile
  - [ ] Error message shown for invalid credentials

  **Commit**: YES
  - Message: `feat(frontend): add login page`
  - Files: `frontend/app/login/page.js`

---

- [ ] 5.2. Create Register Page

  **What to do**:
  - Create `app/register/page.js`
  - Implement registration form
  - Handle errors and redirect on success

  **Parallelizable**: YES (with 5.1)

  **Acceptance Criteria**:
  - [ ] Register form renders with name, email, password fields
  - [ ] Successful registration redirects to /profile
  - [ ] Error shown for duplicate email

  **Commit**: YES
  - Message: `feat(frontend): add register page`
  - Files: `frontend/app/register/page.js`

---

- [ ] 5.3. Create Profile Page

  **What to do**:
  - Create `app/profile/page.js`
  - Show current user information
  - Allow editing name/email

  **Must NOT do**:
  - NO password change (can add later)

  **Parallelizable**: NO (depends on 5.1)

  **Code Pattern - app/profile/page.js**:
  ```javascript
  'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import Button from '@/components/ui/Button';
  import Input from '@/components/ui/Input';
  import { authAPI, usersAPI } from '@/lib/api-client';

  export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
      fetchUser();
    }, []);

    const fetchUser = async () => {
      try {
        const data = await authAPI.getMe();
        setUser(data.data.user);
        setFormData({ name: data.data.user.name, email: data.data.user.email });
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setSaving(true);

      try {
        const data = await usersAPI.update(user._id, formData);
        setUser(data.data.user);
        setSuccess('Profile updated successfully');
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };

    if (loading) {
      return <div className="text-center py-12">Loading...</div>;
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">{success}</div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <div className="text-sm text-gray-500">
              <p>Role: {user.role}</p>
              <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    );
  }
  ```

  **Acceptance Criteria**:
  - [ ] Profile page shows user info
  - [ ] Can update name and email
  - [ ] Unauthenticated users redirected to login

  **Commit**: YES
  - Message: `feat(frontend): add profile page with edit functionality`
  - Files: `frontend/app/profile/page.js`

---

- [ ] 5.4. Add Route Protection Middleware

  **What to do**:
  - Create `middleware.js` at root level
  - Protect `/profile` route
  - Redirect to login if not authenticated

  **Must NOT do**:
  - NO complex role-based routing

  **Parallelizable**: NO (depends on 5.3)

  **Code Pattern - middleware.js**:
  ```javascript
  import { NextResponse } from 'next/server';

  const protectedRoutes = ['/profile'];

  export function middleware(request) {
    const token = request.cookies.get('token');
    const { pathname } = request.nextUrl;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ['/profile/:path*'],
  };
  ```

  **Acceptance Criteria**:
  - [ ] Unauthenticated access to `/profile` redirects to `/login`
  - [ ] Authenticated users can access `/profile`

  **Commit**: YES
  - Message: `feat(frontend): add route protection middleware`
  - Files: `frontend/middleware.js`

---

### Phase 6: Testing & CI/CD

---

- [ ] 6.1. Setup Playwright

  **What to do**:
  - Install Playwright in project root
  - Create `playwright.config.js` with API and E2E projects
  - Create test folder structure

  **Parallelizable**: NO (depends on all previous phases)

  **Commands**:
  ```bash
  npm init playwright@latest
  ```

  **Code Pattern - playwright.config.js**:
  ```javascript
  const { defineConfig, devices } = require('@playwright/test');

  module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html'], ['list']],
    
    use: {
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },

    projects: [
      // API Tests
      {
        name: 'api',
        testDir: './tests/api',
        testMatch: '**/*.api.spec.js',
        use: {
          baseURL: 'http://localhost:5000/api',
        },
      },

      // E2E Tests
      {
        name: 'e2e-chromium',
        testDir: './tests/e2e',
        testMatch: '**/*.e2e.spec.js',
        use: {
          ...devices['Desktop Chrome'],
          baseURL: 'http://localhost:3000',
        },
      },
    ],

    webServer: [
      {
        command: 'npm run dev --prefix backend',
        url: 'http://localhost:5000/health',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
      {
        command: 'npm run dev --prefix frontend',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },
    ],
  });
  ```

  **Acceptance Criteria**:
  - [ ] `tests/` folder exists with `api/` and `e2e/` subfolders
  - [ ] Playwright config has two projects: `api` and `e2e-chromium`
  - [ ] `npx playwright test --project=api` runs

  **Commit**: YES
  - Message: `feat(tests): setup Playwright with API and E2E projects`
  - Files: `playwright.config.js`, `tests/*`

---

- [ ] 6.2. Create API Tests

  **What to do**:
  - Create `tests/api/auth.api.spec.js`
  - Create `tests/api/users.api.spec.js`
  - Test CRUD operations

  **Must NOT do**:
  - NO testing every edge case (happy path + main errors)

  **Parallelizable**: NO (depends on 6.1)

  **Code Pattern - tests/api/auth.api.spec.js**:
  ```javascript
  const { test, expect } = require('@playwright/test');

  test.describe('Auth API', () => {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    };

    test('should register a new user', async ({ request }) => {
      const response = await request.post('/auth/register', {
        data: testUser,
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe(testUser.email);
    });

    test('should fail register with duplicate email', async ({ request }) => {
      // Register first
      await request.post('/auth/register', { data: testUser });

      // Try again with same email
      const response = await request.post('/auth/register', { data: testUser });
      expect(response.status()).toBe(400);
    });

    test('should login successfully', async ({ request }) => {
      const response = await request.post('/auth/login', {
        data: { email: testUser.email, password: testUser.password },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should fail login with wrong password', async ({ request }) => {
      const response = await request.post('/auth/login', {
        data: { email: testUser.email, password: 'wrongpassword' },
      });

      expect(response.status()).toBe(401);
    });
  });
  ```

  **Acceptance Criteria**:
  - [ ] Auth tests: register, login success/failure
  - [ ] Users tests: CRUD operations
  - [ ] `npx playwright test --project=api` passes

  **Commit**: YES
  - Message: `feat(tests): add API tests for auth and users`
  - Files: `tests/api/*`

---

- [ ] 6.3. Create E2E Tests

  **What to do**:
  - Create `tests/e2e/auth.e2e.spec.js`
  - Create `tests/e2e/navigation.e2e.spec.js`
  - Test user flows in browser

  **Parallelizable**: YES (with 6.2)

  **Code Pattern - tests/e2e/auth.e2e.spec.js**:
  ```javascript
  const { test, expect } = require('@playwright/test');

  test.describe('Auth Flow', () => {
    const testUser = {
      name: 'E2E User',
      email: `e2e${Date.now()}@example.com`,
      password: 'password123',
    };

    test('should register and redirect to profile', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[type="text"]', testUser.name);
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/profile');
      await expect(page.locator('h1')).toContainText('Profile');
    });

    test('should login and redirect to profile', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL('/profile');
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login/);
    });
  });
  ```

  **Acceptance Criteria**:
  - [ ] Register flow test passes
  - [ ] Login flow test passes
  - [ ] Protected route redirect test passes
  - [ ] `npx playwright test --project=e2e-chromium` passes

  **Commit**: YES
  - Message: `feat(tests): add E2E tests for auth flow`
  - Files: `tests/e2e/*`

---

- [ ] 6.4. Create GitHub Actions Workflow

  **What to do**:
  - Create `.github/workflows/ci.yml`
  - Jobs: lint, test-backend, test-e2e, build

  **Must NOT do**:
  - NO deployment workflow
  - NO Docker builds

  **Parallelizable**: NO (depends on 6.3)

  **Code Pattern - .github/workflows/ci.yml**:
  ```yaml
  name: CI

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main]

  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true

  env:
    NODE_VERSION: '20'

  jobs:
    lint:
      name: Lint
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'

        - name: Install dependencies
          run: |
            npm ci --prefix backend
            npm ci --prefix frontend

        - name: Lint backend
          run: npm run lint --prefix backend

        - name: Lint frontend
          run: npm run lint --prefix frontend

    test-backend:
      name: Backend Tests
      runs-on: ubuntu-latest
      needs: lint
      services:
        mongodb:
          image: mongo:7.0
          ports:
            - 27017:27017
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'

        - name: Install dependencies
          run: npm ci --prefix backend

        - name: Run backend (for API tests)
          run: npm run dev --prefix backend &
          env:
            MONGODB_URI: mongodb://localhost:27017/test
            JWT_SECRET: test-secret-key
            PORT: 5000

        - name: Wait for backend
          run: npx wait-on http://localhost:5000/health

        - name: Run API tests
          run: npx playwright test --project=api

    test-e2e:
      name: E2E Tests
      runs-on: ubuntu-latest
      needs: lint
      services:
        mongodb:
          image: mongo:7.0
          ports:
            - 27017:27017
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'

        - name: Install dependencies
          run: |
            npm ci --prefix backend
            npm ci --prefix frontend
            npx playwright install --with-deps chromium

        - name: Build frontend
          run: npm run build --prefix frontend

        - name: Run E2E tests
          run: npx playwright test --project=e2e-chromium
          env:
            MONGODB_URI: mongodb://localhost:27017/test
            JWT_SECRET: test-secret-key

        - name: Upload test report
          uses: actions/upload-artifact@v4
          if: always()
          with:
            name: playwright-report
            path: playwright-report/

    build:
      name: Build
      runs-on: ubuntu-latest
      needs: [test-backend, test-e2e]
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: ${{ env.NODE_VERSION }}
            cache: 'npm'

        - name: Install dependencies
          run: npm ci --prefix frontend

        - name: Build frontend
          run: npm run build --prefix frontend
          env:
            NEXT_PUBLIC_API_URL: http://localhost:5000/api
  ```

  **Acceptance Criteria**:
  - [ ] Workflow file exists
  - [ ] All jobs defined: lint, test-backend, test-e2e, build
  - [ ] Workflow passes locally with `act` (optional)

  **Commit**: YES
  - Message: `feat(ci): add GitHub Actions CI workflow`
  - Files: `.github/workflows/ci.yml`

---

- [ ] 6.5. Final Verification and Root Package Setup

  **What to do**:
  - Create root `package.json` with workspace scripts
  - Verify all tests pass
  - Update README.md (minimal)

  **Acceptance Criteria**:
  - [ ] `npm run dev` from root starts both backend and frontend
  - [ ] `npm test` runs all Playwright tests
  - [ ] All tests pass
  - [ ] README has basic setup instructions

  **Commit**: YES
  - Message: `feat: add root package.json and finalize project setup`
  - Files: `package.json`, `README.md`

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1.1 | `feat(backend): initialize project structure with dependencies` | `backend/*` |
| 1.2 | `feat(backend): add configuration and database connection` | `backend/src/config/*` |
| 1.4 | `feat(backend): add utility functions and middleware` | `backend/src/utils/*`, `backend/src/middleware/*` |
| 1.5 | `feat(backend): add Express app and server entry point` | `backend/src/app.js`, `backend/server.js` |
| 2.1 | `feat(backend): add User model with password hashing` | `backend/src/models/User.js` |
| 2.3 | `feat(backend): add auth and user services` | `backend/src/services/*` |
| 2.4 | `feat(backend): add JWT auth middleware` | `backend/src/middleware/auth.middleware.js` |
| 2.5 | `feat(backend): add auth and user controllers` | `backend/src/controllers/*` |
| 2.6 | `feat(backend): add routes with validation and wire to app` | `backend/src/routes/*` |
| 3.1 | `feat(backend): add Swagger API documentation` | `backend/src/docs/*` |
| 3.2 | `feat(backend): add database seed script` | `backend/scripts/seed.js` |
| 4.1 | `feat(frontend): initialize Next.js with Tailwind CSS` | `frontend/*` |
| 4.2 | `feat(frontend): add API client for backend communication` | `frontend/lib/api-client.js` |
| 4.3 | `feat(frontend): add layout components (Header, Footer)` | `frontend/components/layout/*` |
| 4.4 | `feat(frontend): add UI components and home page` | `frontend/components/ui/*` |
| 5.1 | `feat(frontend): add login page` | `frontend/app/login/page.js` |
| 5.2 | `feat(frontend): add register page` | `frontend/app/register/page.js` |
| 5.3 | `feat(frontend): add profile page with edit functionality` | `frontend/app/profile/page.js` |
| 5.4 | `feat(frontend): add route protection middleware` | `frontend/middleware.js` |
| 6.1 | `feat(tests): setup Playwright with API and E2E projects` | `playwright.config.js` |
| 6.2 | `feat(tests): add API tests for auth and users` | `tests/api/*` |
| 6.3 | `feat(tests): add E2E tests for auth flow` | `tests/e2e/*` |
| 6.4 | `feat(ci): add GitHub Actions CI workflow` | `.github/workflows/ci.yml` |
| 6.5 | `feat: add root package.json and finalize project setup` | `package.json` |

---

## Success Criteria

### Verification Commands
```bash
# Backend
cd backend && npm run dev  # Server on port 5000
curl http://localhost:5000/health  # {"success":true}
curl http://localhost:5000/api-docs  # Swagger UI

# Frontend
cd frontend && npm run dev  # Next.js on port 3000
# Open http://localhost:3000

# Tests
npx playwright test --project=api
npx playwright test --project=e2e-chromium

# CI
# Push to GitHub, verify Actions workflow passes
```

### Final Checklist
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] User can register/login/logout
- [ ] Profile page shows and allows editing
- [ ] Swagger docs accessible at /api-docs
- [ ] All Playwright tests pass
- [ ] GitHub Actions workflow passes
- [ ] No ESLint errors

---

## Notes

- **No TypeScript**: All code is JavaScript only
- **Simple Architecture**: routes → controllers → services → models (no repository layer)
- **HTTP-only Cookies**: JWT stored in secure cookies, not localStorage
- **Consistent Response Format**: `{ success: boolean, message?: string, data?: object }`
- **Validation**: express-validator for backend, client-side validation for frontend
- **Testing**: Playwright for both API tests and E2E browser tests
