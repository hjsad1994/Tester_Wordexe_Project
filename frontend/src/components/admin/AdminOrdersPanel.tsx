'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminOrders,
  type Order,
  type OrderStatus,
  softDeleteOrder,
  updateOrderStatus,
} from '@/lib/api';

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao thành công' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const statusLabelMap: Record<OrderStatus, string> = Object.fromEntries(
  statusOptions.map((option) => [option.value, option.label])
) as Record<OrderStatus, string>;

const statusClassMap: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const formatPrice = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedStatusByOrderId, setSelectedStatusByOrderId] = useState<
    Record<string, OrderStatus>
  >({});
  const [deleteModalOrder, setDeleteModalOrder] = useState<Order | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAdminOrders({ page: 1, limit: 50 });
      setOrders(result.orders);
      setSelectedStatusByOrderId(
        result.orders.reduce<Record<string, OrderStatus>>((acc, order) => {
          acc[order._id] = order.status;
          return acc;
        }, {})
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const canEditStatus = useMemo(() => {
    return (status: OrderStatus) => status !== 'delivered';
  }, []);

  const handleSaveStatus = async (order: Order) => {
    const nextStatus = selectedStatusByOrderId[order._id];

    if (!nextStatus || nextStatus === order.status || updatingOrderId) {
      return;
    }

    try {
      setUpdatingOrderId(order._id);
      setError(null);
      const updated = await updateOrderStatus(order._id, nextStatus);
      setOrders((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setSelectedStatusByOrderId((prev) => ({
        ...prev,
        [updated._id]: updated.status,
      }));
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : 'Không thể cập nhật trạng thái'
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openArchiveModal = (order: Order) => {
    setDeleteModalOrder(order);
    setDeleteReason('');
    setError(null);
  };

  const confirmArchive = async () => {
    if (!deleteModalOrder || isDeleting) {
      return;
    }

    if (!deleteReason.trim()) {
      setError('Vui lòng nhập lý do lưu trữ đơn hàng');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await softDeleteOrder(deleteModalOrder._id, deleteReason.trim());
      setOrders((prev) => prev.filter((order) => order._id !== deleteModalOrder._id));
      setDeleteModalOrder(null);
      setDeleteReason('');
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Không thể lưu trữ đơn hàng');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Quản lý đơn hàng</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Đơn đã giao thành công sẽ bị khóa chỉnh sửa trạng thái.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
        >
          Làm mới danh sách
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-left text-[var(--text-muted)]">
              <th className="py-2 pr-2">Mã đơn</th>
              <th className="py-2 pr-2">Khách hàng</th>
              <th className="py-2 pr-2">SĐT</th>
              <th className="py-2 pr-2">Tổng tiền</th>
              <th className="py-2 pr-2">Trạng thái</th>
              <th className="py-2 pr-2">Ngày tạo</th>
              <th className="py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={7}>
                  Đang tải danh sách đơn hàng...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={7}>
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const selectedStatus = selectedStatusByOrderId[order._id] || order.status;
                const statusLocked = !canEditStatus(order.status);

                return (
                  <tr key={order._id} className="align-top border-b border-pink-50">
                    <td className="py-3 pr-2 font-semibold text-[var(--text-primary)]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="text-[var(--text-primary)]">
                        {order.customerInfo.fullName}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] line-clamp-1">
                        {[
                          order.customerInfo.address,
                          order.customerInfo.ward,
                          order.customerInfo.district,
                          order.customerInfo.province,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </td>
                    <td className="py-3 pr-2">{order.customerInfo.phone}</td>
                    <td className="py-3 pr-2 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 pr-2">
                      <span
                        className={`inline-flex mb-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusClassMap[order.status]}`}
                      >
                        {statusLabelMap[order.status]}
                      </span>
                      <div>
                        <select
                          value={selectedStatus}
                          disabled={statusLocked || updatingOrderId === order._id}
                          onChange={(event) =>
                            setSelectedStatusByOrderId((prev) => ({
                              ...prev,
                              [order._id]: event.target.value as OrderStatus,
                            }))
                          }
                          className="min-h-[36px] rounded-lg border border-pink-200 px-2 py-1 text-xs"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 pr-2">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => void handleSaveStatus(order)}
                          disabled={
                            statusLocked ||
                            updatingOrderId === order._id ||
                            selectedStatus === order.status
                          }
                          className="min-h-[36px] rounded-lg border border-pink-300 px-3 py-1.5 text-pink-600 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingOrderId === order._id ? 'Đang lưu...' : 'Lưu trạng thái'}
                        </button>
                        <button
                          onClick={() => openArchiveModal(order)}
                          className="min-h-[36px] rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          Lưu trữ đơn
                        </button>
                      </div>
                      {statusLocked && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          Đơn đã giao nên bị khóa chỉnh trạng thái.
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {deleteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng modal lưu trữ"
            onClick={() => {
              if (!isDeleting) {
                setDeleteModalOrder(null);
                setDeleteReason('');
              }
            }}
            className="absolute inset-0 bg-slate-900/45"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-order-title"
            className="relative z-10 w-full max-w-md rounded-3xl border border-rose-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <h3 id="archive-order-title" className="text-lg font-bold text-[var(--text-primary)]">
              Lưu trữ đơn hàng
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Đơn{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {deleteModalOrder.orderNumber}
              </span>{' '}
              sẽ được lưu trữ mềm để phục vụ đối soát, không bị xóa vĩnh viễn.
            </p>

            <label className="mt-4 block text-sm font-medium text-[var(--text-primary)]">
              Lý do lưu trữ
              <textarea
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                rows={3}
                placeholder="Ví dụ: Đơn trùng lặp đã được xử lý ở mã khác"
                className="mt-1 w-full resize-none rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
              />
            </label>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOrder(null);
                  setDeleteReason('');
                }}
                disabled={isDeleting}
                className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void confirmArchive()}
                disabled={isDeleting}
                className="min-h-[44px] rounded-xl border border-rose-400 bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? 'Đang lưu trữ...' : 'Xác nhận lưu trữ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
