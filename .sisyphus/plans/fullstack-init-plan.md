# Full-Stack Application Initialization Plan

## Project Overview

A full-stack application with:
- **Backend**: Node.js with Layer Architecture (TypeScript)
- **Frontend**: Next.js 14+ with App Router (TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS
- **Testing**: Playwright for E2E and API testing
- **CI/CD**: GitHub Actions
- **Package Manager**: npm

---

## Phase 1: Project Root Setup

### Task 1.1: Initialize Root Project Structure
**Priority**: High | **Parallelizable**: No (must be first)

```bash
# Create root directory structure
mkdir -p project-root
cd project-root

# Initialize root package.json for workspace management
npm init -y
```

**Files to create**:
- `project-root/package.json` - Root package.json with workspace scripts

**Acceptance Criteria**:
- Root directory exists
- Root package.json created with project metadata

---

### Task 1.2: Create Root Configuration Files
**Priority**: High | **Parallelizable**: Yes (after 1.1)

**Files to create**:

#### `project-root/.gitignore`
```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
/coverage/
/playwright-report/
/test-results/
playwright/.cache/

# Misc
*.tsbuildinfo
```

#### `project-root/.nvmrc`
```
20
```

#### `project-root/.editorconfig`
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

#### `project-root/package.json` (update)
```json
{
  "name": "fullstack-app",
  "version": "1.0.0",
  "private": true,
  "description": "Full-stack application with Node.js backend and Next.js frontend",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --prefix backend",
    "dev:frontend": "npm run dev --prefix frontend",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "npm run build --prefix backend",
    "build:frontend": "npm run build --prefix frontend",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "npm run start --prefix backend",
    "start:frontend": "npm run start --prefix frontend",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "npm run test --prefix backend",
    "test:frontend": "npm run test --prefix frontend",
    "test:e2e": "npm run test:e2e --prefix tests",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "npm run lint --prefix backend",
    "lint:frontend": "npm run lint --prefix frontend",
    "clean": "rm -rf node_modules backend/node_modules frontend/node_modules tests/node_modules"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Acceptance Criteria**:
- All configuration files created
- .gitignore covers all necessary patterns
- Root scripts work correctly

---

## Phase 2: Backend Setup (Layer Architecture)

### Task 2.1: Initialize Backend Directory Structure
**Priority**: High | **Parallelizable**: Yes (with Phase 3)

```bash
cd project-root

# Create backend directory structure
mkdir -p backend/src/{presentation,application,domain,infrastructure}
mkdir -p backend/src/presentation/{controllers,routes,middleware,dto}
mkdir -p backend/src/application/{services,use-cases}
mkdir -p backend/src/domain/{entities,interfaces,value-objects}
mkdir -p backend/src/infrastructure/{database,repositories,external-services}
mkdir -p backend/src/config
mkdir -p backend/src/shared/{utils,types,constants}
```

**Directory Structure**:
```
backend/
├── src/
│   ├── presentation/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/       # Express middleware
│   │   └── dto/              # Data Transfer Objects
│   ├── application/
│   │   ├── services/         # Application services
│   │   └── use-cases/        # Business use cases
│   ├── domain/
│   │   ├── entities/         # Core business entities
│   │   ├── interfaces/       # Repository & service interfaces
│   │   └── value-objects/    # Domain value objects
│   ├── infrastructure/
│   │   ├── database/         # Database connection & config
│   │   ├── repositories/     # Repository implementations
│   │   └── external-services/ # Third-party API clients
│   ├── config/               # App configuration
│   └── shared/
│       ├── utils/            # Utility functions
│       ├── types/            # Shared TypeScript types
│       └── constants/        # Application constants
├── tests/                    # Backend unit/integration tests
├── package.json
├── tsconfig.json
└── .env.example
```

**Acceptance Criteria**:
- All directories created
- Structure follows Layer Architecture pattern

---

### Task 2.2: Initialize Backend Package
**Priority**: High | **Parallelizable**: No (after 2.1)

```bash
cd backend
npm init -y
```

#### `backend/package.json`
```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Node.js backend with Layer Architecture",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.2.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5",
    "zod": "^3.22.4",
    "winston": "^3.11.0",
    "http-status-codes": "^2.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Acceptance Criteria**:
- package.json created with all dependencies
- Scripts for dev, build, test, lint defined

---

### Task 2.3: Create Backend TypeScript Configuration
**Priority**: High | **Parallelizable**: Yes (after 2.2)

#### `backend/tsconfig.json`
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
      "@presentation/*": ["presentation/*"],
      "@application/*": ["application/*"],
      "@domain/*": ["domain/*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@config/*": ["config/*"],
      "@shared/*": ["shared/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Acceptance Criteria**:
- TypeScript configured with strict mode
- Path aliases set up for layer imports

---

### Task 2.4: Create Backend ESLint Configuration
**Priority**: Medium | **Parallelizable**: Yes (after 2.2)

#### `backend/.eslintrc.json`
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "env": {
    "node": true,
    "es2022": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "warn"
  },
  "ignorePatterns": ["dist/", "node_modules/", "coverage/"]
}
```

**Acceptance Criteria**:
- ESLint configured for TypeScript
- Rules enforce code quality

---

### Task 2.5: Create Backend Environment Configuration
**Priority**: High | **Parallelizable**: Yes (after 2.2)

#### `backend/.env.example`
```env
# Server
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/fullstack_app
MONGODB_DB_NAME=fullstack_app

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

#### `backend/src/config/index.ts`
```typescript
import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  MONGODB_URI: z.string().url(),
  MONGODB_DB_NAME: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
```

**Acceptance Criteria**:
- Environment variables documented
- Zod validation for env vars

---

### Task 2.6: Create Domain Layer Files
**Priority**: High | **Parallelizable**: Yes (after 2.3)

#### `backend/src/domain/entities/User.ts`
```typescript
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDTO = Pick<IUser, 'email' | 'name' | 'password'>;
export type UpdateUserDTO = Partial<Pick<IUser, 'email' | 'name'>>;
export type UserResponseDTO = Omit<IUser, 'password'>;
```

#### `backend/src/domain/interfaces/IUserRepository.ts`
```typescript
import { IUser, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(data: CreateUserDTO): Promise<IUser>;
  update(id: string, data: UpdateUserDTO): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}
```

#### `backend/src/domain/interfaces/index.ts`
```typescript
export * from './IUserRepository';
```

#### `backend/src/domain/entities/index.ts`
```typescript
export * from './User';
```

**Acceptance Criteria**:
- User entity defined with TypeScript interfaces
- Repository interface defined
- Exports organized via index files

---

### Task 2.7: Create Infrastructure Layer Files
**Priority**: High | **Parallelizable**: No (after 2.6)

#### `backend/src/infrastructure/database/connection.ts`
```typescript
import mongoose from 'mongoose';
import { env } from '@config/index';
import { logger } from '@shared/utils/logger';

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
```

#### `backend/src/infrastructure/database/models/UserModel.ts`
```typescript
import { Schema, model, Document } from 'mongoose';
import { IUser } from '@domain/entities/User';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

export const UserModel = model<UserDocument>('User', userSchema);
```

#### `backend/src/infrastructure/repositories/UserRepository.ts`
```typescript
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { IUser, CreateUserDTO, UpdateUserDTO } from '@domain/entities/User';
import { UserModel } from '../database/models/UserModel';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select('+password').lean();
  }

  async findAll(): Promise<IUser[]> {
    return UserModel.find().lean();
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
}
```

**Acceptance Criteria**:
- MongoDB connection established
- Mongoose model created
- Repository implementation complete

---

### Task 2.8: Create Application Layer Files
**Priority**: High | **Parallelizable**: No (after 2.7)

#### `backend/src/application/services/UserService.ts`
```typescript
import { IUserRepository } from '@domain/interfaces/IUserRepository';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, IUser } from '@domain/entities/User';
import { hash, compare } from 'bcrypt';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUsers(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.toResponseDTO);
  }

  async getUserById(id: string): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.findById(id);
    return user ? this.toResponseDTO(user) : null;
  }

  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    const hashedPassword = await hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.toResponseDTO(user);
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<UserResponseDTO | null> {
    const user = await this.userRepository.update(id, data);
    return user ? this.toResponseDTO(user) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  private toResponseDTO(user: IUser): UserResponseDTO {
    const { password: _, ...rest } = user;
    return rest;
  }
}
```

**Add bcrypt dependency to package.json**:
```json
"dependencies": {
  ...
  "bcrypt": "^5.1.1"
},
"devDependencies": {
  ...
  "@types/bcrypt": "^5.0.2"
}
```

**Acceptance Criteria**:
- UserService implements business logic
- Password hashing integrated
- DTOs properly mapped

---

### Task 2.9: Create Presentation Layer Files
**Priority**: High | **Parallelizable**: No (after 2.8)

#### `backend/src/presentation/dto/user.dto.ts`
```typescript
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

#### `backend/src/presentation/middleware/validateRequest.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

export function validateRequest(schema: ZodSchema) {
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
```

#### `backend/src/presentation/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@shared/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.isOperational ? err.message : 'Internal server error';

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```

#### `backend/src/presentation/controllers/UserController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '@application/services/UserService';
import { CreateUserInput, UpdateUserInput } from '../dto/user.dto';

export class UserController {
  constructor(private userService: UserService) {}

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getUsers();
      res.status(StatusCodes.OK).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (
    req: Request<unknown, unknown, CreateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(StatusCodes.CREATED).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (
    req: Request<{ id: string }, unknown, UpdateUserInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);

      if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      res.status(StatusCodes.OK).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

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
```

#### `backend/src/presentation/routes/userRoutes.ts`
```typescript
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '@application/services/UserService';
import { UserRepository } from '@infrastructure/repositories/UserRepository';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema, updateUserSchema } from '../dto/user.dto';

const router = Router();

// Dependency injection
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateRequest(createUserSchema), userController.createUser);
router.put('/:id', validateRequest(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export { router as userRoutes };
```

#### `backend/src/presentation/routes/index.ts`
```typescript
import { Router } from 'express';
import { userRoutes } from './userRoutes';

const router = Router();

router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { router as apiRoutes };
```

**Acceptance Criteria**:
- Controllers handle HTTP requests
- Routes configured with validation
- Error handling middleware in place

---

### Task 2.10: Create Shared Utilities
**Priority**: Medium | **Parallelizable**: Yes (after 2.5)

#### `backend/src/shared/utils/logger.ts`
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
```

**Acceptance Criteria**:
- Logger configured with Winston
- Log levels support development debugging

---

### Task 2.11: Create Backend Entry Point
**Priority**: High | **Parallelizable**: No (after 2.9)

#### `backend/src/index.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/index';
import { connectDatabase } from '@infrastructure/database/connection';
import { apiRoutes } from '@presentation/routes';
import { errorHandler } from '@presentation/middleware/errorHandler';
import { logger } from '@shared/utils/logger';

async function bootstrap(): Promise<void> {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api', apiRoutes);

  // Error handling
  app.use(errorHandler);

  // Database connection
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
- Express app configured with middleware
- Database connection established
- Server starts successfully

---

### Task 2.12: Install Backend Dependencies
**Priority**: High | **Parallelizable**: No (after package.json complete)

```bash
cd backend
npm install
```

**Acceptance Criteria**:
- All dependencies installed
- No npm warnings/errors

---

## Phase 3: Frontend Setup (Next.js with App Router)

### Task 3.1: Initialize Next.js Project
**Priority**: High | **Parallelizable**: Yes (with Phase 2)

```bash
cd project-root
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Expected prompts**:
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **Yes** (@/*)

**Acceptance Criteria**:
- Next.js app created with TypeScript
- Tailwind CSS configured
- App Router enabled

---

### Task 3.2: Configure Frontend Environment
**Priority**: High | **Parallelizable**: No (after 3.1)

#### `frontend/.env.local.example`
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# App
NEXT_PUBLIC_APP_NAME=Full-Stack App
```

#### Update `frontend/next.config.ts`
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // API proxy for development (optional, prevents CORS issues)
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
          },
        ]
      : [];
  },
};

export default nextConfig;
```

**Acceptance Criteria**:
- Environment example file created
- Next.js config updated for API proxy

---

### Task 3.3: Create Frontend Directory Structure
**Priority**: High | **Parallelizable**: No (after 3.1)

```bash
cd frontend

# Create additional directories
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/components/{ui,layout,features}
mkdir -p src/types
mkdir -p src/services
```

**Directory Structure**:
```
frontend/
├── src/
│   ├── app/                  # App Router pages
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   ├── globals.css       # Global styles
│   │   └── (routes)/         # Route groups
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── lib/                  # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service clients
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Acceptance Criteria**:
- All directories created
- Structure supports scalable development

---

### Task 3.4: Create API Client Service
**Priority**: High | **Parallelizable**: No (after 3.3)

#### `frontend/src/lib/api-client.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json() as ApiResponse<T>;
  
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || 'An error occurred',
      data.errors
    );
  }
  
  return data.data as T;
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },
};
```

#### `frontend/src/services/userService.ts`
```typescript
import { apiClient } from '@/lib/api-client';

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  },

  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async createUser(data: CreateUserData): Promise<User> {
    return apiClient.post<User>('/users', data);
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },
};
```

**Acceptance Criteria**:
- API client handles all HTTP methods
- Error handling implemented
- Type-safe service layer

---

### Task 3.5: Create Shared Types
**Priority**: Medium | **Parallelizable**: Yes (after 3.3)

#### `frontend/src/types/index.ts`
```typescript
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
```

**Acceptance Criteria**:
- Shared types defined
- Consistent with backend DTOs

---

### Task 3.6: Create UI Components
**Priority**: Medium | **Parallelizable**: Yes (after 3.3)

#### `frontend/src/components/ui/Button.tsx`
```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

