'use client';

import { useState } from 'react';
import { HeartIcon, HeartOutlineIcon, StarIcon, CartIcon } from './icons';
import { productIllustrations, ProductIllustrationType } from './icons/ProductIllustrations';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  illustration: ProductIllustrationType;
  rating: number;
  reviews: number;
  badge?: 'new' | 'sale' | 'bestseller';
  category: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getBadgeStyle = () => {
    switch (product.badge) {
      case 'new':
        return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
      case 'sale':
        return 'bg-gradient-to-r from-red-400 to-pink-500 text-white';
      case 'bestseller':
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
      default:
        return '';
    }
  };

  const getBadgeText = () => {
    switch (product.badge) {
      case 'new':
        return 'Mới';
      case 'sale':
        return `-${discount}%`;
      case 'bestseller':
        return 'Bán chạy';
      default:
        return '';
    }
  };

  // Get the illustration component
  const IllustrationComponent = productIllustrations[product.illustration];

  return (
    <div
      className="card-product group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Badge */}
        {product.badge && (
          <div
            className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-md ${getBadgeStyle()}`}
          >
            {getBadgeText()}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition-all duration-300 ${
            isLiked
              ? 'bg-pink-500 text-white scale-110'
              : 'bg-white/80 text-pink-400 hover:bg-pink-500 hover:text-white'
          } shadow-md backdrop-blur-sm`}
        >
          {isLiked ? <HeartIcon size={18} /> : <HeartOutlineIcon size={18} />}
        </button>

        {/* Product Illustration */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <div
            className={`transition-all duration-500 ${
              isHovered ? 'scale-110 -rotate-3' : 'scale-100'
            }`}
          >
            <IllustrationComponent size={140} />
          </div>
        </div>

        {/* Quick Add Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
        >
          <button className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-full flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CartIcon size={18} />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-pink-500">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[var(--text-muted)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
