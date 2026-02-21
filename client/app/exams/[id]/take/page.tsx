'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ExamDetail,
  getExamDetail,
  startExam,
  submitExam,
} from "../../../../services/examService";
import { useAuthStore } from "../../../../store/authStore";

export default function TakeExamPage() {
  const params = useParams<{ id: string }>();
  const examId = Number(params.id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number | undefined>
  >({});
  const [essayAnswers, setEssayAnswers] = useState<
    Record<number, string>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // 1. THÊM STATE LỖI
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    let mounted = true;
    
    async function init() {
      // Reset lỗi trước khi gọi API
      setError(null); 
      if (!user) return;

      try {
        const data = await getExamDetail(examId);
        if (!mounted) return;
        setExam(data);

        if (data.duration) {
          setTimeLeft(data.duration * 60); 
        }

        const start = await startExam(examId, user.id);
        if (!mounted) return;
        setAttemptId(start.attempt_id);

      } catch (err: any) {
        console.error(err);
        if (!mounted) return;

        // 2. XỬ LÝ LỖI TRONG CATCH
        // Nếu backend trả về 404 (Not Found)
        if (err.response && err.response.status === 404) {
             setError("❌ Không tìm thấy mã đề thi này. Vui lòng kiểm tra lại đường dẫn.");
        } 
        // Nếu backend trả về 403 (Forbidden - ví dụ chưa đến giờ thi)
        else if (err.response && err.response.status === 403) {
             setError("⛔ Bạn không có quyền truy cập đề thi này.");
        }
        // Các lỗi khác
        else {
             setError("⚠️ Có lỗi xảy ra khi tải đề thi. Vui lòng thử lại sau.");
        }
      }
    }

    if (examId && user) {
      void init();
    }
    return () => {
      mounted = false;
    };
  }, [examId, user, router]);

  const processSubmit = useCallback(async (forceSubmit = false) => {
    if (!exam || !attemptId) return; 
    
    setSubmitting(true);
    try {
      const answers = exam.questions.map((q) => ({
        question_id: q.id,
        selected_option_id: q.question_type === 'mcq' ? selectedOptions[q.id] : undefined,
        essay_answer: q.question_type === 'essay' ? essayAnswers[q.id] : undefined,
      }));
      const res = await submitExam(examId, attemptId, answers);
      setResult(res.total_score);
      setHasSubmitted(true);
      
      if (forceSubmit) {
        alert("⏰ Đã hết thời gian làm bài! Hệ thống đã tự động thu bài của bạn.");
      }
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  }, [exam, attemptId, examId, selectedOptions, essayAnswers]);

  useEffect(() => {
    if (timeLeft === null || hasSubmitted) return;
    if (timeLeft === 0) {
      processSubmit(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, hasSubmitted, processSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleManualSubmit = async () => {
    if (!attemptId || submitting || hasSubmitted) return;
    if (!confirm('Bạn có chắc muốn nộp bài? Sau khi nộp bạn không thể sửa lại.')) {
      return;
    }
    await processSubmit(false);
  };

  // 3. HIỂN THỊ GIAO DIỆN LỖI (Render Error State)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-6xl">🚫</div>
        <h2 className="text-2xl font-bold text-red-600 text-center px-4">{error}</h2>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-medium shadow-lg"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // 4. HIỂN THỊ LOADING (Chỉ hiện khi chưa có exam và chưa có lỗi)
  if (!exam) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải đề thi...</p>
        </div>
    );
  }

  // ... (Phần render nội dung bài thi giữ nguyên như cũ)
  return (
    <div className="space-y-6 relative pb-20">
       {/* ... Code UI cũ ... */}
      <div className="sticky top-4 z-50 flex justify-center">
        <div className={`
          flex items-center gap-3 px-6 py-3 rounded-full shadow-xl border-4 font-bold text-2xl
          ${(timeLeft !== null && timeLeft < 60) 
            ? 'bg-red-500 border-red-200 text-white animate-pulse' 
            : 'bg-white border-purple-500 text-purple-700'}
        `}>
          <span>⏳</span>
          <span>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📝</span>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
        </div>
        <p className="text-pink-100 flex items-center gap-2">
          <span>⏰</span> Thời gian quy định: {exam.duration} phút
        </p>
      </div>

      <div className="space-y-5">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-white to-pink-50 p-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <span className="text-2xl">❓</span>
                <span>Câu {idx + 1}: {q.content}</span>
              </p>
              <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {q.score} điểm
              </span>
            </div>
            {q.question_type === "mcq" && (
              <div className="mt-4 space-y-2 pl-8">
                {q.options.map((o) => (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer items-center gap-3 p-3 rounded-xl transition-colors border-2 
                      ${selectedOptions[q.id] === o.id 
                        ? 'bg-purple-50 border-purple-400' 
                        : 'hover:bg-pink-100 border-transparent hover:border-pink-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={selectedOptions[q.id] === o.id}
                      onChange={() =>
                        !hasSubmitted && setSelectedOptions((prev) => ({ 
                          ...prev,
                          [q.id]: o.id,
                        }))
                      }
                      disabled={hasSubmitted} 
                      className="w-5 h-5 text-pink-500 focus:ring-pink-300 cursor-pointer"
                    />
                    <span className="text-gray-700 flex-1">{o.content}</span>
                    {selectedOptions[q.id] === o.id && (
                      <span className="text-green-500 text-xl font-bold">✓</span>
                    )}
                  </label>
                ))}
              </div>
            )}
            {q.question_type === "essay" && (
              <div className="mt-4 pl-8">
                <textarea
                  className="w-full border-2 border-pink-300 p-3 rounded-xl text-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white disabled:bg-gray-100"
                  rows={5}
                  placeholder="✍️ Nhập câu trả lời của bạn..."
                  value={essayAnswers[q.id] || ''}
                  disabled={hasSubmitted} 
                  onChange={(e) =>
                    setEssayAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleManualSubmit}
        disabled={submitting || hasSubmitted}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-pink-600 to-purple-700 px-8 py-4 text-lg font-bold text-white hover:from-pink-700 hover:to-purple-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
      >
        {submitting ? "⏳ Đang nộp..." : hasSubmitted ? "✅ Đã nộp bài" : "📤 Nộp bài ngay"}
      </button>

      {result !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-gentle">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành bài thi!</h2>
            <p className="text-xl font-semibold text-purple-600 mb-6">
              Tổng điểm: <span className="text-4xl font-bold">{result}</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {exam.questions.some(q => q.question_type === 'essay') 
                ? '✨ Điểm tự luận sẽ được giáo viên chấm và cập nhật sau.'
                : 'Bạn đã làm rất tốt!'}
            </p>
            <button 
              onClick={() => router.push('/home')}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}