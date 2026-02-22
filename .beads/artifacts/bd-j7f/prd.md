# Beads PRD

**Bead:** bd-j7f  
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

Trong admin panel, các thao tác xoa du lieu can co lop bao ve UX de tranh xoa nham. Hien tai `AdminProductsPanel` va `AdminOrdersPanel` da dung modal xac nhan, nhung `AdminCategoriesPanel` xoa truc tiep khi bam nut `Xoa` ma khong co popup xac nhan.

### Why now?

Yeu cau tu nguoi dung la kiem tra toan bo giao dien FE admin co thao tac xoa va dam bao deu co modal popup xac nhan. Neu khong xu ly, nguoi quan tri co nguy co xoa nham danh muc va mat du lieu khong mong muon.

### Who is affected?

- **Primary users:** Admin van hanh danh muc, san pham, don hang.
- **Secondary users:** QA va support can hanh vi xoa nhat quan de kiem thu va huong dan van hanh.

---

## Scope

### In-Scope

- Ra soat cac man hinh admin co thao tac xoa/lưu tru du lieu.
- Bo sung modal popup xac nhan cho diem xoa con thieu (`AdminCategoriesPanel`).
- Canh chinh hanh vi keyboard/accessibility cho modal moi (dong bang Escape, co nut Huy/Xac nhan ro rang).
- Bo sung/dua vao test kiem tra luong xac nhan truoc khi goi API xoa.

### Out-of-Scope

- Thay doi API backend xoa san pham/danh muc/don hang.
- Thiet ke lai theme UI admin panel.
- Them co che undo sau khi xoa.

---

## Proposed Solution

### Overview

Chuan hoa hanh vi xoa tren admin panel theo cung mot nguyen tac: bam nut xoa chi mo modal xac nhan, API xoa chi duoc goi sau khi admin chon xac nhan. Tai diem xoa danh muc, ap dung pattern modal dang duoc dung o `AdminProductsPanel`/`AdminOrdersPanel` de giu nhat quan ve giao dien, trang thai loading va thong bao loi.

### User Flow

1. Admin bam `Xoa` tren danh sach du lieu.
2. He thong hien modal xac nhan voi noi dung doi tuong sap xoa.
3. Admin chon `Huy` de giu nguyen, hoac `Xac nhan xoa` de thuc hien API va cap nhat bang du lieu.

---

## Requirements

### Functional Requirements

#### Delete actions require explicit confirmation

Moi thao tac xoa trong admin panel phai qua modal xac nhan truoc khi gui request DELETE.

**Scenarios:**

- **WHEN** admin bam nut `Xoa` trong `AdminCategoriesPanel` **THEN** he thong hien modal xac nhan va chua goi `deleteCategory`.
- **WHEN** admin bam `Huy` hoac dong modal **THEN** modal dong va du lieu khong bi xoa.
- **WHEN** admin bam nut xac nhan trong modal **THEN** he thong goi API xoa, cap nhat UI va hien loi neu request that bai.

#### Existing delete modal behavior remains intact

Nhung luong da co modal xac nhan (san pham, luu tru don hang) phai giu hanh vi hien tai.

**Scenarios:**

- **WHEN** thao tac xoa san pham duoc su dung **THEN** modal hien thi nhu hien tai va van can xac nhan truoc khi xoa.
- **WHEN** thao tac luu tru don hang duoc su dung **THEN** modal va valid ly do van hoat dong dung.

### Non-Functional Requirements

- **Performance:** Khong tang them fetch khi mo modal; chi goi API sau khi xac nhan.
- **Security:** Khong thay doi auth/authorization; tiep tuc dung API co credentials hien co.
- **Accessibility:** Modal co `role="dialog"`, `aria-modal="true"`, nut focus duoc va dong bang keyboard.
- **Compatibility:** Tuong thich desktop/mobile trong shell admin hien tai.

---

## Success Criteria

- [ ] Tat ca diem xoa trong admin panel deu can xac nhan qua modal truoc khi request DELETE.
  - Verify: `npm run typecheck`
  - Verify: Kiem tra thu cong tren `/admin/categories`, `/admin/products`, `/admin/orders` de xac nhan nut xoa/luu tru mo modal truoc khi xoa.
