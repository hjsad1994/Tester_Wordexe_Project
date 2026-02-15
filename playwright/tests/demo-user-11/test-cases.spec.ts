import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Demo User 11 - Profile Data Integration", () => {
	test("loads profile from API and persists profile update", async ({
		page,
	}) => {
		const profile = {
			id: "u-001",
			name: "Nguyen Thi Lan",
			email: "lan@example.com",
			phone: "0901234567",
			address: "123 Le Loi, Q1",
			bio: "Mẹ bỉm sữa",
			avatar: null,
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
			const method = route.request().method();

			if (method === "GET") {
				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ status: "success", data: profile }),
				});
				return;
			}

			if (method === "PATCH") {
				const payload = route.request().postDataJSON() as {
					name: string;
					phone: string;
					address: string;
					bio: string;
				};

				profile.name = payload.name;
				profile.phone = payload.phone;
				profile.address = payload.address;
				profile.bio = payload.bio;

				route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ status: "success", data: profile }),
				});
				return;
			}

			route.continue();
		});

		await page.goto("/profile");
		await expect(page.locator("#profile-name")).toHaveValue("Nguyen Thi Lan");
		await expect(page.locator("#profile-phone")).toHaveValue("0901234567");
		await expect(page.locator("#profile-address")).toHaveValue(
			"123 Le Loi, Q1",
		);
		await expect(page.locator("#profile-bio")).toHaveValue("Mẹ bỉm sữa");

		await page.fill("#profile-name", "Tran Minh Chau");
		await page.fill("#profile-phone", "0912345678");
		await page.fill("#profile-address", "456 Hai Ba Trung, Q3");
		await page.fill("#profile-bio", "Cap nhat profile tu API");

		await page.getByRole("button", { name: "Lưu thay đổi" }).click();
		await expect(page.getByText("Cập nhật thành công")).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Tran Minh Chau" }),
		).toBeVisible();

		await page.reload();
		await expect(page.locator("#profile-name")).toHaveValue("Tran Minh Chau");
		await expect(page.locator("#profile-phone")).toHaveValue("0912345678");
		await expect(page.locator("#profile-address")).toHaveValue(
			"456 Hai Ba Trung, Q3",
		);
		await expect(page.locator("#profile-bio")).toHaveValue(
			"Cap nhat profile tu API",
		);
	});
});
