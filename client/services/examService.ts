import { apiClient } from "./apiClient";

export interface ExamSummary {
  id: number;
  title: string;
  description?: string;
  duration: number;
}

export interface ExamDetail extends ExamSummary {
  questions: {
    id: number;
    content: string;
    question_type: "mcq" | "essay";
    score: number;
    options: { id: number; content: string }[];
  }[];
}

export async function listExams() {
  const res = await apiClient.get<ExamSummary[]>("/api/exams");
  return res.data;
}

export async function getExamDetail(id: number) {
  const res = await apiClient.get<ExamDetail>(`/api/exams/${id}`);
  return res.data;
}

export async function startExam(examId: number, userId: number) {
  const res = await apiClient.post<{ attempt_id: number }>(
    `/api/exams/${examId}/start`,
    { user_id: userId }
  );
  return res.data;
}

export async function submitExam(
  examId: number,
  attemptId: number,
  answers: {
    question_id: number;
    selected_option_id?: number;
    essay_answer?: string;
  }[]
) {
  const res = await apiClient.post<{ message: string; total_score: number }>(
    `/api/exams/${examId}/submit`,
    { attempt_id: attemptId, answers }
  );
  return res.data;
}

export async function getMyCreatedExams(userId: number) {
  const res = await apiClient.get<ExamSummary[]>(`/api/exams/my-created?user_id=${userId}`);
  return res.data;
}

export async function getMyAttempts(userId: number) {
  const res = await apiClient.get<any[]>(`/api/exams/my-attempts?user_id=${userId}`);
  return res.data;
}

export async function getExamDetailWithAnswers(examId: number, userId: number) {
  const res = await apiClient.get<ExamDetail & { questions: Array<ExamDetail['questions'][0] & { options: Array<{ id: number; content: string; is_correct: boolean }> }> }>(
    `/api/exams/${examId}/detail?user_id=${userId}`
  );
  return res.data;
}

export async function getExamAttempts(examId: number, userId: number) {
  const res = await apiClient.get<any[]>(`/api/exams/${examId}/attempts?user_id=${userId}`);
  return res.data;
}

export async function gradeEssayAnswer(attemptId: number, questionId: number, score: number, teacherId: number) {
  const res = await apiClient.post<{ message: string; total_score: number }>(
    `/api/exams/attempts/${attemptId}/grade`,
    { question_id: questionId, score, teacher_id: teacherId }
  );
  return res.data;
}

export async function updateExamAnswer(examId: number, questionId: number, correctOptionId: number, userId: number) {
  const res = await apiClient.post<{ message: string }>(
    `/api/exams/${examId}/update-answer`,
    { question_id: questionId, correct_option_id: correctOptionId, user_id: userId }
  );
  return res.data;
}

export async function getAttemptDetail(attemptId: number, userId: number) {
  const res = await apiClient.get<any>(
    `/api/exams/attempts/${attemptId}?user_id=${userId}`
  );
  return res.data;
}

export async function deleteExam(examId: number, userId: number) {
  const res = await apiClient.delete<{ message: string }>(
    `/api/exams/${examId}`,
    { data: { user_id: userId } }
  );
  return res.data;
}

