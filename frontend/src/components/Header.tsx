'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LogoIcon,
  SearchIcon,
  UserIcon,
  CartIcon,
  HeartOutlineIcon,
  MenuIcon,
  CloseIcon,
  GiftIcon,
  SparkleIcon,
} from './icons';

const navLinks = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '/products' },
  { name: 'Khuyến mãi', href: '/sale' },
  { name: 'Danh mục', href: '/categories' },
  { name: 'Về chúng tôi', href: '/about' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          isScrolled ? 'glass shadow-lg py-3' : 'bg-white/80 backdrop-blur-sm py-4'
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
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label={isSearchOpen ? 'Đóng tìm kiếm' : 'Mở tìm kiếm'}
                aria-expanded={isSearchOpen}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
              >
                <SearchIcon size={22} />
              </button>

              {/* Wishlist */}
              <button
                className="hidden sm:flex p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300 relative"
                aria-label="Xem danh sách yêu thích"
              >
                <HeartOutlineIcon size={22} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                  3
                </span>
              </button>

              {/* User */}
              <button
                className="hidden sm:flex p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
                aria-label="Mở tài khoản"
              >
                <UserIcon size={22} />
              </button>

              {/* Cart */}
              <button
                className="relative p-2.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                aria-label="Xem giỏ hàng"
              >
                <CartIcon size={22} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-pink-500 text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  2
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                aria-expanded={isMobileMenuOpen}
                className="lg:hidden p-2 rounded-full text-[var(--text-secondary)] hover:text-pink-500 hover:bg-pink-50 transition-all duration-300"
              >
                {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar (Expandable) */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isSearchOpen ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm cho bé yêu..."
                className="w-full px-5 py-3 pl-12 rounded-full border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white/80 backdrop-blur-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all duration-300"
              />
              <SearchIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
            <div className="flex gap-4 mt-4 pt-4 border-t border-pink-100">
              <button className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors">
                <HeartOutlineIcon size={20} />
                <span>Yêu thích</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-pink-500 transition-colors">
                <UserIcon size={20} />
                <span>Tài khoản</span>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
