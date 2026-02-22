'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ArrowRightIcon, GiftIcon, SparkleIcon, TruckIcon } from '@/components/icons';
import {
  type ProductIllustrationType,
  productIllustrations,
} from '@/components/icons/ProductIllustrations';
import { fetchOrderById, type Order, type OrderStatus } from '@/lib/api';

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

const statusLabelMap: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao thành công',
  cancelled: 'Đã hủy',
};

const statusColorMap: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const estimatedDeliveryDate = useMemo(() => {
    if (!order?.createdAt) {
      return '';
    }

    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('vi-VN');
  }, [order?.createdAt]);

  useEffect(() => {
    const loadOrder = async () => {
      const orderIdFromQuery = searchParams.get('orderId');
      const tokenFromQuery = searchParams.get('token');
      const orderId =
        orderIdFromQuery ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('lastOrderId') : null);
      const accessToken =
        tokenFromQuery ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('lastOrderToken') : null);

      if (!orderId || !accessToken) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('lastOrderId');
          sessionStorage.removeItem('lastOrderToken');
        }
        router.replace('/products');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchOrderById(orderId, accessToken);
        setOrder(result);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('lastOrderId');
          sessionStorage.removeItem('lastOrderToken');
        }
      } catch (loadError) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('lastOrderId');
          sessionStorage.removeItem('lastOrderToken');
        }
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--warm-white)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Đang tải...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--warm-white)] flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-5 text-center shadow-sm">
          <p className="text-rose-600 mb-3">{error || 'Không tìm thấy đơn hàng'}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <span>Quay lại sản phẩm</span>
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
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
              Mã đơn hàng: <span className="font-semibold text-pink-500">{order.orderNumber}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading">
                Trạng thái đơn hàng
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorMap[order.status]}`}
              >
                {statusLabelMap[order.status]}
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
                <p className="font-semibold text-[var(--text-primary)]">{estimatedDeliveryDate}</p>
              </div>
            </div>
          </div>

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
                  {[
                    order.customerInfo.address,
                    order.customerInfo.ward,
                    order.customerInfo.district,
                    order.customerInfo.province,
                  ]
                    .filter(Boolean)
                    .join(', ')}
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

          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4 flex items-center gap-2">
              <SparkleIcon size={20} className="text-pink-400" />
              Chi tiết đơn hàng
            </h2>
            <div className="space-y-3 mb-4">
              {order.items.map((item) => {
                const isImageUrl = item.image?.startsWith('http');
                const Illustration = !isImageUrl
                  ? productIllustrations[item.image as ProductIllustrationType]
                  : null;
                const key =
                  typeof item.product === 'string'
                    ? `${item.product}-${item.productName}`
                    : `${item.product._id}-${item.productName}`;

                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {isImageUrl && item.image && !imgErrors.has(key) ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="48px"
                          onError={() => setImgErrors((prev) => new Set(prev).add(key))}
                        />
                      ) : Illustration ? (
                        <Illustration size={32} />
                      ) : (
                        <GiftIcon size={20} className="text-pink-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatPrice(item.productPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-pink-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">
                    Giảm giá{order.couponCode ? ` (${order.couponCode})` : ''}
                  </span>
                  <span className="text-green-600 font-medium">
                    -{formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-pink-100">
                <span>Tổng cộng</span>
                <span className="text-pink-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

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

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--warm-white)] flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Đang tải...</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
