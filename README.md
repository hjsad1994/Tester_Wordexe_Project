# Baby Bliss - Nền Tảng Thương Mại Điện Tử Sản Phẩm Cho Bé

Ứng dụng thương mại điện tử full-stack chuyên về sản phẩm cho bé, được xây dựng với Node.js/Express (backend), Next.js 16 (frontend) và Playwright (kiểm thử E2E). Giao diện hoàn toàn bằng tiếng Việt, thiết kế responsive, hỗ trợ đa nền tảng.

> *"Yêu thương từng khoảnh khắc"*

## Tính Năng Chính

| Tính năng | Mô tả |
|-----------|-------|
| Đăng ký & Đăng nhập | JWT cookie-based, mã hóa bcrypt, phân quyền admin/user |
| Danh mục sản phẩm | Phân trang, tìm kiếm, lọc theo danh mục, hỗ trợ slug URL |
| Giỏ hàng | Lưu theo user trong localStorage, chế độ "Mua ngay" |
| Danh sách yêu thích | Lưu theo user, toggle nhanh từ trang sản phẩm |
| Thanh toán | COD (thanh toán khi nhận hàng) và MoMo (giao diện mô phỏng) |
| Mã giảm giá | 3 loại: giảm theo %, giảm cố định, miễn phí vận chuyển |
| Đánh giá sản phẩm | 1-5 sao, bình luận, tải lên tối đa 3 ảnh, nút "Hữu ích" |
| Quản lý đơn hàng | Theo dõi trạng thái, lịch sử chuyển đổi trạng thái |
| Hồ sơ cá nhân | Chỉnh sửa thông tin, tải lên ảnh đại diện |
| Trang quản trị | Quản lý sản phẩm, tồn kho, danh mục, đơn hàng, khuyến mãi |
| Tải ảnh Cloudinary | Ảnh sản phẩm, ảnh đại diện, ảnh đánh giá |
| Kiểm thử E2E | Playwright với Page Object Model |

## Cấu Trúc Dự Án

```
project/
├── backend/                  # API server (Node.js/Express)
│   └── src/
│       ├── config/           # Cấu hình database, Cloudinary
│       ├── constants/        # HTTP status codes
│       ├── controllers/      # Xử lý request (auth, product, order, ...)
│       ├── errors/           # Lớp lỗi tùy chỉnh (AppError, ClientError, ServerError)
│       ├── middlewares/      # Auth, upload, async handler, RBAC
│       ├── models/           # Mongoose schemas (User, Product, Order, Coupon, Review)
│       ├── repositories/     # Tầng truy cập dữ liệu
│       ├── routes/           # Định tuyến API
│       ├── services/         # Logic nghiệp vụ
│       ├── validators/       # Xác thực đầu vào
│       ├── utils/            # Hàm tiện ích
│       ├── seed.js           # Script tạo dữ liệu mẫu
│       └── index.js          # Entry point
│
├── frontend/                 # Ứng dụng Next.js 16 (App Router)
│   └── src/
│       ├── app/              # Các trang (17 routes)
│       │   ├── admin/        # Trang quản trị (products, categories, orders, coupons)
│       │   ├── products/     # Danh sách & chi tiết sản phẩm
│       │   ├── cart/         # Giỏ hàng
│       │   ├── wishlist/     # Danh sách yêu thích
│       │   ├── checkout/     # Thanh toán & xác nhận đơn hàng
│       │   ├── profile/      # Hồ sơ cá nhân
│       │   ├── login/        # Đăng nhập
│       │   ├── register/     # Đăng ký
│       │   └── about/        # Giới thiệu
│       ├── components/       # React components (Header, ProductCard, Admin panels, ...)
│       ├── contexts/         # State management (Auth, Cart, Wishlist)
│       └── lib/              # API client & utilities
│
└── playwright/               # Bộ kiểm thử E2E
    ├── tests/                # Test cases (demo-user-01 → 12, RBAC)
    ├── pages/                # Page Object Model
    ├── fixtures/             # Test fixtures
    └── data/                 # Dữ liệu test
```

## Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| Node.js | 20 | Runtime |
| Express | 4.18 | Web framework |
| MongoDB + Mongoose | 8.x | Cơ sở dữ liệu |
| JWT + bcrypt | 9.x / 6.x | Xác thực & mã hóa |
| Cloudinary | 2.9 | Lưu trữ ảnh |
| Multer | 2.0 | Upload file |
| express-validator | 7.3 | Validate request |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| Next.js | 16.1 | React framework (App Router) |
| React | 19.2 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Sonner | 2.x | Toast notifications |

### Kiểm Thử & CI/CD
| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| Playwright | 1.49+ | E2E testing |
| ESLint | 9.x | Linting |
| Prettier | 3.4 | Formatting |
| GitHub Actions | - | CI/CD pipeline |

## Bắt Đầu Nhanh

### Yêu Cầu
- Node.js 20+ (xem `.nvmrc`)
- npm
- MongoDB (Atlas hoặc local)
- Tài khoản Cloudinary (để upload ảnh)

### 1. Backend

```bash
cd backend
cp .env.example .env    # Cấu hình biến môi trường
npm install
npm run seed            # (Tùy chọn) Tạo dữ liệu mẫu
npm run dev
```

Server chạy tại: http://localhost:3001

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Ứng dụng chạy tại: http://localhost:3000

### 3. Playwright (Kiểm thử)

```bash
cd playwright
npm install
npx playwright install
```

## Biến Môi Trường

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

### Xác thực (`/api/auth`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| POST | `/api/auth/register` | - | Đăng ký tài khoản |
| POST | `/api/auth/login` | - | Đăng nhập |
| GET | `/api/auth/me` | Required | Lấy thông tin user hiện tại |
| POST | `/api/auth/logout` | - | Đăng xuất |

### Sản phẩm (`/api/products`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/products` | - | Danh sách sản phẩm (phân trang) |
| GET | `/api/products/active` | - | Sản phẩm đang bán |
| GET | `/api/products/search` | - | Tìm kiếm sản phẩm |
| GET | `/api/products/category/:categoryId` | - | Lọc theo danh mục |
| GET | `/api/products/slug/:slug` | - | Lấy theo slug |
| GET | `/api/products/:id` | - | Chi tiết sản phẩm |
| POST | `/api/products` | Admin | Tạo sản phẩm |
| PUT | `/api/products/:id` | Admin | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Admin | Xóa sản phẩm |
| POST | `/api/products/:id/images` | Admin | Upload ảnh sản phẩm |

### Đánh giá (`/api/reviews`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/products/:id/reviews` | Optional | Danh sách đánh giá |
| POST | `/api/products/:id/reviews` | Required | Tạo đánh giá (1-5 sao, tối đa 3 ảnh) |
| DELETE | `/api/reviews/:id` | Required | Xóa đánh giá |
| POST | `/api/reviews/:id/helpful` | Required | Đánh dấu "Hữu ích" |

### Danh mục (`/api/categories`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/categories` | - | Tất cả danh mục |
| GET | `/api/categories/active` | - | Danh mục đang hoạt động |
| POST | `/api/categories` | Admin | Tạo danh mục |
| PUT | `/api/categories/:id` | Admin | Cập nhật danh mục |
| DELETE | `/api/categories/:id` | Admin | Xóa danh mục |

### Đơn hàng (`/api/orders`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| POST | `/api/orders` | - | Tạo đơn hàng (khách/thành viên, hỗ trợ mã giảm giá) |
| GET | `/api/orders` | Admin | Danh sách đơn hàng |
| GET | `/api/orders/:id` | - | Chi tiết đơn hàng (cần token) |
| PATCH | `/api/orders/:id/status` | Admin | Cập nhật trạng thái |
| DELETE | `/api/orders/:id` | Admin | Xóa mềm (cần lý do) |

### Mã giảm giá (`/api/coupons`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/coupons/available` | Required | Mã khả dụng cho user |
| POST | `/api/coupons/validate` | Required | Kiểm tra mã giảm giá |
| GET | `/api/coupons` | Admin | Tất cả mã giảm giá |
| POST | `/api/coupons` | Admin | Tạo mã giảm giá |
| PUT | `/api/coupons/:id` | Admin | Cập nhật |
| DELETE | `/api/coupons/:id` | Admin | Xóa |

