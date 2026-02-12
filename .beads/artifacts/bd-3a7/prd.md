# About Page - Trang Về chúng tôi

**Bead:** bd-3a7  
**Created:** 2026-02-12  
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

Website Baby Bliss hiện tại chưa có trang About (/about) mặc dù Header và Footer đã có link trỏ đến `/about`. Khi người dùng click vào "Về chúng tôi" sẽ gặp 404. Trang About là yếu tố quan trọng để xây dựng lòng tin với khách hàng trong thương mại điện tử, đặc biệt tại thị trường Việt Nam nơi người tiêu dùng đánh giá cao tính minh bạch và "bộ mặt" thương hiệu.

### Why now?

- Header nav đã link đến `/about` → 404 hiện tại
- Footer "Giới thiệu" → `/about` cũng 404
- Đây là trang thiết yếu cho bất kỳ website e-commerce nào
- Cần trước khi launch/public website

### Who is affected?

- **Primary users:** Khách hàng tiềm năng muốn tìm hiểu thương hiệu Baby Bliss trước khi mua hàng
- **Secondary users:** Đối tác, nhà cung cấp, nhà tuyển dụng tìm hiểu công ty

---

## Scope

### In-Scope

- Tạo trang About tại `frontend/src/app/about/page.tsx`
- Các section: Hero/Mission, Câu chuyện thương hiệu, Giá trị cốt lõi, Số liệu thống kê, Đội ngũ, Cam kết, CTA
- Responsive design (mobile-first)
- Tuân thủ Baby Bliss pink pastel OKLCH theme
- Vietnamese text (hardcoded, không i18n)
- SEO metadata (title, description, Open Graph)
- Pass CI/CD: `npm run lint`, `npm run format:check`, `npm run build`

### Out-of-Scope

- Backend API integration (dữ liệu hardcoded)
- Trang Tuyển dụng, Blog, Đối tác (các trang con khác)
- Dark mode
- Animation phức tạp với thư viện bên ngoài (sử dụng CSS animations có sẵn)
- Unit tests (project không có unit test framework cho frontend)
- Structured data JSON-LD (nice-to-have, defer)

---

## Proposed Solution

### Overview

Tạo một trang About page hoàn chỉnh tại `/about` theo Next.js App Router pattern. Trang gồm 7 section chính, sử dụng dữ liệu hardcoded, tái sử dụng Header/Footer components và tuân thủ design system pink pastel OKLCH. Trang sẽ là React Server Component (không cần `'use client'`) vì không có state/interactivity, giúp SEO tốt hơn.

### User Flow

1. Người dùng click "Về chúng tôi" từ Header hoặc Footer → Navigate đến `/about`
2. Trang hiển thị Hero section với mission statement
3. Scroll xuống xem câu chuyện, giá trị, số liệu, đội ngũ
4. CTA section cuối cùng dẫn người dùng đến trang sản phẩm

---

## Requirements

### Functional Requirements

#### About Hero Section

Hiển thị mission statement của Baby Bliss với visual hấp dẫn.

**Scenarios:**

- **WHEN** người dùng truy cập `/about` **THEN** thấy hero section với tiêu đề "Về chúng tôi" và tagline mission
- **WHEN** xem trên mobile **THEN** hero section responsive, text readable

#### Brand Story Section

Kể câu chuyện thương hiệu Baby Bliss.

**Scenarios:**

- **WHEN** scroll qua hero **THEN** thấy section "Câu chuyện của chúng tôi" với nội dung narrative
- **WHEN** xem trên desktop **THEN** layout dạng split (text + visual) 2 cột

#### Core Values Section

Hiển thị 4 giá trị cốt lõi với icon.

**Scenarios:**

- **WHEN** scroll đến values section **THEN** thấy grid 4 giá trị: Chất lượng, An toàn, Tận tâm, Sáng tạo
- **WHEN** hover vào card **THEN** card có hiệu ứng hover nhẹ nhàng

#### Stats Section

Hiển thị số liệu ấn tượng.

**Scenarios:**

- **WHEN** scroll đến stats **THEN** thấy 4 số liệu: năm kinh nghiệm, khách hàng, sản phẩm, đánh giá
- **WHEN** xem trên mobile **THEN** grid chuyển sang 2 cột

#### Team Section

Hiển thị đội ngũ sáng lập/quản lý.

**Scenarios:**

- **WHEN** scroll đến team section **THEN** thấy 3-4 thành viên với avatar, tên, chức vụ
- **WHEN** xem trên mobile **THEN** grid responsive (1 cột)

#### Commitments Section

Hiển thị cam kết của Baby Bliss.

**Scenarios:**

- **WHEN** scroll đến commitments **THEN** thấy 3-4 cam kết (đổi trả, chính hãng, bảo hành, giao hàng nhanh)

#### CTA Section

Kêu gọi hành động ở cuối trang.

**Scenarios:**

- **WHEN** scroll đến cuối **THEN** thấy CTA với nút "Mua sắm ngay" link đến `/products`
- **WHEN** click nút **THEN** navigate đến `/products`

