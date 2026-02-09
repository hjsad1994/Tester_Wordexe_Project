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
    <footer className="bg-gradient-to-b from-pink-50 to-pink-100/50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <LogoIcon size={48} />
              <div>
                <h2 className="text-2xl font-bold text-gradient">Baby Bliss</h2>
                <p className="text-xs text-[var(--text-muted)]">Yêu thương từng khoảnh khắc</p>
              </div>
            </Link>

            <p className="text-[var(--text-secondary)] mb-6 max-w-sm leading-relaxed">
              Chúng tôi mang đến những sản phẩm chất lượng cao và an toàn nhất cho bé yêu của bạn,
              với tình yêu thương và sự chăm sóc tận tâm.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:1900123456"
                className="flex items-center gap-3 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
              >
                <div className="p-2 rounded-full bg-pink-100">
                  <PhoneIcon size={16} className="text-pink-500" />
                </div>
                <span>1900 123 456</span>
              </a>
              <a
                href="mailto:hello@babybliss.vn"
                className="flex items-center gap-3 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
              >
                <div className="p-2 rounded-full bg-pink-100">
                  <EmailIcon size={16} className="text-pink-500" />
                </div>
                <span>hello@babybliss.vn</span>
              </a>
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <div className="p-2 rounded-full bg-pink-100">
                  <LocationIcon size={16} className="text-pink-500" />
                </div>
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg text-pink-400 hover:text-pink-500 hover:scale-110 transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookIcon size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg text-pink-400 hover:text-pink-500 hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-6 text-lg">
              {footerLinks.shop.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-pink-400 group-hover:w-3 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-6 text-lg">
              {footerLinks.support.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-pink-400 group-hover:w-3 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-6 text-lg">
              {footerLinks.company.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-pink-500 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-pink-400 group-hover:w-3 transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-pink-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-muted)] text-center sm:text-left">
              © 2026 Baby Bliss. Tất cả quyền được bảo lưu.
            </p>
            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
              Made with <HeartIcon size={14} className="text-pink-500 animate-heart-beat" /> in
              Vietnam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
