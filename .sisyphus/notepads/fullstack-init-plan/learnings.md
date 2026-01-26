# Learnings - Full-Stack Init Plan

This file tracks conventions, patterns, and best practices discovered during execution.

---
## Root Package.json Creation

**Completed**: Mon Jan 26 12:47:49 +07 2026

**Outcome**: 
- Created root package.json with workspace configuration
- Set up npm scripts for managing backend and frontend workspaces
- Configured concurrently for parallel dev/start commands
- Node.js version requirement set to >=20.0.0

**Structure**:
- Workspace name: fullstack-app
- Scripts delegate to backend/ and frontend/ using --prefix flag
- Clean script handles all workspace node_modules
- Private package to prevent accidental npm publish

**Verification**: JSON syntax validated successfully

## Task 1.2 Learnings - Root Configuration Files

### Configuration Files Created
- .gitignore: Comprehensive ignore patterns covering dependencies, build outputs, env files, IDE/OS files, logs, testing artifacts
- .nvmrc: Node version 20 specification for consistent environment
- .editorconfig: Code style standards (2-space indent, LF line endings, UTF-8, trim whitespace)

### Patterns Used
- .gitignore organized by category with clear comments
- .editorconfig uses INI format with [*] for global rules and [*.md] for markdown-specific override
- .nvmrc contains only version number (20) without 'v' prefix

### Success
- All 3 files created successfully in project root
- Files match exact specifications from plan lines 44-105

## Task 2.1 Learnings - Backend Directory Structure

### Directory Structure Created
**Completed**: Mon Jan 26 2026

**Architecture Pattern**: Layer Architecture
- **Presentation Layer**: controllers, routes, middleware, dto
- **Application Layer**: services, use-cases
- **Domain Layer**: entities, interfaces, value-objects
- **Infrastructure Layer**: database, repositories, external-services
- **Support**: config, shared (utils, types, constants), tests

**Structure**:
```
backend/
├── src/
│   ├── presentation/     # HTTP layer: controllers, routes, middleware, DTOs
│   ├── application/      # Business logic: services, use-cases
│   ├── domain/           # Core domain: entities, interfaces, value-objects
│   ├── infrastructure/   # External concerns: database, repositories, external-services
│   ├── config/           # Configuration management
│   └── shared/           # Shared utilities, types, constants
└── tests/                # Test files
```

**Command Pattern**: Used brace expansion for efficient parallel directory creation
- Single command with `&&` chaining ensures atomic operation
- `mkdir -p` creates nested directories in one pass

**Verification**: 24 directories created successfully (verified with `find backend -type d`)

**Layer Architecture Flow**: Domain → Infrastructure → Application → Presentation
- Domain: Pure business logic, no dependencies
- Infrastructure: Implements domain interfaces, handles persistence
- Application: Orchestrates use-cases using domain and infrastructure
- Presentation: HTTP/API layer, delegates to application


## Task 2.2 Completed - Backend package.json created

- Created backend/package.json with complete Layer Architecture dependencies
- Dependencies: express, mongoose, cors, helmet, dotenv, zod, winston, http-status-codes
- DevDependencies: TypeScript tooling, tsx, vitest, eslint
- Scripts: dev (tsx watch), build, start, test suite, lint suite, typecheck
- Engines: node >=20.0.0
- All version numbers match plan specification exactly

