import { useState } from "react";
import { useRouter } from "next/navigation";

export function useEnterExamCode() {
  const router = useRouter();
  const [examId, setExamId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) {
      alert("Vui lòng nhập mã đề");
      return;
    }
    const id = parseInt(examId.trim(), 10);
    if (isNaN(id)) {
      alert("Mã đề không hợp lệ");
      return;
    }
    router.push(`/exams/${id}/take`);
  };

  return {
    examId,
    setExamId,
    handleSubmit,
  };
}