#### `frontend/src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Add dependencies**:
```bash
cd frontend
npm install clsx tailwind-merge
```

**Acceptance Criteria**:
- Reusable Button component created
- Utility function for className merging

---

### Task 3.7: Create Layout Components
**Priority**: Medium | **Parallelizable**: Yes (after 3.3)

#### `frontend/src/components/layout/Header.tsx`
```tsx
import Link from 'next/link';

export function Header(): JSX.Element {
  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Full-Stack App
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/users"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Users
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

#### `frontend/src/components/layout/Footer.tsx`
```tsx
export function Footer(): JSX.Element {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm">
          Full-Stack App {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
```

**Acceptance Criteria**:
- Header and Footer components created
- Navigation links functional

---

### Task 3.8: Update Root Layout
**Priority**: Medium | **Parallelizable**: No (after 3.7)

#### `frontend/src/app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Full-Stack App',
  description: 'A full-stack application with Next.js and Node.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

**Acceptance Criteria**:
- Root layout includes Header and Footer
- Proper metadata configured

---

### Task 3.9: Create Sample Pages
**Priority**: Medium | **Parallelizable**: No (after 3.8)

#### `frontend/src/app/page.tsx`
```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home(): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to Full-Stack App
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A modern full-stack application built with Next.js and Node.js using Layer Architecture.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 gap-4">
          <Link href="/users">
            <Button size="lg">View Users</Button>
          </Link>
          <Link href="https://github.com" target="_blank">
            <Button variant="outline" size="lg">Documentation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

#### `frontend/src/app/users/page.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import { userService, User } from '@/services/userService';
import { Button } from '@/components/ui/Button';

export default function UsersPage(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers(): Promise<void> {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <Button>Add User</Button>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No users found. Create your first user!
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {user.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="danger" size="sm">Delete</Button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="mt-2 text-xs text-gray-400 sm:mt-0">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria**:
- Home page with navigation
- Users page with data fetching

---

### Task 3.10: Update Frontend Package.json Scripts
**Priority**: Low | **Parallelizable**: No (after 3.1)

#### Update `frontend/package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

**Acceptance Criteria**:
- Scripts standardized
- Port configuration explicit

---

## Phase 4: Playwright Testing Setup

### Task 4.1: Create Tests Directory Structure
**Priority**: High | **Parallelizable**: Yes (after Phase 2 & 3)

```bash
cd project-root

# Create tests directory
mkdir -p tests/{e2e,api,fixtures,utils}
mkdir -p tests/e2e/{frontend,backend}
```

**Directory Structure**:
```
tests/
├── e2e/
│   ├── frontend/          # Frontend E2E tests
│   └── backend/           # Backend API tests
├── fixtures/              # Test fixtures and data
├── utils/                 # Test utilities
├── playwright.config.ts
└── package.json
```

**Acceptance Criteria**:
- Test directory structure created
- Separation between frontend and backend tests

---

### Task 4.2: Initialize Tests Package
**Priority**: High | **Parallelizable**: No (after 4.1)

#### `tests/package.json`
```json
{
  "name": "tests",
  "version": "1.0.0",
  "description": "Playwright tests for full-stack application",
  "scripts": {
    "test": "playwright test",
    "test:e2e": "playwright test --project=frontend-e2e",
    "test:api": "playwright test --project=backend-api",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report",
    "test:update-snapshots": "playwright test --update-snapshots"
  },
  "devDependencies": {
    "@playwright/test": "^1.41.0",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "dotenv": "^16.4.5"
  }
}
```

**Acceptance Criteria**:
- Package.json created with Playwright dependencies
- Separate scripts for E2E and API tests

---

### Task 4.3: Create Playwright Configuration
**Priority**: High | **Parallelizable**: No (after 4.2)

#### `tests/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: '.env.test' });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Frontend E2E Tests
    {
      name: 'frontend-e2e',
      testDir: './e2e/frontend',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: FRONTEND_URL,
      },
    },
    {
      name: 'frontend-e2e-firefox',
      testDir: './e2e/frontend',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: FRONTEND_URL,
      },
    },
    {
      name: 'frontend-e2e-mobile',
      testDir: './e2e/frontend',
      use: {
        ...devices['iPhone 13'],
        baseURL: FRONTEND_URL,
      },
    },
    
    // Backend API Tests
    {
      name: 'backend-api',
      testDir: './e2e/backend',
      use: {
        baseURL: BACKEND_URL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
  ],

  webServer: [
    {
      command: 'npm run start:backend',
      cwd: '..',
      url: BACKEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run start:frontend',
      cwd: '..',
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
```

#### `tests/.env.test`
```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001/api
```

#### `tests/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@fixtures/*": ["fixtures/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["**/*.ts"]
}
```

**Acceptance Criteria**:
- Playwright configured for multiple projects
- Web server configuration for both frontend and backend
- TypeScript support enabled

---

### Task 4.4: Create Test Utilities
**Priority**: Medium | **Parallelizable**: Yes (after 4.3)

#### `tests/utils/api-helpers.ts`
```typescript
import { APIRequestContext, expect } from '@playwright/test';

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export class ApiHelpers {
  constructor(private request: APIRequestContext) {}

  async createUser(data: { email: string; name: string; password: string }): Promise<User> {
    const response = await this.request.post('/users', { data });
    expect(response.ok()).toBeTruthy();
    const json = await response.json() as ApiResponse<User>;
    return json.data!;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.request.delete(`/users/${id}`);
    expect(response.status()).toBe(204);
  }

  async getUsers(): Promise<User[]> {
    const response = await this.request.get('/users');
    expect(response.ok()).toBeTruthy();
    const json = await response.json() as ApiResponse<User[]>;
    return json.data!;
  }

  async cleanupUsers(): Promise<void> {
    const users = await this.getUsers();
    for (const user of users) {
      await this.deleteUser(user._id);
    }
  }
}
```

#### `tests/fixtures/test-data.ts`
```typescript
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    name: 'Test User',
    password: 'Password123!',
  },
  anotherUser: {
    email: 'another@example.com',
    name: 'Another User',
    password: 'Password456!',
  },
  invalidUser: {
    email: 'invalid-email',
    name: 'A',
    password: 'short',
  },
};
```

**Acceptance Criteria**:
- API helper functions created
- Test data fixtures defined

---

### Task 4.5: Create Frontend E2E Tests
**Priority**: High | **Parallelizable**: No (after 4.4)

#### `tests/e2e/frontend/home.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Welcome to Full-Stack App');
    
    // Check navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: 'View Users' })).toBeVisible();
  });

  test('should navigate to users page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'View Users' }).click();
    
    await expect(page).toHaveURL('/users');
    await expect(page.locator('h1')).toContainText('Users');
  });
});
```

#### `tests/e2e/frontend/users.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should display users page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Users');
    await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate and check for loading indicator before data loads
    await page.goto('/users');
    // This test may need adjustment based on actual loading behavior
  });

  test('should display empty state when no users exist', async ({ page }) => {
    // This assumes no users in database
    // May show empty state or user list depending on database state
    await expect(page.locator('body')).toBeVisible();
  });
});
```

#### `tests/e2e/frontend/navigation.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Users
    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page).toHaveURL('/users');
    
    // Navigate back to Home
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Full-Stack App/);
  });
});
```

**Acceptance Criteria**:
- Home page tests created
- Users page tests created
- Navigation tests created

---

### Task 4.6: Create Backend API Tests
**Priority**: High | **Parallelizable**: No (after 4.4)

#### `tests/e2e/backend/health.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Health Check API', () => {
  test('GET /health should return ok status', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });
});
```

#### `tests/e2e/backend/users.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { ApiHelpers } from '@utils/api-helpers';
import { testUsers } from '@fixtures/test-data';

