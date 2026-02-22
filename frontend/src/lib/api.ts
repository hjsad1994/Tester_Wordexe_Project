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
	avgRating: number;
	reviewCount: number;
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

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	bio: string;
	avatar: string | null;
	role: "admin" | "user";
}

export type OrderStatus =
	| "pending"
	| "paid"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled";

export interface OrderItem {
	product: string | Pick<Product, "_id" | "name" | "slug">;
	productName: string;
	productPrice: number;
	quantity: number;
	image?: string;
}

export interface OrderCustomerInfo {
	fullName: string;
	phone: string;
	address: string;
	province?: string;
	district?: string;
	ward?: string;
	notes?: string;
}

export interface Order {
	_id: string;
	orderNumber: string;
	publicAccessToken?: string;
	user?:
		| string
		| {
				_id: string;
				name: string;
				email: string;
		  }
		| null;
	items: OrderItem[];
	subtotal: number;
	shippingFee: number;
	couponCode: string | null;
	discountAmount: number;
	total: number;
	customerInfo: OrderCustomerInfo;
	paymentMethod: "cod" | "momo";
	status: OrderStatus;
	deletedAt: string | null;
	deleteReason?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateOrderPayload {
	items: Array<{
		productId: string;
		quantity: number;
	}>;
	customerInfo: OrderCustomerInfo;
	paymentMethod: "cod" | "momo";
	shippingFee?: number;
	couponCode?: string;
}

// ─── Coupons ────────────────────────────────────────────────────────

export type CouponDiscountType =
	| "percentage"
	| "fixed_amount"
	| "free_shipping";

export interface Coupon {
	_id: string;
	code: string;
	name: string;
	description: string;
	discountType: CouponDiscountType;
	discountValue: number;
	maximumDiscount: number | null;
	minimumOrderAmount: number;
	usageLimit: number | null;
	usageCount: number;
	perUserLimit: number;
	isActive: boolean;
	validFrom: string | null;
	validUntil: string | null;
	isCurrentlyValid: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CouponPayload {
	code: string;
	name: string;
	description?: string;
	discountType: CouponDiscountType;
	discountValue: number;
	maximumDiscount?: number | null;
	minimumOrderAmount?: number;
	usageLimit?: number | null;
	perUserLimit?: number;
	isActive?: boolean;
	validFrom?: string | null;
	validUntil?: string | null;
}

export interface ValidateCouponResponse {
	valid: boolean;
	coupon: {
		_id: string;
		code: string;
		name: string;
		discountType: CouponDiscountType;
		discountValue: number;
		maximumDiscount: number | null;
	};
	discountAmount: number;
}

// ─── Reviews ────────────────────────────────────────────────────────

export interface ReviewImage {
	publicId: string;
	url: string;
}

export interface ReviewUser {
	_id: string;
	name: string;
	email: string;
	avatar: string | null;
}

export interface Review {
	_id: string;
	product: string;
	user: ReviewUser;
	rating: number;
	comment: string;
	images: ReviewImage[];
	helpfulCount: number;
	isLiked: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface RatingDistribution {
	5: number;
	4: number;
	3: number;
	2: number;
	1: number;
}

export interface ReviewSummary {
	avgRating: number;
	reviewCount: number;
	distribution: RatingDistribution;
	userHasReviewed: boolean;
}

export interface ReviewListData {
	reviews: Review[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
	summary: ReviewSummary;
}

interface OrderListData {
	orders: Order[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
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

/** @deprecated Use uploadProductImages() instead */
export async function uploadProductImage(
	id: string,
	file: File,
): Promise<Product> {
	return uploadProductImages(id, [file]);
}

export async function uploadProductImages(
	id: string,
	files: File[],
): Promise<Product> {
	const formData = new FormData();
	for (const file of files) {
		formData.append("images", file);
	}

	const res = await fetch(`${API_BASE_URL}/api/products/${id}/images`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải ảnh sản phẩm"));
	}

	const body = (await res.json()) as ApiResponse<Product>;
	return body.data;
}

export async function deleteProductImage(
	id: string,
	imageUrl: string,
): Promise<Product> {
	const res = await fetch(`${API_BASE_URL}/api/products/${id}/images`, {
		method: "DELETE",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ imageUrl }),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể xóa ảnh sản phẩm"));
	}

	const body = (await res.json()) as ApiResponse<Product>;
	return body.data;
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

export async function fetchMyProfile(): Promise<UserProfile> {
	const res = await fetch(`${API_BASE_URL}/api/users/me`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải thông tin tài khoản"));
	}

	const body = (await res.json()) as ApiResponse<UserProfile>;
	return body.data;
}

export async function updateMyProfile(payload: {
	name: string;
	phone: string;
	address: string;
	bio: string;
}): Promise<UserProfile> {
	const res = await fetch(`${API_BASE_URL}/api/users/me`, {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể cập nhật hồ sơ"));
	}

	const body = (await res.json()) as ApiResponse<UserProfile>;
	return body.data;
}

export async function uploadAvatar(file: File): Promise<UserProfile> {
	const formData = new FormData();
	formData.append("avatar", file);

	const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
		method: "POST",
		credentials: "include",
		body: formData,
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải lên ảnh đại diện"));
	}

	const body = (await res.json()) as ApiResponse<UserProfile>;
	return body.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
	const res = await fetch(`${API_BASE_URL}/api/orders`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tạo đơn hàng"));
	}

	const body = (await res.json()) as ApiResponse<Order>;
	return body.data;
}

export async function fetchOrderById(
	id: string,
	accessToken: string,
): Promise<Order> {
	const query = new URLSearchParams({ token: accessToken });
	const res = await fetch(
		`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}?${query.toString()}`,
		{
			credentials: "include",
			cache: "no-store",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải đơn hàng"));
	}

	const body = (await res.json()) as ApiResponse<Order>;
	return body.data;
}

export async function fetchAdminOrders(params?: {
	page?: number;
	limit?: number;
	status?: OrderStatus;
	includeDeleted?: boolean;
}): Promise<OrderListData> {
	const query = new URLSearchParams();
	if (params?.page) query.set("page", String(params.page));
	if (params?.limit) query.set("limit", String(params.limit));
	if (params?.status) query.set("status", params.status);
	if (params?.includeDeleted) query.set("includeDeleted", "true");

	const suffix = query.toString() ? `?${query.toString()}` : "";
	const res = await fetch(`${API_BASE_URL}/api/orders${suffix}`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải danh sách đơn hàng"));
	}

	const body = (await res.json()) as ApiResponse<OrderListData>;
	return body.data;
}

export async function updateOrderStatus(
	id: string,
	status: OrderStatus,
): Promise<Order> {
	const res = await fetch(
		`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}/status`,
		{
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		},
	);

	if (!res.ok) {
		throw new Error(
			await parseError(res, "Không thể cập nhật trạng thái đơn hàng"),
		);
	}

	const body = (await res.json()) as ApiResponse<Order>;
	return body.data;
}

export async function softDeleteOrder(
	id: string,
	reason: string,
): Promise<Order> {
	const res = await fetch(
		`${API_BASE_URL}/api/orders/${encodeURIComponent(id)}`,
		{
			method: "DELETE",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ reason }),
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể lưu trữ đơn hàng"));
	}

	const body = (await res.json()) as ApiResponse<Order>;
	return body.data;
}

// ─── Coupon API ─────────────────────────────────────────────────────

export async function fetchCouponsApi(): Promise<Coupon[]> {
	const res = await fetch(`${API_BASE_URL}/api/coupons`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(
			await parseError(res, "Không thể tải danh sách mã khuyến mãi"),
		);
	}

	const body = (await res.json()) as ApiResponse<Coupon[]>;
	return body.data;
}

export async function fetchAvailableCouponsApi(): Promise<Coupon[]> {
	const res = await fetch(`${API_BASE_URL}/api/coupons/available`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải mã khuyến mãi"));
	}

	const body = (await res.json()) as ApiResponse<Coupon[]>;
	return body.data;
}

export async function createCouponApi(payload: CouponPayload): Promise<Coupon> {
	const res = await fetch(`${API_BASE_URL}/api/coupons`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tạo mã khuyến mãi"));
	}

	const body = (await res.json()) as ApiResponse<Coupon>;
	return body.data;
}

export async function updateCouponApi(
	id: string,
	payload: Partial<CouponPayload>,
): Promise<Coupon> {
	const res = await fetch(
		`${API_BASE_URL}/api/coupons/${encodeURIComponent(id)}`,
		{
			method: "PUT",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể cập nhật mã khuyến mãi"));
	}

	const body = (await res.json()) as ApiResponse<Coupon>;
	return body.data;
}

export async function deleteCouponApi(id: string): Promise<void> {
	const res = await fetch(
		`${API_BASE_URL}/api/coupons/${encodeURIComponent(id)}`,
		{
			method: "DELETE",
			credentials: "include",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể xóa mã khuyến mãi"));
	}
}

export async function validateCouponApi(
	code: string,
	subtotal: number,
): Promise<ValidateCouponResponse> {
	const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code, subtotal }),
	});

