import type { Metadata } from 'next';
import { Nunito, Quicksand } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Baby Bliss - Yêu thương từng khoảnh khắc | Sản phẩm cho bé',
  description:
    'Khám phá bộ sưu tập đồ dùng cho bé với chất liệu an toàn, thiết kế xinh xắn. Quần áo, đồ chơi, xe đẩy, và nhiều sản phẩm chất lượng cao dành cho bé yêu của bạn.',
  keywords: [
    'baby products',
    'sản phẩm cho bé',
    'quần áo trẻ em',
    'đồ chơi trẻ em',
    'xe đẩy',
    'bình sữa',
    'tã bỉm',
  ],
  authors: [{ name: 'Baby Bliss' }],
  openGraph: {
    title: 'Baby Bliss - Yêu thương từng khoảnh khắc',
    description: 'Sản phẩm chất lượng cao và an toàn cho bé yêu của bạn',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${nunito.variable} ${quicksand.variable} antialiased font-sans`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
