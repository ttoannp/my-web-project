// components/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/authStore'; // Đường dẫn tới store của bạn

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    // 1. Nạp user từ localStorage vào RAM
    loadFromStorage();

    // 2. Kiểm tra quyền truy cập
    const token = localStorage.getItem('access_token');
    const publicPages = ['/login', '/register', '/']; // Các trang ai cũng vào được

    // Nếu không có token VÀ đang cố vào trang nội bộ -> Đá về login
    if (!token && !publicPages.includes(pathname)) {
      router.push('/login');
    }

    // Nếu ĐÃ có token mà lại vào trang login -> Đá về home
    if (token && pathname === '/login') {
      router.push('/home');
    }
  }, [pathname, router, loadFromStorage]);

  return null; // Component này không hiển thị gì cả, chỉ chạy logic ngầm
}