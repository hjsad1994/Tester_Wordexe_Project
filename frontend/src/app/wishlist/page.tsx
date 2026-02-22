'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import {
  ArrowRightIcon,
  CartIcon,
  GiftIcon,
  HeartIcon,
  HeartOutlineIcon,
  SparkleIcon,
  TrashIcon,
} from '@/components/icons';
import {
  type ProductIllustrationType,
  productIllustrations,
} from '@/components/icons/ProductIllustrations';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toProductSlug } from '@/lib/api';

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

const getProductPath = (product: { id: string; name: string; slug?: string }) => {
  const slug = (product.slug && product.slug.trim()) || toProductSlug(product.name) || product.id;
  return `/products/${encodeURIComponent(slug)}`;
};

export default function WishlistPage() {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />

      <main className="pt-32 pb-20">
        {/* Page Header */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md">
              <HeartIcon size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-heading">
              Sản phẩm yêu thích
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] ml-14">
            {wishlistCount > 0
              ? `${wishlistCount} sản phẩm trong danh sách yêu thích`
              : 'Chưa có sản phẩm yêu thích nào'}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 sm:p-12 text-center">
              {/* Decorative illustration */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <HeartOutlineIcon size={64} className="text-pink-300" />
                </div>
                <div className="absolute top-2 right-2">
                  <SparkleIcon size={20} className="text-pink-300 animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-0">
                  <SparkleIcon size={16} className="text-pink-200 animate-pulse" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading mb-3">
                Danh sách yêu thích trống
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                Hãy khám phá và thêm những sản phẩm yêu thích cho bé yêu của bạn nhé!
              </p>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Content */
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.map((product) => {
                const IllustrationComponent =
                  productIllustrations[product.illustration as ProductIllustrationType];
                const productPath = getProductPath(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md border border-pink-50 overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <Link href={productPath}>
                      <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center overflow-hidden">
                        {product.badge && (
                          <div
                            className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold ${
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
                                ? 'Sale'
                                : 'Hot'}
                          </div>
                        )}
                        {product.imageUrl && !imgErrors.has(product.id) ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
                            onError={() => setImgErrors((prev) => new Set(prev).add(product.id))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-4">
                            {IllustrationComponent ? (
                              <IllustrationComponent size={120} />
                            ) : (
                              <GiftIcon size={40} className="text-pink-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={productPath}>
                        <h3 className="font-medium text-[var(--text-primary)] text-sm mb-2 line-clamp-2 leading-tight hover:text-pink-500 transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-base font-bold text-pink-500">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-[var(--text-muted)] line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const result = addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.illustration,
                              imageUrl: product.imageUrl,
                            });
                            toast.success(
                              result.isNew
                                ? 'Đã thêm vào giỏ hàng'
                                : `Đã cập nhật giỏ hàng (×${result.newQuantity})`,
                              {
                                id: `cart-${product.id}`,
                                description: product.name,
                                action: {
                                  label: 'Xem giỏ hàng',
                                  onClick: () => router.push('/cart'),
                                },
                              }
                            );
                          }}
                          className="flex-1 py-2.5 min-h-[44px] bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1 focus-visible:outline-none transition-all duration-200"
                          aria-label={`Thêm ${product.name} vào giỏ hàng`}
                        >
                          <CartIcon size={15} />
                          <span>Thêm giỏ</span>
                        </button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl border-2 border-pink-200 text-pink-400 hover:text-pink-600 hover:border-pink-400 hover:bg-pink-50 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                          aria-label={`Xóa ${product.name} khỏi yêu thích`}
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear All */}
            <div className="flex justify-end pt-4">
              <button
                onClick={clearWishlist}
                className="text-sm text-pink-400 hover:text-pink-600 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none rounded-lg px-3 py-2 min-h-[44px]"
                aria-label="Xóa tất cả sản phẩm khỏi danh sách yêu thích"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
