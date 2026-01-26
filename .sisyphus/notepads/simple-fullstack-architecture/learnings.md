# Learnings - Simple Fullstack Architecture

## Session: ses_406ee96ceffe4dBNg9we18BEq8
Started: 2026-01-26T06:50:26.537Z

---

## Conventions & Patterns
(Append findings here)

---

## Task 1.1: Backend Project Initialization - 2026-01-26

### What Was Done
- Created complete `backend/` directory structure with all required folders:
  - `src/controllers/`, `src/services/`, `src/models/`, `src/routes/`, `src/middleware/`, `src/config/`, `src/utils/`
- Initialized `package.json` with all 13 production dependencies and 2 dev dependencies
- Created `.env.example` with 6 environment variables (PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN)
- Created `.eslintrc.json` configured for Node.js with ES2021, module support, and basic linting rules

### Dependencies Installed
Production: express, mongoose, dotenv, cors, helmet, morgan, bcryptjs, jsonwebtoken, express-validator, cookie-parser, http-status, swagger-jsdoc, swagger-ui-express
Dev: nodemon, eslint

### Issues Encountered
- npm cache permission errors in `/tmp/.npm` (root-owned files from previous npm versions)
- **Solution**: Used alternate cache location with `--cache /tmp/npm-cache-backend` flag
- Successfully installed 258 packages with 0 vulnerabilities

### Package Versions Used
- Express: ^4.18.2
- Mongoose: ^8.0.0
- All other dependencies as specified in plan requirements

### Notes
- ESLint configured with recommended rules, 2-space indentation, single quotes, semicolons required
- Node.js engine requirement set to >=20.0.0
- npm scripts configured: `start` (production), `dev` (nodemon), `lint` (eslint)

## Task 1.2: Configuration Files - 2026-01-26

### What Was Done
- Created `backend/src/config/index.js` with environment configuration:
  - Exports config object with 6 properties: port, nodeEnv, mongoUri, jwtSecret, jwtExpiresIn, corsOrigin
  - Uses dotenv to load environment variables
  - Provides sensible defaults: port 5000, NODE_ENV 'development', JWT expires 7d, CORS origin localhost:3000
- Created `backend/src/config/db.js` with MongoDB connection:
  - Exports `connectDB` async function
  - Uses mongoose.connect() with config.mongoUri
  - Handles connection errors with console logging and process.exit(1)
  - Logs success message on successful connection

### Pattern Used
- **Centralized Configuration**: Single config module that other files import
- **Dependency Injection**: db.js requires config from index.js
- **Fail-Fast Pattern**: Database connection errors exit the process immediately
- **Environment-First**: All sensitive values come from .env, with safe local dev defaults

### Validation
- Both files have valid JavaScript syntax (verified with `node -c`)
- No syntax errors when requiring files
- Ready for use in server.js initialization

### Notes
- Config file does NOT validate required env vars at load time (simple approach)
- MongoDB URI has NO default value (must be provided in .env)
- JWT secret has NO default value (must be provided in .env)
- Using mongoose's simplified connection (no deprecated options needed in v8.x)


## Task 1.3: Utility Functions Created (Jan 26 2026)

### Files Created
- `backend/src/utils/catchAsync.js` - Async error wrapper for Express routes
- `backend/src/utils/ApiError.js` - Custom error class with operational flag

### Patterns Used
- **catchAsync**: Higher-order function that wraps async route handlers
  - Returns middleware signature `(req, res, next)`
  - Uses `Promise.resolve()` to handle both async/sync functions
  - Passes errors to Express error handler via `next()`
  
- **ApiError**: Custom error class extending Error
  - `statusCode`: HTTP status code (e.g., 404, 500)
  - `message`: Error description
  - `isOperational`: Flag to distinguish operational errors (expected) from programming errors
  - Uses `Error.captureStackTrace` for proper stack traces

### Verification
- Both files validated with `node -e` - no syntax errors
- catchAsync exports as function type
- ApiError instantiates correctly with expected properties

### Usage Pattern
```javascript
// In routes/controllers:
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

router.get('/users/:id', catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
}));
```


## Task 1.4: Middleware Files Created (Jan 26 2026)

### Files Created
- `backend/src/middleware/error.middleware.js` - Global error handler and 404 handler
- `backend/src/middleware/validate.middleware.js` - express-validator wrapper

