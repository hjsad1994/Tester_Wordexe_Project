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
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    return (price / 1000).toFixed(0) + 'K';
  };

  const getBadgeStyle = () => {
    switch (product.badge) {
      case 'new':
        return 'bg-blue-500 text-white';
      case 'sale':
        return 'bg-red-500 text-white';
      case 'bestseller':
        return 'bg-amber-500 text-white';
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
        return 'Hot';
      default:
        return '';
    }
  };

  const IllustrationComponent = productIllustrations[product.illustration];

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 hover:shadow-lg hover:border-pink-200 transition-all duration-300"
      style={{
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        animationFillMode: 'forwards',
        animation: 'fadeInUp 0.4s ease-out forwards',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Compact */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 p-2">
        {/* Badge - Smaller */}
        {product.badge && (
          <div
            className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold ${getBadgeStyle()}`}
          >
            {getBadgeText()}
          </div>
        )}

        {/* Wishlist Button - Smaller */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          aria-label={isLiked ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 ${
            isLiked
              ? 'bg-pink-500 text-white'
              : 'bg-white/90 text-pink-400 hover:bg-pink-500 hover:text-white'
          } shadow-sm`}
        >
          {isLiked ? <HeartIcon size={14} /> : <HeartOutlineIcon size={14} />}
        </button>

        {/* Product Illustration */}
        <div className="w-full h-full flex items-center justify-center">
          <div
            className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
          >
            <IllustrationComponent size={100} />
          </div>
        </div>

        {/* Quick Add Button - Compact */}
        <div
          className={`absolute bottom-2 left-2 right-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <button className="w-full py-2 bg-pink-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 hover:bg-pink-600 transition-colors">
            <CartIcon size={14} />
            <span>Thêm giỏ hàng</span>
          </button>
        </div>
      </div>

      {/* Product Info - Compact */}
      <div className="p-3">
        {/* Name */}
        <h3 className="font-medium text-[var(--text-primary)] text-sm mb-1.5 line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating - Compact */}
        <div className="flex items-center gap-1 mb-2">
          <StarIcon size={12} className="text-amber-400" />
          <span className="text-xs text-[var(--text-secondary)]">{product.rating}</span>
          <span className="text-xs text-[var(--text-muted)]">({product.reviews})</span>
        </div>

        {/* Price - Compact */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-pink-500">{formatPrice(product.price)}đ</span>
          {product.originalPrice && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              {formatPrice(product.originalPrice)}đ
            </span>
          )}
        </div>
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
      `}</style>
    </div>
  );
}
