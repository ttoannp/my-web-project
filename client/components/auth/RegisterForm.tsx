type Props = {
  username: string;
  fullName: string;
  password: string;
  error: string | null;
  loading: boolean;
  onChangeUsername: (value: string) => void;
  onChangeFullName: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function RegisterForm({
  username,
  fullName,
  password,
  error,
  loading,
  onChangeUsername,
  onChangeFullName,
  onChangePassword,
  onSubmit,
}: Props) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-2xl">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">✨</span>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Đăng ký Học sinh
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Tham gia cộng đồng học tập ngay!
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>👤</span> Tên đăng nhập
          </label>
          <input
            className="mt-1 w-full rounded-xl border-2 border-purple-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            value={username}
            onChange={(e) => onChangeUsername(e.target.value)}
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
            onChange={(e) => onChangeFullName(e.target.value)}
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
            onChange={(e) => onChangePassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            required
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
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          {loading ? "⏳ Đang đăng ký..." : "🎉 Đăng ký ngay"}
        </button>
      </form>
    </div>
  );
}

