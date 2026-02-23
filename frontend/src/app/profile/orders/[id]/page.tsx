"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyOrderById, type Order, type OrderStatus } from "@/lib/api";
import {
	formatCurrency,
	formatDate,
	statusLabels,
	statusStyles,
} from "@/lib/order-utils";

const paymentLabels: Record<string, string> = {
	cod: "Thanh toán khi nhận hàng (COD)",
	momo: "Ví MoMo",
};

// ─── Loading Skeleton ───────────────────────────────────────────────
function OrderDetailSkeleton() {
	return (
		<>
			<Header />
			<main className="min-h-screen bg-[var(--background)]">
				<div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
					<div className="h-6 w-48 bg-pink-100 rounded mb-6" />
					<div className="space-y-6">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="bg-white rounded-2xl border border-pink-100 p-6"
							>
								<div className="h-5 w-32 bg-pink-100 rounded mb-4" />
								<div className="space-y-3">
									<div className="h-4 w-full bg-pink-50 rounded" />
									<div className="h-4 w-3/4 bg-pink-50 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}

// ─── Error State ────────────────────────────────────────────────────
function OrderDetailError({ message }: { message: string }) {
	return (
		<>
			<Header />
			<main className="min-h-screen bg-[var(--background)]">
				<div className="max-w-3xl mx-auto px-4 py-8">
					<div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
						<div className="text-5xl mb-4">😕</div>
						<h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
							Không tìm thấy đơn hàng
						</h2>
						<p className="text-[var(--text-secondary)] mb-6">{message}</p>
						<Link
							href="/profile?tab=orders"
							className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-medium"
						>
							← Quay lại lịch sử đơn hàng
						</Link>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}

// ─── Main Component ─────────────────────────────────────────────────
export default function OrderDetailPage() {
	const params = useParams();
	const orderId = params.id as string;
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadOrder = useCallback(async (id: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchMyOrderById(id);
			setOrder(data);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (authLoading) return;
		if (!user) {
			router.push("/login");
			return;
		}
		if (!orderId) return;
		loadOrder(orderId);
	}, [orderId, user, authLoading, router, loadOrder]);

	if (authLoading || loading) return <OrderDetailSkeleton />;
	if (error || !order)
		return <OrderDetailError message={error || "Đơn hàng không tồn tại"} />;

	return (
		<>
			<Header />
			<main className="min-h-screen bg-[var(--background)]">
				<div className="max-w-3xl mx-auto px-4 py-8">
					{/* Back link */}
					<Link
						href="/profile?tab=orders"
						className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium mb-6 transition-colors"
					>
						← Quay lại lịch sử đơn hàng
					</Link>

					<div className="space-y-6">
						{/* ─── Header Card ─────────────────────────────────────── */}
						<div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<div>
									<h1 className="text-xl font-bold text-[var(--text-primary)] font-display">
										Đơn hàng #{order.orderNumber}
									</h1>
									<p className="text-sm text-[var(--text-secondary)] mt-1">
										Ngày đặt: {formatDate(order.createdAt)}
									</p>
								</div>
								<span
									className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${statusStyles[order.status]}`}
								>
									{statusLabels[order.status]}
								</span>
							</div>
						</div>

						{/* ─── Items Card ──────────────────────────────────────── */}
						<div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
							<h2 className="text-lg font-bold text-[var(--text-primary)] font-display mb-4">
								Sản phẩm đã đặt
							</h2>
							<div className="divide-y divide-pink-100">
								{order.items.map((item, index) => (
									<div
										key={index}
										className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
									>
										{item.image && (
											<div className="relative w-16 h-16 rounded-lg overflow-hidden border border-pink-100 flex-shrink-0">
												<Image
													src={item.image}
													alt={item.productName}
													fill
													className="object-cover"
													sizes="64px"
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="font-medium text-[var(--text-primary)] truncate">
												{item.productName}
											</p>
											<p className="text-sm text-[var(--text-secondary)]">
												{formatCurrency(item.productPrice)} × {item.quantity}
											</p>
										</div>
										<p className="font-semibold text-[var(--text-primary)] flex-shrink-0">
											{formatCurrency(item.productPrice * item.quantity)}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* ─── Price Summary Card ──────────────────────────────── */}
						<div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
							<h2 className="text-lg font-bold text-[var(--text-primary)] font-display mb-4">
								Tổng thanh toán
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between text-[var(--text-secondary)]">
									<span>Tạm tính</span>
									<span>{formatCurrency(order.subtotal)}</span>
								</div>
								<div className="flex justify-between text-[var(--text-secondary)]">
									<span>Phí vận chuyển</span>
									<span>
										{order.shippingFee === 0
											? "Miễn phí"
											: formatCurrency(order.shippingFee)}
									</span>
								</div>
								{order.discountAmount > 0 && (
									<div className="flex justify-between text-green-600">
										<span>
											Giảm giá
											{order.couponCode ? ` (${order.couponCode})` : ""}
										</span>
										<span>-{formatCurrency(order.discountAmount)}</span>
									</div>
								)}
								<div className="border-t border-pink-100 pt-3 flex justify-between font-bold text-lg text-[var(--text-primary)]">
									<span>Tổng cộng</span>
									<span className="text-pink-600">
										{formatCurrency(order.total)}
									</span>
								</div>
							</div>
						</div>

						{/* ─── Customer Info Card ──────────────────────────────── */}
						<div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
							<h2 className="text-lg font-bold text-[var(--text-primary)] font-display mb-4">
								Thông tin giao hàng
							</h2>
							<div className="space-y-3 text-[var(--text-secondary)]">
								<div className="flex gap-3">
									<span className="font-medium text-[var(--text-primary)] w-24 flex-shrink-0">
										Họ tên
									</span>
									<span>{order.customerInfo.fullName}</span>
								</div>
								<div className="flex gap-3">
									<span className="font-medium text-[var(--text-primary)] w-24 flex-shrink-0">
										SĐT
									</span>
									<span>{order.customerInfo.phone}</span>
								</div>
								<div className="flex gap-3">
									<span className="font-medium text-[var(--text-primary)] w-24 flex-shrink-0">
										Địa chỉ
									</span>
									<span>{order.customerInfo.address}</span>
								</div>
								{order.customerInfo.notes && (
									<div className="flex gap-3">
										<span className="font-medium text-[var(--text-primary)] w-24 flex-shrink-0">
											Ghi chú
										</span>
										<span>{order.customerInfo.notes}</span>
									</div>
								)}
							</div>
						</div>

						{/* ─── Payment Method Card ─────────────────────────────── */}
						<div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
							<h2 className="text-lg font-bold text-[var(--text-primary)] font-display mb-4">
								Phương thức thanh toán
							</h2>
							<p className="text-[var(--text-secondary)]">
								{paymentLabels[order.paymentMethod] || order.paymentMethod}
							</p>
						</div>

						{/* ─── Status Timeline Card ────────────────────────────── */}
						{order.statusHistory && order.statusHistory.length > 0 && (
							<div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
								<h2 className="text-lg font-bold text-[var(--text-primary)] font-display mb-4">
									Lịch sử trạng thái
								</h2>
								<div className="relative pl-6">
									<div className="absolute left-2 top-2 bottom-2 w-0.5 bg-pink-200" />
									<div className="space-y-4">
										{order.statusHistory.map((entry, index) => (
											<div key={index} className="relative flex gap-3">
												<div
													className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 ${
														index === order.statusHistory!.length - 1
															? "bg-pink-500 border-pink-500"
															: "bg-white border-pink-300"
													}`}
												/>
												<div className="flex-1">
													<p className="font-medium text-[var(--text-primary)]">
														{statusLabels[entry.to as OrderStatus] || entry.to}
													</p>
													{entry.note && (
														<p className="text-sm text-[var(--text-secondary)]">
															{entry.note}
														</p>
													)}
													{entry.changedAt && (
														<p className="text-xs text-[var(--text-secondary)] mt-0.5">
															{formatDate(entry.changedAt)}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
