# Beads PRD: Tích hợp mô tả sản phẩm từ API, hiển thị trong admin list

**Bead:** bd-19l
**Created:** 2026-02-21
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 3
```

---

## Problem Statement

### What problem are we solving?

Trang chi tiết sản phẩm (`products/[id]/page.tsx`) và `ProductDetailModal.tsx` đang sử dụng **mock data cứng** cho phần mô tả sản phẩm thay vì lấy từ API (`product.description`). Trong khi backend (Mongoose schema) và frontend types đã có sẵn field `description`, dữ liệu thực từ API không được hiển thị cho người dùng.

Ngoài ra, trang admin list sản phẩm không hiển thị mô tả ngắn gọn, khiến admin khó quản lý nội dung mô tả sản phẩm.

**User impact:**

- Khách hàng nhìn thấy mô tả sai/cũ (mock data) thay vì mô tả thực của sản phẩm
- Admin không biết sản phẩm nào đã có mô tả, sản phẩm nào chưa
- Mô tả sản phẩm được nhập qua form admin nhưng không hiển thị ra cho khách hàng

### Why now?

Dữ liệu mô tả đang bị lãng phí - admin nhập mô tả nhưng khách hàng không thấy được. Mock data tạo trải nghiệm sai lệch.

### Who is affected?

- **Primary users:** Khách hàng xem chi tiết sản phẩm
- **Secondary users:** Admin quản lý sản phẩm

---

## Scope

### In-Scope

- Thay thế mock description trên trang product detail (`products/[id]/page.tsx`) bằng dữ liệu từ API
- Thay thế mock description trong `ProductDetailModal.tsx` bằng dữ liệu từ API
- Hiển thị cột mô tả ngắn gọn (truncated) trong bảng sản phẩm ở admin panel
- Đảm bảo form create/edit sản phẩm gửi description đúng qua API
- Cập nhật seed data để tất cả sản phẩm đều có mô tả

### Out-of-Scope

- Rich text editor cho mô tả (hiện tại dùng plain textarea, giữ nguyên)
- Thêm field `longDescription`, `features`, `specifications` vào database (chỉ sử dụng field `description` hiện có)
- Thay đổi schema MongoDB (field `description` đã tồn tại)
- Review/rating system (mock ratings sẽ giữ nguyên)
- SEO meta description

---

## Proposed Solution

### Overview

Sử dụng field `product.description` đã có sẵn từ API response để hiển thị mô tả sản phẩm trên trang chi tiết và modal, thay vì dùng mock data hardcoded. Thêm cột mô tả ngắn gọn vào bảng admin list. Đảm bảo seed data và form đều hoạt động đúng với description field.

### User Flow (Customer)

1. Khách hàng vào trang chi tiết sản phẩm
2. Phần "Mô tả sản phẩm" hiển thị nội dung từ `product.description` (API)
3. Nếu sản phẩm chưa có mô tả, hiển thị placeholder text: "Chưa có mô tả cho sản phẩm này"

### User Flow (Admin)

1. Admin vào trang quản lý sản phẩm
2. Bảng sản phẩm hiển thị cột "Mô tả" với text truncated (tối đa ~50 ký tự)
3. Admin tạo/sửa sản phẩm, nhập mô tả qua textarea
4. Mô tả được lưu và hiển thị ngay trên trang chi tiết

---

## Requirements

### Functional Requirements

#### FR-1: Product Detail Page hiển thị mô tả từ API

Trang chi tiết sản phẩm hiển thị `product.description` từ API response thay vì mock data.

**Scenarios:**

- **WHEN** sản phẩm có `description` từ API **THEN** hiển thị nội dung description trong phần mô tả
- **WHEN** sản phẩm không có `description` (undefined/empty) **THEN** hiển thị placeholder "Chưa có mô tả cho sản phẩm này"
- **WHEN** API fail và fallback sang static data **THEN** hiển thị placeholder thay vì mock description

#### FR-2: ProductDetailModal hiển thị mô tả từ API

Modal quick-view hiển thị `product.description` thay vì mock data.

**Scenarios:**

- **WHEN** modal mở với product có description **THEN** hiển thị description thực
- **WHEN** modal mở với product không có description **THEN** hiển thị placeholder

#### FR-3: Admin Product List hiển thị mô tả ngắn gọn

Bảng sản phẩm trong admin panel có cột mô tả.

**Scenarios:**

- **WHEN** sản phẩm có description **THEN** hiển thị text truncated (max 50 ký tự) với "..."
- **WHEN** sản phẩm không có description **THEN** hiển thị text màu xám "Chưa có mô tả"

#### FR-4: Form Create/Edit gửi description qua API

Form tạo/sửa sản phẩm gửi description field trong payload.

**Scenarios:**

- **WHEN** admin tạo sản phẩm mới với mô tả **THEN** description được gửi trong POST payload và lưu vào DB
- **WHEN** admin sửa sản phẩm, thay đổi mô tả **THEN** description mới được gửi trong PUT payload
- **WHEN** admin để trống mô tả **THEN** gửi description là undefined (không bắt buộc)

### Non-Functional Requirements

- **Performance:** Không thêm API call mới - sử dụng data đã có trong response
- **Compatibility:** Tương thích với cấu trúc Product type hiện tại (description đã optional)

---

## Success Criteria

- [ ] Product detail page hiển thị description từ API, không còn mock data
  - Verify: `grep -r "productDetails\[" frontend/src/app/products/\[id\]/page.tsx | wc -l` trả về 0
- [ ] ProductDetailModal hiển thị description từ API, không còn mock data
  - Verify: `grep -r "productDetails\[" frontend/src/components/ProductDetailModal.tsx | wc -l` trả về 0
- [ ] Admin product list có cột mô tả ngắn gọn
  - Verify: `grep -i "description\|mô tả" frontend/src/components/admin/AdminProductsPanel.tsx | grep -i "truncat\|slice\|substring\|50"` trả về match
- [ ] Form create sản phẩm gửi description trong payload
  - Verify: `grep "description" frontend/src/components/admin/AdminProductsPanel.tsx | grep -i "payload\|productForm"` trả về match
- [ ] Seed data có description cho tất cả sản phẩm
  - Verify: `grep "description:" backend/src/seed.js | wc -l` >= 16 (tất cả 16 sản phẩm)
- [ ] TypeScript compiles without errors
  - Verify: `cd frontend && npx tsc --noEmit`
- [ ] ESLint passes
  - Verify: `cd frontend && npx eslint src/app/products/\[id\]/page.tsx src/components/ProductDetailModal.tsx src/components/admin/AdminProductsPanel.tsx`

---

## Technical Context

### Existing Patterns

- Backend: `backend/src/models/Product.js:29-33` - `description` field đã tồn tại (String, optional, max 2000 chars)
- Frontend type: `frontend/src/lib/api.ts:52` - `description?: string` đã có trong `Product` interface
- Frontend payload: `frontend/src/lib/api.ts:77` - `description?: string` đã có trong `ProductPayload`
- Admin form: `frontend/src/components/admin/AdminProductsPanel.tsx:780-794` - textarea cho description đã tồn tại
- Search: `backend/src/repositories/productRepository.js:86` - description đã được sử dụng trong search

### Key Files

- `frontend/src/app/products/[id]/page.tsx` - Trang chi tiết sản phẩm (mock data tại lines 191-288)
- `frontend/src/components/ProductDetailModal.tsx` - Modal quick-view (mock data tại lines 29-60)
- `frontend/src/components/admin/AdminProductsPanel.tsx` - Admin CRUD panel
- `frontend/src/lib/api.ts` - API client và types
- `backend/src/seed.js` - Seed data

### Affected Files

Files this bead will modify:

```yaml
files:
  - frontend/src/app/products/[id]/page.tsx # Xóa mock productDetails, dùng API description
  - frontend/src/components/ProductDetailModal.tsx # Xóa mock productDetails, dùng API description
  - frontend/src/components/admin/AdminProductsPanel.tsx # Thêm cột description vào table
  - backend/src/seed.js # Thêm description cho tất cả sản phẩm trong seed data
