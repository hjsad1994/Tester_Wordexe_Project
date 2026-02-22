"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
	ArrowRightIcon,
	CartIcon,
	GiftIcon,
	HeartIcon,
	HeartOutlineIcon,
	ShieldIcon,
	SparkleIcon,
	StarIcon,
	TruckIcon,
} from "@/components/icons";
import { productIllustrations } from "@/components/icons/ProductIllustrations";
import ProductCard, { type Product } from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
	type Product as ApiProduct,
	fetchProductById,
	fetchProductBySlug,
	fetchProducts,
	toProductSlug,
} from "@/lib/api";

const categoryIllustrationMap: Record<string, Product["illustration"]> = {
	"Quần áo": "clothes",
	"Bình sữa": "bottle",
	"Đồ chơi": "teddy",
	"Tã & Bỉm": "diaper",
	"Xe đẩy": "stroller",
	"Giường & Nôi": "crib",
	"Chăm sóc": "skincare",
	"Giày dép": "shoes",
	"Phụ kiện": "pacifier",
	"Ăn dặm": "food",
};

const mapApiProductToCard = (product: ApiProduct): Product => {
	const categoryName =
		typeof product.category === "string" ? "" : product.category?.name || "";

	return {
		id: product._id,
		slug: product.slug || toProductSlug(product.name),
		name: product.name,
		description: product.description,
		price: product.price,
		quantity: product.quantity,
		imageUrl: product.images?.[0],
		imageUrls: product.images ?? [],
		illustration: categoryIllustrationMap[categoryName] || "teddy",
		rating: product.avgRating || 0,
		reviews: product.reviewCount || 0,
		category: categoryName,
	};
};

// All products data
const allProducts: Product[] = [
	{
		id: "1",
		name: "Bộ quần áo Cotton Organic cho bé sơ sinh",
		price: 299000,
		originalPrice: 399000,
		illustration: "clothes",
		rating: 4.9,
		reviews: 256,
		badge: "bestseller",
		category: "Quần áo",
	},
	{
		id: "2",
		name: "Bình sữa chống đầy hơi Pigeon",
		price: 189000,
		illustration: "bottle",
		rating: 4.8,
		reviews: 189,
		badge: "new",
		category: "Bình sữa",
	},
	{
		id: "3",
		name: "Gấu bông Teddy Bear siêu mềm mại",
		price: 159000,
		originalPrice: 219000,
		illustration: "teddy",
		rating: 4.7,
		reviews: 342,
		badge: "sale",
		category: "Đồ chơi",
	},
	{
		id: "4",
		name: "Tã dán cao cấp Bobby Extra Soft",
		price: 249000,
		illustration: "diaper",
		rating: 4.9,
		reviews: 521,
		badge: "bestseller",
		category: "Tã & Bỉm",
	},
	{
		id: "5",
		name: "Xe đẩy gấp gọn đa năng",
		price: 2490000,
		originalPrice: 2990000,
		illustration: "stroller",
		rating: 4.8,
		reviews: 98,
		badge: "sale",
		category: "Xe đẩy",
	},
	{
		id: "6",
		name: "Nôi điện tự động ru ngủ",
		price: 1890000,
		illustration: "crib",
		rating: 4.6,
		reviews: 156,
		badge: "new",
		category: "Giường & Nôi",
	},
	{
		id: "7",
		name: "Bộ chăm sóc da cho bé Johnson",
		price: 329000,
		illustration: "skincare",
		rating: 4.9,
		reviews: 412,
		category: "Chăm sóc",
	},
	{
		id: "8",
		name: "Giày tập đi mềm chống trơn",
		price: 199000,
		originalPrice: 259000,
		illustration: "shoes",
		rating: 4.7,
		reviews: 287,
		badge: "sale",
		category: "Giày dép",
	},
	{
		id: "9",
		name: "Ti giả silicon mềm cho bé",
		price: 89000,
		illustration: "pacifier",
		rating: 4.5,
		reviews: 198,
		category: "Phụ kiện",
	},
	{
		id: "10",
		name: "Lục lạc đồ chơi phát triển giác quan",
		price: 129000,
		illustration: "rattle",
		rating: 4.6,
		reviews: 145,
		badge: "new",
		category: "Đồ chơi",
	},
	{
		id: "11",
		name: "Bột ăn dặm Gerber organic",
		price: 175000,
		illustration: "food",
		rating: 4.8,
		reviews: 320,
		badge: "bestseller",
		category: "Ăn dặm",
	},
	{
		id: "12",
		name: "Áo khoác giữ ấm lông cừu",
		price: 450000,
		originalPrice: 590000,
		illustration: "clothes",
		rating: 4.7,
		reviews: 89,
		badge: "sale",
		category: "Quần áo",
	},
];

