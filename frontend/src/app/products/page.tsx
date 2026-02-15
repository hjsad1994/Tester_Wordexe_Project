'use client';

import { useEffect, useMemo, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import {
  CloseIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SparkleIcon,
} from '@/components/icons';
import {
  BottleIllustration,
  ClothesIllustration,
  DiaperIllustration,
  PacifierIllustration,
  StrollerIllustration,
  TeddyIllustration,
} from '@/components/icons/ProductIllustrations';
import ProductCard, { type Product as CardProduct } from '@/components/ProductCard';
import {
  type Category as ApiCategory,
  type Product as ApiProduct,
  fetchCategories,
  fetchProducts,
} from '@/lib/api';

const categoryIllustrationMap: Record<string, CardProduct['illustration']> = {
  'Quần áo': 'clothes',
  'Bình sữa': 'bottle',
  'Đồ chơi': 'teddy',
  'Tã & Bỉm': 'diaper',
  'Xe đẩy': 'stroller',
  'Giường & Nôi': 'crib',
  'Chăm sóc': 'skincare',
  'Giày dép': 'shoes',
  'Phụ kiện': 'pacifier',
  'Ăn dặm': 'food',
};

const categoryIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'Quần áo': ClothesIllustration,
  'Bình sữa': BottleIllustration,
  'Đồ chơi': TeddyIllustration,
  'Tã & Bỉm': DiaperIllustration,
  'Xe đẩy': StrollerIllustration,
  'Phụ kiện': PacifierIllustration,
};

const mapApiProductToCard = (product: ApiProduct): CardProduct => {
  const categoryName = typeof product.category === 'string' ? '' : product.category?.name || '';

  return {
    id: product._id,
    name: product.name,
    price: product.price,
    imageUrl: product.images?.[0],
    illustration: categoryIllustrationMap[categoryName] || 'teddy',
    rating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
    reviews: Math.floor(Math.random() * 300) + 50,
    category: categoryName,
  };
};

const sortOptions = [
  { id: 'popular', name: 'Phổ biến nhất' },
  { id: 'newest', name: 'Mới nhất' },
  { id: 'price-asc', name: 'Giá thấp → cao' },
  { id: 'price-desc', name: 'Giá cao → thấp' },
  { id: 'rating', name: 'Đánh giá cao' },
];

