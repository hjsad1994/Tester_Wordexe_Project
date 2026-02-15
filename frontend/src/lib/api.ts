const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
	status: string;
	message: string;
	data: T;
}

export interface TestCase {
	_id: string;
	title: string;
	description: string;
	status: "pending" | "running" | "passed" | "failed";
	assignee: string;
	priority: "low" | "medium" | "high";
	createdAt: string;
	updatedAt: string;
}

export async function fetchTestCases(): Promise<TestCase[]> {
	const res = await fetch(`${API_BASE_URL}/api/test-cases`);
	if (!res.ok) throw new Error("Failed to fetch test cases");
	const data = await res.json();
	return data.data;
}

export async function createTestCase(
	testCase: Partial<TestCase>,
): Promise<TestCase> {
	const res = await fetch(`${API_BASE_URL}/api/test-cases`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(testCase),
	});
	if (!res.ok) throw new Error("Failed to create test case");
	const data = await res.json();
	return data.data;
}

export interface Category {
	_id: string;
	name: string;
	slug: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Product {
	_id: string;
	name: string;
	slug: string;
	description?: string;
	price: number;
	category: string | Pick<Category, "_id" | "name" | "slug">;
	sku?: string;
	quantity: number;
	images?: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ProductListData {
	products: Product[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface ProductPayload {
	name: string;
	price: number;
	category: string;
	description?: string;
	sku?: string;
	quantity?: number;
	images?: string[];
	isActive?: boolean;
}

export interface CategoryPayload {
	name: string;
	description?: string;
	isActive?: boolean;
}

const parseError = async (res: Response, fallback: string) => {
	try {
		const body = (await res.json()) as { message?: string };
		return body.message || fallback;
	} catch {
		return fallback;
	}
};

export const toProductSlug = (value: string) => {
	const normalized = String(value)
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{M}+/gu, "")
		.replace(/đ/g, "d")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return normalized || "san-pham";
};

export async function fetchProducts(params?: {
	page?: number;
	limit?: number;
	sort?: string;
}): Promise<ProductListData> {
	const query = new URLSearchParams();
	if (params?.page) query.set("page", String(params.page));
	if (params?.limit) query.set("limit", String(params.limit));
	if (params?.sort) query.set("sort", params.sort);

	const suffix = query.toString() ? `?${query.toString()}` : "";
	const res = await fetch(`${API_BASE_URL}/api/products${suffix}`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải danh sách sản phẩm"));
	}

	const body = (await res.json()) as ApiResponse<ProductListData>;
	return body.data;
}

export async function fetchProductById(id: string): Promise<Product> {
	const res = await fetch(
		`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`,
		{
			credentials: "include",
			cache: "no-store",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải sản phẩm"));
	}

	const body = (await res.json()) as ApiResponse<Product>;
	return body.data;
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
	const res = await fetch(
		`${API_BASE_URL}/api/products/slug/${encodeURIComponent(slug)}`,
		{
			credentials: "include",
			cache: "no-store",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải sản phẩm theo slug"));
	}

	const body = (await res.json()) as ApiResponse<Product>;
	return body.data;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
	const res = await fetch(`${API_BASE_URL}/api/products`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tạo sản phẩm"));
	}

	const body = (await res.json()) as ApiResponse<Product>;
	return body.data;
}

export async function updateProduct(
	id: string,
	payload: Partial<ProductPayload>,
): Promise<Product> {
	const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể cập nhật sản phẩm"));
	}

	const body = (await res.json()) as ApiResponse<Product>;
	return body.data;
}

export async function deleteProduct(id: string): Promise<void> {
	const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể xóa sản phẩm"));
	}
}

export async function fetchCategories(): Promise<Category[]> {
	const res = await fetch(`${API_BASE_URL}/api/categories`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải danh mục"));
	}

	const body = (await res.json()) as ApiResponse<Category[]>;
	return body.data;
}

export async function createCategory(
	payload: CategoryPayload,
): Promise<Category> {
	const res = await fetch(`${API_BASE_URL}/api/categories`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tạo danh mục"));
	}

	const body = (await res.json()) as ApiResponse<Category>;
	return body.data;
}

export async function updateCategory(
	id: string,
	payload: Partial<CategoryPayload>,
): Promise<Category> {
	const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể cập nhật danh mục"));
	}

	const body = (await res.json()) as ApiResponse<Category>;
	return body.data;
}

export async function deleteCategory(id: string): Promise<void> {
	const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể xóa danh mục"));
	}
}
