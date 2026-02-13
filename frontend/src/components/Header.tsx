"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
	CartIcon,
	CloseIcon,
	GiftIcon,
	HeartOutlineIcon,
	LoginIcon,
	LogoIcon,
	LogoutIcon,
	MenuIcon,
	SparkleIcon,
	UserIcon,
	UserPlusIcon,
} from "./icons";

const navLinks = [
	{ name: "Trang chủ", href: "/" },
	{ name: "Sản phẩm", href: "/products" },
	{ name: "Khuyến mãi", href: "/sale" },
	{ name: "Danh mục", href: "/categories" },
	{ name: "Về chúng tôi", href: "/about" },
];

export default function Header() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { cartCount } = useCart();
	const { wishlistCount } = useWishlist();
	const { isAuthenticated, isAdmin, logout } = useAuth();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<>
			{/* Top Banner */}
			<div className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-400 text-white py-2 px-4 text-center text-sm font-medium animate-gradient">
				<span className="inline-flex items-center gap-2">
					<GiftIcon size={16} className="animate-bounce-soft" />
					Miễn phí vận chuyển cho đơn hàng từ 500K
					<SparkleIcon size={14} className="animate-sparkle" />
				</span>
			</div>

			{/* Main Header */}
			<header
				className={`sticky top-0 z-50 transition-all duration-500 ${
					isScrolled
						? "glass shadow-lg py-3"
						: "bg-white/80 backdrop-blur-sm py-4"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-3 group">
							<div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
								<LogoIcon size={48} />
							</div>
							<div className="hidden sm:block">
								<h1 className="text-2xl font-bold text-gradient font-display tracking-tight">
									Baby Bliss
								</h1>
								<p className="text-xs text-[var(--text-muted)] -mt-1">
									Yêu thương từng khoảnh khắc
								</p>
							</div>
						</Link>

						{/* Desktop Navigation */}
						<nav className="hidden lg:flex items-center gap-1">
							{navLinks.map((link, index) => (
								<Link
									key={link.name}
									href={link.href}
									className="relative px-4 py-2 text-[var(--text-primary)] font-medium rounded-full transition-all duration-300 hover:text-pink-500 hover:bg-pink-50 group"
									style={{ animationDelay: `${index * 0.1}s` }}
								>
									{link.name}
									<span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-300 group-hover:w-1/2 group-hover:left-1/4"></span>
								</Link>
							))}
						</nav>

						{/* Action Buttons */}
						<div className="flex items-center gap-2 sm:gap-4">
							{/* Wishlist */}
							<Link
								href="/wishlist"
								className="hidden sm:flex p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300 relative"
								aria-label="Xem danh sách yêu thích"
							>
								<HeartOutlineIcon size={22} />
								{wishlistCount > 0 && (
									<span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
										{wishlistCount > 99 ? "99+" : wishlistCount}
									</span>
								)}
							</Link>

							{/* Auth Actions */}
							{isAuthenticated ? (
								<>
									{isAdmin && (
										<Link
											href="/products#admin-panel"
											className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all duration-300 text-sm font-medium"
											aria-label="Mở khu vực quản trị"
										>
											<SparkleIcon size={16} />
											<span className="hidden md:inline">Quản trị</span>
										</Link>
									)}
									<Link
										href="/profile"
										className="hidden sm:flex p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
										aria-label="Mở tài khoản"
									>
										<UserIcon size={22} />
									</Link>
									<button
										onClick={logout}
										className="hidden sm:flex p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
										aria-label="Đăng xuất"
									>
										<LogoutIcon size={22} />
									</button>
								</>
							) : (
								<>
									<Link
										href="/login"
										className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300 text-sm font-medium"
										aria-label="Đăng nhập"
									>
										<LoginIcon size={20} />
										<span className="hidden md:inline">Đăng nhập</span>
									</Link>
									<Link
										href="/register"
										className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-all duration-300 text-sm font-medium"
										aria-label="Đăng ký"
									>
										<UserPlusIcon size={20} />
										<span className="hidden md:inline">Đăng ký</span>
									</Link>
								</>
							)}

							{/* Cart */}
							<Link
								href="/cart"
								className="relative p-2.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
								aria-label="Xem giỏ hàng"
							>
								<CartIcon size={22} />
								{cartCount > 0 && (
									<span
										className="absolute -top-1 -right-1 w-5 h-5 bg-white text-pink-500 text-xs font-bold rounded-full flex items-center justify-center shadow-md"
										aria-live="polite"
										role="status"
									>
										{cartCount > 99 ? "99+" : cartCount}
									</span>
								)}
							</Link>

							{/* Mobile Menu Button */}
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
								aria-expanded={isMobileMenuOpen}
								className="lg:hidden p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
							>
								{isMobileMenuOpen ? (
									<CloseIcon size={24} />
								) : (
									<MenuIcon size={24} />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				<div
					className={`lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-500 ${
						isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
					}`}
				>
					<nav className="flex flex-col p-4">
						{navLinks.map((link, index) => (
							<Link
								key={link.name}
								href={link.href}
								className="px-4 py-3 text-[var(--text-primary)] font-medium rounded-xl transition-all duration-300 hover:text-pink-500 hover:bg-pink-50 animate-fade-in-up"
								style={{ animationDelay: `${index * 0.1}s` }}
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{link.name}
							</Link>
						))}
						<div className="flex flex-col gap-2 mt-4 pt-4 border-t border-pink-100">
							<Link
								href="/wishlist"
								onClick={() => setIsMobileMenuOpen(false)}
								className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
							>
								<HeartOutlineIcon size={20} />
								<span>
									Yêu thích
									{wishlistCount > 0
										? ` (${wishlistCount > 99 ? "99+" : wishlistCount})`
										: ""}
								</span>
							</Link>
							{isAuthenticated ? (
								<>
									{isAdmin && (
										<Link
											href="/products#admin-panel"
											onClick={() => setIsMobileMenuOpen(false)}
											className="flex items-center gap-2 px-4 py-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
										>
											<SparkleIcon size={20} />
											<span>Quản trị</span>
										</Link>
									)}
									<Link
										href="/profile"
										onClick={() => setIsMobileMenuOpen(false)}
										className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
									>
										<UserIcon size={20} />
										<span>Tài khoản</span>
									</Link>
									<button
										onClick={() => {
											logout();
											setIsMobileMenuOpen(false);
										}}
										className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
									>
										<LogoutIcon size={20} />
										<span>Đăng xuất</span>
									</button>
								</>
							) : (
								<>
									<Link
										href="/login"
										onClick={() => setIsMobileMenuOpen(false)}
										className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
									>
										<LoginIcon size={20} />
										<span>Đăng nhập</span>
									</Link>
									<Link
										href="/register"
										onClick={() => setIsMobileMenuOpen(false)}
										className="flex items-center gap-2 px-4 py-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
									>
										<UserPlusIcon size={20} />
										<span>Đăng ký</span>
									</Link>
								</>
							)}
						</div>
					</nav>
				</div>
			</header>
		</>
	);
}
