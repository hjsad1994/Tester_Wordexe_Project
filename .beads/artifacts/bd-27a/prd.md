# User Profile Page

**Bead:** bd-27a  
**Created:** 2026-02-12  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 8
```

---

## Problem Statement

### What problem are we solving?

Khi người dùng click vào icon avatar (UserIcon) trên Header, hiện tại **không có hành động nào xảy ra** — button không có `onClick` handler và không navigate đến đâu cả. Website "Baby Bliss" thiếu trang hồ sơ cá nhân (profile page) để người dùng quản lý thông tin tài khoản, upload/chỉnh sửa ảnh đại diện, đổi mật khẩu, và xem lịch sử đơn hàng.

### Why now?

Trang profile là chức năng cơ bản của mọi e-commerce website. Không có profile page, người dùng không thể quản lý tài khoản, dẫn đến trải nghiệm kém. Feature này cũng cần thiết trước khi triển khai checkout flow và order tracking.

### Who is affected?

- **Primary users:** Khách hàng đã đăng ký tài khoản trên Baby Bliss
- **Secondary users:** Admin/nhân viên hỗ trợ khách hàng (cần biết thông tin profile user)

---

## Scope

### In-Scope

- Tạo trang profile page tại `/profile`
- Avatar upload với preview và crop/resize trước khi upload
- Chỉnh sửa thông tin cá nhân (tên, số điện thoại, địa chỉ, bio)
- Chức năng đổi mật khẩu
- Hiển thị lịch sử đơn hàng (mock data, UI only)
- Cập nhật Header: click icon user → navigate đến `/profile`
- Responsive design (mobile + desktop)
- Vietnamese UI text
- Tuân theo pink pastel theme hiện có

### Out-of-Scope

- Thiết lập auth provider thực (Supabase Auth, NextAuth) — sẽ làm sau
- Tích hợp Cloudinary cho avatar storage — sẽ implement riêng
- Chức năng đăng ký/đăng nhập (login/register pages)
- Quản lý địa chỉ giao hàng nhiều địa chỉ
- Hệ thống thông báo (notifications)
- Account settings (theme, language)
- Email verification flow
- API routes / backend integration cho profile

---

## Proposed Solution

### Overview

Tạo trang profile page với **client-side state management** (mock data) để thiết kế giao diện đầy đủ. Page chia thành các section: Avatar + Info, Edit Profile Form, Change Password, và Order History. Sử dụng `react-easy-crop` cho avatar crop. Tất cả data là mock/local state — dễ wire up với auth provider thật sau này thông qua một user context/hook.

### User Flow

1. User click vào icon avatar trên Header → navigate đến `/profile`
2. Trang profile hiển thị với avatar hiện tại, tên, email, và các tab/section
3. User click "Đổi ảnh đại diện" → mở file picker → chọn ảnh → modal crop xuất hiện
4. User crop ảnh → confirm → ảnh mới hiển thị (local state, chưa persist)
5. User chỉnh sửa thông tin cá nhân → nhấn "Lưu thay đổi" → toast success
6. User mở section "Đổi mật khẩu" → nhập mật khẩu cũ/mới → nhấn "Đổi mật khẩu"
7. User xem tab "Lịch sử đơn hàng" → thấy danh sách đơn hàng mock

---

## Requirements

### Functional Requirements

#### FR1: Avatar Upload & Crop

User có thể upload, crop, và preview ảnh đại diện mới.

**Scenarios:**

- **WHEN** user click nút "Đổi ảnh đại diện" **THEN** mở file picker chỉ chấp nhận image files (jpg, png, webp)
- **WHEN** user chọn ảnh **THEN** hiển thị modal crop với aspect ratio 1:1
- **WHEN** user confirm crop **THEN** ảnh mới hiển thị ngay trên profile (local state)
- **WHEN** user chọn file > 5MB **THEN** hiển thị lỗi "Ảnh không được vượt quá 5MB"
- **WHEN** user chọn file không phải image **THEN** file picker không cho phép chọn

#### FR2: Edit Profile Information

User có thể chỉnh sửa thông tin cá nhân.

**Scenarios:**

- **WHEN** page load **THEN** hiển thị thông tin hiện tại trong form (mock data)
- **WHEN** user sửa thông tin và nhấn "Lưu thay đổi" **THEN** hiển thị toast "Cập nhật thành công"
- **WHEN** user để trống trường bắt buộc (tên) **THEN** hiển thị validation error inline
- **WHEN** user nhập số điện thoại không hợp lệ **THEN** hiển thị validation error

#### FR3: Change Password

User có thể đổi mật khẩu tài khoản.

**Scenarios:**

- **WHEN** user nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới **THEN** kiểm tra mật khẩu mới khớp nhau
- **WHEN** mật khẩu mới và xác nhận không khớp **THEN** hiển thị lỗi "Mật khẩu xác nhận không khớp"
- **WHEN** mật khẩu mới < 8 ký tự **THEN** hiển thị lỗi "Mật khẩu phải có ít nhất 8 ký tự"
- **WHEN** đổi mật khẩu thành công **THEN** hiển thị toast success và clear form

#### FR4: Order History

User có thể xem lịch sử đơn hàng.

**Scenarios:**

- **WHEN** user mở tab/section lịch sử đơn hàng **THEN** hiển thị danh sách đơn hàng mock với status, date, total
- **WHEN** không có đơn hàng **THEN** hiển thị empty state "Bạn chưa có đơn hàng nào"
- **WHEN** user click vào đơn hàng **THEN** expand hiển thị chi tiết sản phẩm trong đơn

#### FR5: Header Navigation

Click icon avatar trên Header navigate đến trang profile.

**Scenarios:**

- **WHEN** user click avatar icon trên desktop header **THEN** navigate đến `/profile`
- **WHEN** user click "Tài khoản" trên mobile menu **THEN** navigate đến `/profile`

### Non-Functional Requirements

- **Performance:** Page load < 2s, avatar crop smooth trên mobile
- **Security:** Validate file type và size client-side trước khi crop
- **Accessibility:** Tất cả interactive elements có aria-label, form fields có label, keyboard navigation
- **Compatibility:** Responsive cho mobile (320px+), tablet, desktop
- **Design:** Tuân theo pink pastel theme (globals.css CSS variables), font Nunito/Quicksand

---

## Success Criteria

- [ ] Click icon avatar trên Header → navigate đến `/profile`
  - Verify: `npm run build` passes, manual check navigation
- [ ] Trang profile hiển thị avatar, tên, email, form chỉnh sửa
  - Verify: `npm run build && npm run lint`
- [ ] Avatar upload: chọn file → crop modal → preview ảnh mới
  - Verify: Manual test avatar crop flow
- [ ] Validation: file size > 5MB bị reject, form fields validate đúng
  - Verify: Manual test với file lớn
- [ ] Change password form validate: min 8 chars, confirm match
  - Verify: Manual test validation
- [ ] Order history hiển thị mock data với status badges
  - Verify: Visual inspection
- [ ] Responsive: layout đúng trên mobile/tablet/desktop
  - Verify: `npm run build` + resize browser
- [ ] Build & lint pass
  - Verify: `npm run lint && npm run format:check && npm run build`

---

## Technical Context

### Existing Patterns

- Page pattern: `frontend/src/app/about/page.tsx` — React component with Header/Footer, Tailwind utility classes, Vietnamese text
- Header component: `frontend/src/components/Header.tsx` — Client component with `'use client'`, imports icons from `./icons`
- CSS theming: `frontend/src/app/globals.css` — Pink pastel CSS variables, utility animation classes, glass/gradient utilities
- Icons: `frontend/src/components/icons/index.tsx` — Centralized icon exports (UserIcon, etc.)

### Key Files

- `frontend/src/components/Header.tsx` — Cần cập nhật avatar button onClick → Link to `/profile`
- `frontend/src/app/globals.css` — CSS variables và utility classes cho theming
- `frontend/src/components/icons/index.tsx` — Icon components có thể cần thêm icons mới (Camera, Lock, Package, Edit)
- `frontend/src/app/layout.tsx` — Root layout

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/profile/page.tsx # New profile page
  - frontend/src/components/Header.tsx # Add Link navigation to avatar
  - frontend/src/components/icons/index.tsx # Possibly add new icons
  - frontend/package.json # Add react-easy-crop dependency
```

