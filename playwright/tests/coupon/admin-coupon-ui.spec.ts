import { expect, test, Page, Route } from '@playwright/test';

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const apiResponse = (data: unknown, message = 'OK') =>
  JSON.stringify({ status: 'success', message, data });

const mockAdminUser = {
  id: 'admin-001',
  name: 'Admin Baby Bliss',
  email: 'admin@babybliss.vn',
  phone: '0900000000',
  role: 'admin',
  address: '',
  bio: '',
  avatar: null,
};

const mockCouponList = [
  {
    _id: 'c-001',
    code: 'GIAM10',
    name: 'Giảm 10% đơn đầu tiên',
    description: 'Áp dụng cho khách hàng mới',
    discountType: 'percentage',
    discountValue: 10,
    maximumDiscount: 50000,
    minimumOrderAmount: 200000,
    usageLimit: 100,
    usageCount: 20,
    perUserLimit: 1,
    isActive: true,
    validFrom: null,
    validUntil: '2026-12-31T23:59:59.000Z',
    isCurrentlyValid: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'c-002',
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển',
    description: '',
    discountType: 'free_shipping',
    discountValue: 0,
    maximumDiscount: null,
    minimumOrderAmount: 0,
    usageLimit: null,
    usageCount: 0,
    perUserLimit: 1,
    isActive: false,
    validFrom: null,
    validUntil: null,
    isCurrentlyValid: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function setupAdminMocks(page: Page) {
  // Mock auth → admin
  await page.route('**/api/auth/me', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse(mockAdminUser),
    })
  );

  // Mock GET /api/coupons
  await page.route('**/api/coupons', (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: apiResponse(mockCouponList),
      });
    }
    return route.continue();
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Admin Quản Lý Khuyến Mãi - Giao diện CRUD', () => {
  test.setTimeout(60000);

  test('TC-ADMIN-01: Trang /admin/coupons hiển thị danh sách mã khuyến mãi', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=Quản lý khuyến mãi', { timeout: 10000 });

    await expect(page.locator('h2', { hasText: 'Quản lý khuyến mãi' })).toBeVisible();
    await expect(page.locator('text=GIAM10')).toBeVisible();
    await expect(page.locator('text=FREESHIP')).toBeVisible();
    await expect(page.locator('text=Giảm 10% đơn đầu tiên')).toBeVisible();
  });

  test('TC-ADMIN-02: Bảng hiển thị đủ các cột thông tin', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    const table = page.locator('table');
    await expect(table.locator('th', { hasText: 'Mã' })).toBeVisible();
    await expect(table.locator('th', { hasText: 'Tên' })).toBeVisible();
    await expect(table.locator('th', { hasText: 'Loại' })).toBeVisible();
    await expect(table.locator('th', { hasText: 'Giá trị' })).toBeVisible();
    await expect(table.locator('th', { hasText: 'Đã dùng' })).toBeVisible();
    await expect(table.locator('th', { hasText: 'Trạng thái' })).toBeVisible();
    await expect(table.locator('th', { hasText: 'Thao tác' })).toBeVisible();
  });

  test('TC-ADMIN-03: Hiển thị badge trạng thái "Hoạt động" và "Tắt"', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    await expect(page.locator('button', { hasText: 'Hoạt động' }).first()).toBeVisible();
    await expect(page.locator('button', { hasText: 'Tắt' }).first()).toBeVisible();
  });

  test('TC-ADMIN-04: Nút "+ Tạo mã khuyến mãi" mở modal tạo mới', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=Quản lý khuyến mãi', { timeout: 10000 });

    await page.locator('button', { hasText: 'Tạo mã khuyến mãi' }).click();

    // Modal xuất hiện
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h3', { hasText: 'Tạo mã khuyến mãi mới' })).toBeVisible();

    // Có các field cần thiết
    await expect(modal.locator('#coupon-code')).toBeVisible();
    await expect(modal.locator('#coupon-name')).toBeVisible();
    await expect(modal.locator('#coupon-type')).toBeVisible();
  });

  test('TC-ADMIN-05: Tạo mã khuyến mãi mới thành công', async ({ page }) => {
    await setupAdminMocks(page);

    const newCoupon = {
      _id: 'c-003',
      code: 'BABYBLISS20',
      name: 'Ưu đãi Baby Bliss 20%',
      description: 'Mã mới tạo',
      discountType: 'percentage',
      discountValue: 20,
      maximumDiscount: 100000,
      minimumOrderAmount: 300000,
      usageLimit: 200,
      usageCount: 0,
      perUserLimit: 1,
      isActive: true,
      validFrom: null,
      validUntil: null,
      isCurrentlyValid: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock POST /api/coupons → trả về coupon mới
    await page.route('**/api/coupons', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: apiResponse(newCoupon, 'Coupon created successfully'),
        });
      }
      return route.continue();
    });

    await page.goto('/admin/coupons');
    await page.waitForSelector('text=Quản lý khuyến mãi', { timeout: 10000 });

    await page.locator('button', { hasText: 'Tạo mã khuyến mãi' }).click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Điền form
    await modal.locator('#coupon-code').fill('BABYBLISS20');
    await modal.locator('#coupon-name').fill('Ưu đãi Baby Bliss 20%');
    await modal.locator('#coupon-description').fill('Mã mới tạo');
    await modal.locator('#coupon-type').selectOption('percentage');
    await modal.locator('#coupon-value').fill('20');
    await modal.locator('#coupon-max-discount').fill('100000');
    await modal.locator('#coupon-min-order').fill('300000');

    // Submit
    await modal.locator('button[type="submit"]').click();

    // Modal đóng sau khi thành công
    await expect(modal).toBeHidden({ timeout: 5000 });
  });

  test('TC-ADMIN-06: Validate form - không thể submit khi thiếu mã và tên', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=Quản lý khuyến mãi', { timeout: 10000 });

    await page.locator('button', { hasText: 'Tạo mã khuyến mãi' }).click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Bỏ qua native HTML5 validation để kích hoạt JS validation
    await page.evaluate(() => {
      const form = document.querySelector('[role="dialog"] form') as HTMLFormElement;
      if (form) form.setAttribute('novalidate', '');
    });

    // Submit không điền gì
    await modal.locator('button[type="submit"]').click();

    // Thông báo lỗi JS xuất hiện
    await expect(modal.locator('text=Vui lòng nhập mã và tên khuyến mãi')).toBeVisible();
  });

  test('TC-ADMIN-07: Nút "Sửa" mở modal edit với dữ liệu cũ điền sẵn', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    // Click nút Sửa của row GIAM10
    const giam10Row = page.locator('tr').filter({ hasText: 'GIAM10' });
    await giam10Row.locator('button', { hasText: 'Sửa' }).click({ force: true });

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h3', { hasText: 'Chỉnh sửa mã khuyến mãi' })).toBeVisible();

    // Field được điền sẵn
    await expect(modal.locator('#coupon-code')).toHaveValue('GIAM10');
    await expect(modal.locator('#coupon-name')).toHaveValue('Giảm 10% đơn đầu tiên');
  });

  test('TC-ADMIN-08: Cập nhật mã khuyến mãi thành công', async ({ page }) => {
    await setupAdminMocks(page);

    // Mock PUT /api/coupons/:id
    await page.route('**/api/coupons/c-001', (route) => {
      if (route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: apiResponse({ ...mockCouponList[0], name: 'Giảm 10% - Đã cập nhật' }),
        });
      }
      return route.continue();
    });

    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    const giam10Row = page.locator('tr').filter({ hasText: 'GIAM10' });
    await giam10Row.locator('button', { hasText: 'Sửa' }).click({ force: true });

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Sửa tên
    await modal.locator('#coupon-name').fill('Giảm 10% - Đã cập nhật');
    await modal.locator('button[type="submit"]').click();

    // Modal đóng
    await expect(modal).toBeHidden({ timeout: 5000 });
  });

  test('TC-ADMIN-09: Nút "Xóa" mở modal xác nhận xóa', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    const giam10Row = page.locator('tr').filter({ hasText: 'GIAM10' });
    await giam10Row.locator('button', { hasText: 'Xóa' }).click({ force: true });

    const deleteModal = page.locator('[role="alertdialog"]');
    await expect(deleteModal).toBeVisible();
    await expect(deleteModal.locator('h3', { hasText: 'Xóa mã khuyến mãi?' })).toBeVisible();
    await expect(deleteModal.locator('text=GIAM10')).toBeVisible();
    await expect(deleteModal.locator('text=Hành động này không thể hoàn tác')).toBeVisible();
  });

  test('TC-ADMIN-10: Xác nhận xóa thành công', async ({ page }) => {
    await setupAdminMocks(page);

    // Mock DELETE /api/coupons/c-001
    await page.route('**/api/coupons/c-001', (route) => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: apiResponse(null, 'Coupon deleted successfully'),
        });
      }
      return route.continue();
    });

    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    const giam10Row = page.locator('tr').filter({ hasText: 'GIAM10' });
    await giam10Row.locator('button', { hasText: 'Xóa' }).click({ force: true });

    const deleteModal = page.locator('[role="alertdialog"]');
    await expect(deleteModal).toBeVisible();

    // Xác nhận xóa
    await deleteModal.locator('button', { hasText: 'Xóa' }).click();

    // Modal đóng
    await expect(deleteModal).toBeHidden({ timeout: 5000 });
  });

  test('TC-ADMIN-11: Nhấn Hủy trong modal xóa không xóa coupon', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=GIAM10', { timeout: 10000 });

    const giam10Row = page.locator('tr').filter({ hasText: 'GIAM10' });
    await giam10Row.locator('button', { hasText: 'Xóa' }).click({ force: true });

    const deleteModal = page.locator('[role="alertdialog"]');
    await expect(deleteModal).toBeVisible();

    // Click Hủy
    await deleteModal.locator('button', { hasText: 'Hủy' }).click();
    await expect(deleteModal).toBeHidden({ timeout: 3000 });

    // Coupon vẫn còn trong bảng
    await expect(page.locator('text=GIAM10')).toBeVisible();
  });

  test('TC-ADMIN-12: Nhấn ESC đóng modal tạo mới', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/coupons');
    await page.waitForSelector('text=Quản lý khuyến mãi', { timeout: 10000 });

    await page.locator('button', { hasText: 'Tạo mã khuyến mãi' }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 3000 });
  });

  test('TC-ADMIN-13: Sidebar có link "Khuyến mãi" → /admin/coupons', async ({ page }) => {
    await setupAdminMocks(page);
    await page.goto('/admin/products');
    await page.waitForSelector('nav[aria-label="Điều hướng quản trị"]', { timeout: 10000 });

    const couponLink = page.locator('nav[aria-label="Điều hướng quản trị"] a[href="/admin/coupons"]');
    await expect(couponLink).toBeVisible();
    await expect(couponLink).toHaveText('Khuyến mãi');

    await couponLink.click();
    await expect(page).toHaveURL('/admin/coupons');
  });

  test('TC-ADMIN-14: Non-admin bị redirect khỏi /admin/coupons', async ({ page }) => {
    // Mock auth → user thường (không phải admin)
    await page.route('**/api/auth/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: apiResponse({ ...mockAdminUser, role: 'user' }),
      })
    );

    await page.goto('/admin/coupons');
    // Chờ redirect
    await page.waitForTimeout(1500);

    // Phải bị redirect ra khỏi /admin
    await expect(page).not.toHaveURL('/admin/coupons');
  });
});
