# Backend Auth (Register/Login) + FE Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use skill({ name: "executing-plans" }) to implement this plan task-by-task.

**Goal:** Implement real backend auth (register/login/me/logout) with JWT httpOnly cookies and wire frontend to use the API.

**Architecture:** Keep existing layered structure `routes → controllers → services → repositories → models`. Controllers use `asyncHandler` + `sendSuccess/sendCreated`; services handle auth logic; repository wraps Mongoose.

**Tech Stack:** Node/Express (CommonJS), Mongoose, bcrypt, jsonwebtoken, express-validator, cookie-parser; Next.js 16 (React 19) frontend.

---

## Constraints

- Backend **JavaScript CommonJS** only
- FE **no new dependencies**
- Cookie auth: `httpOnly`, `sameSite: 'lax'` in dev, `secure` only in prod
- Cookie name: `accessToken`
- JWT payload: `{ userId }`, expiry **7d**
- UI text & error messages in **Vietnamese**
- CI must pass (`backend lint + format:check`, `frontend lint + typecheck + build + format:check`)

---

## Phase 1 — Backend Auth Foundation (Tasks 1–12)

### Task 1: TDD "RED" — Verify endpoints don't exist yet

**Files:** none

**Step 1: Start backend dev server**

Run: `cd backend && npm run dev`
Expected: server starts on `localhost:3001`.

**Step 2: Register should 404 (RED)**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"0901234567","password":"12345678"}' -v
```

Expected: **404** (route not found).

**Step 3: Login should 404 (RED)**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345678"}' -v
```

Expected: **404**.

**Step 4: /me should 404 (RED)**

```bash
curl http://localhost:3001/api/auth/me -v
```

Expected: **404**.

**Step 5: Logout should 404 (RED)**

```bash
curl -X POST http://localhost:3001/api/auth/logout -v
```

Expected: **404**.

---

### Task 2: Install backend dependencies

**Files:**

- Modify: `backend/package.json`
- Modify: `backend/package-lock.json`

**Step 1: Install**

```bash
cd backend && npm install bcrypt jsonwebtoken cookie-parser express-validator
```

Expected: packages added to `dependencies`.

**Step 2: Verify**

```bash
cd backend && npm ls bcrypt jsonwebtoken cookie-parser express-validator
```

Expected: all four listed with versions.

---

### Task 3: Add ConflictError (409)

**Files:**

- Modify: `backend/src/errors/ClientError.js`
- Modify: `backend/src/errors/index.js`

**Step 1: Add ConflictError class to `backend/src/errors/ClientError.js`**

```js
class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
```

Add to `module.exports` alongside existing classes.

**Step 2: Export in `backend/src/errors/index.js`**

```js
const { ConflictError } = require("./ClientError");
// Add to module.exports:
module.exports = {
  // ... existing exports
  ConflictError,
};
```

**Step 3: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 4: Create User model

**Files:**

- Create: `backend/src/models/User.js`

**Step 1: Create file**

```js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ và tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [8, "Mật khẩu phải có ít nhất 8 ký tự"],
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", userSchema);
```

**Step 2: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 5: Create user repository

**Files:**

- Create: `backend/src/repositories/userRepository.js`

**Step 1: Create file**

```js
const User = require("../models/User");

const normalizeEmail = (email) => email.trim().toLowerCase();

const findByEmail = (email, options = {}) => {
  const query = User.findOne({ email: normalizeEmail(email) });
  if (options.withPassword) {
    query.select("+password");
  }
  return query.exec();
};

const existsByEmail = (email) => User.exists({ email: normalizeEmail(email) });

const createUser = (data) =>
  User.create({
    ...data,
    email: normalizeEmail(data.email),
  });

const findById = (id) => User.findById(id).exec();

module.exports = { findByEmail, existsByEmail, createUser, findById };
```

**Step 2: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 6: Create auth service

**Files:**

- Create: `backend/src/services/authService.js`

**Step 1: Create file**

```js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const { UnauthorizedError, ConflictError, InternalServerError } = require("../errors");

const TOKEN_EXPIRES_IN = "7d";

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new InternalServerError("JWT_SECRET is not configured");
  }
  return jwt.sign({ userId }, secret, { expiresIn: TOKEN_EXPIRES_IN });
};

const toUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
});

const register = async ({ name, email, phone, password }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError("Email đã được sử dụng");
  }
  const user = await userRepository.createUser({ name, email, phone, password });
  const token = signToken(user._id.toString());
  return { user: toUserResponse(user), token };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email, { withPassword: true });
  if (!user) {
    throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Email hoặc mật khẩu không đúng");
  }
  const token = signToken(user._id.toString());
  return { user: toUserResponse(user), token };
};

const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new UnauthorizedError("Phiên đăng nhập không hợp lệ");
  }
  return toUserResponse(user);
};

module.exports = { register, login, getMe };
```

**Step 2: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 7: Create validators

**Files:**

- Create: `backend/src/validators/authValidator.js`

**Step 1: Create file**

