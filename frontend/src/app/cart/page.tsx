'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  CartIcon,
  ArrowRightIcon,
  SparkleIcon,
} from '@/components/icons';
import {
  productIllustrations,
  type ProductIllustrationType,
} from '@/components/icons/ProductIllustrations';

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export default function CartPage() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
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
              <CartIcon size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-heading">
              Giỏ hàng của bạn
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] ml-14">
            {cartCount > 0 ? `${cartCount} sản phẩm trong giỏ hàng` : 'Chưa có sản phẩm nào'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 sm:p-12 text-center">
              {/* Decorative illustration */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-50 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CartIcon size={64} className="text-pink-300" />
                </div>
                <div className="absolute top-2 right-2">
                  <SparkleIcon size={20} className="text-pink-300 animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-0">
                  <SparkleIcon size={16} className="text-pink-200 animate-pulse" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading mb-3">
                Giỏ hàng trống
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                Hãy khám phá các sản phẩm tuyệt vời dành cho bé yêu của bạn nhé!
              </p>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              >
                <span>Tiếp tục mua sắm</span>
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content */
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const IllustrationComponent =
                    productIllustrations[item.image as ProductIllustrationType];

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-md border border-pink-50 p-4 sm:p-5 flex gap-4 sm:gap-5 items-center transition-all hover:shadow-lg"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center overflow-hidden">
                        {item.imageUrl && !imgErrors.has(item.id) ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 96px"
                            onError={() => setImgErrors((prev) => new Set(prev).add(item.id))}
                          />
                        ) : IllustrationComponent ? (
                          <IllustrationComponent size={64} />
                        ) : (
                          <CartIcon size={32} className="text-pink-300" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base truncate font-heading">
                          {item.name}
                        </h3>
                        <p className="text-pink-500 font-bold text-sm sm:text-base mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] min-w-[44px]"
                            aria-label={`Giảm số lượng ${item.name}`}
                          >
                            <MinusIcon size={16} />
                          </button>
                          <span className="w-10 text-center font-semibold text-[var(--text-primary)] text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] min-w-[44px]"
                            aria-label={`Tăng số lượng ${item.name}`}
                          >
                            <PlusIcon size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal + Remove */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="font-bold text-[var(--text-primary)] text-sm sm:text-base whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 rounded-xl text-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={clearCart}
                    className="text-sm text-pink-400 hover:text-pink-600 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none rounded-lg px-3 py-2 min-h-[44px]"
                    aria-label="Xóa tất cả sản phẩm khỏi giỏ hàng"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 sticky top-28">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-5 flex items-center gap-2">
                    <SparkleIcon size={20} className="text-pink-400" />
                    Tóm tắt đơn hàng
                  </h2>

                  {/* Items Summary */}
                  <div className="space-y-3 mb-5">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)] truncate mr-2">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-[var(--text-primary)] font-medium whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-pink-100 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-[var(--text-primary)]">
                        Tổng cộng
                      </span>
                      <span className="text-xl font-bold text-pink-500">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Chưa bao gồm phí vận chuyển
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/checkout')}
                      className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px]"
                    >
                      <span>Thanh toán</span>
                      <ArrowRightIcon size={18} />
                    </button>

                    <Link
                      href="/products"
                      className="w-full py-3.5 bg-pink-50 text-pink-500 font-semibold rounded-2xl hover:bg-pink-100 transition-all duration-300 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px]"
                    >
                      <span>Tiếp tục mua sắm</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
