"use client";

import ROUTE_PATH from "@/libs/route-path";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import useAxios from "@/hooks/useAxios";
import axiosInstance from "@/utils/axiosInstance";

const AuthContext = createContext();

export const useAuthUser = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  const [progress, setProgress] = useState(10);

  // Function to set user as unavailable
  const setUserUnavailable = async (user) => {
    // Implement your custom availability logic here
    try {
      console.log("Setting user unavailable...");
      // Add your API call here
    } catch (error) {
      console.error("❌ Error setting user unavailable:", error);
    }
  };

  // Function to set user as available with retry mechanism
  const setUserAvailable = async (user, retryCount = 0) => {
    // Implement your custom availability logic here
    try {
      console.log("Setting user available...", retryCount > 0 ? `(Retry ${retryCount})` : "");
      // Add your API call here
    } catch (error) {
      console.error("❌ Error setting user available:", error);

      // Retry once after 2 seconds if failed
      if (retryCount === 0) {
        console.log("🔄 Retrying setUserAvailable in 2 seconds...");
        setTimeout(() => {
          setUserAvailable(user, 1);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    let storedUser = localStorage.getItem("authUser");

    let interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 15 : prev)); // ✅ Faster increment
    }, 100);

    setTimeout(() => {
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setAuthUser(userData);

        // No need to set available on page load - only on login
      }
      setIsAuthLoaded(true);
      clearInterval(interval);
      setProgress(100);
    }, 800); // ✅ Reduced delay for faster load
  }, []);

  // Handle window close events only
  useEffect(() => {
    if (!authUser) {
      return;
    }

    const handleBeforeUnload = (event) => {
      // Set user as unavailable when window is being closed
      console.log("Window closing - setting user unavailable");
      setUserUnavailable(authUser);
    };

    // Add event listener for window close only
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authUser]);

  const login = async (response) => {
    let { token, role, permissions } = response;
    const userData = {
      user: response,
      isAuthenticated: true,
      token,
      role,
      permissions,
    };
    setAuthUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));

    // Set user as available when logging in
    // Add your custom logic here if needed
  };

  const logout = async () => {
    console.log('🔊 AuthContext logout function called - starting speech reset');

    // Reset speech functionality for next session
    const resetSpeechFunctionality = () => {
      // Clear all speech-related localStorage keys
      const speechKeys = [
        'speechPermanentlyDisabled',
        'triggerAutoSpeech',
        'speechEnabled',
        'clickSoundsEnabled',
        'hasAutoSpoken',
        'firstDemoVisit',
        'firstDemoSession',
        'firstGameLogin'
      ];

      console.log('🔊 Clearing speech keys:', speechKeys);
      speechKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`🔊 Removing ${key}: ${value}`);
        localStorage.removeItem(key);
      });

      // Verify keys are cleared
      console.log('🔊 Verifying keys are cleared:');
      speechKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`🔊 ${key} after removal: ${value}`);
      });

      // Also clear any session storage items
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('speechSessionActive');
        sessionStorage.removeItem('demoSpeechCompleted');
      }

      console.log('🔊 Speech functionality completely reset in AuthContext');
    };

    // Reset speech
    resetSpeechFunctionality();

    // Set user as unavailable when logging out
    // Add your custom logic here if needed
    setAuthUser(null);
    localStorage.removeItem("authUser");
    router.push(ROUTE_PATH.AUTH.LOGIN);
  };

  const updateUser = (user) => {
    setAuthUser((prev) => ({ ...prev, user }));
  };


  if (!isAuthLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">

        <div className="w-full max-w-[420px] overflow-hidden rounded-md shadow-2xl border border-[#777]">

          {/* Top white strip */}
          <div className="h-[34px] bg-white" />

          {/* Popup body */}
          <div className="bg-[#9FB4CC] px-6 py-8 text-center">

            {/* Heading */}
            <h2 className="text-2xl font-bold text-black tracking-wider animate-pulse">
              LOADING...
            </h2>

            {/* Small text */}
            <p className="mt-2 text-sm italic text-[#222]">
              Preparing simulation data
            </p>

            {/* Spinner */}
            <div className="flex justify-center mt-6">
              <div className="text-3xl animate-spin text-black">
                ⟳
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <Progress
                value={progress}
                className="w-full h-3 bg-white border border-[#666]"
              />
            </div>

            {/* Percentage */}
            <p className="mt-3 text-sm font-bold text-black">
              {Math.round(progress)}%
            </p>

          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
