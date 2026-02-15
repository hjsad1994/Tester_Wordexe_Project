'use client';

import { useEffect, useState } from 'react';
import { type Category as ApiCategory, fetchCategories } from '@/lib/api';
import { SparkleIcon } from './icons';
import {
  BottleIllustration,
  ClothesIllustration,
  DiaperIllustration,
  PacifierIllustration,
  StrollerIllustration,
  TeddyIllustration,
} from './icons/ProductIllustrations';

const categoryIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'Quần áo': ClothesIllustration,
  'Bình sữa': BottleIllustration,
  'Đồ chơi': TeddyIllustration,
  'Xe đẩy': StrollerIllustration,
  'Tã & Bỉm': DiaperIllustration,
  'Phụ kiện': PacifierIllustration,
};

const categoryColorMap: Record<string, { color: string; hoverColor: string }> = {
  'Quần áo': {
    color: 'from-pink-100 to-pink-200',
    hoverColor: 'group-hover:from-pink-200 group-hover:to-pink-300',
  },
  'Bình sữa': {
    color: 'from-blue-100 to-blue-200',
    hoverColor: 'group-hover:from-blue-200 group-hover:to-blue-300',
  },
  'Đồ chơi': {
    color: 'from-amber-100 to-amber-200',
    hoverColor: 'group-hover:from-amber-200 group-hover:to-amber-300',
  },
  'Xe đẩy': {
    color: 'from-purple-100 to-purple-200',
    hoverColor: 'group-hover:from-purple-200 group-hover:to-purple-300',
  },
  'Tã & Bỉm': {
    color: 'from-cyan-100 to-cyan-200',
    hoverColor: 'group-hover:from-cyan-200 group-hover:to-cyan-300',
  },
  'Phụ kiện': {
    color: 'from-rose-100 to-rose-200',
    hoverColor: 'group-hover:from-rose-200 group-hover:to-rose-300',
  },
};

const defaultColor = {
  color: 'from-gray-100 to-gray-200',
  hoverColor: 'group-hover:from-gray-200 group-hover:to-gray-300',
};

export default function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--warm-white)] to-pink-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4 animate-bounce-soft">
            <SparkleIcon size={16} />
            Khám phá
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Danh mục sản phẩm
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Tìm kiếm sản phẩm phù hợp cho bé yêu theo từng danh mục
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 sm:p-8 rounded-3xl bg-white shadow-md animate-pulse">
                  <div className="flex justify-center mb-4">
                    <div className="w-[70px] h-[70px] bg-pink-50 rounded-full" />
                  </div>
                  <div className="h-5 bg-pink-50 rounded w-3/4 mx-auto mb-1" />
                  <div className="h-4 bg-pink-50 rounded w-1/2 mx-auto" />
                </div>
              ))
            : categories.map((category, index) => {
                const IconComponent = categoryIconMap[category.name] || TeddyIllustration;
                const colors = categoryColorMap[category.name] || defaultColor;
                return (
                  <button
                    key={category._id}
                    className="group animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <div className="relative p-6 sm:p-8 rounded-3xl bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden">
                      {/* Background Gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${colors.color} ${colors.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      ></div>

                      {/* Icon */}
                      <div className="relative z-10 flex justify-center mb-4">
                        <div className="transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                          <IconComponent size={70} />
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="relative z-10 font-semibold text-[var(--text-primary)] text-lg mb-1 transition-colors duration-300">
                        {category.name}
                      </h3>

                      {/* Description */}
                      <p className="relative z-10 text-sm text-[var(--text-muted)] transition-colors duration-300">
                        {category.description || 'Khám phá ngay'}
                      </p>

                      {/* Hover Ring */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-300/50 rounded-3xl transition-all duration-500"></div>
                    </div>
                  </button>
                );
              })}
        </div>

        {/* Promo Banner */}
        <div className="mt-16 relative">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-1">
            <div className="relative rounded-[22px] bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-8 sm:p-12 overflow-hidden">
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white font-medium text-sm mb-4">
                    Ưu đãi đặc biệt
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                    Giảm đến 50% cho bé yêu
                  </h3>
                  <p className="text-white/80 max-w-lg">
                    Đăng ký thành viên ngay để nhận ưu đãi độc quyền và cập nhật những sản phẩm mới
                    nhất
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="px-6 py-4 rounded-full w-full sm:w-72 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/30 focus:border-white focus:outline-none transition-all duration-300"
                  />
                  <button className="px-8 py-4 rounded-full bg-white text-pink-500 font-semibold hover:bg-pink-50 transition-all duration-300 hover:shadow-lg whitespace-nowrap">
                    Đăng ký ngay
                  </button>
                </div>
              </div>

              {/* Floating Elements - SVG based */}
              <div className="absolute top-4 left-4 animate-float opacity-30">
                <TeddyIllustration size={50} />
              </div>
              <div className="absolute bottom-4 right-4 animate-float-reverse opacity-30">
                <PacifierIllustration size={45} />
              </div>
              <div className="absolute top-1/2 right-1/4 animate-bounce-soft opacity-20">
                <SparkleIcon size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
