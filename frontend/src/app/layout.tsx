import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import "./globals.css";

export const metadata: Metadata = {
	title: "Baby Bliss - Yêu thương từng khoảnh khắc | Sản phẩm cho bé",
	description:
		"Khám phá bộ sưu tập đồ dùng cho bé với chất liệu an toàn, thiết kế xinh xắn. Quần áo, đồ chơi, xe đẩy, và nhiều sản phẩm chất lượng cao dành cho bé yêu của bạn.",
	keywords: [
		"baby products",
		"sản phẩm cho bé",
		"quần áo trẻ em",
		"đồ chơi trẻ em",
		"xe đẩy",
		"bình sữa",
		"tã bỉm",
	],
	authors: [{ name: "Baby Bliss" }],
	openGraph: {
		title: "Baby Bliss - Yêu thương từng khoảnh khắc",
		description: "Sản phẩm chất lượng cao và an toàn cho bé yêu của bạn",
		type: "website",
		locale: "vi_VN",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="vi">
			<body className="antialiased font-sans">
				<AuthProvider>
					<CartProvider>
						<WishlistProvider>{children}</WishlistProvider>
					</CartProvider>
				</AuthProvider>
				<Toaster
					position="top-right"
					toastOptions={{
						duration: 4000,
						style: {
							fontFamily: "inherit",
						},
					}}
					richColors
				/>
			</body>
		</html>
	);
}
