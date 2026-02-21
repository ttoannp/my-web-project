'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { getMyCreatedExams, getMyAttempts, deleteExam } from "../../services/examService";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const [activeTab, setActiveTab] = useState<'created' | 'attempts'>('created');
  const [createdExams, setCreatedExams] = useState<any[]>([]);
  const [myAttempts, setMyAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'teacher') {
        if (activeTab === 'created') {
          const exams = await getMyCreatedExams(user.id);
          setCreatedExams(exams);
        } else {
          const attempts = await getMyAttempts(user.id);
          setMyAttempts(attempts);
        }
      } else {
        const attempts = await getMyAttempts(user.id);
        setMyAttempts(attempts);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (e: React.MouseEvent, examId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (!confirm("Bạn có chắc muốn xóa đề thi này? Hành động không thể hoàn tác.")) return;
    setDeletingId(examId);
    try {
      await deleteExam(examId, user.id);
      await loadData();
    } catch (error: any) {
      alert(error?.response?.data?.error || "Lỗi khi xóa đề thi");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

  const isTeacher = user.role === 'teacher';

  return (
    <div className="space-y-6">
      {/* Header với logo, tên user, vai trò */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">🎓</span>
              <h1 className="text-4xl font-bold">Exam Web</h1>
            </div>
            <p className="text-lg text-pink-100">
              Xin chào, <span className="font-bold text-white">{user.full_name || user.username}</span> 👋
            </p>
            <p className="text-sm text-pink-200 mt-2 flex items-center gap-2">
              <span>{isTeacher ? '👨‍🏫' : '👨‍🎓'}</span>
              <span>Vai trò: <span className="font-semibold">{isTeacher ? 'Giáo viên' : 'Học sinh'}</span></span>
            </p>
          </div>
        </div>
      </div>

      {/* Các nút chức năng */}
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
            <p className="text-blue-100">Tạo đề thi trắc nghiệm hoặc tự luận mới</p>
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

      {/* Menu bar với các tab */}
      <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-b-2 border-pink-200">
          <div className="flex">
            {isTeacher && (
              <button
                onClick={() => setActiveTab('created')}
                className={`px-6 py-4 font-semibold text-sm transition-all ${
                  activeTab === 'created'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-pink-50'
                }`}
              >
                📚 Các đề mình đã tạo
              </button>
            )}
            <button
              onClick={() => setActiveTab('attempts')}
              className={`px-6 py-4 font-semibold text-sm transition-all ${
                activeTab === 'attempts'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-pink-50'
              }`}
            >
              📝 {isTeacher ? 'Các đề mình đã làm' : 'Các đề đã làm'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <span className="text-4xl animate-bounce">⏳</span>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : (
            <>
              {activeTab === 'created' && isTeacher && (
                <div className="space-y-4">
                  {createdExams.length === 0 ? (
                    <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-pink-300">
                      <span className="text-5xl">📭</span>
                      <p className="text-gray-500 mt-2">Bạn chưa tạo đề nào.</p>
                    </div>
                  ) : (
                    createdExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="relative border-2 border-pink-200 rounded-2xl p-5 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all shadow-md hover:shadow-lg bg-white group"
                      >
                        <Link href={`/exams/${exam.id}/detail`} className="block pr-12">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <span>📄</span>
                                {exam.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                <span>⏰</span>
                                Thời gian: {exam.duration} phút
                              </p>
                              {exam.created_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  📅 Tạo lúc: {new Date(exam.created_at).toLocaleString('vi-VN')}
                                </p>
                              )}
                            </div>
                            <span className="text-3xl text-purple-500 ml-4">→</span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteExam(e, exam.id)}
                          disabled={deletingId === exam.id}
                          className="absolute top-4 right-4 p-2 rounded-xl text-red-500 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors"
                          title="Xóa đề"
                        >
                          {deletingId === exam.id ? "⏳" : "🗑️"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'attempts' && (
                <div className="space-y-4">
                  {myAttempts.length === 0 ? (
                    <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-pink-300">
                      <span className="text-5xl">📭</span>
                      <p className="text-gray-500 mt-2">Bạn chưa làm đề nào.</p>
                    </div>
                  ) : (
                    myAttempts.map((attempt) => (
                      <Link
                        key={attempt.attempt_id}
                        href={`/exams/${attempt.exam_id}/review`}
                        className="block border-2 border-emerald-200 rounded-2xl p-5 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                              <span>📝</span>
                              {attempt.exam_title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                              <span>⭐</span>
                              Điểm: <span className="font-bold text-purple-600">{attempt.total_score ?? 'Chưa chấm'}</span>
                            </p>
                            {attempt.start_time && (
                              <p className="text-xs text-gray-500 mt-1">
                                📅 Làm lúc: {new Date(attempt.start_time).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>
                          <span className="text-3xl text-emerald-500 ml-4">→</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
