import { expect, test, Page, Route } from '@playwright/test';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCoupons = [
  {
    _id: 'coupon-001',
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
    _id: 'coupon-002',
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển',
    description: 'Không giới hạn đơn hàng',
    discountType: 'free_shipping',
    discountValue: 0,
    maximumDiscount: null,
    minimumOrderAmount: 0,
    usageLimit: null,
    usageCount: 5,
    perUserLimit: 1,
    isActive: true,
    validFrom: null,
    validUntil: null,
    isCurrentlyValid: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'coupon-003',
    code: 'SALE50K',
    name: 'Giảm 50.000đ',
    description: 'Áp dụng cho đơn từ 300.000đ',
    discountType: 'fixed_amount',
    discountValue: 50000,
    maximumDiscount: null,
    minimumOrderAmount: 300000,
    usageLimit: 50,
    usageCount: 50,
    perUserLimit: 1,
    isActive: true,
    validFrom: null,
    validUntil: null,
    isCurrentlyValid: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const apiResponse = (data: unknown) =>
  JSON.stringify({ status: 'success', message: 'OK', data });

// ─── Helper: mock /api/coupons/available ─────────────────────────────────────

async function mockAvailableCoupons(page: Page, coupons = mockCoupons) {
  await page.route('**/api/coupons/available', (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse(coupons),
    })
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Trang Khuyến Mãi (/sale) - Giao diện người dùng', () => {
  test('TC-SALE-01: Trang /sale tải thành công và hiển thị tiêu đề', async ({ page }) => {
    await mockAvailableCoupons(page);
    await page.goto('/sale');

    await expect(page).toHaveURL('/sale');
    await expect(page.locator('main h1')).toContainText('khuyến mãi');
    await expect(page.locator('text=Ưu đãi đặc biệt')).toBeVisible();
  });

  test('TC-SALE-02: Hiển thị đúng số lượng mã khuyến mãi', async ({ page }) => {
    await mockAvailableCoupons(page);
    await page.goto('/sale');

    // Đợi spinner biến mất
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    await expect(page.locator('text=3 mã khuyến mãi đang hoạt động')).toBeVisible();

    // Mỗi card có code hiển thị
    await expect(page.locator('text=GIAM10')).toBeVisible();
    await expect(page.locator('text=FREESHIP')).toBeVisible();
    await expect(page.locator('text=SALE50K')).toBeVisible();
  });

  test('TC-SALE-03: Hiển thị đúng loại và giá trị giảm giá', async ({ page }) => {
    await mockAvailableCoupons(page);
    await page.goto('/sale');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    // Coupon % → badge "-10%"
    await expect(page.locator('text=-10%')).toBeVisible();
    // Free shipping → badge "Free Ship"
    await expect(page.locator('text=Free Ship')).toBeVisible();
    // Fixed amount → badge "-50.000đ"
    await expect(page.locator('text=-50.000đ')).toBeVisible();
  });

  test('TC-SALE-04: Hiển thị điều kiện sử dụng mã', async ({ page }) => {
    await mockAvailableCoupons(page);
    await page.goto('/sale');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    // Đơn tối thiểu coupon GIAM10
    await expect(page.locator('text=200.000đ').first()).toBeVisible();
    // Giảm tối đa coupon GIAM10
    await expect(page.locator('text=50.000đ').first()).toBeVisible();
    // Còn lại coupon GIAM10 (100 - 20 = 80 lượt)
    await expect(page.locator('text=80 lượt')).toBeVisible();
  });

  test('TC-SALE-05: Nút Sao chép copy mã vào clipboard', async ({ page, context, browserName }) => {
    // Chỉ Chromium hỗ trợ grantPermissions clipboard
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await mockAvailableCoupons(page);
    await page.goto('/sale');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    // Click nút "Sao chép" đầu tiên (GIAM10)
    const copyButtons = page.locator('button', { hasText: 'Sao chép' });
    await copyButtons.first().click();

    // Nút đổi sang "✓ Đã sao chép"
    await expect(copyButtons.first()).toContainText('Đã sao chép');

    // Kiểm tra clipboard (chỉ Chromium hỗ trợ clipboard API đầy đủ)
    if (browserName === 'chromium') {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toBe('GIAM10');
    }
  });

  test('TC-SALE-06: Hiển thị empty state khi không có mã khuyến mãi', async ({ page }) => {
    await mockAvailableCoupons(page, []);
    await page.goto('/sale');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    await expect(page.locator('text=Hiện chưa có mã khuyến mãi nào')).toBeVisible();
    await expect(page.locator('text=Hãy quay lại sau để nhận ưu đãi mới nhé!')).toBeVisible();
  });

  test('TC-SALE-07: Nút "Mua sắm ngay" điều hướng đến /products', async ({ page }) => {
    await mockAvailableCoupons(page);
    await page.goto('/sale');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    await page.locator('a', { hasText: 'Mua sắm ngay' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('TC-SALE-08: Header có link điều hướng đến /sale', async ({ page }) => {
    await mockAvailableCoupons(page);
    await page.goto('/');

    // Lấy link đầu tiên (desktop nav) trong header
    const saleLink = page.locator('header a[href="/sale"]').first();
    await expect(saleLink).toBeVisible();
    await expect(saleLink).toHaveText('Khuyến mãi');
  });

  test('TC-SALE-09: Trang hiển thị đúng trên mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockAvailableCoupons(page);
    await page.goto('/sale');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout: 5000 }).catch(() => {});

    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('text=GIAM10')).toBeVisible();
    const copyBtn = page.locator('button', { hasText: 'Sao chép' }).first();
    await expect(copyBtn).toBeVisible();
  });
});
