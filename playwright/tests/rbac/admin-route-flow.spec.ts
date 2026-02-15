import { expect, test } from "@playwright/test";

const mockAdminAuth = async (page: Parameters<typeof test>[0]["page"]) => {
	await page.route("**/api/auth/me", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				status: "success",
				message: "OK",
				data: {
					id: "admin-user-id",
					name: "Admin",
					email: "admin@example.com",
					phone: "0900000000",
					role: "admin",
				},
			}),
		});
	});
};

test.describe("Admin route flow", () => {
	test.describe.configure({ mode: "serial" });

	test("old admin anchor link is removed from header", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator('a[href="/products#admin-panel"]')).toHaveCount(
			0,
		);
	});

	test("products page no longer renders embedded admin panel", async ({
		page,
	}) => {
		await page.goto("/products");
		await expect(page.locator("#admin-panel")).toHaveCount(0);
	});

	test("non-admin users are redirected away from admin content", async ({
		page,
	}) => {
		await page.goto("/admin");
		await expect(page).not.toHaveURL(/\/admin\/products$/);
	});

	test("admin layout shell is full-width and navigation is fully visible", async ({
		page,
	}) => {
		await mockAdminAuth(page);
		await page.goto("/admin/products");

		const shell = page.locator('[data-testid="admin-layout-shell"]');
		await expect(shell).toBeVisible();
		await expect(shell).toHaveClass(/w-full/);
		await expect(shell).not.toHaveClass(/max-w-7xl/);

		const nav = page.locator('nav[aria-label="Điều hướng quản trị"]');
		await expect(nav).toBeVisible();
		await expect(nav.locator('a[href="/admin/products"]')).toBeVisible();
		await expect(nav.locator('a[href="/admin/categories"]')).toBeVisible();
	});

	test("admin navigation remains reachable on mobile viewport", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await mockAdminAuth(page);
		await page.goto("/admin/products");

		const nav = page.locator('nav[aria-label="Điều hướng quản trị"]');
		await expect(nav).toBeVisible();
		await expect(nav).toHaveClass(/overflow-x-auto/);
		await expect(nav.locator('a[href="/admin/products"]')).toBeVisible();
		await expect(nav.locator('a[href="/admin/categories"]')).toBeVisible();
	});
});
