'use client';
import { useEffect, useState } from "react"; // Thêm useState để tránh lỗi Hydration (nếu cần)
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  
  // State này để đảm bảo component đã load xong ở client mới render user
  // (Giúp tránh lỗi giao diện chớp nháy khi reload)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setIsMounted(true);
  }, [loadFromStorage]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Nếu chưa mount xong thì render header rỗng hoặc loading nhẹ để tránh lỗi UI
  if (!isMounted) return (
    <header className="border-b-2 border-pink-200 bg-white shadow-sm h-16"></header>
  );

  return (
    <header className="sticky top-0 z-50 border-b-2 border-pink-200 bg-gradient-to-r from-white to-pink-50 shadow-md backdrop-blur-sm bg-opacity-95">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-3 md:px-4 md:py-4">
        
        {/* LOGO AREA */}
        <Link href={user ? "/home" : "/"} className="font-bold text-xl md:text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 md:gap-2 hover:scale-105 transition-transform">
          <span className="text-2xl md:text-3xl">🎓</span>
          <span className={user ? "hidden sm:inline" : ""}>Exam Web</span>
        </Link>

        {/* NAVIGATION AREA */}
        <nav className="flex items-center gap-2 md:gap-4 text-sm">
          {user ? (
            <>
              {/* Nút Trang chủ */}
              <Link href="/home" className="flex items-center gap-1 px-2 py-1.5 md:px-3 rounded-lg hover:bg-pink-100 transition-colors font-medium text-gray-700 hover:text-pink-600">
                <span>🏠</span>
                <span className="hidden md:inline">Trang chủ</span>
              </Link>

              {/* Nút Tạo đề (Chỉ hiện cho Teacher) */}
              {user.role === 'teacher' && (
                <Link href="/exams/create" className="flex items-center gap-1 px-2 py-1.5 md:px-3 rounded-lg hover:bg-purple-100 transition-colors font-medium text-gray-700 hover:text-purple-600">
                  <span>📝</span>
                  <span className="hidden md:inline">Tạo đề</span>
                </Link>
              )}

              {/* Nút Làm đề */}
              <Link href="/exams/take" className="flex items-center gap-1 px-2 py-1.5 md:px-3 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-gray-700 hover:text-emerald-600">
                <span>✏️</span>
                <span className="hidden md:inline">Làm đề</span>
              </Link>

              {/* USER INFO AREA */}
              <div className="flex items-center gap-2 pl-2 md:pl-4 md:border-l-2 md:border-pink-200 ml-1">
                
                {/* Thông tin user (Ẩn trên điện thoại, hiện trên PC) */}
                <div className="hidden md:flex flex-col items-end leading-tight mr-2">
                  <span className="text-gray-700 font-bold text-xs truncate max-w-[100px]">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-[10px] text-purple-600 bg-purple-100 px-2 rounded-full font-medium">
                    {user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                  </span>
                </div>

                {/* Nút Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-400 to-pink-500 rounded-lg hover:from-red-500 hover:to-pink-600 shadow-sm hover:shadow-md transition-all transform hover:scale-105"
                  title="Đăng xuất"
                >
                  <span>🚪</span>
                  <span className="hidden md:inline">Thoát</span>
                </button>
              </div>
            </>
          ) : (
            // GIAO DIỆN KHÁCH (Chưa đăng nhập)
            <>
              <Link href="/login" className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium hover:from-blue-500 hover:to-blue-700 shadow-md transition-all">
                Login
              </Link>
              <Link href="/register" className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-gradient-to-r from-purple-400 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-700 shadow-md transition-all">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}