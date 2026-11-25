"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/_ui/toast-utils";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import NotificationListener from "@/components/common/NotificationListner";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CategoryProvider } from "@/contexts/categoryContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { SpeechProvider } from "@/contexts/SpeechContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SoundControlHeader from "@/components/common/SoundControlHeader";

export default function ClientRoot({ children }) {
  const [showControls, setShowControls] = useState(false);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShowControls(true);
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <CategoryProvider>
              <SoundProvider>
                <SpeechProvider>
                  {/* {showControls && (
                    <div className="fixed top-0 left-[450px] z-50">
                      <SoundControlHeader />
                    </div>
                  )} */}
                  <NotificationListener />
                  <ProtectedRoute>{children}</ProtectedRoute>
                </SpeechProvider>
              </SoundProvider>
            </CategoryProvider>
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