### Patterns Used
- **errorHandler**: Global Express error middleware
  - Detects if error is ApiError instance (operational) vs unexpected error
  - In production: Generic "Internal server error" for non-ApiError
  - In development: Full error message and stack trace included
  - Response format: `{ success: false, message: string, stack?: string }`
  
- **notFoundHandler**: 404 middleware
  - Catches unmatched routes
  - Returns structured error: `{ success: false, message: "Route METHOD /path not found" }`
  
- **validate**: express-validator error checker
  - Runs after express-validator rule chains
  - Collects all validation errors and joins messages
  - Throws ApiError(400) if validation fails
  - Calls next() if validation passes

### Verification
- Both files syntax-checked manually (LSP not installed)
- Follows exact pattern from plan for error.middleware.js
- validate.middleware.js created as reusable wrapper

### Usage Pattern
```javascript
// In app.js:
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
app.use(notFoundHandler); // before error handler
app.use(errorHandler);    // last middleware

// In routes:
const validate = require('../middleware/validate.middleware');
const { body } = require('express-validator');

router.post('/register', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too short'),
  validate
], registerController);
```

### Notes
- errorHandler uses spread operator for conditional stack property
- validate throws ApiError synchronously (caught by catchAsync wrapper)
- notFoundHandler is NOT an error middleware (only 2 params, not 4)
- Both middleware ready for app.js integration


## Task 1.5: Express App & Server Entry Point (Jan 26 2026)

### Files Created
- `backend/src/app.js` - Express application with full middleware stack
- `backend/server.js` - Server entry point with DB connection
- `backend/.env` - Environment variables (from .env.example)

### Files Modified
- `backend/package.json` - Updated scripts to use server.js as entry point

### Express Application Structure (app.js)
- **Security Layer**: helmet() + CORS with credentials support
- **Body Parsers**: JSON, urlencoded, cookie-parser
- **Conditional Logging**: morgan('dev') only in development
- **Health Check**: GET /health returns `{"success":true,"message":"Server is running"}`
- **Route Placeholder**: Comment for future /api routes
- **Error Handling**: notFoundHandler + errorHandler (must be last)

### Server Entry Point (server.js)
- **Async Startup**: connectDB() called before app.listen()
- **Graceful Failure**: If MongoDB unavailable, process exits with error message
- **Console Logging**: Confirms MongoDB connection and server port/mode

### Package.json Scripts Updated
```json
"main": "server.js",
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "lint": "eslint src --ext .js",
  "lint:fix": "eslint src --ext .js --fix"
}
```

### Verification Results
✅ Server starts successfully (with mocked DB connection)
✅ Health endpoint returns: `{"success":true,"message":"Server is running"}`
✅ 404 handler returns: `{"success":false,"message":"Route GET /nonexistent not found"}`
✅ MongoDB connection attempt works (exits gracefully when DB unavailable)
✅ ESLint passes with 0 errors (1 pre-existing warning in error.middleware.js)

### Middleware Order (Critical)
1. helmet() - Security headers
2. cors() - CORS policy
3. express.json() - JSON body parser
4. express.urlencoded() - URL-encoded parser
5. cookieParser() - Cookie parser
6. morgan() - HTTP logging (dev only)
7. Routes (health check, future /api routes)
8. notFoundHandler - 404 for unmatched routes
9. errorHandler - Global error handler (MUST BE LAST)

### Notes
- CORS configured with `credentials: true` for cookie-based auth
- Health check is simple endpoint (no DB check)
- Server uses async/await pattern for startup sequence
- All environment variables loaded via dotenv in config/index.js
- Port 5000 configured in .env (from .env.example)

### Phase 1 Complete
All Backend Foundation tasks (1.1-1.5) are now complete:
✅ Project structure & dependencies
✅ Configuration files
✅ Utility functions (catchAsync, ApiError)
✅ Middleware (error handlers, validator)
✅ Express app & server entry point

Ready for Phase 2: Authentication System

## Task 2.1: User Model Created (Jan 26 2026)

### File Created
- `backend/src/models/User.js` - Mongoose User model with authentication features

### Schema Fields
- **name**: String, required, min 2 chars, trimmed
- **email**: String, required, unique, lowercase, trimmed, validated with regex
- **password**: String, required, min 8 chars, `select: false` (excluded from queries)
- **role**: Enum ['user', 'admin'], default 'user'
- **timestamps**: Automatic createdAt/updatedAt fields

### Security Features
1. **Password Hashing**: Pre-save hook using bcrypt with 10 rounds
   - Only hashes if password is modified (`this.isModified('password')`)
   - Prevents double-hashing on updates
   
