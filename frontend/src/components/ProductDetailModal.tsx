'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  ArrowRightIcon,
  CartIcon,
  CloseIcon,
  GiftIcon,
  HeartIcon,
  HeartOutlineIcon,
  ShieldIcon,
  SparkleIcon,
  StarIcon,
  TruckIcon,
} from './icons';
import { productIllustrations } from './icons/ProductIllustrations';
import type { Product } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// Extended product details
const productExtras: Record<string, { features: string[]; colors?: string[] }> = {
  '1': {
    features: [
      '100% Cotton Organic',
      'Không chất tẩy độc hại',
      'Nút bấm tiện lợi',
      'Giặt máy được',
    ],
    colors: ['Trắng', 'Hồng nhạt', 'Xanh mint'],
  },
  '2': {
    features: ['Chống đầy hơi', 'Không BPA', 'Núm ti silicon mềm', 'Dễ vệ sinh'],
  },
  '3': {
    features: ['Chất liệu plush mềm', 'An toàn cho bé', 'Có thể giặt', 'Không rụng lông'],
    colors: ['Nâu', 'Trắng kem', 'Hồng'],
  },
  default: {
    features: ['Chất lượng cao', 'An toàn cho bé', 'Thiết kế tiện lợi', 'Đảm bảo chính hãng'],
  },
};

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const { addToCart, setBuyNowItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  if (!product || !isOpen) return null;

  const liked = isInWishlist(product.id);

  const extras = productExtras[product.id] || productExtras.default;
  const IllustrationComponent = productIllustrations[product.illustration];

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.illustration,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-modalSlideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-pink-100 text-[var(--text-secondary)] hover:text-pink-500 transition-colors shadow-md"
        >
          <CloseIcon size={20} />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden">
          {/* Left - Image Section */}
          <div className="relative md:w-2/5 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 p-6 md:p-8 flex items-center justify-center min-h-[280px] md:min-h-full">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-pink-200/40 rounded-full blur-xl" />
            <div className="absolute bottom-8 right-8 w-24 h-24 bg-purple-200/40 rounded-full blur-xl" />
            <div className="absolute top-1/4 right-4 animate-float">
              <SparkleIcon size={20} className="text-pink-300" />
            </div>
            <div className="absolute bottom-1/4 left-4 animate-float-reverse">
              <SparkleIcon size={16} className="text-purple-300" />
            </div>

            {/* Badge */}
            {product.badge && (
              <div
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                  product.badge === 'new'
                    ? 'bg-blue-500 text-white'
                    : product.badge === 'sale'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-white'
                }`}
              >
                {product.badge === 'new'
                  ? 'Mới'
                  : product.badge === 'sale'
                    ? `-${discount}%`
                    : 'Hot'}
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={() => {
                if (liked) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product);
                }
              }}
              aria-label={liked ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
              className={`absolute top-4 right-14 md:right-4 p-2.5 rounded-full transition-all shadow-md ${
                liked
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/90 text-pink-400 hover:bg-pink-500 hover:text-white'
              }`}
            >
              {liked ? <HeartIcon size={18} /> : <HeartOutlineIcon size={18} />}
            </button>

            {/* Product Illustration */}
            <div className="relative z-10 animate-scaleIn">
              <IllustrationComponent size={200} />
            </div>
          </div>

          {/* Right - Content Section */}
          <div className="md:w-3/5 p-6 md:p-8 md:overflow-y-auto">
            {/* Category */}
            <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-medium mb-3">
              {product.category}
            </span>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? 'text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {product.rating}
              </span>
              <span className="text-sm text-[var(--text-muted)]">({product.reviews} đánh giá)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl md:text-3xl font-bold text-pink-500">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[var(--text-muted)] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-500 text-xs font-bold">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-pink-100">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'details'
                    ? 'text-pink-500'
                    : 'text-[var(--text-muted)] hover:text-pink-400'
                }`}
              >
                Chi tiết
                {activeTab === 'details' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'reviews'
                    ? 'text-pink-500'
                    : 'text-[var(--text-muted)] hover:text-pink-400'
                }`}
              >
                Đánh giá ({product.reviews})
                {activeTab === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' ? (
              <div className="space-y-4 mb-6">
                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {product.description || 'Chưa có mô tả cho sản phẩm này'}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  {extras.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <span className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-pink-500"
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
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Colors if available */}
                {extras.colors && (
                  <div>
                    <span className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
                      Màu sắc:
                    </span>
                    <div className="flex gap-2">
                      {extras.colors.map((color, i) => (
                        <button
                          key={i}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            i === 0
                              ? 'border-pink-400 bg-pink-50 text-pink-600'
                              : 'border-gray-200 text-[var(--text-secondary)] hover:border-pink-300'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {/* Sample reviews */}
                {[
                  {
                    name: 'Nguyễn Thị M.',
                    rating: 5,
                    comment: 'Sản phẩm rất tốt, bé nhà mình rất thích!',
                  },
                  {
                    name: 'Trần Văn H.',
                    rating: 5,
                    comment: 'Chất lượng tuyệt vời, giao hàng nhanh.',
                  },
                  {
                    name: 'Lê Thị L.',
                    rating: 4,
                    comment: 'Đóng gói cẩn thận, sẽ mua lại.',
                  },
                ].map((review, i) => (
                  <div key={i} className="p-3 rounded-xl bg-pink-50/50 border border-pink-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                        {review.name[0]}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {review.name}
                      </span>
                      <div className="flex gap-0.5 ml-auto">
                        {[...Array(5)].map((_, j) => (
                          <StarIcon
                            key={j}
                            size={12}
                            className={j < review.rating ? 'text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{review.comment}</p>
                  </div>
                ))}
                <button className="w-full text-sm text-pink-500 font-medium hover:underline">
                  Xem tất cả đánh giá →
                </button>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-3 mb-5">
              {/* Quantity Selector */}
              <div className="flex items-center border border-pink-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] min-w-[44px]"
                  aria-label="Giảm số lượng"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="w-12 text-center font-medium text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] min-w-[44px]"
                  aria-label="Tăng số lượng"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-[0.98]"
              >
                <CartIcon size={18} />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>

            {/* Buy Now */}
            <button
              onClick={() => {
                if (!product) return;
                setBuyNowItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.illustration,
                  quantity,
                });
                router.push('/checkout?buyNow=true');
              }}
              className="w-full py-3 px-6 border-2 border-pink-400 text-pink-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-pink-50 transition-all mb-5"
            >
              <span>Mua ngay</span>
              <ArrowRightIcon size={18} />
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-pink-100">
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-1">
                  <TruckIcon size={18} className="text-pink-500" />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                  Miễn phí ship từ 500K
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-1">
                  <ShieldIcon size={18} className="text-pink-500" />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                  Đổi trả 30 ngày
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-1">
                  <GiftIcon size={18} className="text-pink-500" />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                  Quà tặng kèm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out 0.1s both;
        }
      `}</style>
    </div>
  );
}