```

---

## Risks & Mitigations

| Risk                                                              | Likelihood | Impact | Mitigation                                                                              |
| ----------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------- |
| Sản phẩm hiện có trong DB không có description                    | High       | Medium | Hiển thị placeholder "Chưa có mô tả" khi description trống                              |
| Mock data còn sử dụng ở nơi khác (features, specs, colors, sizes) | Medium     | Low    | Out of scope - chỉ xóa phần description, giữ nguyên mock data khác nếu cần              |
| Xóa mock data gây lỗi ở các phần khác của detail page             | Medium     | Medium | Kiểm tra kỹ dependency trước khi xóa, chỉ xóa reference đến description/longDescription |

---

## Open Questions

| Question                                                          | Owner     | Due Date     | Status                                           |
| ----------------------------------------------------------------- | --------- | ------------ | ------------------------------------------------ |
| Có cần giữ lại mock features/specs/colors/sizes trên detail page? | Developer | Before start | Open - default: giữ nguyên, chỉ thay description |

---

## Tasks

### Cập nhật seed data thêm mô tả cho tất cả sản phẩm [backend]

Tất cả 16 sản phẩm trong seed data đều có field `description` với nội dung mô tả phù hợp bằng tiếng Việt.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - backend/src/seed.js
```

**Verification:**