test.describe('Users API', () => {
  let apiHelpers: ApiHelpers;

  test.beforeEach(async ({ request }) => {
    apiHelpers = new ApiHelpers(request);
  });

  test.afterEach(async () => {
    // Clean up test data
    await apiHelpers.cleanupUsers();
  });

  test('GET /users should return empty array initially', async ({ request }) => {
    const response = await request.get('/users');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('success');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('POST /users should create a new user', async ({ request }) => {
    const response = await request.post('/users', {
      data: testUsers.validUser,
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.status).toBe('success');
    expect(data.data.email).toBe(testUsers.validUser.email);
    expect(data.data.name).toBe(testUsers.validUser.name);
    expect(data.data.password).toBeUndefined(); // Should not return password
    expect(data.data._id).toBeDefined();
  });

  test('POST /users should validate required fields', async ({ request }) => {
    const response = await request.post('/users', {
      data: {},
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.status).toBe('error');
    expect(data.errors).toBeDefined();
  });

  test('POST /users should validate email format', async ({ request }) => {
    const response = await request.post('/users', {
      data: testUsers.invalidUser,
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('GET /users/:id should return a specific user', async ({ request }) => {
    // Create a user first
    const user = await apiHelpers.createUser(testUsers.validUser);
    
    const response = await request.get(`/users/${user._id}`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.data._id).toBe(user._id);
  });

  test('GET /users/:id should return 404 for non-existent user', async ({ request }) => {
    const response = await request.get('/users/507f1f77bcf86cd799439011');
    
    expect(response.status()).toBe(404);
  });

  test('PUT /users/:id should update a user', async ({ request }) => {
    // Create a user first
    const user = await apiHelpers.createUser(testUsers.validUser);
    
    const response = await request.put(`/users/${user._id}`, {
      data: { name: 'Updated Name' },
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.data.name).toBe('Updated Name');
  });

  test('DELETE /users/:id should delete a user', async ({ request }) => {
    // Create a user first
    const user = await apiHelpers.createUser(testUsers.validUser);
    
    const response = await request.delete(`/users/${user._id}`);
    
    expect(response.status()).toBe(204);
    
    // Verify user is deleted
    const getResponse = await request.get(`/users/${user._id}`);
    expect(getResponse.status()).toBe(404);
  });
});
```

**Acceptance Criteria**:
- Health check API tests
- Full CRUD tests for users API
- Validation tests for error cases

---

### Task 4.7: Install Playwright Dependencies
**Priority**: High | **Parallelizable**: No (after 4.2)

```bash
cd tests
npm install
npx playwright install --with-deps
```

**Acceptance Criteria**:
- All dependencies installed
- Playwright browsers installed

---

## Phase 5: CI/CD Pipeline Setup

### Task 5.1: Create GitHub Actions Workflow Directory
**Priority**: High | **Parallelizable**: Yes (after Phase 4)

```bash
cd project-root
mkdir -p .github/workflows
```

**Acceptance Criteria**:
- GitHub workflows directory created

---

### Task 5.2: Create CI Workflow
**Priority**: High | **Parallelizable**: No (after 5.1)

#### `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            package-lock.json
            backend/package-lock.json
            frontend/package-lock.json

      - name: Install root dependencies
        run: npm ci

      - name: Install backend dependencies
        run: npm ci
        working-directory: ./backend

      - name: Install frontend dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Lint backend
        run: npm run lint
        working-directory: ./backend

      - name: Lint frontend
        run: npm run lint
        working-directory: ./frontend

      - name: Type check backend
        run: npm run typecheck
        working-directory: ./backend

      - name: Type check frontend
        run: npm run typecheck
        working-directory: ./frontend

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            package-lock.json
            backend/package-lock.json
            frontend/package-lock.json

      - name: Install dependencies
        run: |
          npm ci
          npm ci --prefix backend
          npm ci --prefix frontend

      - name: Build backend
        run: npm run build
        working-directory: ./backend

      - name: Build frontend
        run: npm run build
        working-directory: ./frontend

      - name: Upload backend build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: backend-dist
          path: backend/dist
          retention-days: 1

      - name: Upload frontend build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/.next
          retention-days: 1

  test-backend-unit:
    name: Backend Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: ./backend

      - name: Run unit tests
        run: npm run test:coverage
        working-directory: ./backend

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: backend/coverage
          retention-days: 7

  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    timeout-minutes: 30
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand(\"ping\").ok'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            package-lock.json
            backend/package-lock.json
            frontend/package-lock.json
            tests/package-lock.json

      - name: Install dependencies
        run: |
          npm ci
          npm ci --prefix backend
          npm ci --prefix frontend
          npm ci --prefix tests

      - name: Download backend build
        uses: actions/download-artifact@v4
        with:
          name: backend-dist
          path: backend/dist

      - name: Download frontend build
        uses: actions/download-artifact@v4
        with:
          name: frontend-build
          path: frontend/.next

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        working-directory: ./tests

      - name: Run E2E tests
        run: npm run test
        working-directory: ./tests
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          MONGODB_DB_NAME: test
          JWT_SECRET: test-secret-key-for-ci-environment
          CORS_ORIGIN: http://localhost:3000
          NODE_ENV: test

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/playwright-report
          retention-days: 7

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: tests/test-results
          retention-days: 7
```

**Acceptance Criteria**:
- CI workflow runs on push and PR
- Lint, build, and test stages
- MongoDB service for E2E tests
- Artifacts uploaded

---

### Task 5.3: Create Deployment Workflow
**Priority**: Medium | **Parallelizable**: Yes (after 5.1)

#### `.github/workflows/deploy.yml`
```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  NODE_VERSION: '20'

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'staging'
    environment:
      name: staging
      url: ${{ vars.STAGING_URL }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      - name: Install and build backend
        run: |
          npm ci
          npm run build
        working-directory: ./backend

      - name: Install and build frontend
        run: |
          npm ci
          npm run build
        working-directory: ./frontend

      # Add your deployment steps here
      # Examples:
      # - Deploy to Vercel for frontend
      # - Deploy to Railway/Render for backend
      # - Deploy to AWS/GCP/Azure
      
      - name: Deploy Backend (placeholder)
        run: echo "Add your backend deployment command here"
        
      - name: Deploy Frontend (placeholder)
        run: echo "Add your frontend deployment command here"

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    if: github.event.inputs.environment == 'production'
    needs: deploy-staging
    environment:
      name: production
      url: ${{ vars.PRODUCTION_URL }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      # Production deployment steps
      - name: Deploy to Production (placeholder)
        run: echo "Add your production deployment commands here"
```

**Acceptance Criteria**:
- Deployment workflow for staging and production
- Manual trigger option
- Environment protection rules supported

---

### Task 5.4: Create PR Template
**Priority**: Low | **Parallelizable**: Yes (after 5.1)

#### `.github/pull_request_template.md`
```markdown
## Description

<!-- Describe your changes in detail -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Related Issues

<!-- Link any related issues here -->
Closes #
```

**Acceptance Criteria**:
- PR template created with checklist

---

## Phase 6: Final Configuration and Documentation

### Task 6.1: Create README.md
**Priority**: Medium | **Parallelizable**: Yes

#### `project-root/README.md`
```markdown
# Full-Stack Application

A modern full-stack application built with Next.js (frontend) and Node.js (backend) using Layer Architecture.

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- Layer Architecture (Presentation, Application, Domain, Infrastructure)

### Frontend
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- React

### Testing
- Playwright for E2E and API testing

### CI/CD
- GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-root
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install test dependencies
cd ../tests && npm install && npx playwright install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.local.example frontend/.env.local

# Tests
cp tests/.env.test.example tests/.env.test
```

4. Start MongoDB (if running locally)

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm run test:e2e

# Run frontend E2E tests only
cd tests && npm run test:e2e

# Run API tests only
cd tests && npm run test:api

# Run tests with UI
cd tests && npm run test:ui
```

## Project Structure

```
project-root/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── presentation/    # Controllers, routes, middleware
│   │   ├── application/     # Business logic, services
│   │   ├── domain/          # Entities, interfaces
│   │   └── infrastructure/  # Database, external services
│   └── tests/               # Unit tests
├── frontend/                # Next.js frontend
│   └── src/
│       ├── app/             # App Router pages
│       ├── components/      # React components
│       ├── services/        # API services
│       └── lib/             # Utilities
├── tests/                   # E2E and API tests
│   └── e2e/
│       ├── frontend/        # Frontend E2E tests
│       └── backend/         # Backend API tests
└── .github/
    └── workflows/           # CI/CD pipelines
```

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Health
- `GET /api/health` - Health check endpoint

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT
```

**Acceptance Criteria**:
- Comprehensive README with setup instructions
- Project structure documented
- API endpoints listed

---

### Task 6.2: Install Root Dependencies
**Priority**: High | **Parallelizable**: No (final step)

```bash
cd project-root
npm install
```

**Acceptance Criteria**:
- All root dependencies installed
- concurrently package available

---

### Task 6.3: Verify Full Setup
**Priority**: High | **Parallelizable**: No (final step)

```bash
# Verify backend starts
cd backend && npm run dev &

# Verify frontend starts
cd frontend && npm run dev &

# Run health check
curl http://localhost:3001/api/health

# Run tests
cd tests && npm run test
```

**Acceptance Criteria**:
- Backend starts without errors
- Frontend starts without errors
- Health check returns 200
- All tests pass

---

## Summary: Task Execution Order

### Parallel Execution Groups

**Group 1** (Sequential - Foundation):
- Task 1.1: Initialize Root Project Structure
- Task 1.2: Create Root Configuration Files

**Group 2** (Parallel - Backend & Frontend Init):
- Task 2.1-2.5: Backend directory, package, tsconfig, eslint, env
- Task 3.1-3.3: Frontend Next.js init, env, directory structure

**Group 3** (Sequential - Backend Layers):
- Task 2.6: Domain Layer
- Task 2.7: Infrastructure Layer
- Task 2.8: Application Layer
- Task 2.9: Presentation Layer
- Task 2.10: Shared Utilities
- Task 2.11: Entry Point
- Task 2.12: Install Dependencies

**Group 4** (Sequential - Frontend Components):
- Task 3.4: API Client
- Task 3.5: Types
- Task 3.6: UI Components
- Task 3.7: Layout Components
- Task 3.8: Root Layout
- Task 3.9: Sample Pages
- Task 3.10: Package Scripts

**Group 5** (Parallel - Testing & CI/CD):
- Tasks 4.1-4.7: Playwright setup
- Tasks 5.1-5.4: GitHub Actions setup

**Group 6** (Final):
- Task 6.1: README
- Task 6.2: Install Root Dependencies
- Task 6.3: Verify Full Setup

---

## Estimated Total Time

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Root Setup | 10 minutes |
| Phase 2: Backend Setup | 45 minutes |
| Phase 3: Frontend Setup | 30 minutes |
| Phase 4: Testing Setup | 25 minutes |
| Phase 5: CI/CD Setup | 15 minutes |
| Phase 6: Final Config | 10 minutes |
| **Total** | **~2-2.5 hours** |

---

## Notes for Execution

1. **MongoDB Required**: Ensure MongoDB is running locally or have an Atlas connection string ready before starting backend development.

2. **Path Aliases**: The backend uses TypeScript path aliases (`@presentation/*`, etc.). These require `tsx` for development and proper `tsconfig.json` configuration.

3. **Environment Variables**: Never commit `.env` files. Always use `.env.example` or `.env.*.example` patterns.

4. **Testing Order**: Always run backend tests before E2E tests to ensure the API layer is working correctly.

5. **CI/CD Secrets**: Remember to configure GitHub repository secrets for production deployments:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - Deployment platform credentials

