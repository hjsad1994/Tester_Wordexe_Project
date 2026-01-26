# Backend Simple Architecture Migration Plan

## Project Overview

**Goal**: Migrate backend from complex Layer Architecture (Domain/Application/Infrastructure/Presentation) to a simpler, more standard structure with flat folders: `models/`, `repositories/`, `services/`, `controllers/`, `routes/`, `middleware/`.

**Strategy**: Start Fresh (Option A) - Delete complex structure, create new simple structure while preserving working configuration and business logic.

**Tech Stack** (unchanged):
- Express.js with TypeScript
- MongoDB with Mongoose ODM
- Zod for validation
- Winston for logging
- bcrypt for password hashing

---

## Current State Analysis

### Files to KEEP (no changes needed)
- `backend/package.json` - All dependencies correct
- `backend/.eslintrc.json` - ESLint config is fine
- `backend/.env.example` - Environment template is fine

### Files to UPDATE
- `backend/tsconfig.json` - Update path aliases for new structure

### Files to DELETE
- `backend/src/domain/` - Entire folder
- `backend/src/infrastructure/` - Entire folder  
- `backend/src/application/` - Entire folder
- `backend/src/presentation/` - If exists (check for files)

### Code to MIGRATE (logic preserved, location changed)
- User types/DTOs → `models/User.model.ts`
- Mongoose schema → `models/User.model.ts`
- Repository implementation → `repositories/user.repository.ts`
- Service logic → `services/user.service.ts`

---

## Target Directory Structure

```
backend/
├── src/
│   ├── models/
│   │   └── User.model.ts         # Mongoose model + TypeScript types
│   ├── repositories/
│   │   └── user.repository.ts    # Data access layer
│   ├── services/
│   │   └── user.service.ts       # Business logic
│   ├── controllers/
│   │   └── user.controller.ts    # HTTP request handlers
│   ├── routes/
│   │   ├── user.routes.ts        # User API routes
│   │   └── index.ts              # Route aggregator
│   ├── middleware/
│   │   ├── validate.middleware.ts  # Zod request validation
│   │   └── error.middleware.ts     # Global error handler
│   ├── config/
│   │   └── index.ts              # Environment config (KEEP)
│   ├── utils/
│   │   └── logger.ts             # Winston logger
│   └── index.ts                  # Express app entry point
├── package.json                  # (KEEP)
├── tsconfig.json                 # (UPDATE path aliases)
├── .eslintrc.json               # (KEEP)
└── .env.example                 # (KEEP)
```

---

## Phase 1: Cleanup & Preparation

### Task 1.1: Delete Complex Architecture Folders
**Priority**: High | **Status**: pending

Delete the complex layer architecture folders that will be replaced:

```bash
# From backend/src/, remove:
rm -rf domain/
rm -rf infrastructure/
rm -rf application/
rm -rf presentation/    # if exists
rm -rf shared/          # if exists (will recreate as utils/)
```

**Files to delete**:
- `src/domain/entities/User.ts`
- `src/domain/entities/index.ts`
- `src/domain/interfaces/IUserRepository.ts`
- `src/domain/interfaces/index.ts`
- `src/infrastructure/database/connection.ts`
- `src/infrastructure/database/models/UserModel.ts`
- `src/infrastructure/repositories/UserRepository.ts`
- `src/application/services/UserService.ts`

**Acceptance Criteria**:
- All old architecture folders removed
- Only `config/` remains in `src/`

---

### Task 1.2: Create New Directory Structure
**Priority**: High | **Status**: pending

Create the simple, flat folder structure:

```bash
cd backend/src
mkdir -p models
mkdir -p repositories
mkdir -p services
mkdir -p controllers
mkdir -p routes
mkdir -p middleware
mkdir -p utils
```

**Acceptance Criteria**:
- All new folders created
- Structure matches target layout

---

### Task 1.3: Update TypeScript Configuration
**Priority**: High | **Status**: pending

