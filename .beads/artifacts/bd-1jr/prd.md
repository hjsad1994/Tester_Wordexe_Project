# PRD: Tach biet navigation admin San pham va Ton kho

**Bead:** bd-1jr  
**Created:** 2026-02-16  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: true
conflicts_with: []
blocks: []
estimated_hours: 6
```

---

## Problem Statement

### What problem are we solving?

Trang admin hien dang gop thao tac quan ly san pham va ton kho trong cung mot diem dieu huong (`/admin/products`), khien luong cong viec theo vai tro (quan ly danh muc san pham vs. dieu chinh ton kho) khong tach bach. Quan tri vien can mot muc dieu huong rieng cho ton kho va mot trang ton kho tap trung de thao tac nhanh, trong khi van tan dung logic quantity da co.

### Why now?

Yeu cau nguoi dung da xac dinh ro can tach navigation va bo sung trang ton kho rieng. Neu khong lam ngay, admin tiep tuc thao tac trong giao dien tron lan, kho mo rong quy trinh ton kho va kho them test/phan quyen theo route ton kho rieng.

### Who is affected?

- **Primary users:** Admin van hanh danh muc san pham va ton kho trong backoffice.
- **Secondary users:** QA/E2E test owners va team bao tri giao dien admin.

---

## Scope

### In-Scope

- Tach `AdminSidebar` thanh hai muc rieng: `San pham` (`/admin/products`) va `Ton kho` (`/admin/inventory`).
- Tao trang admin ton kho rieng tai route `/admin/inventory` trong layout admin hien co.
- Uu tien tai su dung logic quantity hien tai (fetch, validate, update) thay vi tao logic trung lap.
- Cap nhat dieu huong/redirect admin de tuong thich voi route moi.
- Cap nhat test lien quan dieu huong admin.

### Out-of-Scope

- Thay doi schema backend, endpoint moi cho inventory, hoac bo sung reservation/warehouse-level inventory.
- Thiet ke lai toan bo giao dien admin ngoai pham vi menu + trang ton kho.
- Them co che audit log dieu chinh ton kho chi tiet (actor/reason/history) o phien ban nay.

---

## Proposed Solution

### Overview

Bo sung route `/admin/inventory` va giao dien ton kho tap trung, dong thoi tach menu admin thanh hai diem vao doc lap cho San pham va Ton kho. Trang ton kho se dung chung model du lieu product (bao gom `quantity`) va duong update san pham hien co, dam bao quy tac validate quantity nhat quan frontend/backend.

### User Flow (if user-facing)

1. Admin dang nhap vao khu vuc `/admin/*` va thay menu `San pham`, `Ton kho`, `Danh muc`.
2. Admin chon `Ton kho` de vao `/admin/inventory`, xem danh sach san pham kem thong tin so luong ton.
3. Admin chinh sua so luong ton theo luong update co san; he thong validate quantity la so nguyen khong am truoc khi luu.

---

## Requirements

### Functional Requirements

#### Distinct admin navigation entries

Admin sidebar phai hien thi hai muc doc lap cho San pham va Ton kho.

**Scenarios:**

- **WHEN** admin vao layout admin **THEN** menu hien thi item `San pham` tro den `/admin/products` va item `Ton kho` tro den `/admin/inventory`.
- **WHEN** admin dang o `/admin/inventory` **THEN** item `Ton kho` duoc active dung theo pathname.

#### Dedicated inventory route and page

He thong phai co route `/admin/inventory` duoc bao ve boi admin layout/auth guard hien tai.

**Scenarios:**

- **WHEN** non-admin truy cap `/admin/inventory` **THEN** bi redirect nhu cac route admin khac.
- **WHEN** admin truy cap `/admin/inventory` **THEN** trang ton kho duoc render on dinh trong khung admin.

#### Reuse existing quantity logic

Trang ton kho phai dung lai logic quantity hien co de tranh duplicated business rules.

**Scenarios:**

- **WHEN** admin cap nhat quantity hop le **THEN** du lieu duoc gui qua API cap nhat san pham hien co va refresh danh sach.
- **WHEN** quantity khong hop le (am/khong phai so nguyen) **THEN** hien loi validate va khong submit.

#### Preserve products page capability

Trang san pham van giu duoc luong CRUD san pham hien tai sau khi tach navigation.

**Scenarios:**

- **WHEN** admin vao `/admin/products` **THEN** khong bi mat tinh nang quan ly san pham da co.
- **WHEN** tach route inventory **THEN** khong lam vo auth guard va dieu huong admin root.

### Non-Functional Requirements

- **Performance:** Trang ton kho moi khong them request thua ngoai luong fetch/cap nhat product hien co.
- **Security:** Tuan thu auth guard admin (`isAdmin`) va backend role gate hien hanh.
- **Accessibility:** Dieu huong sidebar va thao tac cap nhat ton kho su dung duoc bang ban phim/co nhan dien trang thai active.
- **Compatibility:** Tuong thich App Router hien tai va API `frontend/src/lib/api.ts`/`backend/src/routes/productRoutes.js`.

---

## Success Criteria

- [ ] Sidebar admin co 2 muc doc lap `San pham` va `Ton kho` voi route dung.
  - Verify: `cd frontend && npm run typecheck`
  - Verify: `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`
- [ ] Route `/admin/inventory` render duoc trong admin layout va obey auth guard.
  - Verify: `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`
- [ ] Cap nhat quantity tren trang ton kho tai su dung validate logic hien co, khong chap nhan quantity am/khong nguyen.
  - Verify: `cd frontend && npm run typecheck`
  - Verify: manual check tren `/admin/inventory` voi quantity `-1` va `1.5`
- [ ] Toan bo thay doi frontend dat chuan lint/typecheck truoc khi ship.
  - Verify: `cd frontend && npm run lint:fix`
  - Verify: `cd frontend && npm run typecheck`

---

## Technical Context

### Existing Patterns

- App Router admin pages: `frontend/src/app/admin/products/page.tsx` va `frontend/src/app/admin/categories/page.tsx` la thin wrapper panel component.
- Admin shell + auth guard: `frontend/src/app/admin/layout.tsx`.
- Admin nav tap trung: `frontend/src/components/admin/AdminSidebar.tsx`.
- Product + quantity CRUD da co: `frontend/src/components/admin/AdminProductsPanel.tsx` + `frontend/src/lib/api.ts`.
- Quantity validation backend: `backend/src/services/productService.js`.

### Key Files

- `frontend/src/components/admin/AdminProductsPanel.tsx` - Dang chua logic hien thi/chinh sua `quantity`.
- `frontend/src/components/admin/AdminSidebar.tsx` - Nguon dinh nghia menu admin.
- `frontend/src/app/admin/layout.tsx` - Auth gate va shell dung chung.
- `frontend/src/app/admin/page.tsx` - Redirect mac dinh trong admin.
- `playwright/tests/rbac/admin-route-flow.spec.ts` - Test luong route/nav admin.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/components/admin/AdminSidebar.tsx # Tach menu San pham/Ton kho
  - frontend/src/app/admin/inventory/page.tsx # Route moi cho ton kho
  - frontend/src/components/admin/AdminInventoryPanel.tsx # Panel ton kho tap trung (neu tach panel)
  - frontend/src/components/admin/AdminProductsPanel.tsx # Tach/dua logic dung chung neu can
  - frontend/src/app/admin/page.tsx # Dieu huong mac dinh admin sau khi them route moi
  - frontend/src/components/Header.tsx # Dieu huong entry admin (neu can canh chinh)
  - playwright/tests/rbac/admin-route-flow.spec.ts # Cap nhat assertion nav/route admin
  - playwright/tests/rbac/admin-inventory-flow.spec.ts # Test moi cho route ton kho (neu tao moi)
```

---

## Risks & Mitigations

| Risk                                                            | Likelihood | Impact | Mitigation                                                                            |
| --------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------- |
| Tach giao dien nhung copy/paste logic quantity gay lech hanh vi | Medium     | High   | Uu tien extract/reuse logic chung tu `AdminProductsPanel` thay vi nhan ban            |
| Doi nav lam fail test RBAC route flow hien tai                  | High       | Medium | Cap nhat test Playwright dong bo voi nav moi va verify lai theo file test cu          |
| Doi redirect admin root gay bat ngo luong truy cap              | Medium     | Medium | Chot ro default route (products hoac inventory) trong task routing va cover bang test |

---

## Open Questions

| Question                                                                                 | Owner             | Due Date               | Status |
| ---------------------------------------------------------------------------------------- | ----------------- | ---------------------- | ------ |
| Admin root (`/admin`) nen redirect mac dinh ve `/admin/products` hay `/admin/inventory`? | Product/Requester | Before `/start bd-1jr` | Open   |

---

## Tasks

### Split Admin Sidebar Navigation [frontend]

Admin sidebar renders separate and correctly active entries for `San pham` and `Ton kho` without regressing existing `Danh muc` navigation.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/components/admin/AdminSidebar.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`

### Create Inventory Admin Route [routing]

Route `/admin/inventory` exists under admin App Router and renders inside existing admin layout with current auth guard behavior.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/app/admin/inventory/page.tsx
  - frontend/src/app/admin/layout.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`

### Reuse Quantity Management Logic for Inventory Page [frontend]

Inventory page reuses existing quantity fetch/validation/update behavior so stock edits follow the same business rules as product admin flows.

**Metadata:**

```yaml
depends_on: ["Create Inventory Admin Route"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminInventoryPanel.tsx
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/lib/api.ts
```

**Verification:**

- `cd frontend && npm run typecheck`
- manual check tren `/admin/inventory` voi quantity `-1`, `1.5`, `0`, `10`

### Align Admin Entry and Root Redirect Behavior [routing]

Admin entry points (header link and `/admin` redirect) consistently lead to the agreed default page after Products/Inventory separation.

**Metadata:**

```yaml
depends_on: ["Split Admin Sidebar Navigation", "Create Inventory Admin Route"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/Header.tsx
  - frontend/src/app/admin/page.tsx
```

**Verification:**

- `cd frontend && npm run typecheck`
- `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`

### Update Admin Navigation and Inventory Route Tests [testing]

Automated RBAC and route tests cover separate Products/Inventory navigation and `/admin/inventory` accessibility behavior.

**Metadata:**

```yaml
depends_on:
  - "Split Admin Sidebar Navigation"
  - "Create Inventory Admin Route"
  - "Reuse Quantity Management Logic for Inventory Page"
  - "Align Admin Entry and Root Redirect Behavior"
parallel: false
conflicts_with: []
files:
  - playwright/tests/rbac/admin-route-flow.spec.ts
  - playwright/tests/rbac/admin-inventory-flow.spec.ts
```

**Verification:**

- `cd playwright && npm run test -- tests/rbac/admin-route-flow.spec.ts`
- `cd playwright && npm run test -- tests/rbac/admin-inventory-flow.spec.ts`

---

## Notes

- PRD nay chi dinh huong specification, khong bao gom implementation code.
- Inventory trong pham vi bead nay duoc dinh nghia theo `product.quantity` hien tai; cac mo hinh ton kho nang cao de lai bead khac.
