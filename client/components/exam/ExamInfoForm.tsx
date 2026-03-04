import type { ExamInfo } from "../../hooks/useCreateExam";

type Props = {
  examInfo: ExamInfo;
  onChange: (next: ExamInfo) => void;
};

export function ExamInfoForm({ examInfo, onChange }: Props) {
  return (
    <div className="space-y-5 mb-8 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200">
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          📌 Tên bài kiểm tra
        </label>
        <input
          type="text"
          className="w-full border-2 border-pink-300 p-3 rounded-xl mt-1 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
          value={examInfo.title}
          onChange={(e) => onChange({ ...examInfo, title: e.target.value })}
          placeholder="Ví dụ: Kiểm tra 15 phút Toán"
        />
      </div>
      <div>
        <label className="block font-semibold text-gray-700 mb-2">
          📄 Mô tả (tùy chọn)
        </label>
        <textarea
          className="w-full border-2 border-pink-300 p-3 rounded-xl mt-1 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
          value={examInfo.description}
          onChange={(e) =>
            onChange({ ...examInfo, description: e.target.value })
          }
          placeholder="Mô tả về đề thi..."
          rows={2}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold text-gray-700 mb-2">
            ⏰ Thời gian (phút)
          </label>
          <input
            type="number"
            className="w-full border-2 border-pink-300 p-3 rounded-xl mt-1 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
            value={examInfo.duration}
            onChange={(e) =>
              onChange({
                ...examInfo,
                duration: Number(e.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