Update `backend/tsconfig.json` with new simpler path aliases:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@models/*": ["models/*"],
      "@repositories/*": ["repositories/*"],
      "@services/*": ["services/*"],
      "@controllers/*": ["controllers/*"],
      "@routes/*": ["routes/*"],
      "@middleware/*": ["middleware/*"],
      "@config/*": ["config/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Acceptance Criteria**:
- Path aliases updated for new structure
- TypeScript compiles without errors

---

## Phase 2: Create Model Layer

### Task 2.1: Create User Model
**Priority**: High | **Status**: pending

Create `backend/src/models/User.model.ts`:

```typescript
import { Schema, model, Document, Types } from 'mongoose';

// TypeScript Interfaces
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

// DTOs
export type CreateUserDTO = Pick<IUser, 'email' | 'name' | 'password'>;
export type UpdateUserDTO = Partial<Pick<IUser, 'email' | 'name'>>;
export type UserResponseDTO = Omit<IUser, 'password'>;

// Mongoose Schema
const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });

// Export Model
export const UserModel = model<UserDocument>('User', userSchema);
```

**Acceptance Criteria**:
- Single file contains model, schema, and all TypeScript types
- Mongoose schema has proper validation messages
- Password field excluded by default (select: false)

---

## Phase 3: Create Repository Layer

### Task 3.1: Create User Repository
**Priority**: High | **Status**: pending

Create `backend/src/repositories/user.repository.ts`:

```typescript
import { UserModel, IUser, CreateUserDTO, UpdateUserDTO } from '@models/User.model';

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    return UserModel.find().lean();
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select('+password').lean();
  }

  async create(data: CreateUserDTO): Promise<IUser> {
    const user = new UserModel(data);
    await user.save();
    return user.toObject();
  }

  async update(id: string, data: UpdateUserDTO): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  }
}

// Export singleton instance for simple DI
export const userRepository = new UserRepository();
```

**Acceptance Criteria**:
- Clean data access methods
- No interface abstraction (simpler)
- Singleton export for easy imports
- Uses `.lean()` for better performance

---

## Phase 4: Create Service Layer

### Task 4.1: Add bcrypt Dependency
**Priority**: High | **Status**: pending

Ensure bcrypt is in package.json dependencies:

```bash
cd backend
npm install bcrypt
npm install -D @types/bcrypt
```

Or verify package.json has:
```json
{
  "dependencies": {
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2"
  }
}
```

**Acceptance Criteria**:
- bcrypt and @types/bcrypt installed
- No npm warnings

---

### Task 4.2: Create User Service
**Priority**: High | **Status**: pending

Create `backend/src/services/user.service.ts`:

```typescript
import { hash } from 'bcrypt';
import { userRepository, UserRepository } from '@repositories/user.repository';
import { IUser, CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '@models/User.model';

const SALT_ROUNDS = 10;

export class UserService {
  constructor(private repository: UserRepository = userRepository) {}

  async getAllUsers(): Promise<UserResponseDTO[]> {
    const users = await this.repository.findAll();
    return users.map(this.toResponseDTO);
  }

  async getUserById(id: string): Promise<UserResponseDTO | null> {
    const user = await this.repository.findById(id);
    return user ? this.toResponseDTO(user) : null;
  }

  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    // Check if email already exists
    const exists = await this.repository.existsByEmail(data.email);
    if (exists) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hash(data.password, SALT_ROUNDS);
    
    const user = await this.repository.create({
      ...data,
      password: hashedPassword,
    });

    return this.toResponseDTO(user);
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<UserResponseDTO | null> {
    // If updating email, check it's not taken
    if (data.email) {
      const existing = await this.repository.findByEmail(data.email);
      if (existing && existing._id.toString() !== id) {
        throw new AppError('Email already in use', 409);
      }
    }

    const user = await this.repository.update(id, data);
    return user ? this.toResponseDTO(user) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  private toResponseDTO(user: IUser): UserResponseDTO {
    const { password: _, ...rest } = user;
    return rest;
  }
}

// Custom error class for service errors
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Export singleton instance
export const userService = new UserService();
```

**Acceptance Criteria**:
- Business logic handles password hashing
- Email uniqueness validation
- AppError class for operational errors
- Singleton export for easy use

---

## Phase 5: Create Middleware Layer

### Task 5.1: Create Validation Middleware
**Priority**: High | **Status**: pending

Create `backend/src/middleware/validate.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

// Validation schemas for User
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

**Acceptance Criteria**:
- Generic validate() middleware for any Zod schema
- User validation schemas defined
- TypeScript types inferred from Zod

---

### Task 5.2: Create Error Handler Middleware
**Priority**: High | **Status**: pending

Create `backend/src/middleware/error.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@utils/logger';
import { AppError } from '@services/user.service';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation error',
      errors: err.message,
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Invalid ID format',
    });
    return;
  }

  // Handle unknown errors
  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
```

**Acceptance Criteria**:
- Handles AppError, Mongoose errors, and unknown errors
- Different responses for dev vs production
- Includes 404 handler

---

## Phase 6: Create Controller Layer

### Task 6.1: Create User Controller
**Priority**: High | **Status**: pending

Create `backend/src/controllers/user.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userService, UserService } from '@services/user.service';
import { CreateUserInput, UpdateUserInput } from '@middleware/validate.middleware';

export class UserController {
  constructor(private service: UserService = userService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.service.getUserById(id);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request<unknown, unknown, CreateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.service.createUser(req.body);
      res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request<{ id: string }, unknown, UpdateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.service.updateUser(id, req.body);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteUser(id);

      if (!deleted) {
        res.status(StatusCodes.NOT_FOUND).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
export const userController = new UserController();
```

**Acceptance Criteria**:
- Arrow functions for proper `this` binding
- Proper HTTP status codes
- Error forwarding to error handler
- Typed request bodies

---

## Phase 7: Create Routes Layer

### Task 7.1: Create User Routes
**Priority**: High | **Status**: pending

Create `backend/src/routes/user.routes.ts`:

```typescript
import { Router } from 'express';
import { userController } from '@controllers/user.controller';
import { validate, createUserSchema, updateUserSchema } from '@middleware/validate.middleware';

const router = Router();

// GET /api/users - Get all users
router.get('/', userController.getAll);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getById);

// POST /api/users - Create new user
router.post('/', validate(createUserSchema), userController.create);

// PUT /api/users/:id - Update user
router.put('/:id', validate(updateUserSchema), userController.update);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.delete);

export { router as userRoutes };
```

**Acceptance Criteria**:
- RESTful routes for User CRUD
- Validation middleware applied to POST/PUT
- Clean, readable route definitions

---

### Task 7.2: Create Route Index
**Priority**: High | **Status**: pending

Create `backend/src/routes/index.ts`:

```typescript
import { Router } from 'express';
import { userRoutes } from './user.routes';

const router = Router();

// API routes
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as apiRoutes };
```

**Acceptance Criteria**:
- Aggregates all route modules
- Health check endpoint included
- Easy to add new route modules

---

## Phase 8: Create Utilities

### Task 8.1: Create Logger Utility
**Priority**: High | **Status**: pending

Create `backend/src/utils/logger.ts`:

```typescript
import winston from 'winston';
import { env } from '@config/index';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

// Add file transport in production
if (env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}
```

**Acceptance Criteria**:
- Console logging with colors
- File logging in production
- Proper log format with timestamps

---

### Task 8.2: Create Database Connection Utility
**Priority**: High | **Status**: pending

Create `backend/src/utils/database.ts`:

```typescript
import mongoose from 'mongoose';
import { env } from '@config/index';
import { logger } from './logger';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});
```

**Acceptance Criteria**:
- MongoDB connection with proper error handling
- Connection event listeners
- Graceful shutdown handling

---

## Phase 9: Create Application Entry Point

### Task 9.1: Create Express Application
**Priority**: High | **Status**: pending

Create `backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/index';
import { connectDatabase } from '@utils/database';
import { logger } from '@utils/logger';
import { apiRoutes } from '@routes/index';
import { errorHandler, notFoundHandler } from '@middleware/error.middleware';

async function bootstrap(): Promise<void> {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use('/api', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  // Connect to database
  await connectDatabase();

  // Start server
  app.listen(env.PORT, env.HOST, () => {
    logger.info(`Server running at http://${env.HOST}:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
```

**Acceptance Criteria**:
- Express app with all middleware configured
- Database connection established before server start
- Proper error handling and logging

---

## Phase 10: Verification & Cleanup

### Task 10.1: Install Dependencies
**Priority**: High | **Status**: pending

```bash
cd backend
npm install bcrypt
npm install -D @types/bcrypt
```

**Acceptance Criteria**:
- All dependencies installed
- No npm warnings or errors

---

### Task 10.2: TypeScript Compilation Check
**Priority**: High | **Status**: pending

```bash
cd backend
npm run typecheck
```

**Acceptance Criteria**:
- No TypeScript compilation errors
- All imports resolve correctly

---

### Task 10.3: ESLint Check
**Priority**: Medium | **Status**: pending

```bash
cd backend
npm run lint
```

**Acceptance Criteria**:
- No ESLint errors
- Code follows project style guide

---

### Task 10.4: Test Server Startup
**Priority**: High | **Status**: pending

```bash
cd backend
npm run dev
```

Test endpoints:
- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/users`

**Acceptance Criteria**:
- Server starts without errors
- Health check returns 200
- Users endpoint returns empty array or user list

---

## Task Summary

| Phase | Task | Priority | Status |
|-------|------|----------|--------|
| 1 | Delete complex architecture folders | High | pending |
| 1 | Create new directory structure | High | pending |
| 1 | Update TypeScript configuration | High | pending |
| 2 | Create User Model | High | pending |
| 3 | Create User Repository | High | pending |
| 4 | Add bcrypt dependency | High | pending |
| 4 | Create User Service | High | pending |
| 5 | Create Validation Middleware | High | pending |
| 5 | Create Error Handler Middleware | High | pending |
| 6 | Create User Controller | High | pending |
| 7 | Create User Routes | High | pending |
| 7 | Create Route Index | High | pending |
| 8 | Create Logger Utility | High | pending |
| 8 | Create Database Connection Utility | High | pending |
| 9 | Create Express Application Entry Point | High | pending |
| 10 | Install Dependencies | High | pending |
| 10 | TypeScript Compilation Check | High | pending |
| 10 | ESLint Check | Medium | pending |
| 10 | Test Server Startup | High | pending |

**Total Tasks**: 19

---

## Execution Order

For optimal execution, tasks should be run in this order:

1. **Cleanup Phase** (Tasks 1.1, 1.2, 1.3) - Sequential
2. **Model Layer** (Task 2.1) - After cleanup
3. **Repository Layer** (Task 3.1) - After model
4. **Service Layer** (Tasks 4.1, 4.2) - After repository
5. **Middleware Layer** (Tasks 5.1, 5.2) - Parallel with service
6. **Controller Layer** (Task 6.1) - After service + middleware
7. **Routes Layer** (Tasks 7.1, 7.2) - After controller
8. **Utilities** (Tasks 8.1, 8.2) - Parallel, early in process
9. **Entry Point** (Task 9.1) - After routes + utilities
10. **Verification** (Tasks 10.1-10.4) - Sequential, final

---

## Rollback Plan

If migration fails, restore from git:

```bash
git checkout HEAD -- backend/src/
```

Or re-run the original `fullstack-init-plan.md` tasks 2.6-2.11 to recreate the complex architecture.

---

## Notes

- **No interface abstraction**: Unlike the complex Layer Architecture, this simple structure does not use repository interfaces. The repository is directly imported.
- **Singleton pattern**: Services and repositories export singleton instances for simpler dependency injection.
- **Co-located types**: TypeScript interfaces and Mongoose schemas live in the same model file.
- **Flat imports**: All imports use the `@/` prefix or specific aliases like `@models/`.