// Extended product details
const productExtras: Record<
	string,
	{
		features: string[];
		colors?: string[];
		sizes?: string[];
	}
> = {
	"1": {
		features: [
			"100% Cotton Organic được chứng nhận GOTS",
			"Không chất tẩy độc hại",
			"Nút bấm chống gỉ sét",
			"Giặt máy được ở 40°C",
			"Thiết kế thoáng mát cho mùa hè",
			"Co giãn 4 chiều thoải mái",
		],
		colors: ["Trắng | #FFFFFF", "Hồng nhạt | #FFC0CB", "Xanh mint | #98FF98"],
		sizes: ["S (0-3M)", "M (3-6M)", "L (6-9M)", "XL (9-12M)"],
	},
	"2": {
		features: [
			"Công nghệ van khí chống đầy hơi",
			"Núm ti Peristaltic Plus",
			"Chất liệu PP an toàn, không BPA",
			"Dễ vệ sinh, có thể tiệt trùng",
			"Vạch chia ml rõ ràng",
			"Nắp đậy kín chống tràn",
		],
	},
	"3": {
		features: [
			"Chất liệu plush siêu mềm",
			"Bông nhồi kháng khuẩn",
			"An toàn cho bé từ sơ sinh",
			"Có thể giặt máy",
			"Không rụng lông",
			"Đạt tiêu chuẩn EN71",
		],
		colors: ["Nâu | #8B4513", "Kem | #FFFDD0", "Hồng | #FFB6C1"],
	},
	default: {
		features: [
			"Chất lượng cao cấp",
			"An toàn cho bé",
			"Thiết kế tiện lợi",
			"Đảm bảo chính hãng",
			"Bảo hành đổi trả",
			"Hỗ trợ 24/7",
		],
	},
};

