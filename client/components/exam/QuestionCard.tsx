import type { Question } from "../../hooks/useCreateExam";

type Props = {
  question: Question;
  index: number;
  onRemove: () => void;
  onChangeType: (type: "mcq" | "essay") => void;
  onChangeScore: (score: number) => void;
  onChangeContent: (content: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optIndex: number) => void;
  onChangeOptionContent: (optIndex: number, content: string) => void;
  onSetCorrectOption: (optIndex: number) => void;
};

export function QuestionCard({
  question,
  index,
  onRemove,
  onChangeType,
  onChangeScore,
  onChangeContent,
  onAddOption,
  onRemoveOption,
  onChangeOptionContent,
  onSetCorrectOption,
}: Props) {
  return (
    <div className="border-2 border-pink-200 p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 shadow-md hover:shadow-lg transition-shadow relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-4 flex-1">
          <h3 className="font-bold text-lg text-purple-700">
            Câu hỏi {index + 1}
          </h3>
          <select
            className="border-2 border-pink-300 p-1.5 rounded-xl text-sm bg-white focus:border-pink-500 focus:outline-none"
            value={question.question_type}
            onChange={(e) => onChangeType(e.target.value as "mcq" | "essay")}
          >
            <option value="mcq">📝 Trắc nghiệm</option>
            <option value="essay">✍️ Tự luận</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Điểm:</label>
            <input
              type="number"
              className="w-20 border-2 border-pink-300 p-1.5 rounded-lg text-sm bg-white focus:border-pink-500 focus:outline-none"
              value={question.score}
              onChange={(e) => onChangeScore(Number(e.target.value))}
              min={0}
              step={0.5}
            />
          </div>
        </div>
        <button
          onClick={onRemove}
          className="ml-4 px-3 py-1.5 text-sm font-medium text-white bg-red-400 hover:bg-red-500 rounded-xl shadow-sm transition-colors flex-shrink-0"
        >
          🗑️ Xóa
        </button>
      </div>

      <textarea
        className="w-full border-2 border-pink-300 p-3 rounded-xl mb-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
        placeholder="Nhập nội dung câu hỏi..."
        value={question.content}
        onChange={(e) => onChangeContent(e.target.value)}
        rows={3}
      />

      {question.question_type === "mcq" && (
        <div className="space-y-3 pl-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-purple-700">
              💡 Đáp án:
            </span>
            <button
              type="button"
              onClick={onAddOption}
              className="text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-purple-500 px-3 py-1.5 rounded-lg hover:from-blue-500 hover:to-purple-600 shadow-sm transition-all transform hover:scale-105"
            >
              ➕ Thêm đáp án
            </button>
          </div>
          {question.options.map((opt, optIndex) => (
            <div
              key={optIndex}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-50 transition-colors"
            >
              <input
                type="radio"
                name={`correct-${index}`}
                checked={opt.is_correct}
                onChange={() => onSetCorrectOption(optIndex)}
                className="w-5 h-5 text-pink-500 focus:ring-pink-300 cursor-pointer"
              />
              <input
                type="text"
                className={`flex-1 border-2 p-2.5 rounded-xl focus:outline-none focus:ring-2 ${
                  opt.is_correct
                    ? "border-green-400 bg-green-50 focus:ring-green-300"
                    : "border-pink-300 bg-white focus:ring-pink-300"
                }`}
                placeholder={`Đáp án ${optIndex + 1}`}
                value={opt.content}
                onChange={(e) => onChangeOptionContent(optIndex, e.target.value)}
              />
              {question.options.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveOption(optIndex)}
                  className="text-red-400 hover:text-red-600 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
          {question.options.length === 0 && (
            <p className="text-sm text-gray-500 italic bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              💭 Chưa có đáp án nào. Nhấn "Thêm đáp án" để thêm.
            </p>
          )}
        </div>
      )}

      {question.question_type === "essay" && (
        <div className="pl-4 mt-3 text-sm text-purple-600 italic bg-purple-50 p-3 rounded-xl border border-purple-200">
          ✍️ Câu tự luận: Học sinh sẽ gửi bài làm cho giáo viên chấm điểm sau
          khi nộp bài.
        </div>
      )}
    </div>
  );
}

