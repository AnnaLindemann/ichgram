import axios from "axios";
import { getAuthToken } from "@/lib/auth-storage";
import { logout } from "@/lib/logout";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);