'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      setAuth(res.user, res.token);
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border-2 border-pink-200 bg-white p-8 shadow-2xl">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">🔑</span>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Đăng nhập
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>👤</span> Tên đăng nhập
          </label>
          <input
            className="mt-1 w-full rounded-xl border-2 border-pink-300 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>🔒</span> Mật khẩu
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border-2 border-pink-300 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
          />
        </div>
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
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-base font-semibold text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          {loading ? "⏳ Đang đăng nhập..." : "🚀 Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

