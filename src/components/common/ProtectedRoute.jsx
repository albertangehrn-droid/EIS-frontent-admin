"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";
import ROUTE_PATH from "@/libs/route-path";
import { useTitle } from "@/hooks/useTitle";
import axiosInstance from "@/utils/axiosInstance";

const publicRoutes = [
  ROUTE_PATH.AUTH.LOGIN,
  ROUTE_PATH.AUTH.FORGOT_PASSWORD,
  ROUTE_PATH.AUTH.RESET_PASSWORD,
  ROUTE_PATH.AUTH.REGISTER,
  ROUTE_PATH.HOME,
];

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking");

  // Auto update title
  useTitle();

  // Check if the pathname matches a public route or starts with the reset password route
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes(":token")) {
      return pathname.startsWith("/reset-password/");
    }
    return route === pathname;
  });

  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async () => {
      if (isPublicRoute) {
        if (mounted) {
          setStatus("ready");
        }
        return;
      }

      if (!token || !isAuthenticated) {
        clearAuth();
        if (mounted) {
          setStatus("redirecting");
          router.replace(ROUTE_PATH.AUTH.LOGIN);
        }
        return;
      }

      try {
        await axiosInstance.get("/admin/me", { timeout: 3500 });
        if (mounted) {
          setStatus("ready");
        }
      } catch (error) {
        clearAuth();
        if (mounted) {
          setStatus("redirecting");
          router.replace(ROUTE_PATH.AUTH.LOGIN);
        }
      }
    };

    verifyAdmin();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token, pathname, isPublicRoute, router, clearAuth]);

  // Authentication complete - user stays on current page
  // Navigation is handled by individual page components

  if (!isPublicRoute && status !== "ready") {
    return null;
  }

  return children;
}