---

## Risks & Mitigations

| Risk                                                | Likelihood | Impact | Mitigation                                                                               |
| --------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------- |
| `react-easy-crop` SSR issues (Next.js)              | Medium     | Medium | Use `'use client'` directive; dynamic import with `ssr: false` if needed                 |
| Avatar crop performance on mobile                   | Low        | Medium | Limit max image dimensions before crop; use canvas for resize                            |
| Mock data hard to replace with real auth later      | Medium     | High   | Abstract user data behind a `useUser()` hook; all components consume hook, not raw state |
| New dependency (`react-easy-crop`) adds bundle size | Low        | Low    | Tree-shakeable; only loaded on profile page                                              |

---

## Open Questions

| Question                                                  | Owner | Due Date | Status                                            |
| --------------------------------------------------------- | ----- | -------- | ------------------------------------------------- |
| Sẽ dùng auth provider nào cho login/register?             | User  | TBD      | Open — không ảnh hưởng đến UI/UX của profile page |
| Cloudinary config cho avatar storage sẽ setup khi nào?    | User  | TBD      | Open — profile page dùng local state trước        |
| Order history cần link đến trang chi tiết đơn hàng không? | User  | TBD      | Open — hiện tại chỉ expand inline                 |

---

## Tasks

### Header Avatar Navigation [frontend]

