# Beads PRD

**Bead:** bd-3og  
**Created:** 2026-02-15  
**Status:** Draft

## Bead Metadata

```yaml
depends_on: []
parallel: false
conflicts_with: []
blocks: []
estimated_hours: 8
```

---

## Problem Statement

### What problem are we solving?

Trang quan tri san pham hien dang su dung form inline va thao tac xoa truc tiep, chua co modal xac nhan xoa, va chua co upload anh trong luong them/sua. Trai nghiem nay khong dong nhat voi style hien co cua website, tang rui ro thao tac xoa nham, va lam quy trinh cap nhat hinh anh san pham mat nhieu buoc.

### Why now?

Nhu cau cap nhat UI/UX quan tri da duoc yeu cau ro rang de dong bo giao dien voi website va bo sung kha nang upload anh ngay trong modal them/sua. Neu khong xu ly som, admin tiep tuc phai thao tac thu cong nhieu buoc va co nguy co gay mat du lieu do xoa nham.

### Who is affected?

- **Primary users:** Quan tri vien/nhan vien van hanh danh muc san pham trong trang admin.
- **Secondary users:** Khach hang xem san pham (chat luong hinh anh va du lieu san pham cap nhat nhanh/chinh xac hon).

---

## Scope

### In-Scope

- Chuyen luong them/sua san pham tu form inline sang modal phu hop style hien co cua website.
- Them popup modal xac nhan khi xoa san pham, hien thi thong tin san pham sap bi xoa.
- Bo sung upload anh trong modal them/sua (chon file, preview, thay/bo anh truoc khi luu).
- Dam bao giao dien modal va cac nut thao tac tuong thich desktop/mobile, giu nguyen visual language (pink gradient, bo goc, focus ring, spacing).
- Cap nhat test/verification cho cac hanh vi chinh cua luong them/sua/xoa va upload anh.

### Out-of-Scope

- Thay doi kien truc backend upload (Cloudinary, multer) vuot qua nhu cau tich hop UI hien tai.
- Thiet ke lai toan bo trang admin hoac thay doi navigation cua khu vuc admin.
- Thay doi logic slug/public product routing ngoai pham vi can thiet cho luong admin.

---

## Proposed Solution

### Overview

Tai cau truc `AdminProductsPanel` de su dung modal cho them/sua san pham va modal xac nhan cho xoa san pham, giu nguyen pattern giao dien hien co cua website. Trong modal them/sua, bo sung upload anh voi preview va thao tac thay/bo anh; du lieu anh duoc dong bo voi payload product/API hien co de dam bao luong CRUD hoat dong thong suot.

### User Flow

1. Admin vao trang `/admin/products`, mo modal "Them san pham" hoac "Sua" tu bang danh sach.
2. Admin nhap thong tin, upload/chinh anh, xem preview, sau do luu thay doi.
3. Khi bam "Xoa", he thong mo modal xac nhan; chi xoa khi admin xac nhan hanh dong.

---

## Requirements

### Functional Requirements

#### Product Add/Edit Modal

Modal them/sua phai thay the form inline hien tai va ho tro day du truong thong tin san pham dang duoc su dung.

**Scenarios:**

- **WHEN** admin bam "Them san pham" **THEN** modal them moi mo ra voi trang thai mac dinh hop le.
- **WHEN** admin bam "Sua" tren mot dong san pham **THEN** modal mo ra voi du lieu da duoc prefill dung theo san pham da chon.

#### Delete Confirmation Modal

Xoa san pham phai co buoc xac nhan bang modal de giam rui ro thao tac khong the hoan tac.

**Scenarios:**

- **WHEN** admin bam "Xoa" **THEN** he thong hien modal xac nhan co ten san pham va canh bao hanh dong khong the hoan tac.
- **WHEN** admin chon "Huy" hoac nhan Escape **THEN** modal dong va khong co thao tac xoa nao duoc thuc thi.

#### Image Upload In Add/Edit Modal

Modal them/sua phai ho tro upload anh va cho phep preview/thay/bo anh truoc khi submit.

**Scenarios:**

- **WHEN** admin chon file anh hop le **THEN** he thong hien preview va gan anh vao du lieu san pham de submit.
- **WHEN** file khong hop le (dinh dang/kich thuoc) **THEN** he thong hien loi ro rang va khong submit file do.

#### Style Consistency With Website

