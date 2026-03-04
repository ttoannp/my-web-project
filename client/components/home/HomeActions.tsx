import Link from "next/link";

type Props = {
  isTeacher: boolean;
};

export function HomeActions({ isTeacher }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {isTeacher && (
        <Link
          href="/exams/create"
          className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-blue-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">📝</span>
            <h2 className="text-2xl font-bold">Tạo đề</h2>
          </div>
          <p className="text-blue-100">
            Tạo đề thi trắc nghiệm hoặc tự luận mới
          </p>
        </Link>
      )}
      <Link
        href="/exams/take"
        className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-emerald-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">✏️</span>
          <h2 className="text-2xl font-bold">Làm đề</h2>
        </div>
        <p className="text-emerald-100">Nhập mã đề để vào làm bài</p>
      </Link>
    </div>
  );
}

