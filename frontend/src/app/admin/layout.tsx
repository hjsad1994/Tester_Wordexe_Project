"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { isAdmin, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAdmin) {
			router.replace("/");
		}
	}, [isAdmin, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[var(--warm-white)]">
				<Header />
				<div className="flex items-center justify-center py-20">
					<p className="text-[var(--text-muted)]">Đang tải...</p>
				</div>
				<Footer />
			</div>
		);
	}

	if (!isAdmin) {
		return null;
	}

	return (
		<div className="min-h-screen bg-[var(--warm-white)]">
			<Header />
			<div
				data-testid="admin-layout-shell"
				className="flex w-full flex-col md:flex-row"
			>
				<AdminSidebar />
				<main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
			</div>
			<Footer />
		</div>
	);
}