export default function ProductDetailPage() {
	const params = useParams();
	const router = useRouter();
	const routeParam = decodeURIComponent((params.id as string) || "");

	const [quantity, setQuantity] = useState(1);
	const [activeTab, setActiveTab] = useState<"description" | "reviews">(
		"description",
	);
	const [selectedColor, setSelectedColor] = useState(0);
	const [selectedSize, setSelectedSize] = useState(0);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [product, setProduct] = useState<Product | null>(null);
	const [catalogProducts, setCatalogProducts] =
		useState<Product[]>(allProducts);
	const [isProductLoading, setIsProductLoading] = useState(true);
	const { addToCart, setBuyNowItem } = useCart();
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

	useEffect(() => {
		let cancelled = false;

		const loadProduct = async () => {
			setIsProductLoading(true);

			const catalogPromise = fetchProducts({ limit: 100 })
				.then((productData) => productData.products.map(mapApiProductToCard))
				.catch(() => allProducts);

			if (!routeParam) {
				if (!cancelled) {
					setCatalogProducts(allProducts);
					setProduct(null);
					setIsProductLoading(false);
				}
				return;
			}

			const normalizedRouteParam = routeParam.toLowerCase();
			let products = allProducts;

			let resolvedProduct: Product | null = null;

			try {
				const productBySlug = await fetchProductBySlug(routeParam);
				resolvedProduct = mapApiProductToCard(productBySlug);
			} catch {
				resolvedProduct = null;
			}

			if (!resolvedProduct) {
				try {
					const productById = await fetchProductById(routeParam);
					resolvedProduct = mapApiProductToCard(productById);
				} catch {
					resolvedProduct = null;
				}
			}

			if (!resolvedProduct) {
				const fallbackFromStatic =
					allProducts.find(
						(item) =>
							item.id === routeParam ||
							item.slug === routeParam ||
							item.slug?.toLowerCase() === normalizedRouteParam,
					) || null;
				resolvedProduct = fallbackFromStatic;
			}

			if (!cancelled) {
				setProduct(resolvedProduct);
				if (resolvedProduct) {
					setIsProductLoading(false);
				}
			}

			products = await catalogPromise;
			const matchedFromCatalog =
				products.find(
					(item) =>
						item.id === routeParam ||
						item.slug === routeParam ||
						item.slug?.toLowerCase() === normalizedRouteParam,
				) || null;

			if (!cancelled) {
				setCatalogProducts(products);
				if (!resolvedProduct && matchedFromCatalog) {
					setProduct(matchedFromCatalog);
				}
				setIsProductLoading(false);
			}
		};

		void loadProduct();

		return () => {
			cancelled = true;
		};
	}, [routeParam]);

	// Reset selected image when product changes (adjusting state during render — React-recommended pattern)
	const [prevProductId, setPrevProductId] = useState(product?.id);
	if (product?.id !== prevProductId) {
		setPrevProductId(product?.id);
		setSelectedImageIndex(0);
	}

	const extras = product
		? productExtras[product.id] || productExtras.default
		: productExtras.default;
	const colorOptions = extras.colors || [];
	const parsedColorOptions = colorOptions.map((color) => {
		const [name, hex] = color.split("|").map((part) => part.trim());
		return {
			name,
			hex: hex || name,
		};
	});
	const sizeOptions = extras.sizes || [];
	const selectedColorIndex =
		parsedColorOptions.length > 0
			? Math.min(selectedColor, parsedColorOptions.length - 1)
			: 0;
	const selectedSizeIndex =
		sizeOptions.length > 0 ? Math.min(selectedSize, sizeOptions.length - 1) : 0;

	const relatedProducts = useMemo(() => {
		if (!product) {
			return [];
		}

		return catalogProducts
			.filter(
				(item) => item.category === product.category && item.id !== product.id,
			)
			.slice(0, 4);
	}, [catalogProducts, product]);

	const availableQuantity =
		typeof product?.quantity === "number" && Number.isFinite(product.quantity)
			? Math.max(0, Math.floor(product.quantity))
			: null;

	if (isProductLoading) {
		return (
			<div className="min-h-screen bg-[var(--warm-white)]">
				<Header />
				<div className="max-w-7xl mx-auto px-4 py-20">
					<div className="animate-pulse space-y-4">
						<div className="h-8 w-60 rounded-lg bg-pink-100" />
						<div className="h-[420px] rounded-3xl bg-pink-100" />
						<div className="h-6 w-2/3 rounded-lg bg-pink-100" />
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (!product) {
		return (
			<div className="min-h-screen bg-[var(--warm-white)]">
				<Header />
				<div className="max-w-7xl mx-auto px-4 py-20 text-center">
					<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
						<SparkleIcon size={40} className="text-pink-300" />
					</div>
					<h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
						Không tìm thấy sản phẩm
					</h1>
					<p className="text-[var(--text-secondary)] mb-6">
						Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.
					</p>
					<Link
						href="/products"
						className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
					>
						Quay lại cửa hàng
						<ArrowRightIcon size={18} />
					</Link>
				</div>
				<Footer />
			</div>
		);
	}

	const liked = isInWishlist(product.id);
	const IllustrationComponent = productIllustrations[product.illustration];
	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100,
			)
		: 0;
	const isOutOfStock = availableQuantity === 0;
	const stockStatusLabel =
		availableQuantity === null
			? "Đang cập nhật tồn kho"
			: isOutOfStock
				? "Hết hàng"
				: "Còn hàng";
	const stockCountLabel =
		availableQuantity === null
			? "Đang cập nhật tồn kho"
			: isOutOfStock
				? "Sản phẩm tạm hết hàng"
				: `Còn ${availableQuantity} sản phẩm`;
	const selectedQuantity =
		availableQuantity === null
			? quantity
			: Math.min(quantity, Math.max(1, availableQuantity));

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("vi-VN").format(price) + "đ";
	};

	return (
		<div className="min-h-screen bg-[var(--warm-white)]">
			<Header />
			{/* Breadcrumb */}
			<div className="bg-white border-b border-pink-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
					<nav className="flex items-center gap-2 text-sm">
						<Link
							href="/"
							className="text-[var(--text-muted)] hover:text-pink-500 transition-colors"
						>
							Trang chủ
						</Link>
						<span className="text-[var(--text-muted)]">/</span>
						<Link
							href="/products"
							className="text-[var(--text-muted)] hover:text-pink-500 transition-colors"
						>
							Sản phẩm
						</Link>
						<span className="text-[var(--text-muted)]">/</span>
						<Link
							href={`/products?category=${product.category}`}
							className="text-[var(--text-muted)] hover:text-pink-500 transition-colors"
						>
							{product.category}
						</Link>
						<span className="text-[var(--text-muted)]">/</span>
						<span className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">
							{product.name}
						</span>
					</nav>
				</div>
			</div>
			{/* Main Product Section */}
			<section className="py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
						{/* Left - Product Image */}
						<div className="relative">
							<div className="sticky top-24">
								<div className="relative aspect-square rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 overflow-hidden">
									{/* Decorative elements */}
									<div className="absolute top-8 left-8 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl" />
									<div className="absolute bottom-8 right-8 w-40 h-40 bg-purple-200/30 rounded-full blur-2xl" />
									<div className="absolute top-1/4 right-8 animate-float">
										<SparkleIcon size={24} className="text-pink-300" />
									</div>
									<div className="absolute bottom-1/4 left-8 animate-float-reverse">
										<SparkleIcon size={18} className="text-purple-300" />
									</div>

									{/* Badge */}
									{product.badge && (
										<div
											className={`absolute top-6 left-6 z-10 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${
												product.badge === "new"
													? "bg-blue-500 text-white"
													: product.badge === "sale"
														? "bg-red-500 text-white"
														: "bg-amber-500 text-white"
											}`}
										>
											{product.badge === "new"
												? "Mới"
												: product.badge === "sale"
													? `-${discount}%`
													: "Bán chạy"}
										</div>
									)}

									{/* Wishlist */}
									<button
										onClick={() => {
											if (liked) {
												removeFromWishlist(product.id);
												toast("Đã xóa khỏi danh sách yêu thích", {
													id: `wishlist-${product.id}`,
												});
											} else {
												addToWishlist(product);
												toast.success("Đã thêm vào danh sách yêu thích", {
													id: `wishlist-${product.id}`,
													description: product.name,
													action: {
														label: "Xem danh sách",
														onClick: () => router.push("/wishlist"),
													},
												});
											}
										}}
										aria-label={
											liked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
										}
										className={`absolute top-6 right-6 z-10 p-3 rounded-full transition-all shadow-lg ${
											liked
												? "bg-pink-500 text-white"
												: "bg-white text-pink-400 hover:bg-pink-500 hover:text-white"
										}`}
									>
										{liked ? (
											<HeartIcon size={24} />
										) : (
											<HeartOutlineIcon size={24} />
										)}
									</button>

									{product.imageUrls && product.imageUrls.length > 0 ? (
										<div className="absolute inset-0">
											<Image
												src={
													product.imageUrls[
														Math.min(
															selectedImageIndex,
															product.imageUrls.length - 1,
														)
													]
												}
												alt={product.name}
												fill
												sizes="(max-width: 1024px) 100vw, 50vw"
												className="object-cover"
												priority
											/>
										</div>
									) : (
										<div className="absolute inset-0 flex items-center justify-center p-12">
											<div className="animate-float-slow">
												<IllustrationComponent size={280} />
											</div>
										</div>
									)}
								</div>

								{/* Thumbnails — only shown when multiple images exist */}
								{product.imageUrls && product.imageUrls.length > 1 && (
									<div className="flex gap-3 mt-4">
										{product.imageUrls.map((url, i) => (
											<button
												key={i}
												onClick={() => setSelectedImageIndex(i)}
												className={`relative w-20 h-20 rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${
													i === selectedImageIndex
														? "border-pink-400 ring-2 ring-pink-200"
														: "border-pink-100 hover:border-pink-300"
												}`}
											>
												<Image
													src={url}
													alt={`${product.name} - ảnh ${i + 1}`}
													fill
													sizes="80px"
													className="object-cover"
												/>
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Right - Product Info */}
						<div>
							{/* Category */}
							<Link
								href={`/products?category=${product.category}`}
								className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-sm font-medium mb-4 hover:bg-pink-200 transition-colors"
							>
								{product.category}
							</Link>

							{/* Title */}
							<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
								{product.name}
							</h1>

							{/* Rating */}
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-1">
									{[...Array(5)].map((_, i) => (
										<StarIcon
											key={i}
											size={20}
											className={
												i < Math.floor(product.rating)
													? "text-amber-400"
													: "text-gray-200"
											}
										/>
									))}
								</div>
								<span className="text-lg font-semibold text-[var(--text-primary)]">
									{product.rating}
								</span>
								<span className="text-[var(--text-muted)]">|</span>
								<span className="text-[var(--text-secondary)]">
									{product.reviews} đánh giá
								</span>
								<span className="text-[var(--text-muted)]">|</span>
								<span
									className={`font-medium ${isOutOfStock ? "text-red-600" : availableQuantity === null ? "text-amber-600" : "text-green-600"}`}
								>
									{stockStatusLabel}
								</span>
							</div>

							{/* Price */}
							<div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-pink-100">
								<span className="text-3xl sm:text-4xl font-bold text-pink-500">
									{formatPrice(product.price)}
								</span>
								{product.originalPrice && (
									<>
										<span className="text-xl text-[var(--text-muted)] line-through">
											{formatPrice(product.originalPrice)}
										</span>
										<span className="px-3 py-1 rounded-lg bg-red-100 text-red-500 text-sm font-bold">
											Tiết kiệm{" "}
											{formatPrice(product.originalPrice - product.price)}
										</span>
									</>
								)}
							</div>

							{/* Short Description */}
							<p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
								{product.description || "Chưa có mô tả cho sản phẩm này"}
							</p>

							{/* Colors */}
							{colorOptions.length > 0 && (
								<div className="mb-6">
									<label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
										Màu sắc:{" "}
										<span className="font-normal text-[var(--text-secondary)]">
											{parsedColorOptions[selectedColorIndex].name}
										</span>
									</label>
									<div className="flex gap-3">
										{parsedColorOptions.map((color, i) => (
											<button
												key={i}
												onClick={() => setSelectedColor(i)}
												className={`w-10 h-10 rounded-full border-2 transition-all ${
													selectedColorIndex === i
														? "border-pink-500 ring-2 ring-pink-200"
														: "border-gray-200 hover:border-pink-300"
												}`}
												style={{ backgroundColor: color.hex }}
												title={color.name}
											/>
										))}
									</div>
								</div>
							)}

							{/* Sizes */}
							{sizeOptions.length > 0 && (
								<div className="mb-6">
									<label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
										Kích thước:
									</label>
									<div className="flex flex-wrap gap-2">
										{sizeOptions.map((size, i) => (
											<button
												key={i}
												onClick={() => setSelectedSize(i)}
												className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
													selectedSizeIndex === i
														? "border-pink-500 bg-pink-50 text-pink-600"
														: "border-gray-200 text-[var(--text-secondary)] hover:border-pink-300"
												}`}
											>
												{size}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Quantity */}
							<div className="mb-6">
								<label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
									Số lượng:
								</label>
								<div className="flex items-center gap-4">
									<div className="flex items-center border-2 border-pink-200 rounded-xl overflow-hidden">
										<button
											onClick={() =>
												setQuantity(Math.max(1, selectedQuantity - 1))
											}
											disabled={isOutOfStock}
											className="w-12 h-12 flex items-center justify-center text-[var(--text-secondary)] hover:bg-pink-50 transition-colors text-xl focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
											aria-label="Giảm số lượng"
										>
											−
										</button>
										<span className="w-16 text-center font-semibold text-[var(--text-primary)] text-lg">
											{selectedQuantity}
										</span>
										<button
											onClick={() => {
												setQuantity((currentQuantity) => {
													if (availableQuantity === null) {
														return currentQuantity + 1;
													}
													return Math.min(
														availableQuantity,
														currentQuantity + 1,
													);
												});
											}}
											disabled={
												isOutOfStock ||
												(availableQuantity !== null &&
													selectedQuantity >= availableQuantity)
											}
											className="w-12 h-12 flex items-center justify-center text-[var(--text-secondary)] hover:bg-pink-50 transition-colors text-xl focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
											aria-label="Tăng số lượng"
										>
											+
										</button>
									</div>
									<span className="text-sm text-[var(--text-muted)]">
										{stockCountLabel}
									</span>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-4 mb-8">
								<button
									onClick={() => {
										if (isOutOfStock) {
											return;
										}
										let isNew = false;
										let finalQuantity = 0;
										for (let i = 0; i < selectedQuantity; i++) {
											const result = addToCart({
												id: product.id,
												name: product.name,
												price: product.price,
												image: product.illustration,
												imageUrl: product.imageUrl,
											});
											if (i === 0) isNew = result.isNew;
											finalQuantity = result.newQuantity;
										}
										toast.success(
											isNew
												? finalQuantity > 1
													? `Đã thêm vào giỏ hàng (×${finalQuantity})`
													: "Đã thêm vào giỏ hàng"
												: `Đã cập nhật giỏ hàng (×${finalQuantity})`,
											{
												id: `cart-${product.id}`,
												description: product.name,
												action: {
													label: "Xem giỏ hàng",
													onClick: () => router.push("/cart"),
												},
											},
										);
									}}
									disabled={isOutOfStock}
									className="flex-1 py-4 px-6 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-pink-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
								>
									<CartIcon size={22} />
									<span>Thêm vào giỏ hàng</span>
								</button>
								<button
									onClick={() => {
										if (isOutOfStock) {
											return;
										}
										setBuyNowItem({
											id: product.id,
											name: product.name,
											price: product.price,
											image: product.illustration,
											imageUrl: product.imageUrl,
											quantity: selectedQuantity,
										});
										router.push("/checkout?buyNow=true");
									}}
									disabled={isOutOfStock}
									className="py-4 px-8 border-2 border-pink-400 text-pink-500 font-semibold rounded-2xl hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
								>
									Mua ngay
								</button>
							</div>

							{/* Trust Badges */}
							<div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
										<TruckIcon size={24} className="text-pink-500" />
									</div>
									<div>
										<p className="text-sm font-semibold text-[var(--text-primary)]">
											Miễn phí ship
										</p>
										<p className="text-xs text-[var(--text-muted)]">
											Đơn từ 500K
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
										<ShieldIcon size={24} className="text-pink-500" />
									</div>
									<div>
										<p className="text-sm font-semibold text-[var(--text-primary)]">
											Đổi trả
										</p>
										<p className="text-xs text-[var(--text-muted)]">
											Trong 30 ngày
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
										<GiftIcon size={24} className="text-pink-500" />
									</div>
									<div>
										<p className="text-sm font-semibold text-[var(--text-primary)]">
											Quà tặng
										</p>
										<p className="text-xs text-[var(--text-muted)]">Kèm theo</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="py-8 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Tab Headers */}
					<div className="flex gap-1 border-b border-pink-100 mb-8">
						{[
							{ id: "description", label: "Mô tả sản phẩm" },
							{ id: "reviews", label: `Đánh giá (${product.reviews})` },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as typeof activeTab)}
								className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
									activeTab === tab.id
										? "text-pink-500"
										: "text-[var(--text-muted)] hover:text-pink-400"
								}`}
							>
								{tab.label}
								{activeTab === tab.id && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
								)}
							</button>
						))}
					</div>

					{/* Tab Content */}
					<div className="max-w-4xl">
						{activeTab === "description" && (
							<div className="space-y-6 animate-fadeIn">
								<p className="text-[var(--text-secondary)] leading-relaxed text-lg">
									{product.description || "Chưa có mô tả cho sản phẩm này"}
								</p>
								<div>
									<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
										Tính năng nổi bật
									</h3>
									<div className="grid sm:grid-cols-2 gap-3">
										{extras.features.map((feature, i) => (
											<div
												key={i}
												className="flex items-start gap-3 p-3 rounded-xl bg-pink-50/50"
											>
												<span className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
													<svg
														className="w-3.5 h-3.5 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</span>
												<span className="text-[var(--text-secondary)]">
													{feature}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{activeTab === "reviews" && (
							<div>
								<ProductReviews productId={product.id} />
							</div>
						)}
					</div>
				</div>
			</section>
			{relatedProducts.length > 0 && (
				<section className="py-12 bg-gradient-to-b from-white to-pink-50/30">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-2xl font-bold text-[var(--text-primary)]">
								Sản phẩm liên quan
							</h2>
							<Link
								href={`/products?category=${product.category}`}
								className="text-pink-500 font-medium hover:underline flex items-center gap-1"
							>
								Xem tất cả
								<ArrowRightIcon size={16} />
							</Link>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
							{relatedProducts.map((p, i) => (
								<ProductCard key={p.id} product={p} index={i} />
							))}
						</div>
					</div>
				</section>
			)}
			<Footer />
			<style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
		</div>
	);
}
