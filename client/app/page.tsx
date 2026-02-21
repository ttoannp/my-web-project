'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    if (user) {
      router.push('/home');
    }
  }, [user, router, loadFromStorage]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Hệ thống thi trắc nghiệm / tự luận
      </h1>
      <p className="text-slate-600">
        Tạo đề, quản lý đề thi và cho học sinh vào làm bài trực tuyến.
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        <li className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-1">Giáo viên</h2>
          <p className="text-sm text-slate-600">
            Đăng nhập, tạo đề trắc nghiệm / tự luận bằng tay hoặc từ file PDF.
          </p>
        </li>
        <li className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-1">Học sinh</h2>
          <p className="text-sm text-slate-600">
            Vào thi, làm bài, hệ thống tự chấm trắc nghiệm.
          </p>
        </li>
        <li className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-1">Quản lý đề</h2>
          <p className="text-sm text-slate-600">
            Danh sách đề, thời gian làm bài, xem điểm sau khi nộp.
          </p>
        </li>
      </ul>
    </div>
  );
}
