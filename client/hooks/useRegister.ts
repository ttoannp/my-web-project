import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register(username, password, fullName, "student");
      setAuth(res.user, res.token);
      router.push("/home");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    fullName,
    password,
    error,
    loading,
    setUsername,
    setFullName,
    setPassword,
    handleSubmit,
  };
}