- `grep "description:" backend/src/seed.js | wc -l` trả về >= 16
- `cd backend && node -e "require('./src/seed.js')"` chạy không lỗi (dry check syntax)

### Thay mock description trên product detail page bằng API data [frontend]

Trang `products/[id]/page.tsx` hiển thị `product.description` từ API thay vì `productDetails[id].description`. Khi không có description, hiển thị placeholder. Xóa hoặc giảm bớt mock `productDetails` object liên quan đến description/longDescription.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Thay mock description trong ProductDetailModal bằng API data"]
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `grep -c "productDetails\[" frontend/src/app/products/\[id\]/page.tsx` giảm đáng kể hoặc về 0 cho phần description
- `grep "product\.description\|product?.description\|Chưa có mô tả" frontend/src/app/products/\[id\]/page.tsx` trả về match
- `cd frontend && npx tsc --noEmit` passes

### Thay mock description trong ProductDetailModal bằng API data [frontend]

`ProductDetailModal.tsx` hiển thị `product.description` từ props thay vì mock `productDetails` object. Khi không có description, hiển thị placeholder.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: ["Thay mock description trên product detail page bằng API data"]
files:
  - frontend/src/components/ProductDetailModal.tsx
```

**Verification:**

- `grep -c "productDetails\[" frontend/src/components/ProductDetailModal.tsx` về 0 hoặc giảm
- `grep "description\|Chưa có mô tả" frontend/src/components/ProductDetailModal.tsx` trả về match
- `cd frontend && npx tsc --noEmit` passes

### Thêm cột mô tả ngắn gọn vào admin product list [frontend]

Bảng sản phẩm trong `AdminProductsPanel.tsx` có thêm cột "Mô tả" hiển thị text truncated (max 50 ký tự). Sản phẩm chưa có mô tả hiển thị text placeholder màu xám.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
```

**Verification:**

- `grep -i "mô tả\|description" frontend/src/components/admin/AdminProductsPanel.tsx | grep -i "th>\|td>\|column\|header\|truncat\|slice\|substring"` trả về match
- `cd frontend && npx tsc --noEmit` passes

### Xác minh end-to-end flow hoạt động [verification]

Toàn bộ flow từ admin create/edit product → API save description → product detail page hiển thị description hoạt động chính xác. TypeScript và ESLint pass.

**Metadata:**

```yaml
depends_on:
  - "Cập nhật seed data thêm mô tả cho tất cả sản phẩm"
  - "Thay mock description trên product detail page bằng API data"
  - "Thay mock description trong ProductDetailModal bằng API data"
  - "Thêm cột mô tả ngắn gọn vào admin product list"
parallel: false
conflicts_with: []
files: []
```

**Verification:**

- `cd frontend && npx tsc --noEmit` passes
- `cd frontend && npx eslint src/app/products/\[id\]/page.tsx src/components/ProductDetailModal.tsx src/components/admin/AdminProductsPanel.tsx` passes
- Không còn mock description data trong product detail page và modal

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

- Backend model **đã có** field `description` - KHÔNG cần thay đổi schema
- Frontend types **đã có** `description` - KHÔNG cần thay đổi interface
- Admin form **đã có** textarea cho description - chỉ cần verify nó gửi data đúng
- Phần mock data cho `features`, `specifications`, `colors`, `sizes` trên detail page là OUT OF SCOPE - giữ nguyên nếu không gây conflict
