// axiosInstance.js
import { showToast } from "@/components/_ui/toast-utils";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

console.log("BASE URL", process.env.NEXT_PUBLIC_API_URL);

// Interceptor for request logging and adding auth token
axiosInstance.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
  } catch (error) {
    console.error("Error reading token from storage:", error);
  }

  return config;
});

// Interceptor for response error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("API Error:", error.response);

    const is401 = error.response?.status === 401 || error.response?.data?.status === 401;

    // Handle 401 Unauthorized Error
    if (is401) {
      console.error("Unauthorized Access:", error.response?.data);

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("auth-storage");
          const authModule = require("@/stores/useAuthStore");
          const store = authModule?.default || authModule?.useAuthStore;
          if (store?.getState()?.clearAuth) {
            store.getState().clearAuth();
          }
        } catch (e) {}

        const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/EIS/admin';
        const cleanBase = (basePath || '').replace(/\/$/, '');
        const loginPath = cleanBase || '/EIS/admin';
        const currentPath = window.location.pathname;

        // Only redirect if on another protected page, not already on root/admin/loginPath
        if (
          currentPath !== loginPath &&
          currentPath !== `${loginPath}/` &&
          currentPath !== "/" &&
          currentPath !== "/admin" &&
          currentPath !== "/admin/"
        ) {
          showToast(
            "error",
            error.response?.data?.message || "Session expired. Please login again."
          );
          window.location.href = loginPath;
        }
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
