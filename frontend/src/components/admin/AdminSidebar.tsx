'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = [
  { label: 'Sản phẩm', href: '/admin/products' },
  { label: 'Danh mục', href: '/admin/categories' },
  { label: 'Đơn hàng', href: '/admin/orders' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-pink-100 bg-white md:w-56 md:min-h-[calc(100vh-72px)] md:border-b-0 md:border-r">
      <nav
        aria-label="Điều hướng quản trị"
        className="flex gap-2 overflow-x-auto px-4 py-3 md:flex-col md:gap-1 md:overflow-visible"
      >
        <p className="hidden px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:block">
          Quản trị
        </p>
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-[var(--text-secondary)] hover:bg-pink-50 hover:text-pink-500'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