Modal va cac control phai tuan theo visual pattern hien co cua website.

**Scenarios:**

- **WHEN** hien thi modal tren desktop/mobile **THEN** spacing, typography, button style, border radius, va focus ring phu hop pattern hien tai.
- **WHEN** nguoi dung dieu huong bang ban phim **THEN** focus trap va thu tu focus trong modal hoat dong dung.

### Non-Functional Requirements

- **Performance:** Mo/dong modal, prefill du lieu, va preview anh phan hoi trong khung UX thong thuong (<200ms cho thao tac UI cuc bo, khong tinh upload network).
- **Security:** Van ton trong phan quyen admin cho thao tac CRUD va upload; khong mo rong quyen truy cap moi.
- **Accessibility:** Dat muc WCAG 2.2 AA cho dialog semantics, keyboard navigation, focus visibility, va target size toi thieu.
- **Compatibility:** Hoat dong tren Next.js/React stack hien tai, tuong thich desktop va mobile viewport.

---

## Success Criteria

- [ ] Luong them/sua san pham duoc thuc hien qua modal, khong con phu thuoc form inline de thao tac CRUD chinh.
  - Verify: `npm --prefix frontend run typecheck`
- [ ] Xoa san pham luon hien modal xac nhan va chi thuc hien xoa sau khi xac nhan.
  - Verify: `npm --prefix playwright run test -- tests/rbac/admin-product-category.spec.ts`
- [ ] Modal them/sua ho tro upload anh voi preview va thong bao loi cho file khong hop le.
  - Verify: `npm --prefix frontend run lint:fix`
- [ ] Giao dien modal them/sua/xoa phu hop visual language hien co (pink gradient controls, rounded style, focus ring) tren desktop va mobile.
  - Verify: `npm --prefix playwright run test -- tests/rbac/admin-route-flow.spec.ts`
- [ ] Khong gay hoi quy cho luong API CRUD san pham va route admin.
  - Verify: `npm --prefix playwright run test`

---

## Technical Context

### Existing Patterns

- Pattern CRUD panel hien tai: `frontend/src/components/admin/AdminProductsPanel.tsx` - Dang quan ly add/edit/delete bang state local + API helper.
- Pattern visual admin: `frontend/src/components/admin/AdminCategoriesPanel.tsx` - Mau gradient, border, spacing, button style nhat quan voi khu vuc admin.
- Pattern modal custom: `frontend/src/components/ProductDetailModal.tsx` - Co backdrop, container va animation modal tu custom implementation.
- Pattern product API + slug helper: `frontend/src/lib/api.ts` - Chua ProductPayload, CRUD API, `toProductSlug` cho ten co dau.
- Pattern image mapping public product: `frontend/src/app/products/page.tsx` - Dang map `images?.[0]` thanh `imageUrl`.

### Key Files

- `frontend/src/components/admin/AdminProductsPanel.tsx` - Diem thay doi chinh cho modal them/sua/xoa va upload anh.
- `frontend/src/app/admin/products/page.tsx` - Entry page cua luong admin product.
- `frontend/src/lib/api.ts` - CRUD API va payload product (bao gom `images`).
- `backend/src/routes/productRoutes.js` - Endpoint CRUD va upload image theo role admin.
- `backend/src/middlewares/uploadMiddleware.js` - Rang buoc file upload (mime, max size).
- `playwright/tests/rbac/admin-product-category.spec.ts` - Nen tang test CRUD API va regression lien quan san pham.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx # Chuyen sang modal add/edit, bo sung delete confirm modal, upload image
  - frontend/src/app/admin/products/page.tsx # Dieu chinh rendering neu can trich xuat/compose modal components
  - frontend/src/lib/api.ts # Dong bo payload/typing cho upload image trong flow add-edit
  - backend/src/controllers/productController.js # Dieu chinh contract tra ve neu can cho upload-flow UI
  - backend/src/services/productService.js # Dam bao service support luong add image cho modal flow
  - playwright/tests/rbac/admin-product-category.spec.ts # Bo sung coverage cho hanh vi xoa co xac nhan/upload flow
  - playwright/tests/rbac/admin-route-flow.spec.ts # Kiem tra route admin khong hoi quy khi doi UI flow
