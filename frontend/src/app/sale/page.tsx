'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GiftIcon, SparkleIcon, ArrowRightIcon, TruckIcon } from '@/components/icons';
import { type Coupon, type CouponDiscountType, fetchAvailableCouponsApi } from '@/lib/api';

const discountTypeLabels: Record<CouponDiscountType, string> = {
  percentage: 'Giảm theo %',
  fixed_amount: 'Giảm cố định',
  free_shipping: 'Miễn phí vận chuyển',
};

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const validUntil = formatDate(coupon.validUntil);
  const remaining =
    coupon.usageLimit != null ? coupon.usageLimit - coupon.usageCount : null;

  return (
    <div className="group relative rounded-2xl border border-pink-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top stripe */}
      <div className="h-2 bg-gradient-to-r from-pink-400 to-pink-500" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {coupon.discountType === 'free_shipping' ? (
              <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                <TruckIcon size={18} />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-pink-50 text-pink-500">
                <GiftIcon size={18} />
              </div>
            )}
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {discountTypeLabels[coupon.discountType]}
            </span>
          </div>

          {/* Discount badge */}
          <div className="shrink-0 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 px-3 py-1 text-white font-bold text-sm shadow-sm">
            {coupon.discountType === 'percentage'
              ? `-${coupon.discountValue}%`
              : coupon.discountType === 'fixed_amount'
                ? `-${formatPrice(coupon.discountValue)}`
                : 'Free Ship'}
          </div>
        </div>

        {/* Name & description */}
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">{coupon.name}</h3>
        {coupon.description && (
          <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">
            {coupon.description}
          </p>
        )}

        {/* Conditions */}
        <div className="space-y-1 mb-4 text-xs text-[var(--text-secondary)] flex-1">
          {coupon.minimumOrderAmount > 0 && (
            <p>• Đơn tối thiểu: <span className="font-medium">{formatPrice(coupon.minimumOrderAmount)}</span></p>
          )}
          {coupon.maximumDiscount != null && coupon.discountType === 'percentage' && (
            <p>• Giảm tối đa: <span className="font-medium">{formatPrice(coupon.maximumDiscount)}</span></p>
          )}
          {validUntil && (
            <p>• Hết hạn: <span className="font-medium">{validUntil}</span></p>
          )}
          {remaining != null && (
            <p>• Còn lại: <span className="font-medium text-pink-500">{remaining} lượt</span></p>
          )}
        </div>

        {/* Divider dashed */}
        <div className="border-t border-dashed border-pink-200 mb-4" />

        {/* Code + Copy button */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-bold text-pink-600 text-base tracking-wider">
            {coupon.code}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
          >
            {copied ? '✓ Đã sao chép' : 'Sao chép'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SalePage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableCouponsApi()
      .then(setCoupons)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải khuyến mãi');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden gradient-hero animate-gradient py-16 sm:py-24 text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto px-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm text-pink-600 font-medium text-sm mb-6">
              <SparkleIcon size={16} />
              Ưu đãi đặc biệt
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
              Mã <span className="text-gradient">khuyến mãi</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Sao chép mã và nhập khi thanh toán để nhận ưu đãi
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full">
              <path
                d="M0 30C240 50 480 10 720 30C960 50 1200 10 1440 30V60H0V30Z"
                fill="var(--warm-white)"
              />
            </svg>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-rose-500">{error}</p>
            </div>
          )}

          {!loading && !error && coupons.length === 0 && (
            <div className="text-center py-20 text-[var(--text-secondary)]">
              <GiftIcon size={48} className="mx-auto mb-4 text-pink-200" />
              <p className="text-lg font-medium">Hiện chưa có mã khuyến mãi nào</p>
              <p className="text-sm mt-1">Hãy quay lại sau để nhận ưu đãi mới nhé!</p>
            </div>
          )}

          {!loading && !error && coupons.length > 0 && (
            <>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                {coupons.length} mã khuyến mãi đang hoạt động
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {coupons.map((coupon) => (
                  <CouponCard key={coupon._id} coupon={coupon} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-400 to-pink-500 px-8 py-3 font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Mua sắm ngay
                  <ArrowRightIcon size={18} />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
