import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export function useRootLanding() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    if (user) {
      router.push("/home");
    }
  }, [user, router, loadFromStorage]);

  return {
    user,
  };
}

