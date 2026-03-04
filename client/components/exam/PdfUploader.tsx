type Props = {
  pdfFile: File | null;
  parsingPdf: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onParsePdf: () => void;
};

export function PdfUploader({
  pdfFile,
  parsingPdf,
  onFileChange,
  onParsePdf,
}: Props) {
  return (
    <div className="mb-8 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-md">
      <p className="mb-3 text-sm font-medium text-purple-700 flex items-center gap-2">
        <span>📚</span> Hoặc tải file PDF đề trắc nghiệm để hệ thống đọc câu hỏi
        (không lấy đáp án).
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="text-sm border-2 border-purple-300 rounded-xl p-2 bg-white cursor-pointer"
        />
        <button
          type="button"
          onClick={onParsePdf}
          disabled={!pdfFile || parsingPdf}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform hover:scale-105 sm:mt-0"
        >
          {parsingPdf ? "⏳ Đang đọc PDF..." : "📖 Đọc đề từ PDF"}
        </button>
      </div>
    </div>
  );
}

