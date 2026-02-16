# Product detail inventory must load from DB

**Bead:** bd-4lz  
**Created:** 2026-02-16  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: false
conflicts_with: []
blocks: []
estimated_hours: 2
```

---

## Problem Statement

### What problem are we solving?

Trang chi tiet san pham dang hien thi ton kho bang gia tri mock/hardcoded ("Con 156 san pham") thay vi doc `quantity` thuc te tu DB qua API. Dieu nay gay sai lech thong tin ton kho, co the dan den over-selling hoac mat tin cay khi khach hang thay so luong khong dung.

### Why now?

San pham da co truong `quantity` trong DB va API contract frontend da co field nay, nhung luong map + UI detail chua su dung. Can dong bo ngay de tranh tiep tuc hien thi du lieu sai tren trang ban hang.

### Who is affected?

- **Primary users:** Khach hang xem trang chi tiet san pham truoc khi mua.
- **Secondary users:** Team van hanh/kho va team kinh doanh can thong tin ton kho chinh xac.

---

## Scope

### In-Scope

- Cap nhat product detail page de hien thi ton kho tu du lieu API/DB (`quantity`) thay vi text hardcoded.
- Cap nhat mapper/type frontend de khong loai bo truong `quantity` khi map tu API sang model UI detail.
- Xu ly state hien thi ton kho theo cac trang thai co y nghia (con hang, het hang, khong co du lieu).
- Bo sung/duy tri test bao ve hanh vi ton kho tren product detail.

### Out-of-Scope

- Thay doi logic cap nhat ton kho trong backend (create/update inventory).
- Trien khai dat cho/giu hang theo ton kho (checkout reservation).
- Refactor tong the trang detail ngoai cac phan lien quan den inventory sourcing.

---

## Proposed Solution

### Overview

Tai su dung luong du lieu san co: backend tra ve `quantity` trong API product, frontend giu lai field nay trong type/mapping va product detail render thong tin ton kho dua tren gia tri thuc. Cac chuoi hardcoded se duoc thay bang render dong theo `quantity`, dam bao man hinh detail phan anh dung du lieu tu DB.

### User Flow (if user-facing)

1. User vao trang `/products/[id or slug]`.
2. Frontend lay product tu API (`fetchProductById`/`fetchProductBySlug`) va map day du `quantity`.
3. UI hien thi trang thai ton kho theo du lieu DB (con hang/het hang) thay vi gia tri mock.

---

## Requirements

### Functional Requirements

#### Product detail inventory is DB-backed

Thong tin ton kho tren trang detail phai dua tren `quantity` tu API thay vi hardcoded text.

**Scenarios:**

- **WHEN** API tra ve `quantity > 0` **THEN** UI hien thi trang thai con hang va so luong ton kho theo gia tri thuc.
- **WHEN** API tra ve `quantity = 0` **THEN** UI hien thi trang thai het hang va khong hien gia tri mock.
- **WHEN** API khong co `quantity` (du lieu bat thuong/fallback) **THEN** UI hien thi thong diep an toan (khong invent so luong).

#### Mapping and contract consistency

Luong map frontend cho product detail phai giu `quantity` tu API contract den UI layer.

**Scenarios:**

- **WHEN** frontend map `ApiProduct` sang model detail **THEN** field `quantity` khong bi loai bo.
- **WHEN** typecheck chay **THEN** type Product/detail model phan anh dung contract moi.

### Non-Functional Requirements

- **Performance:** Khong them request moi; tiep tuc dung request detail hien tai.
- **Security:** Khong thay doi auth hoac quyen truy cap API.
- **Accessibility:** Trang thai ton kho phai de doc bang text ro rang, khong chi phu thuoc mau sac.
- **Compatibility:** Tuong thich voi luong tai product theo `id` va theo `slug` hien co.

---

## Success Criteria

- [ ] Product detail khong con hien thi so ton kho hardcoded; so luong duoc render tu `quantity` cua API/DB.
  - Verify: `npm run typecheck`
  - Verify: `npm run lint:fix`
  - Verify: manual check `/products/<slug>` voi du lieu quantity khac nhau (0, >0) tren local app.
- [ ] Frontend mapping/type giu day du `quantity` tu API contract den UI detail.
  - Verify: `npm run typecheck`
  - Verify: `rg "quantity" frontend/src/app/products/\[id\]/page.tsx frontend/src/components/ProductCard.tsx frontend/src/lib/api.ts`
- [ ] Co regression coverage cho inventory display tren product detail.
  - Verify: `bunx playwright test playwright/tests/demo-user-12/test-cases.spec.ts --grep "stock|ton kho|quantity|product detail"`

---

## Technical Context

### Existing Patterns

- Detail data loading pattern: `frontend/src/app/products/[id]/page.tsx` su dung `fetchProductById`/`fetchProductBySlug` + mapper `mapApiProductToCard`.
- API contract pattern: `frontend/src/lib/api.ts` dinh nghia `Product` co san field `quantity`.
- Product schema/backend source of truth: `backend/src/models/Product.js` luu `quantity` voi default/min hop le.

### Key Files

- `frontend/src/app/products/[id]/page.tsx` - Noi map du lieu API va render inventory text tren detail page.
- `frontend/src/components/ProductCard.tsx` - UI Product type dang duoc tai su dung, hien chua co `quantity`.
- `frontend/src/lib/api.ts` - API Product contract da co `quantity`.
- `backend/src/models/Product.js` - Schema quantity la source of truth tu DB.
- `backend/src/routes/productRoutes.js` - Endpoints detail theo id/slug duoc frontend su dung.
- `playwright/tests/demo-user-12/test-cases.spec.ts` - Pattern test PDP hien co; hien chua assert inventory.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/app/products/[id]/page.tsx # Replace hardcoded inventory display with DB-backed quantity
  - frontend/src/components/ProductCard.tsx # Keep quantity in UI type/model used by detail mapper
  - playwright/tests/demo-user-12/test-cases.spec.ts # Add/adjust PDP inventory regression checks
```

