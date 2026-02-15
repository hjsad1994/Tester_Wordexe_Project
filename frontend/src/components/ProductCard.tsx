"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toProductSlug } from "@/lib/api";
import { CartIcon, HeartIcon, HeartOutlineIcon, StarIcon } from "./icons";
import {
	type ProductIllustrationType,
	productIllustrations,
} from "./icons/ProductIllustrations";

export interface Product {
	id: string;
	slug?: string;
	name: string;
	price: number;
	originalPrice?: number;
	illustration: ProductIllustrationType;
	imageUrl?: string;
	rating: number;
	reviews: number;
	badge?: "new" | "sale" | "bestseller";
	category: string;
}

interface ProductCardProps {
	product: Product;
	index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const { addToCart } = useCart();
	const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

	const liked = isInWishlist(product.id);

	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100,
			)
		: 0;

	const formatPrice = (price: number) => {
		if (price >= 1000000) {
			return (price / 1000000).toFixed(1).replace(".0", "") + "M";
		}
		return (price / 1000).toFixed(0) + "K";
	};

	const getBadgeStyle = () => {
		switch (product.badge) {
			case "new":
				return "bg-blue-500 text-white";
			case "sale":
				return "bg-red-500 text-white";
			case "bestseller":
				return "bg-amber-500 text-white";
			default:
				return "";
		}
	};

	const getBadgeText = () => {
		switch (product.badge) {
			case "new":
				return "Mới";
			case "sale":
				return `-${discount}%`;
			case "bestseller":
				return "Hot";
			default:
				return "";
		}
	};

	const IllustrationComponent = productIllustrations[product.illustration];
	const resolvedSlug =
		(product.slug && product.slug.trim()) ||
		toProductSlug(product.name) ||
		product.id;
	const productPath = `/products/${encodeURIComponent(resolvedSlug)}`;

	return (
		<div
			className="group product-card-animated bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 hover:shadow-lg hover:border-pink-200 transition-all duration-300"
			style={{
				animationDelay: `${index * 0.05}s`,
				opacity: 0,
				animationFillMode: "forwards",
				animation: "fadeInUp 0.4s ease-out forwards",
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Image Container - Clickable Link */}
			<Link
				href={productPath}
				className="block focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none rounded-t-2xl"
			>
				<div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
					{/* Badge */}
					{product.badge && (
						<div
							className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold ${getBadgeStyle()}`}
						>
							{getBadgeText()}
						</div>
					)}

					{/* Wishlist Button */}
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							if (liked) {
								removeFromWishlist(product.id);
							} else {
								addToWishlist(product);
							}
						}}
						aria-label={liked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
						className={`absolute top-2 right-2 z-10 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
							liked
								? "bg-pink-500 text-white"
								: "bg-white/90 text-pink-400 hover:bg-pink-500 hover:text-white"
						} shadow-md`}
					>
						{liked ? <HeartIcon size={18} /> : <HeartOutlineIcon size={18} />}
					</button>

					{/* Product Image or Illustration */}
					<div
						className={`relative w-full h-full transition-transform duration-300 ${
							isHovered ? "scale-105" : "scale-100"
						}`}
					>
						{product.imageUrl ? (
							<Image
								src={product.imageUrl}
								alt={product.name}
								fill
								className="object-cover"
								sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center p-4">
								<IllustrationComponent size={120} />
							</div>
						)}
					</div>
				</div>
			</Link>

			{/* Product Info */}
			<Link
				href={productPath}
				className="block p-3 pb-2 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
			>
				{/* Name */}
				<h3 className="font-medium text-[var(--text-primary)] text-sm mb-1.5 line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors min-h-[2.5rem]">
					{product.name}
				</h3>

				{/* Rating */}
				<div className="flex items-center gap-1.5 mb-2">
					<StarIcon size={16} className="text-amber-400" />
					<span className="text-sm font-medium text-[var(--text-secondary)]">
						{product.rating}
					</span>
					<span className="text-sm text-[var(--text-muted)]">
						({product.reviews})
					</span>
				</div>

				{/* Price */}
				<div className="flex items-center gap-2">
					<span className="text-base font-bold text-pink-500">
						{formatPrice(product.price)}đ
					</span>
					{product.originalPrice && (
						<span className="text-xs text-[var(--text-muted)] line-through">
							{formatPrice(product.originalPrice)}đ
						</span>
					)}
				</div>
			</Link>

			{/* Action Buttons - Always Visible */}
			<div className="px-3 pb-3 flex gap-2">
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						addToCart({
							id: product.id,
							name: product.name,
							price: product.price,
							image: product.illustration,
						});
					}}
					className="flex-1 py-2.5 min-h-[44px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1 focus-visible:outline-none transition-all duration-200"
				>
					<CartIcon size={15} />
					<span>Thêm giỏ</span>
				</button>
				<Link
					href={productPath}
					className="flex-1 py-2.5 min-h-[44px] bg-white border-2 border-pink-300 text-pink-500 text-xs font-semibold rounded-xl flex items-center justify-center hover:bg-pink-50 hover:border-pink-400 hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1 focus-visible:outline-none transition-all duration-200"
				>
					Chi tiết
				</Link>
			</div>

			<style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .product-card-animated {
            animation: none !important;
          }
        }
      `}</style>
		</div>
	);
}