2. **Password Comparison**: `isPasswordMatch(password)` instance method
   - Uses bcrypt.compare for secure password verification
   - Returns promise that resolves to boolean
   
3. **Password Exclusion**: `toJSON()` method removes password from output
   - Ensures password never sent in API responses
   - Complements `select: false` on schema field

### Validation Rules
- Email regex: `/^\S+@\S+\.\S+$/`
- Name: 2-150 characters (trimmed)
- Password: 8+ characters minimum
- Role: Must be 'user' or 'admin'

### Verification
✅ Syntax validated with `node -c backend/src/models/User.js`
✅ Follows EXACT pattern from plan
✅ All required fields present
✅ Security hooks implemented correctly

### Usage Pattern
```javascript
const User = require('./models/User');

// Create user (password auto-hashed)
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'user'
});

// Find user with password (must explicitly select)
const userWithPassword = await User.findOne({ email: 'john@example.com' }).select('+password');

// Compare password
const isMatch = await userWithPassword.isPasswordMatch('password123'); // true

// Password excluded from JSON
res.json(user); // password field not included
```

### Notes
- Password field has `select: false` - must use `.select('+password')` to retrieve
- Pre-save hook uses `function()` (not arrow) to preserve `this` context
- bcrypt rounds set to 10 (standard security level)
- Email stored in lowercase for case-insensitive lookups
- Model name: 'User' (collection: 'users' in MongoDB)

### Ready For
- Task 2.2: Auth Service (register, login, token generation)
- Task 2.3: Auth Controllers (HTTP handlers)
- Task 2.4: Auth Routes (API endpoints)

## Task 2.2: Auth Service Created (Jan 26 2026)

### File Created
- `backend/src/services/auth.service.js` - Authentication service with register, login, token generation

### Service Functions

1. **generateToken(userId)**
   - Creates JWT with payload `{ id: userId }`
   - Uses config.jwtSecret and config.jwtExpiresIn
   - Returns signed token string

2. **register({ name, email, password })**
   - Checks for existing user with email
   - Throws ApiError(400, 'Email already registered') if duplicate
   - Creates new user (password auto-hashed by User model)
   - Generates token using user._id
   - Returns `{ user, token }`

3. **login({ email, password })**
   - Finds user by email with `.select('+password')` to include password field
   - Validates credentials using `user.isPasswordMatch(password)` method
   - Throws ApiError(401, 'Invalid email or password') if credentials invalid
   - Generates token using user._id
   - Returns `{ user, token }`

### Dependencies Used
- `jsonwebtoken` - JWT signing
- `User` model - Database operations and password verification
- `ApiError` - Custom error throwing with HTTP status codes
- `config` - JWT secret and expiration settings

### Error Handling Pattern
- **400 Bad Request**: Duplicate email during registration
- **401 Unauthorized**: Invalid credentials during login
- Both errors are operational (ApiError) - caught by global error handler

### Security Features
- Password never exposed in response (User.toJSON strips it)
- Password comparison uses bcrypt (via User.isPasswordMatch)
- JWT tokens expire based on config (default 7d)
- Tokens signed with secret from environment variable

### Verification
✅ Syntax validated with `node --check`
✅ Follows EXACT pattern from plan
✅ All three functions exported: register, login, generateToken
✅ Ready for controller integration

### Usage Pattern
```javascript
const authService = require('./services/auth.service');

// Register new user
const { user, token } = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Login existing user
const { user, token } = await authService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Generate token manually
const token = authService.generateToken(userId);
```

### Notes
- Service is business logic layer - NO HTTP concerns (req/res)
- Controllers will call these functions and handle HTTP responses
- Errors thrown here are caught by catchAsync wrapper in routes
- Token payload is minimal (only user ID) - add more claims if needed later
- Uses async/await throughout for consistency

### Ready For
- Task 2.3: Auth Controllers (HTTP handlers that call these services)
- Task 2.4: Auth Routes (API endpoints mapping to controllers)
- Task 2.5: Auth Middleware (JWT verification for protected routes)


## Task 2.3: User Service Created
- Created `backend/src/services/user.service.js` with CRUD operations
- Functions: getAllUsers, getUserById, updateUser, deleteUser
- Security: updateUser explicitly deletes password field to prevent updates
- Error handling: All functions throw ApiError(404) for not found
- updateUser uses findByIdAndUpdate with options: {new: true, runValidators: true}
- Pattern: Simple async functions wrapping Mongoose Model methods

