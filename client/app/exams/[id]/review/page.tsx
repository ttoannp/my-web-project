'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../../store/authStore";
import { getMyAttempts, getAttemptDetail } from "../../../../services/examService";

export default function ReviewExamPage() {
  const params = useParams<{ id: string }>();
  const examId = Number(params.id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [attemptDetail, setAttemptDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [examId, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const attemptsData = await getMyAttempts(user.id);
      const myAttempt = attemptsData.find((a: any) => a.exam_id === examId);
      if (myAttempt) {
        const detail = await getAttemptDetail(myAttempt.attempt_id, user.id);
        setAttemptDetail(detail);
      } else {
        alert('Không tìm thấy bài làm của bạn');
        router.push('/home');
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center">Đang tải...</p>;
  }

  if (!attemptDetail) {
    return <p className="text-center">Không tìm thấy bài làm.</p>;
  }

  const getAnswerForQuestion = (questionId: number) => {
    return attemptDetail.answers.find((a: any) => a.question_id === questionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{attemptDetail.exam_title}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Điểm: <span className="font-medium">{attemptDetail.total_score ?? 'Chưa chấm'}</span>
          </p>
          {attemptDetail.start_time && (
            <p className="text-xs text-gray-500 mt-1">
              Làm lúc: {new Date(attemptDetail.start_time).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/home')}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Nội dung đề thi và câu trả lời</h2>
        <div className="space-y-4">
          {attemptDetail.questions.map((q: any, idx: number) => {
            const answer = getAnswerForQuestion(q.id);
            return (
              <div key={q.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">
                    Câu {idx + 1}: {q.content}
                  </p>
                  <span className="text-sm text-gray-500">({q.score} điểm)</span>
                </div>
                {q.question_type === 'mcq' && (
                  <div className="ml-4 space-y-1 mt-2">
                    {q.options.map((opt: any) => {
                      const isSelected = answer?.selected_option_id === opt.id;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 ${
                            isSelected ? 'bg-blue-50 p-2 rounded' : ''
                          }`}
                        >
                          <span>{isSelected ? '✓' : '○'}</span>
                          <span>{opt.content}</span>
                          {isSelected && (
                            <span className="text-xs text-blue-600 ml-2">(Đã chọn)</span>
                          )}
                        </div>
                      );
                    })}
                    {answer && (
                      <p className="text-sm text-gray-600 mt-2">
                        Điểm: {answer.score ?? 0} / {q.score}
                      </p>
                    )}
                  </div>
                )}
                {q.question_type === 'essay' && (
                  <div className="ml-4 mt-2">
                    <p className="text-sm font-medium mb-1">Câu trả lời của bạn:</p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm whitespace-pre-wrap">
                        {answer?.essay_answer || 'Chưa trả lời'}
                      </p>
                    </div>
                    {answer && (
                      <p className="text-sm text-gray-600 mt-2">
                        Điểm: {answer.score ?? 'Chưa chấm'} / {q.score}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
