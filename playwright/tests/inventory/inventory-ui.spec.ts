import { expect, test, type Page, type Route } from '@playwright/test';

const apiResponse = (data: unknown, message = 'OK') =>
  JSON.stringify({ status: 'success', message, data });

const mockAdminUser = {
  id: 'admin-inventory-001',
  name: 'Admin Inventory',
  email: 'admin-inventory@example.com',
  phone: '0900000000',
  role: 'admin' as const,
  address: '',
  bio: '',
  avatar: null,
};

type MockProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  description: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const createMockProduct = (overrides?: Partial<MockProduct>): MockProduct => ({
  _id: 'prod-inv-001',
  name: 'Sữa bột Baby Bliss Premium',
  slug: 'sua-bot-baby-bliss-premium',
  price: 359000,
  quantity: 6,
  description: 'Sữa bột cho bé từ 6-12 tháng tuổi',
  category: {
    _id: 'cat-milk-001',
    name: 'Sữa & Ăn dặm',
    slug: 'sua-an-dam',
  },
  images: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

async function mockProductDetail(page: Page, product: MockProduct) {
  await page.route('**/api/products?*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse({
        products: [product],
        pagination: {
          page: 1,
          limit: 100,
          total: 1,
          pages: 1,
        },
      }),
    });
  });

  await page.route(`**/api/products/slug/${product.slug}`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse(product),
    });
  });

  await page.route(`**/api/products/${product._id}`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse(product),
    });
  });
}

async function mockAdminInventoryPage(page: Page, product: MockProduct) {
  let currentQuantity = product.quantity;

  await page.route('**/api/auth/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse(mockAdminUser),
    });
  });

  await page.route('**/api/categories', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse([
        {
          _id: product.category._id,
          name: product.category.name,
          slug: product.category.slug,
          description: 'Danh mục test inventory',
          isActive: true,
        },
      ]),
    });
  });

  await page.route('**/api/products?*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse({
        products: [{ ...product, quantity: currentQuantity }],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          pages: 1,
        },
      }),
    });
  });

  await page.route(`**/api/products/${product._id}`, async (route: Route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }

    const payload = route.request().postDataJSON() as { quantity?: number };
    if (typeof payload.quantity === 'number') {
      currentQuantity = payload.quantity;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: apiResponse({ ...product, quantity: currentQuantity }),
    });
  });
}

test.describe('Inventory UI', () => {
  test('TC-INV-UI-01: trang chi tiết hiển thị hết hàng và khóa nút mua', async ({ page }) => {
    const product = createMockProduct({
      _id: 'prod-inv-00',
      slug: 'sua-bot-het-hang',
      name: 'Sữa bột hết hàng',
      quantity: 0,
    });

    await mockProductDetail(page, product);

    await page.goto(`/products/${product.slug}`);

    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    await expect(page.getByText('Hết hàng', { exact: true })).toBeVisible();
    await expect(page.getByText('Sản phẩm tạm hết hàng')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm vào giỏ hàng' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Mua ngay' })).toBeDisabled();
  });

  test('TC-INV-UI-02: trang chi tiết hiển thị tồn kho và cho phép thêm giỏ', async ({ page }) => {
    const product = createMockProduct({
      _id: 'prod-inv-08',
      slug: 'sua-bot-con-hang',
      name: 'Sữa bột còn hàng',
      quantity: 8,
    });

    await mockProductDetail(page, product);

    await page.goto(`/products/${product.slug}`);

    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    await expect(page.getByText('Còn hàng', { exact: true })).toBeVisible();
    await expect(page.getByText('Còn 8 sản phẩm')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thêm vào giỏ hàng' })).toBeEnabled();
  });

  test('TC-INV-UI-03: admin cập nhật tồn kho từ trang /admin/inventory', async ({ page }) => {
    const product = createMockProduct({
      _id: 'prod-admin-inv-01',
      name: 'Bỉm dán sơ sinh Premium',
      quantity: 2,
    });

    await mockAdminInventoryPage(page, product);

    await page.goto('/admin/inventory');
    await expect(page.getByRole('heading', { name: 'Bảng quản trị tồn kho' })).toBeVisible();

    const productRow = page.locator('tr').filter({ hasText: product.name });
    await expect(productRow).toContainText('2 sản phẩm');

    await productRow.getByRole('button', { name: 'Cập nhật tồn' }).click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Cập nhật tồn kho' })).toBeVisible();

    await modal.locator('#product-quantity').fill('8');
    await modal.getByRole('button', { name: 'Cập nhật tồn kho' }).click();

    await expect(modal).toBeHidden({ timeout: 5000 });
    await expect(productRow).toContainText('8 sản phẩm');
  });
});
