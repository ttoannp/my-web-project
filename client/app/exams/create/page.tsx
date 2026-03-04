'use client';

import { ExamInfoForm } from "../../../components/exam/ExamInfoForm";
import { PdfUploader } from "../../../components/exam/PdfUploader";
import { QuestionCard } from "../../../components/exam/QuestionCard";
import { useCreateExam } from "../../../hooks/useCreateExam";

export default function CreateExamPage() {
  const {
    user,
    loading,
    parsingPdf,
    pdfFile,
    examInfo,
    questions,
    setExamInfo,
    addQuestion,
    removeQuestion,
    handleQuestionTypeChange,
    handleQuestionChange,
    addOption,
    removeOption,
    handleOptionChange,
    setCorrectOption,
    handlePdfChange,
    handleParsePdf,
    handleSubmit,
  } = useCreateExam();

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

      <ExamInfoForm examInfo={examInfo} onChange={setExamInfo} />

      <PdfUploader
        pdfFile={pdfFile}
        parsingPdf={parsingPdf}
        onFileChange={handlePdfChange}
        onParsePdf={handleParsePdf}
      />

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <QuestionCard
            key={qIndex}
            question={q}
            index={qIndex}
            onRemove={() => removeQuestion(qIndex)}
            onChangeType={(type) => handleQuestionTypeChange(qIndex, type)}
            onChangeScore={(score) =>
              handleQuestionChange(qIndex, "score", score)
            }
            onChangeContent={(content) =>
              handleQuestionChange(qIndex, "content", content)
            }
            onAddOption={() => addOption(qIndex)}
            onRemoveOption={(optIndex) => removeOption(qIndex, optIndex)}
            onChangeOptionContent={(optIndex, content) =>
              handleOptionChange(qIndex, optIndex, "content", content)
            }
            onSetCorrectOption={(optIndex) =>
              setCorrectOption(qIndex, optIndex)
            }
          />
        ))}
      </div>

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
          {loading ? "⏳ Đang lưu..." : "💾 Lưu Đề Thi"}
        </button>
      </div>
    </div>
  );
}

