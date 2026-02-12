import Link from 'next/link';
import {
  LogoIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  HeartIcon,
} from './icons';

const footerLinks = {
  shop: {
    title: 'Mua sắm',
    links: [
      { name: 'Quần áo', href: '/products/clothes' },
      { name: 'Đồ chơi', href: '/products/toys' },
      { name: 'Chăm sóc', href: '/products/care' },
      { name: 'Xe đẩy & Nôi', href: '/products/strollers' },
      { name: 'Khuyến mãi', href: '/sale' },
    ],
  },
  support: {
    title: 'Hỗ trợ',
    links: [
      { name: 'Hướng dẫn mua hàng', href: '/guide' },
      { name: 'Chính sách đổi trả', href: '/returns' },
      { name: 'Chính sách vận chuyển', href: '/shipping' },
      { name: 'Câu hỏi thường gặp', href: '/faq' },
      { name: 'Liên hệ', href: '/contact' },
    ],
  },
  company: {
    title: 'Về chúng tôi',
    links: [
      { name: 'Giới thiệu', href: '/about' },
      { name: 'Tuyển dụng', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Đối tác', href: '/partners' },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-pink-50 to-pink-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-6">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoIcon size={36} />
              <div>
                <h2 className="text-xl font-bold text-gradient leading-tight">Baby Bliss</h2>
                <p className="text-[10px] text-[var(--text-muted)]">Yêu thương từng khoảnh khắc</p>
              </div>
            </Link>

            <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
              Chúng tôi mang đến những sản phẩm chất lượng cao và an toàn nhất cho bé yêu của bạn,
              với tình yêu thương và sự chăm sóc tận tâm.
            </p>

            {/* Contact Info - compact inline */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[var(--text-secondary)]">
              <a
                href="tel:1900123456"
                className="inline-flex items-center gap-1.5 hover:text-pink-500 transition-colors"
              >
                <PhoneIcon size={14} className="text-pink-500" />
                <span>1900 123 456</span>
              </a>
              <a
                href="mailto:hello@babybliss.vn"
                className="inline-flex items-center gap-1.5 hover:text-pink-500 transition-colors"
              >
                <EmailIcon size={14} className="text-pink-500" />
                <span>hello@babybliss.vn</span>
              </a>
              <span className="inline-flex items-center gap-1.5">
                <LocationIcon size={14} className="text-pink-500" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white shadow-sm hover:shadow-md text-pink-400 hover:text-pink-500 hover:scale-110 transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-white shadow-sm hover:shadow-md text-pink-400 hover:text-pink-500 hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wide">
              {footerLinks.shop.title}
            </h3>
            <ul className="space-y-1.5">
              {footerLinks.shop.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-0.5 bg-pink-400 group-hover:w-2.5 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wide">
              {footerLinks.support.title}
            </h3>
            <ul className="space-y-1.5">
              {footerLinks.support.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-0.5 bg-pink-400 group-hover:w-2.5 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wide">
              {footerLinks.company.title}
            </h3>
            <ul className="space-y-1.5">
              {footerLinks.company.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-0.5 bg-pink-400 group-hover:w-2.5 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 border-t border-pink-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-[var(--text-muted)] text-center sm:text-left">
              © 2026 Baby Bliss. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              Made with <HeartIcon size={12} className="text-pink-500 animate-heart-beat" /> in
              Vietnam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
