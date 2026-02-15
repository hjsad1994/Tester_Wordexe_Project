"use client";

import { useEffect, useRef, useState } from "react";
import {
	type Product as ApiProduct,
	fetchProducts,
	toProductSlug,
} from "@/lib/api";
import { ArrowRightIcon, SparkleIcon } from "./icons";
import ProductCard, { type Product as CardProduct } from "./ProductCard";

const categoryIllustrationMap: Record<string, CardProduct["illustration"]> = {
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

const mapApiProductToCard = (product: ApiProduct): CardProduct => {
	const categoryName =
		typeof product.category === "string" ? "" : product.category?.name || "";

	return {
		id: product._id,
		slug: product.slug || toProductSlug(product.name),
		name: product.name,
		price: product.price,
		imageUrl: product.images?.[0],
		illustration: categoryIllustrationMap[categoryName] || "teddy",
		rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
		reviews: Math.floor(Math.random() * 300) + 50,
		category: categoryName,
	};
};

export default function FeaturedProducts() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [products, setProducts] = useState<CardProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchProducts({ limit: 8 })
			.then((data) => {
				setProducts(data.products.map(mapApiProductToCard));
			})
			.catch((err: unknown) => {
				console.error("Failed to fetch featured products:", err);
				setError("Không thể tải sản phẩm nổi bật");
			})
			.finally(() => setLoading(false));
	}, []);

	const scroll = (direction: "left" | "right") => {
		if (!scrollRef.current) {
			return;
		}

		const scrollAmount = 320;
		scrollRef.current.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	return (
		<section className="py-20 bg-[var(--warm-white)] relative overflow-hidden">
			{/* Background Decoration */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-pink-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
			<div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
				{/* Section Header */}
				<div className="flex flex-col sm:flex-row items-center justify-between mb-12">
					<div className="text-center sm:text-left mb-6 sm:mb-0">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4">
							<SparkleIcon size={16} className="animate-sparkle" />
							<span>Sản phẩm nổi bật</span>
						</div>
						<h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
							Được yêu thích nhất
						</h2>
						<p className="text-[var(--text-secondary)] mt-2 max-w-md">
							Những sản phẩm được các bà mẹ tin tưởng lựa chọn cho bé yêu
						</p>
					</div>

					{/* Navigation Arrows */}
					<div className="flex items-center gap-3">
						<button
							onClick={() => scroll("left")}
							aria-label="Cuộn sang trái"
							className="p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-pink-100 text-[var(--text-secondary)] hover:text-pink-500 hover:border-pink-300 transition-all duration-300"
						>
							<ArrowRightIcon size={20} className="rotate-180" />
						</button>
						<button
							onClick={() => scroll("right")}
							aria-label="Cuộn sang phải"
							className="p-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
						>
							<ArrowRightIcon size={20} />
						</button>
					</div>
				</div>

				{/* Products Carousel */}
				<div
					ref={scrollRef}
					className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
					style={{
						scrollbarWidth: "none",
						msOverflowStyle: "none",
					}}
				>
					{loading
						? Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px]">
									<div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 animate-pulse">
										<div className="aspect-square bg-pink-50" />
										<div className="p-3 space-y-2">
											<div className="h-4 bg-pink-50 rounded w-3/4" />
											<div className="h-3 bg-pink-50 rounded w-1/2" />
											<div className="h-5 bg-pink-50 rounded w-1/3" />
										</div>
									</div>
								</div>
							))
						: products.map((product, index) => (
								<div
									key={product.id}
									className="flex-shrink-0 w-[280px] sm:w-[300px]"
								>
									<ProductCard product={product} index={index} />
								</div>
							))}
				</div>

				{error && <p className="mt-4 text-sm text-red-500">{error}</p>}

				{/* View All Button */}
				<div className="text-center mt-12">
					<button className="btn-secondary inline-flex items-center gap-2 group">
						<span>Xem tất cả sản phẩm</span>
						<ArrowRightIcon
							size={18}
							className="group-hover:translate-x-1 transition-transform"
						/>
					</button>
				</div>
			</div>

			{/* Hide scrollbar */}
			<style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
		</section>
	);
}