### Người dùng (`/api/users`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| GET | `/api/users/me` | Required | Lấy hồ sơ |
| PATCH | `/api/users/me` | Required | Cập nhật hồ sơ |
| POST | `/api/users/me/avatar` | Required | Upload ảnh đại diện |

## Luồng Trạng Thái Đơn Hàng

```
pending (Chờ xử lý)
  ├── → paid (Đã thanh toán)
  ├── → processing (Đang xử lý)
  └── → cancelled (Đã hủy)

paid (Đã thanh toán)
  ├── → processing (Đang xử lý)
  └── → cancelled (Đã hủy)

processing (Đang xử lý)
  ├── → shipped (Đang giao)
  └── → cancelled (Đã hủy)

shipped (Đang giao)
  └── → delivered (Đã giao) ✓

delivered / cancelled → Không thể thay đổi
```

## Kiến Trúc

### Backend (Layered Architecture)
```
Routes → Controllers → Services → Repositories → Models
```
- **Models**: Mongoose schemas với validation
- **Repositories**: Tầng truy cập dữ liệu (CRUD)
- **Services**: Logic nghiệp vụ (xử lý coupon, chuyển trạng thái đơn hàng, ...)
- **Controllers**: Xử lý HTTP request/response
- **Middlewares**: Auth (JWT), RBAC, upload (Multer + Cloudinary), error handler

### Frontend (React Context + App Router)
- **AuthContext**: Quản lý đăng nhập/đăng xuất, kiểm tra quyền admin
- **CartContext**: Giỏ hàng per-user (localStorage), hỗ trợ "Mua ngay"
- **WishlistContext**: Danh sách yêu thích per-user (localStorage)

## Trang Quản Trị

Truy cập tại `/admin` (yêu cầu tài khoản có quyền admin):

| Mục | Đường dẫn | Chức năng |
|-----|-----------|-----------|
| Sản phẩm | `/admin/products` | CRUD sản phẩm, upload ảnh |
| Tồn kho | `/admin/inventory` | Xem và quản lý số lượng tồn kho |
| Danh mục | `/admin/categories` | CRUD danh mục sản phẩm |
| Đơn hàng | `/admin/orders` | Quản lý trạng thái, xóa mềm |
| Khuyến mãi | `/admin/coupons` | CRUD mã giảm giá |

## Chạy Kiểm Thử

```bash
cd playwright

# Chạy tất cả test
npx playwright test

# Chạy test cụ thể
npx playwright test tests/demo-user-01
npx playwright test tests/rbac

# Chạy với giao diện
npx playwright test --ui

# Xem báo cáo
npx playwright show-report
```

### Phân Công Test

| Thành viên | Nội dung kiểm thử | File |
|------------|-------------------|------|
| Demo User 01 | Điều hướng trang chủ | `tests/demo-user-01/` |
| Demo User 02 | Hiển thị danh sách | `tests/demo-user-02/` |
| Demo User 03 | Tương tác click | `tests/demo-user-03/` |
| Demo User 04 | Tương tác form | `tests/demo-user-04/` |
| Demo User 05 | Mock API response | `tests/demo-user-05/` |
| Demo User 06 | Điều hướng & URL | `tests/demo-user-06/` |
| Demo User 07 | Responsive design | `tests/demo-user-07/` |
| Demo User 08 | Accessibility | `tests/demo-user-08/` |
| Demo User 09 | Screenshot testing | `tests/demo-user-09/` |
| Demo User 10 | Xử lý lỗi | `tests/demo-user-10/` |
| RBAC | Phân quyền admin | `tests/rbac/` |

## CI/CD

GitHub Actions tự động chạy khi push/PR vào `main`:

1. **Backend CI**: install → lint → format check → test
2. **Frontend CI**: install → lint → format check → typecheck → build
3. **CI Status**: Gate tổng hợp kết quả

## Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/ten-tinh-nang`)
3. Chạy lint và format trước khi commit:
   ```bash
   npm run lint
   npm run format
   ```
4. Commit changes (`git commit -m 'feat: mô tả tính năng'`)
5. Push và tạo Pull Request

---

Baby Bliss - Nền tảng mua sắm sản phẩm cho bé