Avatar icon button trên Header (desktop + mobile) navigate đến `/profile` khi click.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Profile Page Layout"]
files:
  - frontend/src/components/Header.tsx
```

**Verification:**

- `npm run lint && npm run build` passes
- Click avatar icon → navigates to `/profile`

### Profile Page Layout [frontend]

Trang `/profile` có layout hoàn chỉnh với sidebar navigation (avatar + menu items) và main content area, responsive trên mobile/desktop, dùng mock user data.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Header Avatar Navigation"]
files:
  - frontend/src/app/profile/page.tsx
  - frontend/src/components/icons/index.tsx
```

**Verification:**

- `npm run lint && npm run build` passes
- Page renders tại `/profile` với avatar, user info, navigation tabs
- Responsive layout kiểm tra ở 320px, 768px, 1280px

### Avatar Upload & Crop [frontend]

User có thể upload ảnh, crop 1:1 ratio trong modal, preview ảnh mới — validate file type và size (max 5MB).

**Metadata:**

```yaml
depends_on: ["Profile Page Layout"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/profile/page.tsx
  - frontend/package.json
```

**Verification:**

- `npm run lint && npm run build` passes
- Upload image → crop modal appears → confirm → new avatar displays
- File > 5MB → error message shown
- Non-image file → rejected by file picker

### Edit Profile Form [frontend]

Form chỉnh sửa thông tin cá nhân (tên, email [readonly], SĐT, địa chỉ, bio) với inline validation và toast feedback.

**Metadata:**

```yaml
depends_on: ["Profile Page Layout"]
parallel: true
conflicts_with: ["Avatar Upload & Crop"]
files:
  - frontend/src/app/profile/page.tsx
```

**Verification:**

- `npm run lint && npm run build` passes
- Sửa thông tin → "Lưu thay đổi" → toast success
- Bỏ trống tên → validation error hiển thị inline

### Change Password Section [frontend]

Form đổi mật khẩu với validation (min 8 chars, confirm match) và feedback.

**Metadata:**

```yaml
depends_on: ["Profile Page Layout"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/profile/page.tsx
```

**Verification:**

- `npm run lint && npm run build` passes
- Mật khẩu < 8 chars → error message
- Confirm không khớp → error message
- Thành công → toast + clear form

### Order History Section [frontend]

Tab/section hiển thị danh sách đơn hàng mock với status badges, expandable chi tiết, và empty state.

**Metadata:**

```yaml
depends_on: ["Profile Page Layout"]
parallel: true
conflicts_with: []
files:
  - frontend/src/app/profile/page.tsx
```

**Verification:**

- `npm run lint && npm run build` passes
- Hiển thị danh sách mock orders với status (Đang xử lý, Đang giao, Hoàn thành)
- Click vào order → expand chi tiết sản phẩm
- Empty state hiển thị khi không có đơn hàng

---

## Dependency Legend

| Field            | Purpose                                           | Example                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------ |
| `depends_on`     | Must complete before this task starts             | `["Setup database", "Create schema"]`      |
| `parallel`       | Can run concurrently with other parallel tasks    | `true` / `false`                           |
| `conflicts_with` | Cannot run in parallel (same files)               | `["Update config"]`                        |
| `files`          | Files this task modifies (for conflict detection) | `["src/db/schema.ts", "src/db/client.ts"]` |

---

## Notes

- **All UI text in Vietnamese** — tuân theo convention hiện tại của website
- **No auth system yet** — tất cả user data dùng mock/local state. Abstract qua `useUser()` hook để dễ wire up auth provider sau
- **Cloudinary sẽ implement sau** — avatar chỉ lưu local state, không persist. Structure code để dễ thay thế bằng Cloudinary upload
- **react-easy-crop** là dependency mới cần add — cần hỏi user trước khi add vào package.json
- **Design system** — dùng CSS variables từ globals.css, class utilities (`.btn-primary`, `.glass`, `.card-product`), Tailwind v4
