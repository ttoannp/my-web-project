'use client';
import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../services/apiClient";
import { useAuthStore } from "../../../store/authStore";

type Question = {
  content: string;
  score: number;
  question_type: 'mcq' | 'essay';
  options: { content: string; is_correct: boolean }[];
};

export default function CreateExamPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const [examInfo, setExamInfo] = useState({
    title: '',
    description: '',
    duration: 60,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      content: '',
      score: 1,
      question_type: 'mcq',
      options: [
        { content: '', is_correct: false },
        { content: '', is_correct: false },
      ],
    },
  ]);

  // Thêm câu hỏi mới
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        content: '',
        score: 1,
        question_type: 'mcq',
        options: [
          { content: '', is_correct: false },
          { content: '', is_correct: false },
        ],
      },
    ]);
  };

  // Xóa câu hỏi
  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Thay đổi loại câu hỏi
  const handleQuestionTypeChange = (index: number, type: 'mcq' | 'essay') => {
    const newQuestions = [...questions];
    if (type === 'essay') {
      // Tự luận: không có đáp án
      newQuestions[index] = {
        ...newQuestions[index],
        question_type: 'essay',
        options: [],
      };
    } else {
      // Trắc nghiệm: có ít nhất 2 đáp án
      if (newQuestions[index].options.length === 0) {
        newQuestions[index].options = [
          { content: '', is_correct: false },
          { content: '', is_correct: false },
        ];
      }
      newQuestions[index].question_type = 'mcq';
    }
    setQuestions(newQuestions);
  };

  // Thay đổi nội dung câu hỏi
  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  // Thêm đáp án mới
  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ content: '', is_correct: false });
    setQuestions(newQuestions);
  };

  // Xóa đáp án
  const removeOption = (qIndex: number, optIndex: number) => {
    const newQuestions = [...questions];
    const options = newQuestions[qIndex].options;
    if (options.length > 1) {
      options.splice(optIndex, 1);
      // Nếu xóa đáp án đúng, reset tất cả về false
      newQuestions[qIndex].options.forEach(o => o.is_correct = false);
      setQuestions(newQuestions);
    }
  };

  // Thay đổi nội dung đáp án
  const handleOptionChange = (qIndex: number, optIndex: number, field: string, value: any) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[qIndex].options];
    options[optIndex] = { ...options[optIndex], [field]: value };
    newQuestions[qIndex].options = options;
    setQuestions(newQuestions);
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPdfFile(file);
  };

  const handleParsePdf = async () => {
    if (!pdfFile) return;
    setParsingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      
      // Axios sẽ tự động set Content-Type với boundary cho FormData
      const res = await apiClient.post("/api/exams/parse-pdf", formData);
      
      const parsedQuestions: Question[] = res.data.questions ?? [];
      if (parsedQuestions.length === 0) {
        alert("Không đọc được câu hỏi nào từ file PDF, vui lòng kiểm tra lại định dạng.");
        return;
      }
      setQuestions(parsedQuestions);
      alert(`✅ Đã đọc được ${parsedQuestions.length} câu hỏi từ PDF. Vui lòng kiểm tra và chọn đáp án đúng.`);
    } catch (error: any) {
      console.error("Lỗi parse PDF:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Lỗi khi đọc file PDF";
      const errorHint = error?.response?.data?.hint || "";
      alert(`❌ ${errorMessage}${errorHint ? `\n\nGợi ý: ${errorHint}` : ""}`);
    } finally {
      setParsingPdf(false);
    }
  };

  // Gửi dữ liệu về Backend
  // Gửi dữ liệu về Backend
  const handleSubmit = async () => {
    if (!user) return;

    // --- BẮT ĐẦU VALIDATE DỮ LIỆU ---

    // 1. Kiểm tra tiêu đề đề thi
    if (!examInfo.title.trim()) {
      alert("⚠️ Vui lòng nhập tên bài kiểm tra!");
      return;
    }

    // 2. Kiểm tra từng câu hỏi
    if (questions.length === 0) {
      alert("⚠️ Đề thi phải có ít nhất 1 câu hỏi!");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionNum = i + 1;

      // Kiểm tra nội dung câu hỏi
      if (!q.content.trim()) {
        alert(`⚠️ Câu hỏi số ${questionNum} đang để trống nội dung!`);
        return; // Dừng lại, không lưu
      }

      if (q.question_type === 'mcq') {
        // Kiểm tra số lượng đáp án (tối thiểu 2)
        if (q.options.length < 2) {
          alert(`⚠️ Câu hỏi số ${questionNum} (Trắc nghiệm) cần ít nhất 2 đáp án!`);
          return;
        }

        // Kiểm tra nội dung các đáp án
        const emptyOptionIndex = q.options.findIndex(opt => !opt.content.trim());
        if (emptyOptionIndex !== -1) {
          alert(`⚠️ Câu hỏi số ${questionNum}: Đáp án thứ ${emptyOptionIndex + 1} đang để trống!`);
          return;
        }

        // [QUAN TRỌNG] Kiểm tra đã chọn đáp án đúng chưa
        const hasCorrectAnswer = q.options.some(opt => opt.is_correct);
        if (!hasCorrectAnswer) {
          alert(`⚠️ Lỗi tại Câu hỏi số ${questionNum}:\n\nBạn chưa chọn đáp án đúng!\nVui lòng tích vào ô tròn cạnh đáp án đúng.`);
          return;
        }
      }
    }
    // --- KẾT THÚC VALIDATE ---

    setLoading(true);
    const payload = {
      ...examInfo,
      created_by: user.id,
      questions: questions,
    };

    try {
      await apiClient.post("/api/exams/create", payload);
      alert("✅ Tạo đề thi thành công!");
      router.push('/home');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || "❌ Lỗi khi tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl mt-6 rounded-3xl border-2 border-pink-200">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">📝</span>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Tạo Đề Thi Mới
        </h1>
      </div>

      {/* Phần 1: Thông tin chung */}
      <div className="space-y-5 mb-8 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">📌 Tên bài kiểm tra</label>
          <input
            type="text"
            className="w-full border-2 border-pink-300 p-3 rounded-xl mt-1 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
            value={examInfo.title}
            onChange={(e) => setExamInfo({ ...examInfo, title: e.target.value })}
            placeholder="Ví dụ: Kiểm tra 15 phút Toán"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-2">📄 Mô tả (tùy chọn)</label>
          <textarea
            className="w-full border-2 border-pink-300 p-3 rounded-xl mt-1 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
            value={examInfo.description}
            onChange={(e) => setExamInfo({ ...examInfo, description: e.target.value })}
            placeholder="Mô tả về đề thi..."
            rows={2}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold text-gray-700 mb-2">⏰ Thời gian (phút)</label>
            <input
              type="number"
              className="w-full border-2 border-pink-300 p-3 rounded-xl mt-1 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
              value={examInfo.duration}
              onChange={(e) => setExamInfo({ ...examInfo, duration: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Phần 1.5: Đọc đề từ file PDF trắc nghiệm */}
      <div className="mb-8 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-md">
        <p className="mb-3 text-sm font-medium text-purple-700 flex items-center gap-2">
          <span>📚</span> Hoặc tải file PDF đề trắc nghiệm để hệ thống đọc câu hỏi (không lấy đáp án).
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            className="text-sm border-2 border-purple-300 rounded-xl p-2 bg-white cursor-pointer"
          />
          <button
            type="button"
            onClick={handleParsePdf}
            disabled={!pdfFile || parsingPdf}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform hover:scale-105 sm:mt-0"
          >
            {parsingPdf ? "⏳ Đang đọc PDF..." : "📖 Đọc đề từ PDF"}
          </button>
        </div>
      </div>

      {/* Phần 2: Danh sách câu hỏi */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="border-2 border-pink-200 p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 shadow-md hover:shadow-lg transition-shadow relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4 flex-1">
                <h3 className="font-bold text-lg text-purple-700">Câu hỏi {qIndex + 1}</h3>
                <select
                  className="border-2 border-pink-300 p-1.5 rounded-xl text-sm bg-white focus:border-pink-500 focus:outline-none"
                  value={q.question_type}
                  onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value as 'mcq' | 'essay')}
                >
                  <option value="mcq">📝 Trắc nghiệm</option>
                  <option value="essay">✍️ Tự luận</option>
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Điểm:</label>
                  <input
                    type="number"
                    className="w-20 border-2 border-pink-300 p-1.5 rounded-lg text-sm bg-white focus:border-pink-500 focus:outline-none"
                    value={q.score}
                    onChange={(e) => handleQuestionChange(qIndex, 'score', Number(e.target.value))}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="ml-4 px-3 py-1.5 text-sm font-medium text-white bg-red-400 hover:bg-red-500 rounded-xl shadow-sm transition-colors flex-shrink-0"
              >
                🗑️ Xóa
              </button>
            </div>

            <textarea
              className="w-full border-2 border-pink-300 p-3 rounded-xl mb-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
              placeholder="Nhập nội dung câu hỏi..."
              value={q.content}
              onChange={(e) => handleQuestionChange(qIndex, 'content', e.target.value)}
              rows={3}
            />

            {/* Danh sách đáp án - chỉ hiển thị nếu là trắc nghiệm */}
            {q.question_type === 'mcq' && (
              <div className="space-y-3 pl-4 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-700">💡 Đáp án:</span>
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-purple-500 px-3 py-1.5 rounded-lg hover:from-blue-500 hover:to-purple-600 shadow-sm transition-all transform hover:scale-105"
                  >
                    ➕ Thêm đáp án
                  </button>
                </div>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-50 transition-colors">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={opt.is_correct}
                      onChange={() => {
                        const newQuestions = [...questions];
                        newQuestions[qIndex].options.forEach(o => o.is_correct = false);
                        newQuestions[qIndex].options[optIndex].is_correct = true;
                        setQuestions(newQuestions);
                      }}
                      className="w-5 h-5 text-pink-500 focus:ring-pink-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      className={`flex-1 border-2 p-2.5 rounded-xl focus:outline-none focus:ring-2 ${
                        opt.is_correct 
                          ? 'border-green-400 bg-green-50 focus:ring-green-300' 
                          : 'border-pink-300 bg-white focus:ring-pink-300'
                      }`}
                      placeholder={`Đáp án ${optIndex + 1}`}
                      value={opt.content}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, 'content', e.target.value)}
                    />
                    {q.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, optIndex)}
                        className="text-red-400 hover:text-red-600 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length === 0 && (
                  <p className="text-sm text-gray-500 italic bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    💭 Chưa có đáp án nào. Nhấn "Thêm đáp án" để thêm.
                  </p>
                )}
              </div>
            )}

            {/* Thông báo cho câu tự luận */}
            {q.question_type === 'essay' && (
              <div className="pl-4 mt-3 text-sm text-purple-600 italic bg-purple-50 p-3 rounded-xl border border-purple-200">
                ✍️ Câu tự luận: Học sinh sẽ gửi bài làm cho giáo viên chấm điểm sau khi nộp bài.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nút thao tác */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={addQuestion}
          className="px-6 py-3 border-2 border-purple-400 text-purple-600 rounded-xl hover:bg-purple-50 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
        >
          ➕ Thêm câu hỏi
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 ml-auto disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
        >
          {loading ? '⏳ Đang lưu...' : '💾 Lưu Đề Thi'}
        </button>
      </div>
    </div>
  );
}