## Task 2.3: Backend TypeScript Configuration
- Created backend/tsconfig.json with strict TypeScript configuration
- Configured ES2022 target with NodeNext module resolution for modern Node.js
- Enabled all strict flags: noImplicitAny, noImplicitReturns, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, exactOptionalPropertyTypes
- Path aliases established for Layer Architecture:
  - @presentation/* → Clean controller/route imports
  - @application/* → Service layer access
  - @domain/* → Entity/repository interfaces
  - @infrastructure/* → DB/external integrations
  - @config/* → Configuration management
  - @shared/* → Common utilities/types
- Benefits: Type-safe imports across layers, reduced coupling, better IDE navigation
- JSON syntax verified successfully

## Task 2.4: Backend ESLint Configuration
**Completed**: Mon Jan 26 2026

- Created backend/.eslintrc.json with TypeScript ESLint strict rules
- Parser: @typescript-eslint/parser with type-aware linting
- Extends: eslint:recommended + TypeScript recommended + type-checking rules
- Type-checking enabled via parserOptions.project pointing to tsconfig.json
- Strict rules configured:
  - explicit-function-return-type: warn (enforce return type annotations)
  - no-unused-vars: error with ^_ pattern for intentional unused params
  - no-explicit-any: error (ban 'any' type usage)
  - no-console: warn (prevent console.log in production)
- Ignore patterns: dist/, node_modules/, coverage/
- Environment: Node.js with ES2022 features
- Integration: Works with tsconfig.json path aliases and strict mode
- JSON syntax verified successfully

## Task 2.5: Backend Environment Configuration
**Completed**: Mon Jan 26 2026

### Files Created
1. **backend/.env.example** (306 bytes)
   - Server variables: NODE_ENV, PORT, HOST
   - Database variables: MONGODB_URI, MONGODB_DB_NAME
   - Security variables: JWT_SECRET, JWT_EXPIRES_IN
   - CORS variables: CORS_ORIGIN
   - Logging variables: LOG_LEVEL

2. **backend/src/config/index.ts** (730 bytes)
   - Zod validation schema for all env variables
   - Runtime validation with safeParse
   - Process exit on validation failure
   - Type-safe env export

### Environment Variable Patterns
- **Enums**: NODE_ENV (development/production/test), LOG_LEVEL (error/warn/info/debug)
- **String transforms**: PORT (string→number conversion)
- **URL validation**: MONGODB_URI, CORS_ORIGIN (z.string().url())
- **Security**: JWT_SECRET minimum 32 characters (z.string().min(32))
- **Defaults**: NODE_ENV=development, PORT=3001, HOST=localhost, JWT_EXPIRES_IN=7d, LOG_LEVEL=info

### Zod Schema Benefits
- Type-safe environment access via exported `env` object
- Fail-fast on app startup if env vars invalid/missing
- Automatic type coercion (PORT string→number)
- Clear error messages via parsed.error.format()

### Integration Points
- Config will be imported by infrastructure layer (database connections)
- Application layer will use for JWT/security settings
- Presentation layer will use for server/CORS config
- Winston logger will use LOG_LEVEL from validated env

### Security Notes
- .env.example committed to git with safe placeholder values
- Actual .env file ignored via .gitignore (created in Task 1.2)
- JWT_SECRET placeholder warns: "change-in-production"
- Production deployment must override all sensitive values


## Task 2.6: Domain Layer Files
**Completed**: Mon Jan 26 2026

### Files Created
1. **backend/src/domain/entities/User.ts** (372 bytes)
   - IUser interface with Mongoose Types.ObjectId for _id
   - Properties: _id, email, name, password, createdAt, updatedAt
   - CreateUserDTO: Pick<IUser, 'email' | 'name' | 'password'>
   - UpdateUserDTO: Partial<Pick<IUser, 'email' | 'name'>>
   - UserResponseDTO: Omit<IUser, 'password'> (security: excludes password from responses)

2. **backend/src/domain/interfaces/IUserRepository.ts** (394 bytes)
   - Repository interface with 6 CRUD methods
   - findById/findByEmail: Promise<IUser | null>
   - findAll: Promise<IUser[]>
   - create: Promise<IUser> (requires CreateUserDTO)
   - update: Promise<IUser | null> (requires UpdateUserDTO)
   - delete: Promise<boolean>

3. **backend/src/domain/interfaces/index.ts** (35 bytes)
   - Re-exports IUserRepository interface

4. **backend/src/domain/entities/index.ts** (24 bytes)
   - Re-exports IUser and all DTOs from User.ts

### Domain Layer Patterns
- **Pure Domain Logic**: No dependencies on infrastructure/frameworks
- **Repository Pattern**: Abstract data access via interface
- **DTO Pattern**: Separate internal entities from API contracts
  - CreateUserDTO: Minimal data for user creation
  - UpdateUserDTO: Optional fields for partial updates
  - UserResponseDTO: Safe external representation (no password)
- **Type Safety**: Mongoose Types.ObjectId ensures type-safe MongoDB IDs
- **Index Exports**: Clean barrel exports for simpler imports

### Architecture Flow (Layer Architecture)
```
Domain (Innermost) → Infrastructure → Application → Presentation
- Domain defines WHAT (entities, interfaces, rules)
- Infrastructure implements HOW (concrete repositories, DB)
- Application orchestrates use-cases
- Presentation handles HTTP/API layer
```

### Integration Points
- Infrastructure layer (Task 2.7) will implement IUserRepository with Mongoose
- Application layer will use repository interface for business logic
- Path alias: @domain/* enables clean cross-layer imports
- DTOs will be used in presentation layer for request/response validation

### Security Considerations
- UserResponseDTO excludes password field from API responses
- CreateUserDTO ensures password is required during user creation
- UpdateUserDTO excludes password (password updates handled separately)


## Task 2.7: Infrastructure Layer Files
**Completed**: Mon Jan 26 2026

### Files Created
1. **backend/src/infrastructure/database/connection.ts** (552 bytes)
   - connectDatabase(): MongoDB connection using mongoose.connect
   - Uses env.MONGODB_URI and env.MONGODB_DB_NAME from @config
   - Winston logger integration for connection status
   - Error handling with process.exit(1) on connection failure
   - disconnectDatabase(): Graceful MongoDB disconnection

2. **backend/src/infrastructure/database/models/UserModel.ts** (646 bytes)
   - UserDocument interface extends Omit<IUser, '_id'> & Document
   - Mongoose schema with email (unique, lowercase, trim), name (trim), password (select: false)
   - timestamps: true for automatic createdAt/updatedAt
   - Index on email field for query performance
   - UserModel exported as Mongoose model<UserDocument>

3. **backend/src/infrastructure/repositories/UserRepository.ts** (1.0K)
   - Implements IUserRepository interface from domain layer
   - 6 methods: findById, findByEmail, findAll, create, update, delete
   - Uses .lean() for plain JavaScript objects (not Mongoose documents)
   - findByEmail uses .select('+password') to include password field
   - create() uses toObject() to convert document to plain object
   - update() uses findByIdAndUpdate with { new: true }
   - delete() returns boolean based on result !== null

### Infrastructure Layer Patterns
- **Repository Pattern Implementation**: Concrete implementation of domain interfaces
- **Mongoose Integration**: ODM for MongoDB with type-safe schemas
- **Data Mapping**: UserDocument interface bridges domain IUser and Mongoose Document
- **Security**: password field uses select: false, excluded by default from queries
- **Performance**: .lean() returns plain objects, skipping Mongoose hydration overhead
- **Type Safety**: All methods return Promise<IUser | null>, Promise<IUser[]>, Promise<boolean>

### Path Alias Usage
- @config/index → Environment configuration
- @domain/entities/User → IUser entity and DTOs
- @domain/interfaces/IUserRepository → Repository interface
- @shared/utils/logger → Winston logger instance
- Relative path ../database/models/UserModel for internal infrastructure imports

### Mongoose Schema Patterns
- **Unique Index**: email field with unique: true constraint
- **String Transforms**: lowercase: true, trim: true for email normalization
- **Security Field**: password with select: false (requires explicit .select('+password'))
- **Timestamps**: Automatic createdAt/updatedAt via timestamps: true
- **Compound Index**: userSchema.index({ email: 1 }) for optimized email lookups

### Repository Method Details
- **findById/findByEmail**: Return null if not found (nullable return type)
- **findAll**: Always returns array (empty if no documents)
- **create**: Creates + saves document, returns plain object
- **update**: Returns updated document or null if ID not found
- **delete**: Returns true if deleted, false if ID not found

### Integration Points
- Application layer (Task 2.8) will inject UserRepository into services
- Connection functions will be called from index.ts (Task 2.11)
- UserModel bridges domain entities and MongoDB collections
- Repository abstracts MongoDB operations from business logic

### Architecture Verification
✅ Infrastructure layer implements domain interfaces (IUserRepository)
✅ No domain logic in infrastructure (pure data access)
✅ Path aliases enable clean cross-layer imports
✅ Mongoose types compatible with domain IUser interface
✅ Password security via select: false pattern

## Task 2.8: Application Layer Files
**Completed**: Mon Jan 26 2026

### File Created
**backend/src/application/services/UserService.ts** (1.3K)
- UserService class implementing business logic layer
- Constructor injection pattern: accepts IUserRepository (domain interface)
- 5 public methods: getUsers(), getUserById(id), createUser(data), updateUser(id, data), deleteUser(id)
- 1 private helper: toResponseDTO(user) - strips password field from responses
- Password hashing: bcrypt.hash(data.password, 10) with 10 salt rounds

### Service Methods
1. **getUsers()**: Returns Promise<UserResponseDTO[]>
   - Fetches all users via repository.findAll()
   - Maps each user through toResponseDTO to exclude passwords

2. **getUserById(id)**: Returns Promise<UserResponseDTO | null>
   - Fetches user by ID via repository.findById(id)
   - Returns mapped DTO or null if not found

3. **createUser(data)**: Returns Promise<UserResponseDTO>
   - Hashes password with bcrypt (salt rounds: 10)
   - Creates user with hashed password via repository.create()
   - Returns response DTO (password excluded)

4. **updateUser(id, data)**: Returns Promise<UserResponseDTO | null>
   - Updates user via repository.update(id, data)
   - Returns mapped DTO or null if not found

5. **deleteUser(id)**: Returns Promise<boolean>
   - Delegates to repository.delete(id)
   - Returns true if deleted, false if not found

### Private Helper Method
- **toResponseDTO(user)**: Converts IUser to UserResponseDTO
  - Destructures password field (assigned to unused _)
  - Returns rest of user object (security: password never exposed)

### Application Layer Patterns
- **Service Layer**: Orchestrates business logic between domain and infrastructure
- **Dependency Injection**: Repository injected via constructor (testable, decoupled)
- **Password Hashing**: bcrypt with 10 salt rounds (industry standard)
- **DTO Mapping**: toResponseDTO ensures password field never returned in API responses
- **Async/Await**: All methods return promises for database operations

### Path Alias Imports
- @domain/interfaces/IUserRepository → Domain interface dependency
- @domain/entities/User → IUser entity and all DTOs (CreateUserDTO, UpdateUserDTO, UserResponseDTO)
- bcrypt → hash() and compare() functions (compare imported but not used yet)

### bcrypt Dependency Requirement
**IMPORTANT**: Task 2.8 requires adding bcrypt to backend/package.json:
```json
"dependencies": {
  "bcrypt": "^5.1.1"
},
"devDependencies": {
  "@types/bcrypt": "^5.0.2"
}
```
This must be added manually to backend/package.json (not done in this task).
After adding, run `npm install` in backend/ directory.

### Integration Points
- Infrastructure layer (Task 2.7): UserRepository implements IUserRepository used here
- Presentation layer (Task 2.9): Controllers will inject UserService to handle HTTP requests
- Domain layer: All interfaces and DTOs from @domain/* ensure type safety
- Password security: Hashed passwords stored in DB, plain passwords never returned

### Architecture Verification
✅ Application layer orchestrates domain + infrastructure
✅ Constructor injection enables dependency inversion
✅ DTOs used throughout (CreateUserDTO in, UserResponseDTO out)
✅ Password security via hashing (create) and exclusion (response)
✅ No direct database access (delegates to repository interface)
✅ Path aliases (@domain/*) enable clean cross-layer imports


## Task 1.1: Complex Architecture Cleanup (Completed)
- **Action**: Deleted complex Layer Architecture folders from backend/src/
- **Folders Removed**: 
  - domain/ (entities, interfaces)
  - infrastructure/ (database, repositories)
  - application/ (services)
  - presentation/ (if existed)
  - shared/ (if existed)
- **Files Deleted**: User.ts, IUserRepository.ts, UserModel.ts, UserRepository.ts, UserService.ts, connection.ts
- **Preserved**: backend/src/config/ folder retained as required
- **Verification**: `find backend/src -type d` confirms only backend/src/ and backend/src/config/ remain
- **Outcome**: Clean slate ready for new simple structure (models/, repositories/, services/, controllers/)


## Task 1.2: New Directory Structure Created
- Created 7 new folders for simple flat architecture
- Folders: models/, repositories/, services/, controllers/, routes/, middleware/, utils/
- config/ folder preserved as expected
- Simple mkdir -p command worked cleanly
- Verified with find command - all 8 directories present under backend/src/

## Task 1.3: TypeScript Path Aliases Updated
**Completed**: Mon Jan 26 2026

### Changes Made
- **File**: backend/tsconfig.json
- **Section**: compilerOptions.paths
- **Old Aliases** (Layer Architecture - 6 aliases):
  - @presentation/* → presentation/*
  - @application/* → application/*
  - @domain/* → domain/*
  - @infrastructure/* → infrastructure/*
  - @config/* → config/*
  - @shared/* → shared/*

- **New Aliases** (Simple Flat Architecture - 9 aliases):
  - @/* → ./*
  - @models/* → models/*
  - @repositories/* → repositories/*
  - @services/* → services/*
  - @controllers/* → controllers/*
  - @routes/* → routes/*
  - @middleware/* → middleware/*
  - @config/* → config/*
  - @utils/* → utils/*

### Path Alias Patterns
- **Root Alias**: @/* gives access to any file in src/
- **Layer Aliases**: Each directory gets dedicated alias (@models/*, @services/*, etc.)
- **Import Examples**:
  - `import { UserModel } from '@models/User.model'`
  - `import { UserService } from '@services/User.service'`
  - `import { authMiddleware } from '@middleware/auth.middleware'`
  - `import { env } from '@config'` (preserved from previous structure)

### Benefits of New Aliases
- **Simpler Structure**: Matches flat architecture (no nested layers)
- **Cleaner Imports**: Shorter paths without deep nesting
- **Better IDE Support**: Each folder has dedicated autocomplete namespace
- **Universal Root**: @/* provides fallback for any src/ file

### Verification
- JSON syntax validated with node -e JSON.parse()
- All 9 path aliases match plan specification (lines 156-166)
- baseUrl remains "./src" - all aliases relative to src/

### Integration Impact
- Next task (2.1) will create User.model.ts and use @models/* alias
- All future files will use new aliases for cross-file imports
- Old imports (@domain/*, @infrastructure/*, etc.) no longer valid


## Task 2.1: User Model Created (Simple Architecture)
**Completed**: Mon Jan 26 2026

### File Created
**backend/src/models/User.model.ts** (1.1K, 51 lines)
- Consolidates all user-related concerns in single file (vs. Layer Architecture split)
- Replaces old: domain/entities/User.ts + infrastructure/database/models/UserModel.ts

### Structure Components
1. **TypeScript Interfaces**:
   - IUser: Core entity with _id (Types.ObjectId), email, name, password, timestamps
   - UserDocument: extends Omit<IUser, '_id'>, Document (bridges domain + Mongoose)

2. **DTOs**:
   - CreateUserDTO: Pick<IUser, 'email' | 'name' | 'password'> - minimal user creation
   - UpdateUserDTO: Partial<Pick<IUser, 'email' | 'name'>> - optional partial updates
   - UserResponseDTO: Omit<IUser, 'password'> - safe external representation

3. **Mongoose Schema**:
   - email: String, required, unique, lowercase, trim, validation message
   - name: String, required, trim, minlength: 2, validation message  
   - password: String, required, select: false (security default)
   - timestamps: true (auto createdAt/updatedAt)

4. **Indexes**: userSchema.index({ email: 1 }) for query performance

5. **Export**: UserModel = model<UserDocument>('User', userSchema)

### Simple Architecture Patterns
- **Single-File Model**: All concerns in one place (types + schema + model)
- **Path Alias Ready**: @models/* imports configured in tsconfig.json (Task 1.3)
- **Security Default**: password select: false excludes from queries by default
- **Validation**: Required fields with custom messages, string transforms (lowercase, trim)
- **Type Safety**: UserDocument interface ensures TypeScript + Mongoose compatibility

### Key Differences from Layer Architecture
- **Before**: User.ts (domain) + UserModel.ts (infrastructure) + separate files
- **After**: User.model.ts (all-in-one) - simpler, faster navigation
- **Benefit**: Less file jumping, clearer code organization for small-medium projects

### Integration Points
- Next: Task 3.1 will create UserRepository importing from '@models/User.model'
- UserService (Task 4.1) will use DTOs for business logic
- Controllers will use CreateUserDTO/UpdateUserDTO for request validation
- Responses will use UserResponseDTO to exclude password field

### Security Notes
- password field excluded by default (select: false)
- Repositories must explicitly .select('+password') to include password
- UserResponseDTO enforces password exclusion at type level
- Mongoose timestamps auto-track record creation/modification


## Task 3.1: User Repository Created

**Date**: 2026-01-26

**Implementation**:
- Created `backend/src/repositories/user.repository.ts` with 7 CRUD methods
- Used @models/* path alias for clean imports
- All methods return promises with proper typing

**Key Patterns**:
1. **Singleton Export**: `export const userRepository = new UserRepository()` for simple DI
2. **Performance Optimization**: `.lean()` on all read operations returns plain objects (no mongoose overhead)
3. **Selective Field Selection**: `select('+password')` only on findByEmail for authentication
4. **Boolean Delete**: `delete()` returns boolean instead of deleted document
5. **Existence Check**: `existsByEmail()` uses `countDocuments()` for efficiency

**Method Signatures**:
- `findAll()`: Returns all users as plain objects
- `findById(id)`: Returns single user or null
- `findByEmail(email)`: Returns user with password field for auth
- `create(data)`: Creates and returns new user using toObject()
- `update(id, data)`: Updates and returns updated user with `{ new: true }`
- `delete(id)`: Returns boolean success indicator
- `existsByEmail(email)`: Returns boolean for email uniqueness checks

**Next Dependencies**:
- Task 4.1/4.2 will import userRepository in service layer
- No interface abstraction needed (simple architecture)

## Task 4.1: Added bcrypt Dependencies (Mon Jan 26 2026)

**What was done:**
- Added `bcrypt: ^5.1.1` to dependencies
- Added `@types/bcrypt: ^5.0.2` to devDependencies
- Maintained alphabetical order in both sections
- Verified JSON validity

**Dependencies added:**
```json
"dependencies": {
  "bcrypt": "^5.1.1"
}
"devDependencies": {
  "@types/bcrypt": "^5.0.2"
}
```

**Rationale:**
- bcrypt required for password hashing in UserService (Task 4.2)
- Was identified as missing in old Layer Architecture
- Simple architecture plan includes this fix explicitly

**Verification:**
- ✓ Valid JSON structure maintained
- ✓ Alphabetical order preserved
- ✓ Exact versions as specified in plan (lines 318-325)
- ✓ All existing dependencies retained

**Next:**
- Task 4.2 will create UserService that imports bcrypt
- Task 10.1 will run npm install to install dependencies


## Task 4.2: User Service Implementation

### Implementation Details
- Created `backend/src/services/user.service.ts` with complete business logic
- UserService class with constructor injection for testability
- Password security: bcrypt hashing with SALT_ROUNDS = 10
- Email validation: checks for duplicate emails on create/update
- Data protection: toResponseDTO strips password from responses

### Key Components
1. **CRUD Operations**: getAllUsers, getUserById, createUser, updateUser, deleteUser
2. **AppError Class**: Custom error with statusCode and isOperational properties
3. **Singleton Pattern**: Exported userService instance for easy DI
4. **Type Safety**: Full TypeScript with proper DTOs and return types

### Security Patterns
- Password hashing: `await hash(data.password, SALT_ROUNDS)` using bcrypt
- Email uniqueness: Validated before create and on update
- Password stripping: Private toResponseDTO removes password from all responses

### Error Handling
- AppError provides structured errors with HTTP status codes
- 409 Conflict for duplicate emails
- isOperational flag for error middleware

### Dependencies
- Requires: bcrypt package (Task 4.1), userRepository (Task 3.1)
- Used by: user.controller.ts (Task 5.1)


## validate.middleware.ts Created
- Generic validate() middleware accepts any ZodSchema
- ZodError handling with formatted error response (field path + message)
- createUserSchema: email, name (min 2), password (min 8)
- updateUserSchema: optional email, name
- Type exports: CreateUserInput, UpdateUserInput inferred from Zod schemas