```

---

## Risks & Mitigations

| Risk                                                                           | Likelihood | Impact | Mitigation                                                                                            |
| ------------------------------------------------------------------------------ | ---------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Modal state race condition (open/close + async save/delete) gay trang thai sai | Medium     | High   | Tach state modal ro rang theo action, khoa nut submit khi pending, chi dong modal sau khi API success |
| Upload preview gay memory leak neu khong revoke object URL                     | Medium     | Medium | Revoke object URL khi replace/remove/unmount; bo sung verification cho flow upload lap lai            |
| Lech style voi website hien co sau khi doi layout                              | Medium     | Medium | Reuse class/token pattern tu admin panels hien co; review desktop/mobile truoc khi ship               |
| Hoi quy luong CRUD do thay doi payload anh                                     | Low        | High   | Giu contract payload tuong thich, verify bang Playwright + typecheck                                  |

---

## Open Questions

| Question                                                                                       | Owner                 | Due Date   | Status |
| ---------------------------------------------------------------------------------------------- | --------------------- | ---------- | ------ |
| Upload anh trong modal se ho tro 1 anh dai dien hay nhieu anh ngay o phase nay?                | Product + Engineering | 2026-02-16 | Open   |
| Khi sua san pham, co can cho xoa tung anh da ton tai tren server ngay trong modal khong?       | Engineering           | 2026-02-16 | Open   |
| Can bo sung thong diep xac nhan xoa theo chuan nghiep vu nao (vi du hien SKU/ID ben canh ten)? | Product               | 2026-02-16 | Open   |

---

## Tasks

### Build product add/edit modal flow [ui]

Admin co the them hoac sua san pham trong modal co prefill dung du lieu, thay the luong form inline hien tai.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/app/admin/products/page.tsx
```

**Verification:**

- `npm --prefix frontend run typecheck`
- Manual: mo `/admin/products`, bam Them/Sua va xac nhan modal open/close + prefill dung du lieu

### Integrate image upload inside add/edit modal [upload]

Modal them/sua ho tro chon file anh hop le, preview, thay/bo anh, va dong bo du lieu anh vao payload submit.

**Metadata:**

```yaml
depends_on:
  - Build product add/edit modal flow
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
  - frontend/src/lib/api.ts
  - backend/src/controllers/productController.js
  - backend/src/services/productService.js
```

**Verification:**

- `npm --prefix frontend run lint:fix`
- `npm --prefix frontend run typecheck`
- Manual: upload file hop le/khong hop le va xac nhan preview + thong bao loi

### Add destructive delete confirmation modal [ui]

Hanh dong xoa san pham yeu cau modal xac nhan co thong tin san pham va chi xoa khi admin chap nhan.

**Metadata:**

```yaml
depends_on:
  - Build product add/edit modal flow
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
```

**Verification:**

- Manual: bam Xoa -> modal hien thong tin san pham -> Huy thi khong xoa, Xac nhan thi moi xoa
- `npm --prefix frontend run typecheck`

### Add regression coverage for admin product modal flows [test]

Bo test dam bao luong them/sua/xoa co modal va upload anh khong gay hoi quy route/phan quyen admin hien tai.

**Metadata:**

```yaml
depends_on:
  - Integrate image upload inside add/edit modal
  - Add destructive delete confirmation modal
parallel: false
conflicts_with: []
files:
  - playwright/tests/rbac/admin-product-category.spec.ts
  - playwright/tests/rbac/admin-route-flow.spec.ts
```

**Verification:**

- `npm --prefix playwright run test -- tests/rbac/admin-product-category.spec.ts`
- `npm --prefix playwright run test -- tests/rbac/admin-route-flow.spec.ts`

### Final cross-check for style consistency and responsive behavior [ux]

Giao dien modal them/sua/xoa dat chat luong nhat quan style website va su dung tot tren desktop/mobile truoc khi ship.

**Metadata:**

```yaml
depends_on:
  - Build product add/edit modal flow
  - Integrate image upload inside add/edit modal
  - Add destructive delete confirmation modal
parallel: false
conflicts_with: []
files:
  - frontend/src/components/admin/AdminProductsPanel.tsx
```

**Verification:**

- Manual: kiem tra viewport mobile + desktop, keyboard navigation, focus trap, button target size
- `npm --prefix frontend run build`

---

## Notes

- PRD nay chi dinh nghia yeu cau/scope; khong bao gom implementation code.
- Uu tien giu pattern visual va API contract hien co, tranh refactor ngoai pham vi bead.
