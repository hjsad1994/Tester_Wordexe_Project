'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ArrowRightIcon, GiftIcon, ShieldIcon, SparkleIcon, TruckIcon } from '@/components/icons';
import {
  type ProductIllustrationType,
  productIllustrations,
} from '@/components/icons/ProductIllustrations';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createOrder as createOrderApi, validateCouponApi } from '@/lib/api';
import type { ValidateCouponResponse } from '@/lib/api';

interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

type PaymentMethod = 'cod' | 'momo';

const SHIPPING_FEE = 30000;

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

function CheckoutContent() {
  const { cartItems, clearCart, buyNowItem, clearBuyNowItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const isOrderCompleteRef = useRef(false);

  const checkoutItems = useMemo(() => {
    if (isBuyNow && buyNowItem) return [buyNowItem];
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems]
  );

  useEffect(() => {
    if (checkoutItems.length === 0 && !isOrderCompleteRef.current) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [showMomoOverlay, setShowMomoOverlay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [showCouponSection, setShowCouponSection] = useState(false);

  // Derived totals (after coupon state)
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const effectiveShippingFee =
    appliedCoupon?.coupon.discountType === 'free_shipping' ? 0 : SHIPPING_FEE;
  const total = subtotal - discountAmount + effectiveShippingFee;

  // Pre-fill form from user profile when logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^0[0-9]{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Coupon handlers
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Vui lòng nhập mã khuyến mãi');
      return;
    }
    try {
      setIsValidatingCoupon(true);
      setCouponError(null);
      const result = await validateCouponApi(code, subtotal);
      setAppliedCoupon(result);
      setCouponError(null);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Mã khuyến mãi không hợp lệ');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const completeOrder = async (method: PaymentMethod) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdOrder = await createOrderApi({
        items: checkoutItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
        },
        paymentMethod: method,
        shippingFee: SHIPPING_FEE,
        couponCode: appliedCoupon?.coupon.code,
      });

      sessionStorage.setItem('lastOrderId', createdOrder._id);
      sessionStorage.setItem('lastOrderToken', createdOrder.publicAccessToken || '');

      isOrderCompleteRef.current = true;

      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }

      router.push(
        `/checkout/success?orderId=${encodeURIComponent(createdOrder._id)}&token=${encodeURIComponent(createdOrder.publicAccessToken || '')}`
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }
    setSubmitError(null);

    if (paymentMethod === 'momo') {
      setShowMomoOverlay(true);
      return;
    }

    await completeOrder('cod');
  };

  if (checkoutItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
            <Link href="/" className="hover:text-pink-500 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-pink-500 transition-colors">
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-medium">Thanh toán</span>
          </nav>

          {/* Page Title */}
          <div className="flex items-center gap-3 mb-8">
            <ShieldIcon size={28} className="text-pink-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-heading">
              Thanh toán
            </h1>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit}>
            {submitError && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {submitError}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column — Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Info */}
                <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-5 flex items-center gap-2">
                    <TruckIcon size={20} className="text-pink-400" />
                    Thông tin giao hàng
                  </h2>
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Họ và tên <span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${errors.fullName ? 'border-[var(--destructive)]' : 'border-pink-200'} bg-white text-[var(--text-primary)] focus:border-pink-400 focus:outline-none transition-colors`}
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.fullName && (
                        <p
                          className="text-sm text-[var(--destructive)] mt-1"
                          role="alert"
                          aria-live="polite"
                        >
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Số điện thoại <span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${errors.phone ? 'border-[var(--destructive)]' : 'border-pink-200'} bg-white text-[var(--text-primary)] focus:border-pink-400 focus:outline-none transition-colors`}
                        placeholder="0912345678"
                      />
                      {errors.phone && (
                        <p
                          className="text-sm text-[var(--destructive)] mt-1"
                          role="alert"
                          aria-live="polite"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Địa chỉ <span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${errors.address ? 'border-[var(--destructive)]' : 'border-pink-200'} bg-white text-[var(--text-primary)] focus:border-pink-400 focus:outline-none transition-colors`}
                        placeholder="123 Đường ABC, Phường Bến Nghé, Quận 1, TP. HCM"
                      />
                      {errors.address && (
                        <p
                          className="text-sm text-[var(--destructive)] mt-1"
                          role="alert"
                          aria-live="polite"
                        >
                          {errors.address}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Ghi chú
                      </label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 bg-white text-[var(--text-primary)] focus:border-pink-400 focus:outline-none transition-colors resize-none"
                        placeholder="Ghi chú thêm..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6">
                  <fieldset>
                    <legend className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4">
                      Phương thức thanh toán
                    </legend>
                    <div className="space-y-3">
                      {/* COD */}
                      <label
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-pink-100 hover:border-pink-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-5 h-5 accent-pink-500"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                            <TruckIcon size={20} className="text-pink-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">
                              Thanh toán khi nhận hàng (COD)
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              Thanh toán bằng tiền mặt khi nhận hàng
                            </p>
                          </div>
                        </div>
                      </label>
                      {/* MoMo */}
                      <label
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          paymentMethod === 'momo'
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-pink-100 hover:border-pink-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="momo"
                          checked={paymentMethod === 'momo'}
                          onChange={() => setPaymentMethod('momo')}
                          className="w-5 h-5 accent-pink-500"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-pink-500">M</span>
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">Ví MoMo</p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              Thanh toán qua ví điện tử MoMo
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </fieldset>
                </div>
              </div>

              {/* Right Column — Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 sticky top-28">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-5 flex items-center gap-2">
                    <SparkleIcon size={20} className="text-pink-400" />
                    Đơn hàng của bạn
                  </h2>
                  {/* Item list */}
                  <div className="space-y-3 mb-5">
                    {checkoutItems.map((item) => {
                      const Illustration =
                        productIllustrations[item.image as ProductIllustrationType];
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.imageUrl && !imgErrors.has(item.id) ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                                onError={() => setImgErrors((prev) => new Set(prev).add(item.id))}
                              />
                            ) : Illustration ? (
                              <Illustration size={36} />
                            ) : (
                              <GiftIcon size={24} className="text-pink-300" />
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
                  {/* Coupon Section */}
                  <div className="border-t border-pink-100 pt-4 mb-1">
                    {!showCouponSection && !appliedCoupon ? (
                      <button
                        type="button"
                        onClick={() => setShowCouponSection(true)}
                        className="text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 rounded-lg px-1"
                      >
                        Bạn có mã khuyến mãi?
                      </button>
                    ) : appliedCoupon ? (
                      <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                        <div>
                          <span className="text-sm font-medium text-green-700">
                            🎉 {appliedCoupon.coupon.code}
                          </span>
                          <p className="text-xs text-green-600">{appliedCoupon.coupon.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-green-600 hover:text-green-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded px-1"
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã khuyến mãi"
                            className="flex-1 rounded-xl border border-pink-200 px-3 py-2 text-sm font-mono uppercase focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => void handleApplyCoupon()}
                            disabled={isValidatingCoupon}
                            className="rounded-xl bg-pink-100 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-200 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isValidatingCoupon ? '...' : 'Áp dụng'}
                          </button>
                        </div>
                        {couponError && <p className="text-xs text-rose-500">{couponError}</p>}
                        <button
                          type="button"
                          onClick={() => {
                            setShowCouponSection(false);
                            setCouponCode('');
                            setCouponError(null);
                          }}
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                        >
                          Ẩn
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Totals */}
                  <div className="border-t border-pink-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Tạm tính</span>
                      <span className="text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                      <span
                        className={`text-[var(--text-primary)] ${effectiveShippingFee === 0 ? 'line-through text-[var(--text-muted)]' : ''}`}
                      >
                        {effectiveShippingFee === 0
                          ? formatPrice(SHIPPING_FEE)
                          : formatPrice(effectiveShippingFee)}
                      </span>
                    </div>
                    {effectiveShippingFee === 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Miễn phí vận chuyển</span>
                        <span className="text-green-600 font-medium">
                          -{formatPrice(SHIPPING_FEE)}
                        </span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          Giảm giá{appliedCoupon ? ` (${appliedCoupon.coupon.code})` : ''}
                        </span>
                        <span className="text-green-600 font-medium">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-pink-100">
                      <span className="text-[var(--text-primary)]">Tổng cộng</span>
                      <span className="text-pink-500">{formatPrice(total)}</span>
                    </div>
                  </div>
                  {/* Submit button */}
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full mt-5 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}</span>
                    <ArrowRightIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      {/* MoMo Overlay */}
      {showMomoOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-500">M</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] font-heading mb-2">
              Thanh toán MoMo
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">Quét mã QR để thanh toán</p>
            {/* QR Code Placeholder */}
            <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-2xl border-2 border-dashed border-pink-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-xs text-[var(--text-muted)]">QR Code</p>
              </div>
            </div>
            <p className="text-lg font-bold text-pink-500 mb-1">{formatPrice(total)}</p>
            <p className="text-xs text-[var(--text-muted)] mb-6 italic">
              ⚠️ Đây là mô phỏng — không phải thanh toán thật
            </p>
            <button
              onClick={() => {
                setShowMomoOverlay(false);
                void completeOrder('momo');
              }}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl mb-3 hover:shadow-lg transition-all"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đã thanh toán'}
            </button>
            <button
              onClick={() => setShowMomoOverlay(false)}
              className="w-full py-3 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--warm-white)] flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">Đang tải...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
