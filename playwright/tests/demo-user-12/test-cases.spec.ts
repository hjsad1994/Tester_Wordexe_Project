import { expect, test } from "../../fixtures/test-fixtures";

const onePixelPng = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9mA8wYAAAAAASUVORK5CYII=",
	"base64",
);

test.describe("Demo User 12 - Profile Avatar Upload", () => {
	test("shows validation error for invalid avatar file type", async ({
		page,
	}) => {
		const profile = {
			id: "u-001",
			name: "Nguyen Thi Lan",
			email: "lan@example.com",
			phone: "0901234567",
			address: "",
			bio: "",
			avatar: null,
			role: "user" as const,
		};

		let uploadCalled = false;

		await page.route("**/api/auth/me", (route) => {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					status: "success",
					data: {
						id: profile.id,
						name: profile.name,
						email: profile.email,
						phone: profile.phone,
						role: profile.role,
					},
				}),
			});
		});

		await page.route("**/api/users/me", (route) => {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ status: "success", data: profile }),
			});
		});

		await page.route("**/api/users/me/avatar", (route) => {
			uploadCalled = true;
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ status: "success", data: profile }),
			});
		});

		await page.goto("/profile");

		await page.setInputFiles('input[type="file"]', {
			name: "avatar.txt",
			mimeType: "text/plain",
			buffer: Buffer.from("not-an-image"),
		});

		await expect(
			page.getByText("Chỉ chấp nhận file ảnh (JPG, PNG, WebP)"),
		).toBeVisible();
		expect(uploadCalled).toBe(false);
	});

	test("uploads avatar and renders persisted avatar url", async ({ page }) => {
		let currentAvatar: string | null = null;

		const profile = {
			id: "u-001",
			name: "Nguyen Thi Lan",
			email: "lan@example.com",
			phone: "0901234567",
			address: "",
			bio: "",
			avatar: currentAvatar,
			role: "user" as const,
		};

		await page.route("**/api/auth/me", (route) => {
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					status: "success",
					data: {
						id: profile.id,
						name: profile.name,
						email: profile.email,
						phone: profile.phone,
						role: profile.role,
					},
				}),
			});
		});

		await page.route("**/api/users/me", (route) => {
			profile.avatar = currentAvatar;

			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ status: "success", data: profile }),
			});
		});

		await page.route("**/api/users/me/avatar", async (route) => {
			currentAvatar =
				"https://res.cloudinary.com/demo/image/upload/v1/avatars/user_u-001.png";
			profile.avatar = currentAvatar;

			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ status: "success", data: profile }),
			});
		});

		await page.goto("/profile");

		await page.setInputFiles('input[type="file"]', {
			name: "avatar.png",
			mimeType: "image/png",
			buffer: onePixelPng,
		});

		await expect(page.getByText("Đã cập nhật ảnh đại diện")).toBeVisible();
		await expect(page.locator('img[alt="Ảnh đại diện"]')).toHaveAttribute(
			"src",
			/res\.cloudinary\.com/,
		);

		await page.reload();
		await page.waitForLoadState("networkidle");

		await expect(page.locator('img[alt="Ảnh đại diện"]')).toHaveAttribute(
			"src",
			/res\.cloudinary\.com/,
			{ timeout: 15000 },
		);
	});
});

test.describe("Demo User 12 - Product Detail Image Rendering", () => {
	test("renders Cloudinary image from product.images on product detail", async ({
		page,
	}) => {
		const product = {
			_id: "prod-cloudinary-01",
			name: "Bé bông Cloudinary",
			slug: "be-bong-cloudinary",
			price: 199000,
			category: {
				_id: "cat-toys",
				name: "Đồ chơi",
				slug: "do-choi",
			},
			quantity: 50,
			images: [
				"https://res.cloudinary.com/demo/image/upload/v1/products/be-bong-cloudinary.png",
			],
			isActive: true,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		};

		await page.route("**/api/products?*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					status: "success",
					message: "OK",
					data: {
						products: [product],
						pagination: {
							page: 1,
							limit: 100,
							total: 1,
							pages: 1,
						},
					},
				}),
			});
		});

		await page.route(
			"**/api/products/slug/be-bong-cloudinary",
			async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						status: "success",
						message: "OK",
						data: product,
					}),
				});
			},
		);

		await page.goto("/products/be-bong-cloudinary");

		await expect(
			page.getByRole("heading", { name: "Bé bông Cloudinary" }),
		).toBeVisible();
		await expect(page.locator('img[alt="Bé bông Cloudinary"]')).toHaveAttribute(
			"src",
			/res\.cloudinary\.com/,
		);
	});

	test("falls back without broken product image when images[] is empty", async ({
		page,
	}) => {
		const product = {
			_id: "prod-no-image-01",
			name: "Bé bông không ảnh",
			slug: "be-bong-khong-anh",
			price: 159000,
			category: {
				_id: "cat-toys",
				name: "Đồ chơi",
				slug: "do-choi",
			},
			quantity: 50,
			images: [],
			isActive: true,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-01T00:00:00.000Z",
		};

		await page.route("**/api/products?*", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					status: "success",
					message: "OK",
					data: {
						products: [product],
						pagination: {
							page: 1,
							limit: 100,
							total: 1,
							pages: 1,
						},
					},
				}),
			});
		});

		await page.route(
			"**/api/products/slug/be-bong-khong-anh",
			async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						status: "success",
						message: "OK",
						data: product,
					}),
				});
			},
		);

		await page.goto("/products/be-bong-khong-anh");

		await expect(
			page.getByRole("heading", { name: "Bé bông không ảnh" }),
		).toBeVisible();
		await expect(page.locator('img[alt="Bé bông không ảnh"]')).toHaveCount(0);
	});
});
