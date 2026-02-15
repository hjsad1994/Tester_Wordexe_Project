import { type ChildProcess, spawn } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const API_URL = "http://127.0.0.1:3001";
const backendDir = path.resolve(__dirname, "../../../backend");
const envPath = path.join(backendDir, ".env");

let backendProcess: ChildProcess | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEnvValue = (content: string, key: string) => {
	const line = content
		.split("\n")
		.map((entry) => entry.trim())
		.find((entry) => entry.startsWith(`${key}=`));

	if (!line) {
		return null;
	}

	const raw = line.slice(key.length + 1).trim();
	if (!raw) {
		return null;
	}

	return raw.replace(/^['"]|['"]$/g, "");
};

const resolveJwtSecret = () => {
	if (process.env.JWT_SECRET) {
		return process.env.JWT_SECRET;
	}

	try {
		const envContent = readFileSync(envPath, "utf8");
		return parseEnvValue(envContent, "JWT_SECRET");
	} catch {
		return null;
	}
};

const base64Url = (value: string) => Buffer.from(value).toString("base64url");

const signJwt = (payload: Record<string, unknown>, secret: string) => {
	const header = { alg: "HS256", typ: "JWT" };
	const encodedHeader = base64Url(JSON.stringify(header));
	const encodedPayload = base64Url(JSON.stringify(payload));
	const signature = createHmac("sha256", secret)
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest("base64url");

	return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const waitForBackendReady = async () => {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		try {
			const response = await fetch(`${API_URL}/health`);
			if (response.ok) {
				return;
			}
		} catch {}
		await sleep(500);
	}

	throw new Error("Backend failed to become ready on /health");
};

test.beforeAll(async () => {
	backendProcess = spawn("npm", ["run", "start"], {
		cwd: backendDir,
		env: process.env,
		stdio: "pipe",
		shell: process.platform === "win32",
	});

	await waitForBackendReady();
});

test.afterAll(async () => {
	if (backendProcess) {
		backendProcess.kill("SIGTERM");
		backendProcess = null;
	}
});

const registerAndLoginUser = async (
	request: Parameters<typeof test>[0]["request"],
) => {
	const email = `rbac-user-${Date.now()}@example.com`;
	const password = "Test@12345";

	const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
		data: {
			name: "RBAC User",
			email,
			phone: `09${Date.now().toString().slice(-8)}`,
			password,
		},
	});
	expect(registerResponse.status()).toBe(201);

	const registerBody = await registerResponse.json();
	expect(registerBody.data.role).toBe("user");

	const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
		data: { email, password },
	});
	expect(loginResponse.status()).toBe(200);

	const loginBody = await loginResponse.json();
	expect(loginBody.data.role).toBe("user");

	const cookie = loginResponse.headers()["set-cookie"];
	expect(cookie).toBeTruthy();

	return cookie;
};