```js
const { body, validationResult } = require("express-validator");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Vui lòng nhập họ và tên"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập email")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập số điện thoại")
    .bail()
    .matches(/^(0|\+84)\d{9,10}$/)
    .withMessage("Số điện thoại không hợp lệ"),
  body("password")
    .notEmpty()
    .withMessage("Vui lòng nhập mật khẩu")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Vui lòng nhập email")
    .bail()
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("password").notEmpty().withMessage("Vui lòng nhập mật khẩu"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    status: "fail",
    errors: errors.array().map(({ path, msg }) => ({
      field: path,
      message: msg,
    })),
  });
};

module.exports = { registerRules, loginRules, validate };
```

**Step 2: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 8: Create auth middleware

**Files:**

- Create: `backend/src/middlewares/authMiddleware.js`

**Step 1: Create file**

```js
const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");

module.exports = (req, _res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    throw new UnauthorizedError("Bạn chưa đăng nhập");
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch (_error) {
    throw new UnauthorizedError("Phiên đăng nhập không hợp lệ");
  }
};
```

**Step 2: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 9: Create auth controller

**Files:**

- Create: `backend/src/controllers/authController.js`

**Step 1: Create file**

```js
const authService = require("../services/authService");
const { sendSuccess, sendCreated } = require("../utils/responseHelper");
const asyncHandler = require("../middlewares/asyncHandler");

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

exports.register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.cookie("accessToken", token, getCookieOptions());
  sendCreated(res, user, "Đăng ký thành công");
});

exports.login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.cookie("accessToken", token, getCookieOptions());
  sendSuccess(res, user, "Đăng nhập thành công");
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.userId);
  sendSuccess(res, user, "Lấy thông tin người dùng thành công");
});

exports.logout = asyncHandler(async (_req, res) => {
  res.clearCookie("accessToken", getCookieOptions());
  sendSuccess(res, null, "Đăng xuất thành công");
});
```

**Step 2: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 10: Create auth routes + mount in central router

**Files:**

- Create: `backend/src/routes/authRoutes.js`
- Modify: `backend/src/routes/index.js`

**Step 1: Create `backend/src/routes/authRoutes.js`**

```js
const express = require("express");
const authController = require("../controllers/authController");
const { registerRules, loginRules, validate } = require("../validators/authValidator");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authController.logout);

module.exports = router;
```

**Step 2: Update `backend/src/routes/index.js`**

Add at the top with other requires:

```js
const authRoutes = require("./authRoutes");
```

Add before existing route mounts:

```js
router.use("/auth", authRoutes);
```

Final file should be:

```js
const express = require("express");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

module.exports = router;
```

**Step 3: Lint**

Run: `cd backend && npm run lint`
Expected: no errors.

---

### Task 11: Wire cookie-parser + CORS credentials + env vars

**Files:**

- Modify: `backend/src/index.js`
- Modify: `backend/.env.example`

**Step 1: Update `backend/src/index.js`**

Full updated file:

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const routes = require("./routes");
const errorHandler = require("./errors/errorHandler");

const app = express();

connectDB();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api", routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

Changes from original:

- Added `const cookieParser = require('cookie-parser');`
- Added `app.use(cookieParser());` after `urlencoded`
- Changed `app.use(cors())` → `app.use(cors(corsOptions))` with origin + credentials

**Step 2: Update `backend/.env.example`**

Append two lines:

```
JWT_SECRET=your_jwt_secret_here_change_in_production
FRONTEND_URL=http://localhost:3000
```

**Step 3: Lint + format check**

```bash
cd backend && npm run lint && npm run format:check
```

Expected: all pass.

---

### Task 12: TDD "GREEN" — Verify all endpoints work

**Files:** none

**Step 1: Register → 201 + Set-Cookie**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"0901234567","password":"12345678"}' -v
```

Expected: **201**, `data` has `{id, name, email, phone}` (no password), `Set-Cookie: accessToken=...`

**Step 2: Duplicate email → 409**

Run same command again.
Expected: **409** with message `"Email đã được sử dụng"`.

**Step 3: Login → 200 + Set-Cookie**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345678"}' -v
```

Expected: **200**, Set-Cookie present.

**Step 4: Wrong password → 401**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' -v
```

Expected: **401** with `"Email hoặc mật khẩu không đúng"`.

**Step 5: /me → 200 with cookie**

```bash
curl http://localhost:3001/api/auth/me --cookie "accessToken=<token-from-step-3>" -v
```

Expected: **200** with user data `{id, name, email, phone}`.

**Step 6: Logout → 200 + cookie cleared**

```bash
curl -X POST http://localhost:3001/api/auth/logout -v
```

Expected: **200**, cookie cleared.

**Step 7: Validation errors → 400**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bad","phone":"123","password":"short"}' -v
```

Expected: **400** with field-specific error messages.

---

## Phase 2 — Frontend Integration (Tasks 13–16)

### Task 13: Update AuthContext to use real API

**Files:**

- Modify: `frontend/src/contexts/AuthContext.tsx`