	if (!res.ok) {
		throw new Error(await parseError(res, "Mã khuyến mãi không hợp lệ"));
	}

	const body = (await res.json()) as ApiResponse<ValidateCouponResponse>;
	return body.data;
}

// ─── Review API ─────────────────────────────────────────────────────

export async function fetchReviews(
	productId: string,
	params?: { page?: number; limit?: number },
): Promise<ReviewListData> {
	const query = new URLSearchParams();
	if (params?.page) query.set("page", String(params.page));
	if (params?.limit) query.set("limit", String(params.limit));

	const suffix = query.toString() ? `?${query.toString()}` : "";
	const res = await fetch(
		`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews${suffix}`,
		{
			credentials: "include",
			cache: "no-store",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể tải đánh giá"));
	}

	const body = (await res.json()) as ApiResponse<ReviewListData>;
	return body.data;
}

export async function createReview(
	productId: string,
	data: { rating: number; comment: string },
	images: File[] = [],
): Promise<Review> {
	const formData = new FormData();
	formData.append("rating", String(data.rating));
	formData.append("comment", data.comment);
	for (const image of images) {
		formData.append("images", image);
	}

	const res = await fetch(
		`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`,
		{
			method: "POST",
			credentials: "include",
			cache: "no-store",
			body: formData,
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể gửi đánh giá"));
	}

	const body = (await res.json()) as ApiResponse<Review>;
	return body.data;
}

export async function deleteReview(reviewId: string): Promise<void> {
	const res = await fetch(
		`${API_BASE_URL}/api/reviews/${encodeURIComponent(reviewId)}`,
		{
			method: "DELETE",
			credentials: "include",
			cache: "no-store",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể xóa đánh giá"));
	}
}

export async function toggleReviewHelpful(
	reviewId: string,
): Promise<{ helpfulCount: number; isLiked: boolean }> {
	const res = await fetch(
		`${API_BASE_URL}/api/reviews/${encodeURIComponent(reviewId)}/helpful`,
		{
			method: "POST",
			credentials: "include",
			cache: "no-store",
		},
	);

	if (!res.ok) {
		throw new Error(await parseError(res, "Không thể cập nhật"));
	}

	const body = (await res.json()) as ApiResponse<{
		helpfulCount: number;
		isLiked: boolean;
	}>;
	return body.data;
}
