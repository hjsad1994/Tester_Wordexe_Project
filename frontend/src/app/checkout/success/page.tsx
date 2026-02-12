'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SparkleIcon, TruckIcon, ArrowRightIcon } from '@/components/icons';
import {
  productIllustrations,
  type ProductIllustrationType,
} from '@/components/icons/ProductIllustrations';

interface OrderData {
  orderId: string;
  items: Array<{ id: string; name: string; price: number; image: string; quantity: number }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  customerInfo: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    notes: string;
  };
  paymentMethod: 'cod' | 'momo';
  status: string;
  estimatedDelivery: string;
}

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export default function CheckoutSuccessPage() {
  const router = useRouter();

  const [order] = useState<OrderData | null>(() => {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem('lastOrder');
    if (data) {
      sessionStorage.removeItem('lastOrder');
      return JSON.parse(data) as OrderData;
    }
    return null;
  });

  useEffect(() => {
    if (!order) {
      router.push('/products');
    }
  }, [order, router]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--warm-white)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Success Banner */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-heading mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Mã đơn hàng: <span className="font-semibold text-pink-500">{order.orderId}</span>
            </p>
          </div>

          {/* Order Status Card */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading">
                Trạng thái đơn hàng
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Đã thanh toán'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Phương thức thanh toán</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Ví MoMo'}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Dự kiến giao hàng</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {order.estimatedDelivery}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4 flex items-center gap-2">
              <TruckIcon size={20} className="text-pink-400" />
              Thông tin giao hàng
            </h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--text-secondary)]">Người nhận:</span>{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {order.customerInfo.fullName}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-secondary)]">Điện thoại:</span>{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {order.customerInfo.phone}
                </span>
              </p>
              <p>
                <span className="text-[var(--text-secondary)]">Địa chỉ:</span>{' '}
                <span className="font-medium text-[var(--text-primary)]">
                  {order.customerInfo.address}, {order.customerInfo.ward},{' '}
                  {order.customerInfo.district}, {order.customerInfo.province}
                </span>
              </p>
              {order.customerInfo.notes && (
                <p>
                  <span className="text-[var(--text-secondary)]">Ghi chú:</span>{' '}
                  <span className="font-medium text-[var(--text-primary)]">
                    {order.customerInfo.notes}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4 flex items-center gap-2">
              <SparkleIcon size={20} className="text-pink-400" />
              Chi tiết đơn hàng
            </h2>
            <div className="space-y-3 mb-4">
              {order.items.map((item) => {
                const Illustration = productIllustrations[item.image as ProductIllustrationType];
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0">
                      {Illustration ? (
                        <Illustration size={32} />
                      ) : (
                        <span className="text-pink-300 text-lg">🎁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
            {/* Totals */}
            <div className="border-t border-pink-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-pink-100">
                <span>Tổng cộng</span>
                <span className="text-pink-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
            >
              <span>Tiếp tục mua sắm</span>
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
