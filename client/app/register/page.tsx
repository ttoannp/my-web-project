// 'use client';

// import { FormEvent, useState } from "react";
// import { useRouter } from "next/navigation";
// import { register } from "../../services/authService";
// import { useAuthStore } from "../../store/authStore";

// export default function RegisterPage() {
//   const router = useRouter();
//   const setAuth = useAuthStore((s) => s.setAuth);
//   const [username, setUsername] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState<"teacher" | "student">("teacher");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     try {
//       const res = await register(username, password, fullName, role);
//       setAuth(res.user, res.token);
//       router.push("/home");
//     } catch (err: any) {
//       setError(err?.response?.data?.error ?? "Đăng ký thất bại");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-md rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-2xl">
//       <div className="text-center mb-6">
//         <span className="text-5xl mb-3 block">✨</span>
//         <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//           Đăng ký tài khoản
//         </h1>
//       </div>
//       <form onSubmit={handleSubmit} className="space-y-5">
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//             <span>👤</span> Tên đăng nhập
//           </label>
//           <input
//             className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="Nhập tên đăng nhập..."
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//             <span>📝</span> Họ và tên
//           </label>
//           <input
//             className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             placeholder="Nhập họ và tên..."
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//             <span>🔒</span> Mật khẩu
//           </label>
//           <input
//             type="password"
//             className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Nhập mật khẩu..."
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//             <span>🎭</span> Vai trò
//           </label>
//           <select
//             className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
//             value={role}
//             onChange={(e) =>
//               setRole(e.target.value === "teacher" ? "teacher" : "student")
//             }
//           >
//             <option value="teacher">👨‍🏫 Giáo viên</option>
//             <option value="student">👨‍🎓 Học sinh</option>
//           </select>
//         </div>
//         {error && (
//           <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
//             <p className="text-sm text-red-600 flex items-center gap-2">
//               <span>⚠️</span> {error}
//             </p>
//           </div>
//         )}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
//         >
//           {loading ? "⏳ Đang đăng ký..." : "🎉 Đăng ký"}
//         </button>
//       </form>
//     </div>
//   );
// }

'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  // Xóa state role vì chúng ta sẽ mặc định là student
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Truyền trực tiếp giá trị "student" vào hàm register
      const res = await register(username, password, fullName, "student");
      setAuth(res.user, res.token);
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-2xl">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">✨</span>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Đăng ký Học sinh
        </h1>
        <p className="text-gray-500 text-sm mt-2">Tham gia cộng đồng học tập ngay!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>👤</span> Tên đăng nhập
          </label>
          <input
            className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>📝</span> Họ và tên
          </label>
          <input
            className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nhập họ và tên..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>🔒</span> Mật khẩu
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            required
          />
        </div>

        {/* Phần chọn vai trò (Role Select) đã được loại bỏ để tránh người dùng thay đổi */}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          {loading ? "⏳ Đang đăng ký..." : "🎉 Đăng ký ngay"}
        </button>
      </form>
    </div>
  );
}