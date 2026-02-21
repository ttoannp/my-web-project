import { create } from "zustand";
import type { User } from "../services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("current_user", JSON.stringify(user));
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("current_user");
    }
    set({ user: null, token: null });
  },
  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("current_user");
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({ user, token });
        } catch (e) {
          // Invalid data, clear it
          localStorage.removeItem("access_token");
          localStorage.removeItem("current_user");
        }
      }
    }
  },
}));

