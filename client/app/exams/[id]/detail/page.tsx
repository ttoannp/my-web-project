'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../../store/authStore";
import {
  getExamDetailWithAnswers,
  getExamAttempts,
  gradeEssayAnswer,
  updateExamAnswer,
  deleteExam,
} from "../../../../services/examService";

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const examId = Number(params.id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [exam, setExam] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<Record<number, boolean>>({});
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      router.push('/home');
      return;
    }
    loadData();
  }, [examId, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [examData, attemptsData] = await Promise.all([
        getExamDetailWithAnswers(examId, user.id),
        getExamAttempts(examId, user.id),
      ]);
      setExam(examData);
      setAttempts(attemptsData);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeEssay = async (attemptId: number, questionId: number, score: number) => {
    if (!user) return;
    setGrading((prev) => ({ ...prev, [questionId]: true }));
    try {
      await gradeEssayAnswer(attemptId, questionId, score, user.id);
      await loadData();
      if (selectedAttempt?.id === attemptId) {
        const updated = attempts.find(a => a.attempt_id === attemptId);
        if (updated) setSelectedAttempt(updated);
      }
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Lỗi khi chấm điểm');
    } finally {
      setGrading((prev) => ({ ...prev, [questionId]: false }));
    }
  };


const handleUpdateAnswer = async (questionId: number, correctOptionId: number) => {
  if (!user) return;
  if (!confirm('Bạn có chắc muốn sửa đáp án này? Hệ thống sẽ tự động chấm lại điểm cho tất cả học sinh đã làm bài.')) return;
  
  // Có thể thêm loading state cục bộ nếu muốn
  try {
    await updateExamAnswer(examId, questionId, correctOptionId, user.id);
    
    alert('✅ Sửa đáp án thành công! Hệ thống đã cập nhật lại điểm số.');
    
    // Quan trọng: Gọi lại loadData để lấy danh sách điểm mới nhất từ server
    await loadData(); 
    
  } catch (error: any) {
    alert(error?.response?.data?.error || 'Lỗi khi sửa đáp án');
  }
};

  const handleDeleteExam = async () => {
    if (!user) return;
    if (!confirm('Bạn có chắc muốn xóa đề thi này? Tất cả câu hỏi và bài làm sẽ bị xóa. Hành động không thể hoàn tác.')) return;
    setDeleting(true);
    try {
      await deleteExam(examId, user.id);
      alert('Đã xóa đề thi thành công.');
      router.push('/home');
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Lỗi khi xóa đề thi');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-center">Đang tải...</p>;
  }

  if (!exam) {
    return <p className="text-center">Không tìm thấy đề thi.</p>;
  }

  // ... (các import và logic giữ nguyên)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          
          {/* --- THÊM ĐOẠN NÀY ĐỂ HIỂN THỊ MÃ ĐỀ --- */}
          <div className="flex items-center gap-3 mt-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-base font-bold px-3 py-1 rounded border border-blue-400">
              Mã đề: {exam.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(String(exam.id));
                alert(`Đã sao chép mã đề: ${exam.id}`);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              title="Sao chép mã đề để gửi cho học sinh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Sao chép
            </button>
          </div>
          {/* --------------------------------------- */}

          <p className="text-sm text-gray-600">
            Thời gian: {exam.duration} phút
          </p>
        </div>
        
        {/* Phần nút bấm bên phải giữ nguyên */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteExam}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Đang xóa...' : '🗑️ Xóa đề'}
          </button>
          <button
            onClick={() => router.push('/home')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
      </div>


      {/* Danh sách câu hỏi với đáp án đúng */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Nội dung đề thi</h2>
        <div className="space-y-4">
          {exam.questions.map((q: any, idx: number) => (
            <div key={q.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium">
                  Câu {idx + 1}: {q.content}
                </p>
                <span className="text-sm text-gray-500">({q.score} điểm)</span>
              </div>
              {q.question_type === 'mcq' && (
                <div className="ml-4 space-y-1">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 ${
                        opt.is_correct ? 'text-green-600 font-medium' : ''
                      }`}
                    >
                      <span>{opt.is_correct ? '✓' : '○'}</span>
                      <span>{opt.content}</span>
                      {!opt.is_correct && (
                        <button
                          onClick={() => handleUpdateAnswer(q.id, opt.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                        >
                          Đặt làm đáp án đúng
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {q.question_type === 'essay' && (
                <p className="ml-4 text-sm text-gray-600 italic">
                  Câu tự luận - Giáo viên sẽ chấm điểm sau khi học sinh nộp bài
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách bài làm của học sinh */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">
          Bài làm của học sinh ({attempts.length})
        </h2>
        {attempts.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có học sinh nào làm bài.</p>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.attempt_id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedAttempt(selectedAttempt?.attempt_id === attempt.attempt_id ? null : attempt)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{attempt.student_name}</p>
                    <p className="text-sm text-gray-600">
                      Điểm: <span className="font-medium">{attempt.total_score ?? 'Chưa chấm'}</span>
                    </p>
                    {attempt.start_time && (
                      <p className="text-xs text-gray-500 mt-1">
                        Làm lúc: {new Date(attempt.start_time).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <span className="text-blue-600">
                    {selectedAttempt?.attempt_id === attempt.attempt_id ? '▼' : '▶'}
                  </span>
                </div>

                {selectedAttempt?.attempt_id === attempt.attempt_id && (
                  <div 
                    className="mt-4 pt-4 border-t space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {exam.questions.map((q: any, idx: number) => {
                      const answer = attempt.answers.find((a: any) => a.question_id === q.id);
                      return (
                        <div key={q.id} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium mb-2">
                            Câu {idx + 1}: {q.content}
                          </p>
                          {q.question_type === 'mcq' && answer && (
                            <div>
                              <p className="text-sm">
                                Đáp án đã chọn:{' '}
                                {q.options.find((o: any) => o.id === answer.selected_option_id)?.content || 'Không có'}
                              </p>
                              <p className="text-sm mt-1">
                                Điểm: {answer.score ?? 0} / {q.score}
                              </p>
                            </div>
                          )}
                          {q.question_type === 'essay' && answer && (
                            <div>
                              <p className="text-sm font-medium mb-1">Câu trả lời:</p>
                              <p className="text-sm bg-white p-2 rounded border mb-2 whitespace-pre-wrap">
                                {answer.essay_answer || 'Chưa trả lời'}
                              </p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  className="w-20 border p-1 rounded text-sm"
                                  placeholder="Điểm"
                                  defaultValue={answer.score ?? 0}
                                  min="0"
                                  max={q.score}
                                  step="0.5"
                                  onBlur={(e) => {
                                    const score = parseFloat(e.target.value);
                                    if (!isNaN(score) && score >= 0 && score <= q.score) {
                                      handleGradeEssay(attempt.attempt_id, q.id, score);
                                    }
                                  }}
                                />
                                <span className="text-sm text-gray-600">/ {q.score}</span>
                                {grading[q.id] && <span className="text-xs text-gray-500">Đang lưu...</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
