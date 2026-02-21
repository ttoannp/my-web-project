import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Nếu là FormData, không set Content-Type để axios tự động set với boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