test.describe("RBAC: product/category permissions", () => {
	test("non-admin users receive 403 for product/category writes", async ({
		request,
	}) => {
		const userCookie = await registerAndLoginUser(request);
		const fakeId = "000000000000000000000000";

		const deniedRequests = [
			[
				"POST",
				"/api/products",
				{ name: "Denied Product", price: 1000, category: fakeId },
			],
			["PUT", `/api/products/${fakeId}`, { name: "Denied Product Updated" }],
			["DELETE", `/api/products/${fakeId}`, undefined],
			["POST", "/api/categories", { name: `Denied Category ${Date.now()}` }],
			[
				"PUT",
				`/api/categories/${fakeId}`,
				{ name: `Denied Category Updated ${Date.now()}` },
			],
			["DELETE", `/api/categories/${fakeId}`, undefined],
			["PATCH", `/api/orders/${fakeId}/status`, { status: "processing" }],
			["DELETE", `/api/orders/${fakeId}`, { reason: "Denied archive request" }],
		] as const;

		for (const [method, route, payload] of deniedRequests) {
			const response = await request.fetch(`${API_URL}${route}`, {
				method,
				headers: {
					Cookie: userCookie,
					...(payload ? { "Content-Type": "application/json" } : {}),
				},
				data: payload,
			});

			expect(response.status(), `${method} ${route}`).toBe(403);
		}
	});

	test("admin can perform product/category CRUD writes", async ({
		request,
	}) => {
		const secret = resolveJwtSecret();
		expect(secret).toBeTruthy();

		const token = signJwt(
			{
				userId: "000000000000000000000001",
				role: "admin",
				exp: Math.floor(Date.now() / 1000) + 3600,
			},
			secret as string,
		);
		const adminCookie = `accessToken=${token}`;

		const categoryResponse = await request.post(`${API_URL}/api/categories`, {
			headers: { Cookie: adminCookie },
			data: {
				name: `RBAC Category ${Date.now()}`,
				description: "RBAC category description",
			},
		});
		expect(categoryResponse.status()).toBe(201);
		const categoryBody = await categoryResponse.json();
		const categoryId = categoryBody.data._id as string;

		const productResponse = await request.post(`${API_URL}/api/products`, {
			headers: { Cookie: adminCookie },
			data: {
				name: `RBAC Product ${Date.now()}`,
				price: 120000,
				category: categoryId,
				description: "RBAC product description",
			},
		});
		expect(productResponse.status()).toBe(201);
		const productBody = await productResponse.json();
		const productId = productBody.data._id as string;

		const updateProductResponse = await request.put(
			`${API_URL}/api/products/${productId}`,
			{
				headers: { Cookie: adminCookie },
				data: { name: `RBAC Product Updated ${Date.now()}` },
			},
		);
		expect(updateProductResponse.status()).toBe(200);

		const updateCategoryResponse = await request.put(
			`${API_URL}/api/categories/${categoryId}`,
			{
				headers: { Cookie: adminCookie },
				data: { name: `RBAC Category Updated ${Date.now()}` },
			},
		);
		expect(updateCategoryResponse.status()).toBe(200);

		const deleteProductResponse = await request.delete(
			`${API_URL}/api/products/${productId}`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(deleteProductResponse.status()).toBe(200);

		const deleteCategoryResponse = await request.delete(
			`${API_URL}/api/categories/${categoryId}`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(deleteCategoryResponse.status()).toBe(200);
	});

	test("admin can manage order lifecycle and delivered orders are locked", async ({
		request,
	}) => {
		const secret = resolveJwtSecret();
		expect(secret).toBeTruthy();

		const token = signJwt(
			{
				userId: "000000000000000000000001",
				role: "admin",
				exp: Math.floor(Date.now() / 1000) + 3600,
			},
			secret as string,
		);
		const adminCookie = `accessToken=${token}`;

		const categoryResponse = await request.post(`${API_URL}/api/categories`, {
			headers: { Cookie: adminCookie },
			data: {
				name: `Order Lifecycle Category ${Date.now()}`,
				description: "Order lifecycle category",
			},
		});
		expect(categoryResponse.status()).toBe(201);
		const categoryBody = await categoryResponse.json();
		const categoryId = categoryBody.data._id as string;

		const productResponse = await request.post(`${API_URL}/api/products`, {
			headers: { Cookie: adminCookie },
			data: {
				name: `Order Lifecycle Product ${Date.now()}`,
				price: 180000,
				category: categoryId,
				description: "Order lifecycle product",
			},
		});
		expect(productResponse.status()).toBe(201);
		const productBody = await productResponse.json();
		const productId = productBody.data._id as string;

		const createOrderResponse = await request.post(`${API_URL}/api/orders`, {
			data: {
				items: [{ productId, quantity: 1 }],
				paymentMethod: "cod",
				customerInfo: {
					fullName: "Order Test User",
					phone: "0912345678",
					province: "TP. Ho Chi Minh",
					district: "Quan 1",
					ward: "Ben Nghe",
					address: "123 Nguyen Hue",
					notes: "Playwright lifecycle test",
				},
			},
		});
		expect(createOrderResponse.status()).toBe(201);
		const createdOrderBody = await createOrderResponse.json();
		const orderId = createdOrderBody.data._id as string;

		const toProcessingResponse = await request.patch(
			`${API_URL}/api/orders/${orderId}/status`,
			{
				headers: { Cookie: adminCookie },
				data: { status: "processing" },
			},
		);
		expect(toProcessingResponse.status()).toBe(200);

		const toShippedResponse = await request.patch(
			`${API_URL}/api/orders/${orderId}/status`,
			{
				headers: { Cookie: adminCookie },
				data: { status: "shipped" },
			},
		);
		expect(toShippedResponse.status()).toBe(200);

		const toDeliveredResponse = await request.patch(
			`${API_URL}/api/orders/${orderId}/status`,
			{
				headers: { Cookie: adminCookie },
				data: { status: "delivered" },
			},
		);
		expect(toDeliveredResponse.status()).toBe(200);

		const lockDeliveredResponse = await request.patch(
			`${API_URL}/api/orders/${orderId}/status`,
			{
				headers: { Cookie: adminCookie },
				data: { status: "cancelled" },
			},
		);
		expect(lockDeliveredResponse.status()).toBe(400);

		const archiveOrderResponse = await request.delete(
			`${API_URL}/api/orders/${orderId}`,
			{
				headers: {
					Cookie: adminCookie,
					"Content-Type": "application/json",
				},
				data: { reason: "Audit archive verification" },
			},
		);
		expect(archiveOrderResponse.status()).toBe(200);

		const defaultListResponse = await request.get(`${API_URL}/api/orders`, {
			headers: { Cookie: adminCookie },
		});
		expect(defaultListResponse.status()).toBe(200);
		const defaultListBody = await defaultListResponse.json();
		expect(
			defaultListBody.data.orders.some(
				(order: { _id: string }) => order._id === orderId,
			),
		).toBe(false);

		const includeDeletedResponse = await request.get(
			`${API_URL}/api/orders?includeDeleted=true`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(includeDeletedResponse.status()).toBe(200);
		const includeDeletedBody = await includeDeletedResponse.json();
		expect(
			includeDeletedBody.data.orders.some(
				(order: { _id: string; deletedAt: string | null }) =>
					order._id === orderId && order.deletedAt,
			),
		).toBe(true);

		const deleteProductResponse = await request.delete(
			`${API_URL}/api/products/${productId}`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(deleteProductResponse.status()).toBe(200);

		const deleteCategoryResponse = await request.delete(
			`${API_URL}/api/categories/${categoryId}`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(deleteCategoryResponse.status()).toBe(200);
	});

	test("Vietnamese product slugs retain base letters and resolve by slug route", async ({
		request,
	}) => {
		const secret = resolveJwtSecret();
		expect(secret).toBeTruthy();

		const token = signJwt(
			{
				userId: "000000000000000000000001",
				role: "admin",
				exp: Math.floor(Date.now() / 1000) + 3600,
			},
			secret as string,
		);
		const adminCookie = `accessToken=${token}`;

		const categoryResponse = await request.post(`${API_URL}/api/categories`, {
			headers: { Cookie: adminCookie },
			data: {
				name: `Slug VN Category ${Date.now()}`,
				description: "Slug VN category description",
			},
		});
		expect(categoryResponse.status()).toBe(201);
		const categoryBody = await categoryResponse.json();
		const categoryId = categoryBody.data._id as string;

		const vietnameseName = "Thú nhồi bông hình thỏ dễ thương";
		const malformedSlug = "th-nh-i-b-ng-h-nh-th-d-th-ng";
		const expectedSlugFragment = "thu-nhoi-bong-hinh-tho-de-thuong";

		const createProductResponse = await request.post(
			`${API_URL}/api/products`,
			{
				headers: { Cookie: adminCookie },
				data: {
					name: vietnameseName,
					price: 150000,
					category: categoryId,
					description: "Vietnamese slug regression",
				},
			},
		);
		expect(createProductResponse.status()).toBe(201);
		const createProductBody = await createProductResponse.json();
		const createdProductId = createProductBody.data._id as string;
		const createdProductSlug = createProductBody.data.slug as string;

		expect(createdProductSlug).toContain(expectedSlugFragment);
		expect(createdProductSlug).not.toContain(malformedSlug);

		const bySlugResponse = await request.get(
			`${API_URL}/api/products/slug/${encodeURIComponent(createdProductSlug)}`,
		);
		expect(bySlugResponse.status()).toBe(200);
		const bySlugBody = await bySlugResponse.json();
		expect(bySlugBody.data._id).toBe(createdProductId);

		const deleteProductResponse = await request.delete(
			`${API_URL}/api/products/${createdProductId}`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(deleteProductResponse.status()).toBe(200);

		const deleteCategoryResponse = await request.delete(
			`${API_URL}/api/categories/${categoryId}`,
			{
				headers: { Cookie: adminCookie },
			},
		);
		expect(deleteCategoryResponse.status()).toBe(200);
	});

	test("read routes remain publicly accessible", async ({ request }) => {
		const productsResponse = await request.get(`${API_URL}/api/products`);
		expect(productsResponse.status()).toBe(200);

		const categoriesResponse = await request.get(`${API_URL}/api/categories`);
		expect(categoriesResponse.status()).toBe(200);
	});
});
