type Props = {
  examId: string;
  onChangeExamId: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ExamCodeForm({ examId, onChangeExamId, onSubmit }: Props) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
      <div className="text-center mb-6">
        <span className="text-5xl mb-3 block">✏️</span>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Làm đề thi
        </h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>🔢</span> Nhập mã đề thi
          </label>
          <input
            type="text"
            className="w-full border-2 border-emerald-300 p-4 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white text-center text-lg font-semibold"
            placeholder="Ví dụ: 1"
            value={examId}
            onChange={(e) => onChangeExamId(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🚀</span> Vào làm bài
        </button>
      </form>
    </div>
  );
}

