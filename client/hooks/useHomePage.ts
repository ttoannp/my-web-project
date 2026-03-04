import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import {
  getMyCreatedExams,
  getMyAttempts,
  deleteExam,
} from "../services/examService";

export type CreatedExam = any;
export type Attempt = any;

export function useHomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  const [activeTab, setActiveTab] = useState<"created" | "attempts">("created");
  const [createdExams, setCreatedExams] = useState<CreatedExam[]>([]);
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    void loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === "teacher") {
        if (activeTab === "created") {
          const exams = await getMyCreatedExams(user.id);
          setCreatedExams(exams);
        } else {
          const attempts = await getMyAttempts(user.id);
          setMyAttempts(attempts);
        }
      } else {
        const attempts = await getMyAttempts(user.id);
        setMyAttempts(attempts);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (
    e: React.MouseEvent,
    examId: number
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (
      !confirm(
        "Bạn có chắc muốn xóa đề thi này? Hành động không thể hoàn tác."
      )
    )
      return;
    setDeletingId(examId);
    try {
      await deleteExam(examId, user.id);
      await loadData();
    } catch (error: any) {
      alert(error?.response?.data?.error || "Lỗi khi xóa đề thi");
    } finally {
      setDeletingId(null);
    }
  };

  const isTeacher = user?.role === "teacher";

  return {
    user,
    isTeacher,
    activeTab,
    setActiveTab,
    createdExams,
    myAttempts,
    loading,
    deletingId,
    handleDeleteExam,
  };
}

