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
