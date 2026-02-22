'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Coupon,
  type CouponDiscountType,
  type CouponPayload,
  createCouponApi,
  deleteCouponApi,
  fetchCouponsApi,
  updateCouponApi,
} from '@/lib/api';

// ─── Types & Helpers ─────────────────────────────────────────────────

interface CouponFormState {
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: string;
  maximumDiscount: string;
  minimumOrderAmount: string;
  usageLimit: string;
  perUserLimit: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
}

function createEmptyCouponForm(): CouponFormState {
  return {
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maximumDiscount: '',
    minimumOrderAmount: '0',
    usageLimit: '',
    perUserLimit: '1',
    isActive: true,
    validFrom: '',
    validUntil: '',
  };
}

const discountTypeLabels: Record<CouponDiscountType, string> = {
  percentage: 'Phần trăm (%)',
  fixed_amount: 'Số tiền cố định (đ)',
  free_shipping: 'Miễn phí vận chuyển',
};

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// ─── Component ──────────────────────────────────────────────────────

export default function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formState, setFormState] = useState<CouponFormState>(createEmptyCouponForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement>(null);

  // ─── Focus Trap ─────────────────────────────────────────────────

  const trapFocus = useCallback(
    (e: KeyboardEvent, containerRef: React.RefObject<HTMLDivElement | null>) => {
      if (e.key !== 'Tab' || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  // ─── Data Loading ───────────────────────────────────────────────

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCouponsApi();
      setCoupons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  // ─── Modal Handlers ─────────────────────────────────────────────

  const resetForm = () => {
    setFormState(createEmptyCouponForm());
    setFormError(null);
    setEditingCoupon(null);
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, []);

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
    setTimeout(() => codeInputRef.current?.focus(), 50);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormState({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maximumDiscount: coupon.maximumDiscount != null ? String(coupon.maximumDiscount) : '',
      minimumOrderAmount: String(coupon.minimumOrderAmount),
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      perUserLimit: String(coupon.perUserLimit),
      isActive: coupon.isActive,
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : '',
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : '',
    });
    setFormError(null);
    setShowModal(true);
    setTimeout(() => codeInputRef.current?.focus(), 50);
  };

  // Keyboard handlers for modals
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      trapFocus(e, modalRef);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showModal, closeModal, trapFocus]);

  useEffect(() => {
    if (!couponToDelete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCouponToDelete(null);
        setDeleteError(null);
      }
      trapFocus(e, deleteModalRef);
    };
    deleteCancelButtonRef.current?.focus();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [couponToDelete, trapFocus]);

  // ─── CRUD Handlers ──────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formState.code.trim() || !formState.name.trim()) {
      setFormError('Vui lòng nhập mã và tên khuyến mãi');
      return;
    }

    const payload: CouponPayload = {
      code: formState.code.trim().toUpperCase(),
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      discountType: formState.discountType,
      discountValue: Number(formState.discountValue) || 0,
      maximumDiscount: formState.maximumDiscount ? Number(formState.maximumDiscount) : null,
      minimumOrderAmount: Number(formState.minimumOrderAmount) || 0,
      usageLimit: formState.usageLimit ? Number(formState.usageLimit) : null,
      perUserLimit: Number(formState.perUserLimit) || 1,
      isActive: formState.isActive,
      validFrom: formState.validFrom || null,
      validUntil: formState.validUntil || null,
    };

    try {
      setIsSaving(true);
      if (editingCoupon) {
        await updateCouponApi(editingCoupon._id, payload);
      } else {
        await createCouponApi(payload);
      }
      closeModal();
      await loadCoupons();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không thể lưu mã khuyến mãi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCouponApi(coupon._id, { isActive: !coupon.isActive });
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    }
  };

  const confirmDeleteCoupon = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteError(null);
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteCouponApi(couponToDelete._id);
      setCouponToDelete(null);
      await loadCoupons();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Không thể xóa mã khuyến mãi');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Form Field Helper ─────────────────────────────────────────

  const updateField = <K extends keyof CouponFormState>(key: K, value: CouponFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[var(--text-secondary)]">Đang tải...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-heading">
            Quản lý khuyến mãi
          </h2>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-400 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px]"
          >
            + Tạo mã khuyến mãi
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        {coupons.length === 0 ? (
          <p className="text-center text-[var(--text-secondary)] py-8">Chưa có mã khuyến mãi nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-pink-100 text-left text-[var(--text-secondary)]">
                  <th className="pb-3 pr-3 font-medium">Mã</th>
                  <th className="pb-3 pr-3 font-medium">Tên</th>
                  <th className="pb-3 pr-3 font-medium">Loại</th>
                  <th className="pb-3 pr-3 font-medium">Giá trị</th>
                  <th className="pb-3 pr-3 font-medium">Đã dùng</th>
                  <th className="pb-3 pr-3 font-medium">Hiệu lực</th>
                  <th className="pb-3 pr-3 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-pink-50 last:border-b-0">
                    <td className="py-3 pr-3 font-mono font-semibold text-pink-600 uppercase">
                      {coupon.code}
                    </td>
                    <td className="py-3 pr-3 text-[var(--text-primary)]">{coupon.name}</td>
                    <td className="py-3 pr-3 text-[var(--text-secondary)]">
                      {discountTypeLabels[coupon.discountType]}
                    </td>
                    <td className="py-3 pr-3 text-[var(--text-primary)] font-medium">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : coupon.discountType === 'fixed_amount'
                          ? formatPrice(coupon.discountValue)
                          : '—'}
                    </td>
                    <td className="py-3 pr-3 text-[var(--text-secondary)]">
                      {coupon.usageCount}
                      {coupon.usageLimit != null ? `/${coupon.usageLimit}` : ''}
                    </td>
                    <td className="py-3 pr-3 text-[var(--text-secondary)] text-xs">
                      {formatDate(coupon.validFrom)} – {formatDate(coupon.validUntil)}
                    </td>
                    <td className="py-3 pr-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(coupon)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          coupon.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            coupon.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        {coupon.isActive ? 'Hoạt động' : 'Tắt'}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditCoupon(coupon)}
                          className="rounded-xl px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDeleteCoupon(coupon)}
                          className="rounded-xl px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={editingCoupon ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}
            className="relative mx-4 w-full max-w-2xl rounded-3xl border border-pink-200 bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="mb-5 text-lg font-bold text-[var(--text-primary)] font-heading">
              {editingCoupon ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}
            </h3>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Code */}
                <div>
                  <label
                    htmlFor="coupon-code"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Mã khuyến mãi *
                  </label>
                  <input
                    ref={codeInputRef}
                    id="coupon-code"
                    type="text"
                    value={formState.code}
                    onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                    placeholder="VD: GIAM10"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-mono uppercase focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="coupon-name"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Tên khuyến mãi *
                  </label>
                  <input
                    id="coupon-name"
                    type="text"
                    value={formState.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="VD: Giảm 10% đơn đầu tiên"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="coupon-description"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Mô tả
                  </label>
                  <input
                    id="coupon-description"
                    type="text"
                    value={formState.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Mô tả ngắn cho mã khuyến mãi"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label
                    htmlFor="coupon-type"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Loại giảm giá
                  </label>
                  <select
                    id="coupon-type"
                    value={formState.discountType}
                    onChange={(e) =>
                      updateField('discountType', e.target.value as CouponDiscountType)
                    }
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors bg-white"
                  >
                    {(Object.entries(discountTypeLabels) as [CouponDiscountType, string][]).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Discount Value */}
                {formState.discountType !== 'free_shipping' && (
                  <div>
                    <label
                      htmlFor="coupon-value"
                      className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      Giá trị giảm {formState.discountType === 'percentage' ? '(%)' : '(đ)'}
                    </label>
                    <input
                      id="coupon-value"
                      type="number"
                      min="0"
                      step={formState.discountType === 'percentage' ? '1' : '1000'}
                      value={formState.discountValue}
                      onChange={(e) => updateField('discountValue', e.target.value)}
                      className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Maximum Discount (percentage only) */}
                {formState.discountType === 'percentage' && (
                  <div>
                    <label
                      htmlFor="coupon-max-discount"
                      className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      Giảm tối đa (đ)
                    </label>
                    <input
                      id="coupon-max-discount"
                      type="number"
                      min="0"
                      step="1000"
                      value={formState.maximumDiscount}
                      onChange={(e) => updateField('maximumDiscount', e.target.value)}
                      placeholder="Không giới hạn"
                      className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Minimum Order Amount */}
                <div>
                  <label
                    htmlFor="coupon-min-order"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Đơn tối thiểu (đ)
                  </label>
                  <input
                    id="coupon-min-order"
                    type="number"
                    min="0"
                    step="1000"
                    value={formState.minimumOrderAmount}
                    onChange={(e) => updateField('minimumOrderAmount', e.target.value)}
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label
                    htmlFor="coupon-usage-limit"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Giới hạn sử dụng
                  </label>
                  <input
                    id="coupon-usage-limit"
                    type="number"
                    min="0"
                    value={formState.usageLimit}
                    onChange={(e) => updateField('usageLimit', e.target.value)}
                    placeholder="Không giới hạn"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                  />
                </div>

                {/* Per User Limit */}
                <div>
                  <label
                    htmlFor="coupon-per-user"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Giới hạn / người dùng
                  </label>
                  <input
                    id="coupon-per-user"
                    type="number"
                    min="1"
                    value={formState.perUserLimit}
                    onChange={(e) => updateField('perUserLimit', e.target.value)}
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                  />
                </div>

                {/* Valid From */}
                <div>
                  <label
                    htmlFor="coupon-valid-from"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Bắt đầu hiệu lực
                  </label>
                  <input
                    id="coupon-valid-from"
                    type="date"
                    value={formState.validFrom}
                    onChange={(e) => updateField('validFrom', e.target.value)}
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label
                    htmlFor="coupon-valid-until"
                    className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Kết thúc hiệu lực
                  </label>
                  <input
                    id="coupon-valid-until"
                    type="date"
                    value={formState.validUntil}
                    onChange={(e) => updateField('validUntil', e.target.value)}
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus-visible:outline-none transition-colors"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 sm:col-span-2">
                  <label
                    htmlFor="coupon-active"
                    className="text-sm font-medium text-[var(--text-secondary)] cursor-pointer"
                  >
                    Kích hoạt
                  </label>
                  <button
                    id="coupon-active"
                    type="button"
                    role="switch"
                    aria-checked={formState.isActive}
                    onClick={() => updateField('isActive', !formState.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                      formState.isActive ? 'bg-pink-400' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formState.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-pink-200 px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-pink-50 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-gradient-to-r from-pink-400 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Đang lưu...' : editingCoupon ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm">
          <div
            ref={deleteModalRef}
            role="alertdialog"
            aria-modal="true"
            aria-label="Xác nhận xóa mã khuyến mãi"
            className="relative mx-4 w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)] font-heading">
              Xóa mã khuyến mãi?
            </h3>
            <p className="mb-5 text-sm text-[var(--text-secondary)]">
              Bạn có chắc muốn xóa mã{' '}
              <span className="font-mono font-semibold text-rose-600">{couponToDelete.code}</span>?
              Hành động này không thể hoàn tác.
            </p>

            {deleteError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                ref={deleteCancelButtonRef}
                type="button"
                onClick={() => {
                  setCouponToDelete(null);
                  setDeleteError(null);
                }}
                className="rounded-2xl border border-pink-200 px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-pink-50 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDeleteCoupon()}
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
