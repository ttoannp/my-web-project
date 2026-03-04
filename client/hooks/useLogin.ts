import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      setAuth(res.user, res.token);
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    password,
    error,
    loading,
    setUsername,
    setPassword,
    handleSubmit,
  };
}