- [ ] Luong xoa danh muc khong xoa du lieu khi bam `Huy` hoac dong modal.
  - Verify: Thu cong tren `/admin/categories` voi 1 danh muc mau (bam `Xoa` -> `Huy` -> du lieu con nguyen).
- [ ] Co test bao ve hanh vi xac nhan xoa o admin FE.
  - Verify: `bunx playwright test playwright/tests/rbac/admin-route-flow.spec.ts`
  - Verify: `bunx playwright test playwright/tests/rbac/admin-product-category.spec.ts`

---

## Technical Context

### Existing Patterns

- Pattern: `frontend/src/components/admin/AdminProductsPanel.tsx` - Da co modal xac nhan xoa san pham (`deletingProduct`, `confirmDeleteProduct`, `role="dialog"`).
- Pattern: `frontend/src/components/admin/AdminOrdersPanel.tsx` - Da co modal xac nhan luu tru don hang (`deleteModalOrder`, `confirmArchive`).
- Gap: `frontend/src/components/admin/AdminCategoriesPanel.tsx` - Ham `handleDeleteCategory` dang goi `deleteCategory` truc tiep tu nut `Xoa`.

### Key Files

- `frontend/src/components/admin/AdminCategoriesPanel.tsx` - Man hinh can bo sung modal xac nhan xoa.
- `frontend/src/components/admin/AdminProductsPanel.tsx` - Mau modal xac nhan va pattern trap focus.
- `frontend/src/components/admin/AdminOrdersPanel.tsx` - Mau modal xac nhan co state deleting.
- `frontend/src/lib/api.ts` - Ham `deleteCategory`, `deleteProduct`, `softDeleteOrder` duoc goi sau xac nhan.
- `playwright/tests/rbac/admin-route-flow.spec.ts` - Khuon test FE route/admin shell.
- `playwright/tests/rbac/admin-product-category.spec.ts` - Khuon test luong CRUD/DELETE API lien quan admin.

### Affected Files

```yaml
files:
  - frontend/src/components/admin/AdminCategoriesPanel.tsx # add confirmation modal flow for category delete
  - playwright/tests/rbac/admin-route-flow.spec.ts # extend FE assertions for admin delete confirmation UX
  - playwright/tests/rbac/admin-product-category.spec.ts # extend coverage for delete confirmation behavior
```

---

## Tasks

### Inventory admin delete entry points [analysis]

A verified inventory of all delete/archive actions in admin FE is documented and mapped to whether confirmation modal already exists.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/components/admin/AdminOrdersPanel.tsx
  - frontend/src/components/admin/AdminCategoriesPanel.tsx
```

**Verification:**

- Confirm only category delete lacks a modal in current state.
- Confirm product delete and order archive already require modal confirmation.

### Add confirmation modal for category delete [frontend]

Category deletion requires an explicit modal confirmation and only calls `deleteCategory` after the admin confirms.

**Metadata:**

```yaml
depends_on: ["Inventory admin delete entry points"]
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminCategoriesPanel.tsx
```

**Verification:**

- `npm run typecheck`
- Manual check on `/admin/categories`: click `Xoa` opens modal; click `Huy` keeps item; click confirm removes item.

### Add regression coverage for confirmation behavior [test]

Automated checks assert that admin delete/archive flows require explicit user confirmation before destructive requests.

**Metadata:**

```yaml
depends_on: ["Add confirmation modal for category delete"]
parallel: false
conflicts_with: []
files:
  - playwright/tests/rbac/admin-route-flow.spec.ts
  - playwright/tests/rbac/admin-product-category.spec.ts
```

**Verification:**

- `bunx playwright test playwright/tests/rbac/admin-route-flow.spec.ts`
- `bunx playwright test playwright/tests/rbac/admin-product-category.spec.ts`

---

## Notes

- Loai bead duoc auto-classify la `task` vi pham vi tactical, gioi han trong FE admin panel.
- PRD nay chi dac ta; implementation se thuc hien o buoc `/ship bd-j7f` sau khi `/start bd-j7f`.
