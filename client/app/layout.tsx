import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import AuthGuard from "./components/AuthGuard"; // 👈 Import người bảo vệ vào đây

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Web",
  description: "Hệ thống thi trắc nghiệm và tự luận",
};

// Cấu hình hiển thị chuẩn cho điện thoại
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* AuthGuard chạy ngầm để kiểm tra đăng nhập */}
        <AuthGuard />

        {/* Container chính: Ngăn cuộn ngang và set màu nền */}
        <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
          <Header />
          
          {/* Main Content: Responsive Padding */}
          <main className="mx-auto w-full max-w-5xl px-4 py-4 md:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}