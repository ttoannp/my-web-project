'use client';

import { LoginForm } from "../../components/auth/LoginForm";
import { useLogin } from "../../hooks/useLogin";

export default function LoginPage() {
  const {
    username,
    password,
    error,
    loading,
    setUsername,
    setPassword,
    handleSubmit,
  } = useLogin();

  return (
    <LoginForm
      username={username}
      password={password}
      error={error}
      loading={loading}
      onChangeUsername={setUsername}
      onChangePassword={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