## Task 2.4: Auth Middleware Created (Jan 26 2026)

### File Created
- `backend/src/middleware/auth.middleware.js` - JWT verification middleware

### Exported Functions
- **protect**: Middleware to verify JWT and attach user to request

### Protection Flow
1. **Extract Token**: Reads from `req.cookies.token` (HTTP-only cookie)
2. **Validate Presence**: Throws 401 if no token present
3. **Verify JWT**: Uses `jwt.verify()` with config.jwtSecret
4. **Fetch User**: Queries User model with decoded.id
5. **Validate User**: Throws 401 if user not found in database
6. **Attach User**: Sets `req.user` to user object
7. **Continue**: Calls `next()` to proceed to route handler

### Error Handling
- **JsonWebTokenError**: Invalid token format/signature → 401
- **TokenExpiredError**: Token past expiration → 401
- **Missing Token**: No cookie present → 401
- **User Not Found**: Valid token but user deleted → 401
- **Other Errors**: Passed to next() for global error handler

### Dependencies
- `jsonwebtoken` - JWT verification
- `User` model - Database user lookup
- `ApiError` - Operational error throwing
- `config` - JWT secret for verification

### Security Features
- Token read from HTTP-only cookie (not headers) - prevents XSS
- Token signature verified with secret
- User existence checked on every request (revoked if deleted)
- All auth failures return 401 with descriptive messages
- Specific error messages for token expiration vs invalid token

### Verification
✅ Syntax validated with `node -c`
✅ Follows EXACT pattern from plan
✅ Ready for route protection

### Usage Pattern
```javascript
const { protect } = require('../middleware/auth.middleware');

// Protect individual routes
router.get('/profile', protect, getUserProfile);

// Protect all routes in router
router.use(protect); // Apply to all routes below
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
```

### Notes
- Middleware attaches FULL user object to req.user (not just ID)
- Password field excluded (User model has select: false)
- Token must be in cookie named 'token' (set by auth controller)
- Returns 401 for ALL auth failures (consistent error code)
- Uses async/await with try/catch for error handling
- Calls next(error) to pass to global error handler

### Integration Points
- **Auth Routes**: Will set token cookie on login/register
- **Protected Routes**: Will use protect middleware
- **Express App**: Cookie-parser already configured in app.js
- **Config**: JWT secret already defined in config/index.js

### Ready For
- Task 2.5: Auth Controllers (register/login handlers)
- Task 2.6: Auth Routes (POST /api/auth/register, POST /api/auth/login)
- Task 3.x: Protected user routes (GET /api/users, etc.)


## Task 2.5: Controllers Created (Jan 26 2026)

### Files Created
- `backend/src/controllers/auth.controller.js` - Auth handlers (register, login, logout, getMe)
- `backend/src/controllers/user.controller.js` - User CRUD handlers

### Auth Controller Functions

1. **register(req, res)**
   - Calls authService.register(req.body)
   - Sets HTTP-only cookie with token
   - Returns 201 status with success message and user data
   - Response: `{ success: true, message: 'User registered successfully', data: { user } }`

2. **login(req, res)**
   - Calls authService.login(req.body)
   - Sets HTTP-only cookie with token
   - Returns 200 status with success message and user data
   - Response: `{ success: true, message: 'Login successful', data: { user } }`

3. **logout(req, res)**
   - Clears cookie by setting empty value with maxAge: 0
   - Returns 200 status with success message
   - Response: `{ success: true, message: 'Logout successful' }`

4. **getMe(req, res)**
   - Returns authenticated user from req.user (set by protect middleware)
   - Response: `{ success: true, data: { user: req.user } }`

### User Controller Functions

1. **getAllUsers(req, res)**
   - Calls userService.getAllUsers()
   - Response: `{ success: true, data: { users } }`

2. **getUserById(req, res)**
   - Calls userService.getUserById(req.params.id)
   - Response: `{ success: true, data: { user } }`

3. **updateUser(req, res)**
   - Calls userService.updateUser(req.params.id, req.body)
   - Response: `{ success: true, message: 'User updated successfully', data: { user } }`

4. **deleteUser(req, res)**
   - Calls userService.deleteUser(req.params.id)
   - Response: `{ success: true, message: 'User deleted successfully' }`

