'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard, { Product } from '@/components/ProductCard';
import {
  SearchIcon,
  SparkleIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  ChevronDownIcon,
  CloseIcon,
} from '@/components/icons';
import {
  ClothesIllustration,
  BottleIllustration,
  TeddyIllustration,
  DiaperIllustration,
  StrollerIllustration,
  PacifierIllustration,
} from '@/components/icons/ProductIllustrations';

// Extended product data
const allProducts: Product[] = [
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
  {
    id: '9',
    name: 'Ti giả silicon mềm cho bé',
    price: 89000,
    illustration: 'pacifier',
    rating: 4.5,
    reviews: 198,
    category: 'Phụ kiện',
  },
  {
    id: '10',
    name: 'Lục lạc đồ chơi phát triển giác quan',
    price: 129000,
    illustration: 'rattle',
    rating: 4.6,
    reviews: 145,
    badge: 'new',
    category: 'Đồ chơi',
  },
  {
    id: '11',
    name: 'Bột ăn dặm Gerber organic',
    price: 175000,
    illustration: 'food',
    rating: 4.8,
    reviews: 320,
    badge: 'bestseller',
    category: 'Ăn dặm',
  },
  {
    id: '12',
    name: 'Áo khoác giữ ấm lông cừu',
    price: 450000,
    originalPrice: 590000,
    illustration: 'clothes',
    rating: 4.7,
    reviews: 89,
    badge: 'sale',
    category: 'Quần áo',
  },
  {
    id: '13',
    name: 'Bình sữa thủy tinh cao cấp Comotomo',
    price: 320000,
    illustration: 'bottle',
    rating: 4.9,
    reviews: 267,
    badge: 'bestseller',
    category: 'Bình sữa',
  },
  {
    id: '14',
    name: 'Thú nhồi bông hình thỏ dễ thương',
    price: 189000,
    illustration: 'teddy',
    rating: 4.6,
    reviews: 178,
    category: 'Đồ chơi',
  },
  {
    id: '15',
    name: 'Tã quần Huggies Dry Pants',
    price: 289000,
    illustration: 'diaper',
    rating: 4.8,
    reviews: 445,
    badge: 'bestseller',
    category: 'Tã & Bỉm',
  },
  {
    id: '16',
    name: 'Xe đẩy siêu nhẹ travel system',
    price: 3200000,
    originalPrice: 3800000,
    illustration: 'stroller',
    rating: 4.9,
    reviews: 67,
    badge: 'sale',
    category: 'Xe đẩy',
  },
];

