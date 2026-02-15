import { expect, test } from "@playwright/test";

test.describe("Admin route flow", () => {
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
});