### Cookie Configuration
```javascript
const cookieOptions = {
  httpOnly: true,                    // Prevents XSS access
  secure: config.nodeEnv === 'production',  // HTTPS only in prod
  sameSite: 'lax',                   // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
};
```

### Design Patterns

1. **Thin Controllers**: Zero business logic - delegate everything to services
2. **catchAsync Wrapper**: All controllers wrapped for automatic error handling
3. **Consistent Response Format**: All responses follow `{ success, message?, data? }` pattern
4. **HTTP Status Codes**: 201 for creation (register), 200 for other operations
5. **Cookie-Based Auth**: JWT stored in HTTP-only cookie (not headers/localStorage)

### Security Features
- HTTP-only cookies prevent XSS attacks (JavaScript can't read cookie)
- Secure flag in production forces HTTPS
- sameSite: 'lax' provides CSRF protection
- Token expires after 7 days (matches JWT expiration)
- Logout clears cookie with maxAge: 0

### Verification
✅ Syntax validated with `node -c` on both files
✅ All functions use catchAsync wrapper
✅ Consistent response format across all endpoints
✅ Cookie options match plan requirements
✅ Controllers delegate to services (no business logic)

### Response Examples
```javascript
// Register/Login success
{ success: true, message: 'User registered successfully', data: { user: {...} } }

// GetMe success
{ success: true, data: { user: {...} } }

// Logout success
{ success: true, message: 'Logout successful' }

// Update/Delete success
{ success: true, message: 'User updated successfully', data: { user: {...} } }
```

### Notes
- Controllers are HTTP layer - handle request/response only
- Services handle business logic and database operations
- Errors thrown by services are caught by catchAsync wrapper
- All controllers assume validation happens in routes (express-validator)
- Cookie name: 'token' (must match auth middleware expectation)
- logout doesn't invalidate token (JWT stateless) - just removes cookie

### Ready For
- Task 2.6: Auth Routes (POST /api/auth/register, etc.)
- Task 2.7: User Routes (GET /api/users, etc.)
- Task 2.8: Route integration in app.js


## Task 2.6: Routes and Validation Created (Jan 26 2026)

### Files Created
- `backend/src/routes/auth.routes.js` - Auth endpoints with validation
- `backend/src/routes/user.routes.js` - User CRUD endpoints with validation
- `backend/src/routes/index.js` - Route aggregator

### Files Modified
- `backend/src/app.js` - Wired routes to `/api` prefix

### Auth Routes (POST /api/auth/*)

1. **POST /api/auth/register**
   - Validation: name (trim, notEmpty, min 2 chars), email (isEmail), password (min 8 chars)
   - Controller: authController.register
   - Response: 201 with user + cookie

2. **POST /api/auth/login**
   - Validation: email (isEmail), password (notEmpty)
   - Controller: authController.login
   - Response: 200 with user + cookie

3. **POST /api/auth/logout**
   - No validation required
   - Controller: authController.logout
   - Response: 200 with success message

4. **GET /api/auth/me**
   - Middleware: protect (JWT verification)
   - Controller: authController.getMe
   - Response: 200 with current user

### User Routes (all under /api/users/*)

**Protection**: All user routes use `router.use(protect)` - requires JWT cookie

1. **GET /api/users**
   - No validation
   - Controller: userController.getAllUsers
   - Response: 200 with users array

2. **GET /api/users/:id**
   - Validation: param('id').isMongoId()
   - Controller: userController.getUserById
   - Response: 200 with user object

3. **PUT /api/users/:id**
   - Validation: param('id').isMongoId(), optional name (min 2), optional email (isEmail)
   - Controller: userController.updateUser
   - Response: 200 with updated user

4. **DELETE /api/users/:id**
   - Validation: param('id').isMongoId()
   - Controller: userController.deleteUser
   - Response: 200 with success message

### Validation Pattern

**express-validator chain → validate middleware**

```javascript
const validation = [
  body('email').isEmail().withMessage('Custom error message'),
  body('password').isLength({ min: 8 }).withMessage('Too short'),
];

router.post('/endpoint', validation, validate, controller);
```

**validate middleware** (from validate.middleware.js):
- Collects all validation errors with `validationResult(req)`
- Joins error messages with '; '
- Throws ApiError(400, joinedMessages) if errors exist
- Calls next() if validation passes

### Routes Aggregator (routes/index.js)

```javascript
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
```

- Mounts auth routes at `/api/auth`
- Mounts user routes at `/api/users`
- Exported as single router to app.js

### App.js Integration

**Added**:
```javascript
const routes = require('./routes');
app.use('/api', routes);
```

**Middleware Order**:
1. Security (helmet, cors)
2. Body parsers (json, urlencoded, cookies)
3. Logging (morgan in dev)
4. Health check
5. **API routes** ← NEW
6. notFoundHandler
7. errorHandler

### Validation Rules Used

**Auth Register**:
- name: trim, notEmpty, min 2 chars
- email: isEmail
- password: min 8 chars

**Auth Login**:
- email: isEmail
- password: notEmpty

**User Update**:
- name: optional, trim, min 2 chars
- email: optional, isEmail

**User ID (param)**:
- id: isMongoId

### Verification Results
✅ auth.routes.js syntax OK
✅ user.routes.js syntax OK
✅ routes/index.js syntax OK
✅ app.js syntax OK

### Security Patterns

1. **Cookie-Based JWT**: Token read from cookie (not headers)
2. **Route-Level Protection**: protect middleware on individual routes (/auth/me) or entire router (user routes)
3. **Validation on Entry**: All inputs validated before reaching controllers
4. **Consistent Error Format**: Validation errors return 400 with `{ success: false, message: 'error1; error2' }`

### Endpoint URLs (Full Paths)

**Public**:
- POST http://localhost:5000/api/auth/register
- POST http://localhost:5000/api/auth/login
- POST http://localhost:5000/api/auth/logout

**Protected** (requires JWT cookie):
- GET http://localhost:5000/api/auth/me
- GET http://localhost:5000/api/users
- GET http://localhost:5000/api/users/:id
- PUT http://localhost:5000/api/users/:id
- DELETE http://localhost:5000/api/users/:id

### Notes
- All validation uses express-validator fluent API
- Validation rules match User model constraints
- param validation for MongoDB ObjectID format
- router.use(protect) applies to ALL routes below it
- Optional fields use .optional() chaining
- Custom error messages with .withMessage()

### Phase 2 Complete
✅ All Backend Auth & User CRUD tasks (2.1-2.6) complete:
- User Model with password hashing
- Auth Service (register, login, token)
- User Service (CRUD operations)
- Auth Middleware (JWT verification)
- Auth & User Controllers (HTTP handlers)
- Routes with validation (this task)

**Ready For**: Phase 3 - Swagger Documentation & Backend Cleanup


## Task 3.1: Swagger Documentation Added (Jan 26 2026)

### Files Created
- `backend/src/docs/swagger.js` - Swagger configuration with swaggerJsdoc

### Files Modified
- `backend/src/routes/auth.routes.js` - Added JSDoc annotations for 4 auth endpoints
- `backend/src/routes/user.routes.js` - Added JSDoc annotations for 4 user endpoints
- `backend/src/app.js` - Wired Swagger UI to `/api-docs` endpoint

### Swagger Configuration
- **OpenAPI Version**: 3.0.0
- **API Title**: Fullstack App API
- **Version**: 1.0.0
- **Server URL**: http://localhost:5000/api
- **Security Scheme**: cookieAuth (apiKey in cookie named 'token')
- **API Discovery**: Scans `./src/routes/*.js` for @swagger JSDoc comments

### Documented Endpoints (8 total)

**Auth Endpoints (4)**:
1. POST /auth/register - Register new user (201, 400)
2. POST /auth/login - Login with credentials (200, 400, 401)
3. POST /auth/logout - Logout current user (200)
4. GET /auth/me - Get current user info (200, 401) - Protected

**User Endpoints (4)** - All protected with cookieAuth:
1. GET /users - Get all users (200, 401)
2. GET /users/{id} - Get user by ID (200, 400, 401, 404)
3. PUT /users/{id} - Update user (200, 400, 401, 404)
4. DELETE /users/{id} - Delete user (200, 400, 401, 404)

### JSDoc Pattern Used

**Standard pattern for each endpoint**:
```javascript
/**
 * @swagger
 * /path:
 *   method:
 *     tags: [TagName]
 *     summary: Short description
 *     security:
 *       - cookieAuth: []    // For protected endpoints
 *     parameters:           // For path/query params
 *       - in: path/query
 *         name: paramName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:          // For POST/PUT
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field: { type: string, example: value }
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
```

### Response Codes Documented
- **200**: Successful operation (GET, PUT, DELETE)
- **201**: Resource created (POST register)
- **400**: Validation error or bad request
- **401**: Unauthorized (missing/invalid token)
- **404**: Resource not found

### App.js Integration
**Middleware order** (critical):
1. Security (helmet, cors)
2. Body parsers (json, urlencoded, cookies)
3. Logging (morgan in dev)
4. Health check
5. **Swagger UI** ← NEW at /api-docs (before /api routes)
6. API routes at /api
7. 404 handler
8. Error handler

**Why Swagger before /api routes**: Swagger UI needs to be registered before API routes to avoid conflicts with route matching.

### Verification Results
✅ All files syntax-checked (node -c)
✅ Swagger spec loads correctly as object
✅ All 6 paths registered: /auth/register, /auth/login, /auth/logout, /auth/me, /users, /users/{id}
✅ Auth register endpoint has correct summary and response codes (201, 400)
✅ All 4 user endpoints documented correctly
✅ API title, version, server URL configured
✅ Cookie auth security scheme configured

### Swagger Spec Output
```javascript
{
  openapi: '3.0.0',
  info: { title: 'Fullstack App API', version: '1.0.0', description: '...' },
  servers: [{ url: 'http://localhost:5000/api', description: 'Development server' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' }
    }
  },
  paths: {
    '/auth/register': { post: {...} },
    '/auth/login': { post: {...} },
    '/auth/logout': { post: {...} },
    '/auth/me': { get: {...} },
    '/users': { get: {...} },
    '/users/{id}': { get: {...}, put: {...}, delete: {...} }
  }
}
```

### Access Swagger UI
- **URL**: http://localhost:5000/api-docs
- **Purpose**: Interactive API documentation with "Try it out" functionality
- **Features**:
  - Browse all endpoints organized by tags (Auth, Users)
  - View request/response schemas with examples
  - Test endpoints directly from browser
  - See required authentication (cookie icon for protected routes)
  - Copy curl commands for each endpoint

### Notes
- Swagger UI uses swagger-ui-express middleware
- JSDoc comments must be in /** */ block format (not //)
- @swagger prefix required for swaggerJsdoc to parse
- All endpoints follow OpenAPI 3.0 schema specification
- Cookie authentication requires setting cookie in browser (test with login first)
- Response schemas match actual controller response format `{ success, message?, data? }`
- Path parameters use {id} syntax (OpenAPI convention)
- Optional request body fields NOT marked as required in schema

### Patterns Learned
1. **JSDoc above route definition**: Place @swagger comment immediately before router.method() call
2. **Tag grouping**: Use tags to organize endpoints (Auth, Users)
3. **Security per endpoint**: Apply cookieAuth only to protected routes
4. **Example values**: Provide examples for all fields (improves Swagger UI UX)
5. **Consistent schemas**: Response schemas match controller output exactly
6. **HTTP status codes**: Document common codes only (200, 201, 400, 401, 404) - not every possible code

### Ready For
- Task 3.2: Database Seed Script (parallel with 3.1)
- Task 3.3: Backend Final Verification (lint, manual testing, Swagger UI verification)
- Frontend developers can now reference /api-docs for API contract


## Database Seed Script (Task 3.2)
- Created `backend/scripts/seed.js` with exact pattern from plan
- Seeds 2 test users: admin@example.com (admin), user@example.com (user)
- Both use password: password123
- Script clears users collection before seeding (User.deleteMany)
- Uses mongoose.connect directly with config.mongoUri
- Added npm script `"seed": "node scripts/seed.js"` to package.json
- Syntax verified with node -c
- Script properly handles errors with try/catch and process.exit(1)
- User.create will trigger pre-save hook for password hashing

## Backend Final Verification (Task 3.3) - Jan 26, 2026

### Verification Results ✅

**ESLint Status:**
- ✅ `npm run lint` passes with 0 errors
- 1 expected warning: 'next' unused in error.middleware.js (Express 4-param error handler pattern)

**Response Format Consistency:**
- ✅ All endpoints follow consistent format:
  - Success: `{ success: true, message?: string, data?: object }`
  - Error: `{ success: false, message: string }`
- ✅ 19 success response instances verified across controllers
- ✅ Error middleware enforces consistent error format

**Swagger Documentation:**
- ✅ Swagger UI configured at `/api-docs`
- ✅ Comprehensive JSDoc annotations on all routes:
  - Auth routes: register, login, logout, getMe (4 endpoints)
  - User routes: getAllUsers, getUserById, updateUser, deleteUser (4 endpoints)
- ✅ Cookie-based authentication documented
- ✅ Request/response schemas fully defined

**Error Handling Consistency:**
- ✅ ApiError class provides consistent error structure
- ✅ User-friendly messages across all error types:
  - 400: Validation errors with clear messages
  - 401: Authentication errors (no token, invalid token, expired token)
  - 404: Resource not found with clear context
  - 500: Internal server error (generic in production, detailed in dev)
- ✅ Validation middleware combines multiple errors into single message
- ✅ JWT-specific errors properly handled (JsonWebTokenError, TokenExpiredError)

**Code Quality:**
- ✅ All services use consistent error throwing with ApiError
- ✅ Controllers wrapped with catchAsync for proper async error handling
- ✅ Middleware properly chained for validation and authentication
- ✅ Environment-based behavior (dev vs production error details)

### Key Architecture Patterns Confirmed:
1. **3-Layer Architecture:** Routes → Controllers → Services → Models
2. **Consistent Error Flow:** ApiError → Error Middleware → JSON Response
3. **Validation:** express-validator → validate middleware → ApiError
4. **Authentication:** JWT in cookie → protect middleware → req.user
5. **Documentation:** Swagger JSDoc annotations → swagger-jsdoc → Swagger UI

### No Changes Required:
- Backend code is clean and production-ready
- All verification criteria met without modifications
- No commit needed

## Task 4.2: API Client Created (Jan 26 2026)

### Files Created
- `frontend/lib/api-client.js` - Fetch-based API client for backend communication
- `frontend/.env.local.example` - Environment variable template

### API Client Structure

**ApiClient Class:**
- **request(endpoint, options)** - Base request method with:
  - Automatic JSON headers
  - Cookie credentials (`credentials: 'include'`)
  - Response JSON parsing
  - Error handling (throws Error with message from response)
  
- **HTTP Methods**: get(), post(body), put(body), delete()
  - All delegate to request() with appropriate method
  - Return parsed response data

### Exported API Modules

**authAPI:**
- register(data) → POST /auth/register
- login(data) → POST /auth/login
- logout() → POST /auth/logout
- getMe() → GET /auth/me

**usersAPI:**
- getAll() → GET /users
- getById(id) → GET /users/:id
- update(id, data) → PUT /users/:id
- delete(id) → DELETE /users/:id

### Environment Configuration
- **NEXT_PUBLIC_API_URL**: Backend API base URL (default: http://localhost:5000/api)
- `.env.local.example` created for reference
- Actual `.env.local` must be created by developer

### Security Features
- **credentials: 'include'**: Sends HTTP-only cookies with every request
- **NO localStorage**: JWT stored in cookie (set by backend)
- **NO manual headers**: Backend sets/reads cookie automatically
- **Error propagation**: Server error messages passed to UI layer

### Design Pattern
- **Singleton instance**: apiClient exported as single instance
- **Functional API**: authAPI and usersAPI export object with methods
- **Promise-based**: All methods return promises (async/await compatible)
- **Error handling**: Throws Error on non-ok responses (caught by try/catch)

### Verification
✅ Syntax validated with `node -c frontend/lib/api-client.js`
✅ Follows EXACT pattern from plan
✅ credentials: 'include' configured for cookies
✅ Environment variable template created

### Usage Pattern
```javascript
import { authAPI, usersAPI } from '@/lib/api-client';

// Register user
try {
  const response = await authAPI.register({ name, email, password });
  console.log(response.data.user);
} catch (error) {
  console.error(error.message); // Error from backend
}

// Get current user
try {
  const response = await authAPI.getMe();
  console.log(response.data.user);
} catch (error) {
  // Handle 401 (not authenticated)
}

// Get all users
const response = await usersAPI.getAll();
console.log(response.data.users);
```

### Notes
- Client works with both server and client components in Next.js
- Environment variables prefixed with NEXT_PUBLIC_ are exposed to browser
- Error messages from backend (response.message) are thrown as Error
- Response data structure matches backend: { success, message?, data? }
- All API calls require backend server running on configured URL

### Integration Points
- **Header Component**: Will use authAPI.getMe() to check auth status
- **Login/Register Pages**: Will use authAPI.login/register()
- **Profile Page**: Will use authAPI.getMe() and usersAPI.update()
- **Protected Routes**: Can use authAPI.getMe() for client-side checks

### Ready For
- Task 4.3: Layout Components (Header will use authAPI)
- Task 4.4: UI Components (Button, Input for forms)
- Task 5.x: Auth Pages (Login, Register using authAPI)