const categories = [
  { id: 'all', name: 'Tất cả', Icon: SparkleIcon, count: allProducts.length },
  {
    id: 'clothes',
    name: 'Quần áo',
    Icon: ClothesIllustration,
    count: allProducts.filter((p) => p.category === 'Quần áo').length,
  },
  {
    id: 'bottle',
    name: 'Bình sữa',
    Icon: BottleIllustration,
    count: allProducts.filter((p) => p.category === 'Bình sữa').length,
  },
  {
    id: 'toy',
    name: 'Đồ chơi',
    Icon: TeddyIllustration,
    count: allProducts.filter((p) => p.category === 'Đồ chơi').length,
  },
  {
    id: 'diaper',
    name: 'Tã & Bỉm',
    Icon: DiaperIllustration,
    count: allProducts.filter((p) => p.category === 'Tã & Bỉm').length,
  },
  {
    id: 'stroller',
    name: 'Xe đẩy',
    Icon: StrollerIllustration,
    count: allProducts.filter((p) => p.category === 'Xe đẩy').length,
  },
  {
    id: 'pacifier',
    name: 'Phụ kiện',
    Icon: PacifierIllustration,
    count: allProducts.filter((p) => p.category === 'Phụ kiện').length,
  },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      const categoryMap: Record<string, string> = {
        clothes: 'Quần áo',
        bottle: 'Bình sữa',
        toy: 'Đồ chơi',
        diaper: 'Tã & Bỉm',
        stroller: 'Xe đẩy',
        pacifier: 'Phụ kiện',
      };
      result = result.filter((p) => p.category === categoryMap[selectedCategory]);
    }

    const priceRange = priceRanges.find((r) => r.id === selectedPriceRange);
    if (priceRange && priceRange.id !== 'all') {
      result = result.filter((p) => p.price >= priceRange.min && p.price < priceRange.max);
    }

    switch (selectedSort) {
      case 'newest':
        result = result.reverse();
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
  }, [searchQuery, selectedCategory, selectedSort, selectedPriceRange]);

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

      {/* Compact Header Section */}
      <section className="bg-gradient-to-r from-pink-50 via-white to-purple-50 pt-6 pb-4 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Sản phẩm cho <span className="text-gradient">Bé yêu</span>
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {filteredProducts.length} sản phẩm
              </p>
            </div>

            {/* Search Bar - Compact */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
              />
              <SearchIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-pink-500"
                >
                  <CloseIcon size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs - Horizontal Scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => {
              const IconComponent = category.Icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
                      : 'bg-white border border-pink-100 text-[var(--text-secondary)] hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center`}>
                    {category.id === 'all' ? (
                      <IconComponent size={16} className={isActive ? 'text-white' : 'text-pink-500'} />
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

      {/* Toolbar */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-pink-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {/* Left Side - Filters */}
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-50 text-pink-600 text-sm font-medium hover:bg-pink-100 transition-colors"
              >
                <FilterIcon size={16} />
                <span>Lọc</span>
              </button>

              {/* Price Filter Dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => {
                    setIsPriceOpen(!isPriceOpen);
                    setIsSortOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPriceRange !== 'all'
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  <span>
                    {selectedPriceRange === 'all'
                      ? 'Giá'
                      : priceRanges.find((r) => r.id === selectedPriceRange)?.name}
                  </span>
                  <ChevronDownIcon size={14} className={isPriceOpen ? 'rotate-180' : ''} />
                </button>

                {isPriceOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsPriceOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-pink-100 py-1 z-50">
                      {priceRanges.map((range) => (
                        <button
                          key={range.id}
                          onClick={() => {
                            setSelectedPriceRange(range.id);
                            setIsPriceOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            selectedPriceRange === range.id
                              ? 'bg-pink-50 text-pink-600 font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-pink-50'
                          }`}
                        >
                          {range.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-pink-500 hover:bg-pink-50 transition-colors"
                >
                  <CloseIcon size={12} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>

            {/* Right Side - Sort & View */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsPriceOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-pink-200 text-sm text-[var(--text-secondary)] hover:border-pink-300 transition-colors"
                >
                  <span className="hidden sm:inline">
                    {sortOptions.find((s) => s.id === selectedSort)?.name}
                  </span>
                  <span className="sm:hidden">Sắp xếp</span>
                  <ChevronDownIcon size={14} className={isSortOpen ? 'rotate-180' : ''} />
                </button>

                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-pink-100 py-1 z-50">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedSort(option.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            selectedSort === option.id
                              ? 'bg-pink-50 text-pink-600 font-medium'
                              : 'text-[var(--text-secondary)] hover:bg-pink-50'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center border border-pink-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-[var(--text-muted)] hover:bg-pink-50'
                  }`}
                >
                  <GridIcon size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
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

      {/* Products Grid */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length > 0 ? (
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
                <SearchIcon size={32} className="text-pink-300" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Load More */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-8">
              <button className="px-6 py-2.5 rounded-xl border-2 border-pink-300 text-pink-500 text-sm font-medium hover:bg-pink-50 transition-colors">
                Xem thêm sản phẩm
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-pink-100 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Bộ lọc</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 rounded-full hover:bg-pink-50 text-[var(--text-secondary)]"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Categories */}
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
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-xs ${
                          isActive
                            ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-md'
                            : 'bg-pink-50 text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {category.id === 'all' ? (
                            <IconComponent size={18} className={isActive ? 'text-white' : 'text-pink-500'} />
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

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Khoảng giá</h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-pink-100 p-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 rounded-xl border-2 border-pink-300 text-pink-500 font-medium text-sm"
              >
                Xóa lọc
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium text-sm shadow-md"
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
      `}</style>
    </div>
  );
}
