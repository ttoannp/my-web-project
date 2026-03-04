import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../services/apiClient";
import { useAuthStore } from "../store/authStore";

export type QuestionOption = {
  content: string;
  is_correct: boolean;
};

export type Question = {
  content: string;
  score: number;
  question_type: "mcq" | "essay";
  options: QuestionOption[];
};

export type ExamInfo = {
  title: string;
  description: string;
  duration: number;
};

export function useCreateExam() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [examInfo, setExamInfo] = useState<ExamInfo>({
    title: "",
    description: "",
    duration: 60,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      content: "",
      score: 1,
      question_type: "mcq",
      options: [
        { content: "", is_correct: false },
        { content: "", is_correct: false },
      ],
    },
  ]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        content: "",
        score: 1,
        question_type: "mcq",
        options: [
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleQuestionTypeChange = (index: number, type: "mcq" | "essay") => {
    setQuestions((prev) => {
      const next = [...prev];
      if (type === "essay") {
        next[index] = {
          ...next[index],
          question_type: "essay",
          options: [],
        };
      } else {
        if (next[index].options.length === 0) {
          next[index].options = [
            { content: "", is_correct: false },
            { content: "", is_correct: false },
          ];
        }
        next[index].question_type = "mcq";
      }
      return next;
    });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].options = [
        ...next[qIndex].options,
        { content: "", is_correct: false },
      ];
      return next;
    });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const options = next[qIndex].options;
      if (options.length > 1) {
        options.splice(optIndex, 1);
        options.forEach((o) => {
          o.is_correct = false;
        });
      }
      return [...next];
    });
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    field: keyof QuestionOption,
    value: any
  ) => {
    setQuestions((prev) => {
      const next = [...prev];
      const options = [...next[qIndex].options];
      options[optIndex] = { ...options[optIndex], [field]: value };
      next[qIndex].options = options;
      return next;
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex].options = next[qIndex].options.map((opt, idx) => ({
        ...opt,
        is_correct: idx === optIndex,
      }));
      return next;
    });
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

      const res = await apiClient.post("/api/exams/parse-pdf", formData);
      const parsedQuestions: Question[] = res.data.questions ?? [];
      if (parsedQuestions.length === 0) {
        alert(
          "Không đọc được câu hỏi nào từ file PDF, vui lòng kiểm tra lại định dạng."
        );
        return;
      }
      setQuestions(parsedQuestions);
      alert(
        `✅ Đã đọc được ${parsedQuestions.length} câu hỏi từ PDF. Vui lòng kiểm tra và chọn đáp án đúng.`
      );
    } catch (error: any) {
      console.error("Lỗi parse PDF:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Lỗi khi đọc file PDF";
      const errorHint = error?.response?.data?.hint || "";
      alert(
        `❌ ${errorMessage}${errorHint ? `\n\nGợi ý: ${errorHint}` : ""}`
      );
    } finally {
      setParsingPdf(false);
    }
  };

  const validateBeforeSubmit = () => {
    if (!examInfo.title.trim()) {
      alert("⚠️ Vui lòng nhập tên bài kiểm tra!");
      return false;
    }

    if (questions.length === 0) {
      alert("⚠️ Đề thi phải có ít nhất 1 câu hỏi!");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionNum = i + 1;

      if (!q.content.trim()) {
        alert(`⚠️ Câu hỏi số ${questionNum} đang để trống nội dung!`);
        return false;
      }

      if (q.question_type === "mcq") {
        if (q.options.length < 2) {
          alert(
            `⚠️ Câu hỏi số ${questionNum} (Trắc nghiệm) cần ít nhất 2 đáp án!`
          );
          return false;
        }

        const emptyOptionIndex = q.options.findIndex(
          (opt) => !opt.content.trim()
        );
        if (emptyOptionIndex !== -1) {
          alert(
            `⚠️ Câu hỏi số ${questionNum}: Đáp án thứ ${
              emptyOptionIndex + 1
            } đang để trống!`
          );
          return false;
        }

        const hasCorrectAnswer = q.options.some((opt) => opt.is_correct);
        if (!hasCorrectAnswer) {
          alert(
            `⚠️ Lỗi tại Câu hỏi số ${questionNum}:\n\nBạn chưa chọn đáp án đúng!\nVui lòng tích vào ô tròn cạnh đáp án đúng.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateBeforeSubmit()) return;

    setLoading(true);
    const payload = {
      ...examInfo,
      created_by: user.id,
      questions,
    };

    try {
      await apiClient.post("/api/exams/create", payload);
      alert("✅ Tạo đề thi thành công!");
      router.push("/home");
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || "❌ Lỗi khi tạo đề thi");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}