const priceRanges = [
  { id: 'all', name: 'Tất cả', min: 0, max: Infinity },
  { id: 'under-200k', name: '< 200K', min: 0, max: 200000 },
  { id: '200k-500k', name: '200K - 500K', min: 200000, max: 500000 },
  { id: '500k-1m', name: '500K - 1M', min: 500000, max: 1000000 },
  { id: 'over-1m', name: '> 1M', min: 1000000, max: Infinity },
];

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<CardProduct[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    Promise.all([fetchProducts({ limit: 100 }), fetchCategories()])
      .then(([productData, categoryData]) => {
        setAllProducts(productData.products.map(mapApiProductToCard));
        setApiCategories(categoryData);
      })
      .catch((error: unknown) => {
        console.error('Failed to load products/categories:', error);
        setLoadError('Không thể tải dữ liệu sản phẩm');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const tabs: Array<{
      id: string;
      name: string;
      Icon: React.ComponentType<{ size?: number; className?: string }>;
      count: number;
    }> = [
      {
        id: 'all',
        name: 'Tất cả',
        Icon: SparkleIcon,
        count: allProducts.length,
      },
    ];

    for (const category of apiCategories) {
      const count = allProducts.filter((p) => p.category === category.name).length;
      tabs.push({
        id: category._id,
        name: category.name,
        Icon: categoryIconMap[category.name] || TeddyIllustration,
        count,
      });
    }

    return tabs;
  }, [apiCategories, allProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      const selectedCat = apiCategories.find((c) => c._id === selectedCategory);
      if (selectedCat) {
        result = result.filter((p) => p.category === selectedCat.name);
      }
    }

    const priceRange = priceRanges.find((r) => r.id === selectedPriceRange);
    if (priceRange && priceRange.id !== 'all') {
      result = result.filter((p) => p.price >= priceRange.min && p.price < priceRange.max);
    }

    switch (selectedSort) {
      case 'newest':
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [allProducts, apiCategories, searchQuery, selectedCategory, selectedSort, selectedPriceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedSort('popular');
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || selectedPriceRange !== 'all';

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />

      <section className="bg-gradient-to-r from-pink-50 via-white to-purple-50 pt-6 pb-4 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Sản phẩm cho <span className="text-gradient">Bé yêu</span>
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {loading ? '...' : `${filteredProducts.length} sản phẩm`}
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                aria-label="Tìm kiếm sản phẩm"
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-pink-200 focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none bg-white text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
              />
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-pink-500 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none rounded"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => {
              const IconComponent = category.Icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
                      : 'bg-white border border-pink-100 text-[var(--text-secondary)] hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {category.id === 'all' ? (
                      <IconComponent
                        size={16}
                        className={isActive ? 'text-white' : 'text-pink-500'}
                      />
                    ) : (
                      <IconComponent size={24} />
                    )}
                  </div>
                  <span>{category.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/25' : 'bg-pink-100 text-pink-500'
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-pink-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-lg bg-pink-50 text-pink-600 text-sm font-medium hover:bg-pink-100 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                <FilterIcon size={16} />
                <span>Lọc</span>
              </button>

              <div className="hidden sm:block">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  aria-label="Lọc theo giá"
                  className={`px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors appearance-none bg-no-repeat bg-[length:14px] bg-[right_8px_center] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ec4899%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] pr-7 cursor-pointer focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    selectedPriceRange !== 'all'
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  aria-label="Xóa tất cả bộ lọc"
                  className="flex items-center gap-1 px-3 py-2.5 min-h-[44px] rounded-lg text-xs text-pink-500 hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                >
                  <CloseIcon size={12} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  aria-label="Sắp xếp sản phẩm"
                  className="px-3 py-2.5 min-h-[44px] rounded-lg bg-white border border-pink-200 text-sm text-[var(--text-secondary)] hover:border-pink-300 transition-colors appearance-none bg-no-repeat bg-[length:14px] bg-[right_8px_center] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ec4899%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] pr-7 cursor-pointer focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:flex items-center border border-pink-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Xem dạng lưới"
                  aria-pressed={viewMode === 'grid'}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    viewMode === 'grid'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-[var(--text-muted)] hover:bg-pink-50'
                  }`}
                >
                  <GridIcon size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="Xem dạng danh sách"
                  aria-pressed={viewMode === 'list'}
                  className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    viewMode === 'list'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-[var(--text-muted)] hover:bg-pink-50'
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadError && <p className="text-sm text-red-500 mb-4">{loadError}</p>}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 animate-pulse"
                >
                  <div className="aspect-square bg-pink-50" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-pink-50 rounded w-3/4" />
                    <div className="h-3 bg-pink-50 rounded w-1/2" />
                    <div className="h-5 bg-pink-50 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                <SearchIcon size={32} className="text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 min-h-[44px] rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="text-center mt-8">
              <button className="px-6 py-2.5 min-h-[44px] rounded-xl border-2 border-pink-300 text-pink-500 text-sm font-medium hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none">
                Xem thêm sản phẩm
              </button>
            </div>
          )}
        </div>
      </section>

      {isFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-modal-title"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-pink-100 p-4 flex items-center justify-between">
              <h2 id="filter-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
                Bộ lọc
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                aria-label="Đóng bộ lọc"
                className="p-3 min-w-[44px] min-h-[44px] rounded-full hover:bg-pink-50 text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Danh mục</h3>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => {
                    const IconComponent = category.Icon;
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex flex-col items-center gap-1 p-3 min-h-[44px] rounded-xl transition-all text-xs focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                          isActive
                            ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-md'
                            : 'bg-pink-50 text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {category.id === 'all' ? (
                            <IconComponent
                              size={18}
                              className={isActive ? 'text-white' : 'text-pink-500'}
                            />
                          ) : (
                            <IconComponent size={28} />
                          )}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">
                  Khoảng giá
                </h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                        selectedPriceRange === range.id
                          ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
                          : 'bg-pink-50 text-[var(--text-secondary)]'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-pink-100 p-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 min-h-[44px] rounded-xl border-2 border-pink-300 text-pink-500 font-medium text-sm focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                Xóa lọc
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 min-h-[44px] rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium text-sm shadow-md focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