**Step 1: Replace with full updated content**

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const parseErrorResponse = async (
  res: Response,
): Promise<{ message: string; fieldErrors?: Record<string, string> }> => {
  const data = await res.json().catch(() => null);

  if (data?.errors && Array.isArray(data.errors)) {
    const fieldErrors: Record<string, string> = {};
    for (const error of data.errors) {
      const field = error.field || error.param;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = error.message || error.msg || "Dữ liệu không hợp lệ";
      }
    }
    return {
      message: data.message || "Dữ liệu không hợp lệ",
      fieldErrors,
    };
  }

  return {
    message: data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await parseErrorResponse(res);
        return { ok: false, ...error };
      }

      const data = await res.json();
      setUser(data.data);
      setIsAuthenticated(true);
      return { ok: true };
    } catch {
      return { ok: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại." };
    }
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }): Promise<AuthResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await parseErrorResponse(res);
          return { ok: false, ...error };
        }

        const response = await res.json();
        setUser(response.data);
        setIsAuthenticated(true);
        return { ok: true };
      } catch {
        return { ok: false, message: "Không thể kết nối đến máy chủ. Vui lòng thử lại." };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, isLoading, login, logout, register }),
    [isAuthenticated, user, isLoading, login, logout, register],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

Key changes from mock:

- Added `id` to `AuthUser`
- `login`/`register` now return `Promise<AuthResult>` instead of `void`
- Added `isLoading` state + `checkAuth()` on mount via `useEffect`
- Added `parseErrorResponse()` for backend validation errors
- All fetches use `credentials: 'include'` for cookies

**Step 2: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: will likely show errors in login/register pages (they still use sync signatures) — fix in next tasks.

---

### Task 14: Update login page for async API

**Files:**

- Modify: `frontend/src/app/login/page.tsx`

**Step 1: Add formError state**

After the existing state declarations, add:

```tsx
const [formError, setFormError] = useState<string | null>(null);
```

**Step 2: Make handleSubmit async**

Replace the existing `handleSubmit` function:

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setIsSubmitting(true);
  setFormError(null);

  const result = await login(form.email, form.password);

  if (!result.ok) {
    if (result.fieldErrors) {
      setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
    }
    setFormError(result.message);
    setIsSubmitting(false);
    return;
  }

  router.push("/");
};
```

**Step 3: Clear formError on input change**

In `handleChange`, add after the existing `if (errors[field])` block:

```tsx
if (formError) setFormError(null);
```

**Step 4: Add error banner above submit button**

Before the submit `<button>`, add:

```tsx
{
  formError && (
    <p className="text-red-500 text-sm" role="alert">
      {formError}
    </p>
  );
}
```

**Step 5: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: pass (or only register page errors remain).

---

### Task 15: Update register page for async API

**Files:**

- Modify: `frontend/src/app/register/page.tsx`

**Step 1: Add formError state**

After existing state declarations, add:

```tsx
const [formError, setFormError] = useState<string | null>(null);
```

**Step 2: Make handleSubmit async**

Replace:

```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setIsSubmitting(true);
  setFormError(null);

  const result = await register({
    name: form.name,
    email: form.email,
    phone: form.phone,
    password: form.password,
  });

  if (!result.ok) {
    if (result.fieldErrors) {
      setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
    }
    setFormError(result.message);
    setIsSubmitting(false);
    return;
  }

  router.push("/");
};
```

**Step 3: Clear formError on input change**

In `handleChange`, add after the existing `if (errors[field])` block:

```tsx
if (formError) setFormError(null);
```

**Step 4: Add error banner above submit button**

Before the submit `<button>`, add:

```tsx
{
  formError && (
    <p className="text-red-500 text-sm" role="alert">
      {formError}
    </p>
  );
}
```

**Step 5: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: pass.

---

### Task 16: Frontend full CI check

**Files:** none

**Step 1: Build**

```bash
cd frontend && npm run build
```

Expected: build succeeds.

**Step 2: Full CI**

```bash
cd frontend && npm run lint && npm run typecheck && npm run build && npm run format:check
```

Expected: all pass.

---

## Phase 3 — Full Verification (Task 17)

### Task 17: Full CI + manual verification

**Files:** none

**Step 1: Backend CI**

```bash
cd backend && npm run lint && npm run format:check
```

Expected: all pass.

**Step 2: Frontend CI**

```bash
cd frontend && npm run lint && npm run typecheck && npm run build && npm run format:check
```

Expected: all pass.

**Step 3: End-to-end manual flow (optional)**

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Register with valid data → redirects home, header shows user name
4. Reload page → auth persists (cookie)
5. Logout → header shows login/register links
6. Login with wrong password → Vietnamese error message
7. Login with correct credentials → redirects home

---

## Summary

| Metric         | Count |
| -------------- | ----- |
| Total tasks    | 17    |
| Backend tasks  | 12    |
| Frontend tasks | 4     |
| CI tasks       | 1     |
| New files      | 7     |
| Modified files | 7     |
| TDD checks     | 11    |

**Next step:** `/ship bd-1kq`
