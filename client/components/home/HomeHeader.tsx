type Props = {
  user: any;
  isTeacher: boolean;
};

export function HomeHeader({ user, isTeacher }: Props) {
  if (!user) return null;

  return (
    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🎓</span>
            <h1 className="text-4xl font-bold">Exam Web</h1>
          </div>
          <p className="text-lg text-pink-100">
            Xin chào,{" "}
            <span className="font-bold text-white">
              {user.full_name || user.username}
            </span>{" "}
            👋
          </p>
          <p className="text-sm text-pink-200 mt-2 flex items-center gap-2">
            <span>{isTeacher ? "👨‍🏫" : "👨‍🎓"}</span>
            <span>
              Vai trò:{" "}
              <span className="font-semibold">
                {isTeacher ? "Giáo viên" : "Học sinh"}
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

