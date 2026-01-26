# Draft: Simple Fullstack Architecture Setup

## Requirements (CONFIRMED)

### Backend
- **Framework**: Express.js (confirmed by user)
- **Language**: JavaScript (NO TypeScript - confirmed by user)
- **Database**: MongoDB with Mongoose ODM
- **Architecture**: Simple Layer Architecture với các folders:
  - `controllers/` - HTTP request handlers
  - `services/` - Business logic  
  - `repositories/` - Data access layer
  - `models/` - Mongoose models + schemas
  - `routes/` - Route definitions (RIÊNG - confirmed)
  - `middleware/` - Auth, validation, error handling (confirmed)
- **Dev tools**: nodemon và các libs phổ biến

### Frontend
- **Framework**: Next.js 14+ với App Router
- **Styling**: Tailwind CSS
- **Language**: JavaScript (NO TypeScript)

### Testing
- **Testing tool**: Playwright (confirmed by user)
- **Scope**: E2E tests cho frontend + API tests cho backend

## Technical Decisions (CONFIRMED)
- [x] Framework backend: Express.js
- [x] TypeScript: NO - Plain JavaScript
- [x] Routes structure: routes/ folder riêng
- [x] Middleware folder: YES
- [x] Testing: Playwright cho cả E2E và API testing

## Research Findings

### Express.js Simple Layer Architecture Patterns
From GitHub research:
```
backend/
├── src/
│   ├── controllers/     # HTTP handlers (user.controller.js)
│   ├── services/        # Business logic (user.service.js)
│   ├── repositories/    # Data access (user.repository.js)
│   ├── models/          # Mongoose schemas (User.js)
│   ├── routes/          # API routes (user.routes.js, index.js)
│   ├── middleware/      # Auth, validation, error handler
│   ├── config/          # Database, env config
│   └── utils/           # Helper functions
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json
└── .env
```

### Common Express.js Dependencies
- **Core**: express, mongoose, dotenv
- **Security**: helmet, cors, bcryptjs
- **Validation**: joi or express-validator  
- **Dev**: nodemon
- **Logging**: morgan or winston (optional)

### Next.js App Router Structure
```
frontend/
├── src/
│   ├── app/             # App Router pages
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── (routes)/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   └── layout/      # Header, Footer, etc.
│   ├── lib/             # API client, utils
│   └── services/        # API service layer
├── public/
├── tailwind.config.js
├── next.config.js
└── package.json
```

## ALL REQUIREMENTS CONFIRMED

1. ~~Backend framework?~~ → Express.js ✓
2. ~~TypeScript?~~ → NO (plain JavaScript) ✓
3. ~~Routes structure?~~ → Separate folder ✓
4. ~~Middleware folder?~~ → YES ✓
5. ~~Testing?~~ → Playwright ✓
6. ~~Authentication?~~ → **YES - JWT Authentication** ✓
7. ~~Validation library?~~ → **express-validator** ✓
8. ~~Sample entity?~~ → **User CRUD** ✓
9. ~~Extra features?~~ → **CI/CD (GitHub Actions) + API Documentation (Swagger)** ✓

## Scope Boundaries (FINAL)

### INCLUDE
- Backend với Simple Layer Architecture:
  - `controllers/` - HTTP handlers
  - `services/` - Business logic  
  - `repositories/` - Data access
  - `models/` - Mongoose schemas
  - `routes/` - API routes
  - `middleware/` - Auth, validation, error handling
  - `config/` - Database, env config
  - `utils/` - Helper functions
- MongoDB connection via Mongoose
- **JWT Authentication** (login, register, protected routes)
- **User CRUD** as sample entity
- **express-validator** for validation
- Frontend: Next.js 14+ với App Router + Tailwind CSS
- **Playwright** testing (E2E + API tests)
- **Swagger/OpenAPI** documentation
- **GitHub Actions** CI/CD
- Development tools: nodemon, dotenv, cors, helmet, morgan
- Basic .env configuration

### EXCLUDE
- Docker setup (not requested)
- Rate limiting (can add later)
- Email verification (can add later)
- Social auth (can add later)
- Admin panel (can add later)