### Non-Functional Requirements

- **Performance:** Trang phải là Server Component (không `'use client'` trừ khi cần thiết), fast LCP
- **Accessibility:** Heading hierarchy H1 → H2 → H3, semantic HTML (`<main>`, `<section>`), `aria-labelledby` cho các section
- **Compatibility:** Responsive: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- **SEO:** Next.js metadata export (title, description, openGraph)

---

## Success Criteria

- [ ] Truy cập `http://localhost:3000/about` hiển thị trang About đầy đủ, không 404
  - Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about` returns `200`
- [ ] Trang có đầy đủ 7 section: Hero, Story, Values, Stats, Team, Commitments, CTA
  - Verify: Visual inspection tại `http://localhost:3000/about`
- [ ] Design chuẩn Baby Bliss pink pastel theme (OKLCH CSS vars, Tailwind classes consistent)
  - Verify: Visual inspection - màu sắc, typography, spacing nhất quán với Home page
- [ ] Responsive trên mobile, tablet, desktop
  - Verify: Resize browser 375px, 768px, 1440px - layout không broken
- [ ] Header và Footer hiển thị đúng
  - Verify: Visual inspection - link "Về chúng tôi" highlighted/active
- [ ] SEO metadata được export đúng
  - Verify: View page source, kiểm tra `<title>` và `<meta name="description">`
- [ ] CI/CD pass
  - Verify: `cd frontend && npm run lint && npm run format:check && npm run build`

---

## Technical Context

### Existing Patterns

- `frontend/src/app/page.tsx` - Home page composition: Header + sections + Footer
- `frontend/src/components/Hero.tsx` - Hero section pattern: `'use client'`, parallax, gradient-hero
- `frontend/src/components/Features.tsx` - Grid feature cards với icon, data-driven render
- `frontend/src/components/Testimonials.tsx` - Section with header badge, cards grid, staggered animation
- `frontend/src/app/globals.css` - Design tokens (OKLCH), utility classes, glassmorphism, gradients

### Key Files

- `frontend/src/components/icons/index.tsx` - Available icon components (HeartIcon, ShieldIcon, StarIcon, TruckIcon, GiftIcon, SparkleIcon, etc.)
- `frontend/src/app/layout.tsx` - Root layout with `<html lang="vi">`, Nunito/Quicksand fonts, CartProvider
- `frontend/src/components/Header.tsx` - Nav with `/about` link already present
- `frontend/src/components/Footer.tsx` - Footer with `/about` link already present

### Affected Files

Files this bead will create/modify:

```yaml
files:
  - frontend/src/app/about/page.tsx # NEW - About page (main page component)
```

---

## Risks & Mitigations

| Risk                                    | Likelihood | Impact           | Mitigation                                                    |
| --------------------------------------- | ---------- | ---------------- | ------------------------------------------------------------- |
| ESLint/Prettier fails                   | Medium     | High (blocks CI) | Run `npm run lint` và `npm run format:check` trước khi commit |
| Component quá lớn, khó maintain         | Low        | Medium           | Tách thành các section components nếu file > 300 lines        |
| Inconsistent styling với existing pages | Low        | Medium           | Sử dụng cùng CSS vars, Tailwind patterns từ Home page         |

---

## Open Questions

| Question | Owner | Due Date | Status |
| -------- | ----- | -------- | ------ |
| None     | -     | -        | -      |

---

## Tasks

### Create About page with all sections [frontend]

Tạo file `frontend/src/app/about/page.tsx` với đầy đủ 7 sections (Hero, Story, Values, Stats, Team, Commitments, CTA), SEO metadata, responsive design, tuân thủ Baby Bliss pink pastel OKLCH theme, tái sử dụng Header/Footer.

**Metadata:**

```yaml
depends_on: []
parallel: true
conflicts_with: []
files:
  - frontend/src/app/about/page.tsx
```

**Verification:**

- `cd frontend && npm run build` succeeds (page renders as RSC)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about` returns 200
- Visual inspection: 7 sections present, responsive, consistent theming

### Pass CI/CD checks [ci]

Đảm bảo code mới pass tất cả CI checks: ESLint, Prettier format, Next.js build.

**Metadata:**

```yaml
depends_on: ["Create About page with all sections"]
parallel: false
conflicts_with: []
files:
  - frontend/src/app/about/page.tsx
```

**Verification:**

- `cd frontend && npm run lint` passes
- `cd frontend && npm run format:check` passes
- `cd frontend && npm run build` passes

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

- Brand name: **Baby Bliss** (consistent với Header/Footer)
- Tagline: "Yêu thương từng khoảnh khắc" (from Footer)
- Fonts: Nunito (body), Quicksand (display headings)
- Color system: Pink pastel OKLCH (--pink-50 through --pink-600, --lavender, --mint, --peach, etc.)
- All text in Vietnamese, no i18n framework
- Use existing icon components from `icons/index.tsx` where applicable
- Contact info consistent with Footer: 1900 123 456, hello@babybliss.vn, 123 Nguyễn Huệ, Q.1, TP.HCM
