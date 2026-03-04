'use client';
import { HomeActions } from "../../components/home/HomeActions";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeTabs } from "../../components/home/HomeTabs";
import { useHomePage } from "../../hooks/useHomePage";

export default function HomePage() {
  const {
    user,
    isTeacher,
    activeTab,
    setActiveTab,
    createdExams,
    myAttempts,
    loading,
    deletingId,
    handleDeleteExam,
  } = useHomePage();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <HomeHeader user={user} isTeacher={isTeacher} />
      <HomeActions isTeacher={isTeacher} />
      <HomeTabs
        isTeacher={isTeacher}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        createdExams={createdExams}
        myAttempts={myAttempts}
        deletingId={deletingId}
        onDeleteExam={handleDeleteExam}
      />
    </div>
  );
}
