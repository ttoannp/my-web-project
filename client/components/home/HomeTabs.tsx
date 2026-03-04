import type { CreatedExam, Attempt } from "../../hooks/useHomePage";
import Link from "next/link";

type Props = {
  isTeacher: boolean;
  activeTab: "created" | "attempts";
  setActiveTab: (tab: "created" | "attempts") => void;
  loading: boolean;
  createdExams: CreatedExam[];
  myAttempts: Attempt[];
  deletingId: number | null;
  onDeleteExam: (e: React.MouseEvent, examId: number) => void;
};

export function HomeTabs({
  isTeacher,
  activeTab,
  setActiveTab,
  loading,
  createdExams,
  myAttempts,
  deletingId,
  onDeleteExam,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-pink-200 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-b-2 border-pink-200">
        <div className="flex">
          {isTeacher && (
            <button
              onClick={() => setActiveTab("created")}
              className={`px-6 py-4 font-semibold text-sm transition-all ${
                activeTab === "created"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-purple-600 hover:bg-pink-50"
              }`}
            >
              📚 Các đề mình đã tạo
            </button>
          )}
          <button
            onClick={() => setActiveTab("attempts")}
            className={`px-6 py-4 font-semibold text-sm transition-all ${
              activeTab === "attempts"
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:text-purple-600 hover:bg-pink-50"
            }`}
          >
            📝 {isTeacher ? "Các đề mình đã làm" : "Các đề đã làm"}
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
            {activeTab === "created" && isTeacher && (
              <div className="space-y-4">
                {createdExams.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-pink-300">
                    <span className="text-5xl">📭</span>
                    <p className="text-gray-500 mt-2">Bạn chưa tạo đề nào.</p>
                  </div>
                ) : (
                  createdExams.map((exam: any) => (
                    <div
                      key={exam.id}
                      className="relative border-2 border-pink-200 rounded-2xl p-5 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all shadow-md hover:shadow-lg bg-white group"
                    >
                      <Link
                        href={`/exams/${exam.id}/detail`}
                        className="block pr-12"
                      >
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
                                📅 Tạo lúc:{" "}
                                {new Date(
                                  exam.created_at
                                ).toLocaleString("vi-VN")}
                              </p>
                            )}
                          </div>
                          <span className="text-3xl text-purple-500 ml-4">
                            →
                          </span>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => onDeleteExam(e, exam.id)}
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

            {activeTab === "attempts" && (
              <div className="space-y-4">
                {myAttempts.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-pink-300">
                    <span className="text-5xl">📭</span>
                    <p className="text-gray-500 mt-2">
                      Bạn chưa làm đề nào.
                    </p>
                  </div>
                ) : (
                  myAttempts.map((attempt: any) => (
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
                            Điểm:{" "}
                            <span className="font-bold text-purple-600">
                              {attempt.total_score ?? "Chưa chấm"}
                            </span>
                          </p>
                          {attempt.start_time && (
                            <p className="text-xs text-gray-500 mt-1">
                              📅 Làm lúc:{" "}
                              {new Date(
                                attempt.start_time
                              ).toLocaleString("vi-VN")}
                            </p>
                          )}
                        </div>
                        <span className="text-3xl text-emerald-500 ml-4">
                          →
                        </span>
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
  );
}