---

## Open Questions

| Question                                                                                                 | Owner            | Due Date   | Status |
| -------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | ------ |
| Can hien thi dinh dang inventory nao cho `quantity` lon (vi du 1000+) de nhat quan voi UX hien tai?      | Product/Frontend | 2026-02-17 | Open   |
| Khi API fallback khong co `quantity`, co nen an hoan toan khoi ton kho hay hien "Dang cap nhat ton kho"? | Product/Frontend | 2026-02-17 | Open   |

---

## Tasks

### Propagate quantity to product detail model [frontend]

Product detail data model and mapping retain `quantity` from API so the UI can consume DB-backed stock values.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
  - frontend/src/components/ProductCard.tsx
```

**Verification:**

- `npm run typecheck`
- `rg "mapApiProductToCard|quantity" frontend/src/app/products/\[id\]/page.tsx frontend/src/components/ProductCard.tsx`

### Render inventory state from DB quantity [frontend]

Product detail inventory section shows in-stock/out-of-stock state and quantity based on API `quantity` instead of hardcoded text.

**Metadata:**

```yaml
depends_on:
  - Propagate quantity to product detail model
parallel: false
conflicts_with: []
files:
  - frontend/src/app/products/[id]/page.tsx
```

**Verification:**

- `npm run typecheck`
- `npm run lint:fix`
- Manual: open `/products/<slug>` where quantity is 0 and >0; confirm UI text changes with real values.

### Add regression coverage for PDP inventory display [tests]

Automated tests validate that product detail inventory reflects API quantity values and no longer depends on mock stock text.

**Metadata:**

```yaml
depends_on:
  - Render inventory state from DB quantity
parallel: false
conflicts_with: []
files:
  - playwright/tests/demo-user-12/test-cases.spec.ts
```

**Verification:**

- `bunx playwright test playwright/tests/demo-user-12/test-cases.spec.ts --grep "stock|ton kho|quantity|product detail"`

---

## Notes

- Prior related fix `bd-2ey` da cap nhat luong image PDP tu API; bead nay tiep tuc cung luong data do cho inventory de loai bo hardcoded mock ton kho.
- Khong implement trong phase `/create`; tai lieu nay chi dinh nghia end-state cho `/start` + `/ship`.
