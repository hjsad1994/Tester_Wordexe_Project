'use client';

import { useRef } from 'react';
import ProductCard, { Product } from './ProductCard';
import { ArrowRightIcon, SparkleIcon } from './icons';

const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Bộ quần áo Cotton Organic cho bé sơ sinh',
    price: 299000,
    originalPrice: 399000,
    illustration: 'clothes',
    rating: 4.9,
    reviews: 256,
    badge: 'bestseller',
    category: 'Quần áo',
  },
  {
    id: '2',
    name: 'Bình sữa chống đầy hơi Pigeon',
    price: 189000,
    illustration: 'bottle',
    rating: 4.8,
    reviews: 189,
    badge: 'new',
    category: 'Bình sữa',
  },
  {
    id: '3',
    name: 'Gấu bông Teddy Bear siêu mềm mại',
    price: 159000,
    originalPrice: 219000,
    illustration: 'teddy',
    rating: 4.7,
    reviews: 342,
    badge: 'sale',
    category: 'Đồ chơi',
  },
  {
    id: '4',
    name: 'Tã dán cao cấp Bobby Extra Soft',
    price: 249000,
    illustration: 'diaper',
    rating: 4.9,
    reviews: 521,
    badge: 'bestseller',
    category: 'Tã & Bỉm',
  },
  {
    id: '5',
    name: 'Xe đẩy gấp gọn đa năng',
    price: 2490000,
    originalPrice: 2990000,
    illustration: 'stroller',
    rating: 4.8,
    reviews: 98,
    badge: 'sale',
    category: 'Xe đẩy',
  },
  {
    id: '6',
    name: 'Nôi điện tự động ru ngủ',
    price: 1890000,
    illustration: 'crib',
    rating: 4.6,
    reviews: 156,
    badge: 'new',
    category: 'Giường & Nôi',
  },
  {
    id: '7',
    name: 'Bộ chăm sóc da cho bé Johnson',
    price: 329000,
    illustration: 'skincare',
    rating: 4.9,
    reviews: 412,
    category: 'Chăm sóc',
  },
  {
    id: '8',
    name: 'Giày tập đi mềm chống trơn',
    price: 199000,
    originalPrice: 259000,
    illustration: 'shoes',
    rating: 4.7,
    reviews: 287,
    badge: 'sale',
    category: 'Giày dép',
  },
];

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
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
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-pink-100 text-[var(--text-secondary)] hover:text-pink-500 hover:border-pink-300 transition-all duration-300"
            >
              <ArrowRightIcon size={20} className="rotate-180" />
            </button>
            <button
              onClick={() => scroll('right')}
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
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[300px]"
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="btn-secondary inline-flex items-center gap-2 group">
            <span>Xem tất cả sản phẩm</span>
            <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
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
