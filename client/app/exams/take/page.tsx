'use client';

import { ExamCodeForm } from "../../../components/exam/ExamCodeForm";
import { useEnterExamCode } from "../../../hooks/useEnterExamCode";

export default function TakeExamPage() {
  const { examId, setExamId, handleSubmit } = useEnterExamCode();

  return (
    <ExamCodeForm
      examId={examId}
      onChangeExamId={setExamId}
      onSubmit={handleSubmit}
    />
  );
}

