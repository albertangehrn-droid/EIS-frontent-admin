"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GameButton from "@/components/Buttons/GameButton";
import IMAGES from "@/utils/imagePaths";
import HeroOverlay from "./HeroOverlay";
import useAuthStore from "@/stores/useAuthStore";
import axiosInstance from "@/utils/axiosInstance";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

const StartingScreen = () => {
  const router = useRouter();
  const {
    adminLogin,
    sendForgotOtp,
    resetAdminPassword,
    logout,
    clearAuth,
    loading,
    error,
    clearError,
    isAuthenticated,
    token,
  } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showQuitPopup, setShowQuitPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password, 3 = Success
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotMessage, setForgotMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const images = [
    IMAGES.ALL.ROLL[2],
    IMAGES.ALL.ROLL[1],
    IMAGES.ALL.ROLL[3],
    IMAGES.ALL.ROLL[5],
    IMAGES.ALL.ROLL[7],
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  // Verify admin session on mount before rendering protected UI
  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      let currentToken = token;
      let isAuth = isAuthenticated;

      if (typeof window !== "undefined") {
        try {
          const authStorage = localStorage.getItem("auth-storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            if (parsed?.state?.token) currentToken = parsed.state.token;
            if (parsed?.state?.isAuthenticated != null) isAuth = parsed.state.isAuthenticated;
          }
        } catch (e) {}
      }

      // If no token exists, user is definitely NOT logged in -> show login modal immediately with 0 delay
      if (!currentToken || !isAuth) {
        if (mounted) {
          if (clearAuth) clearAuth();
          setShowAdminLogin(true);
          setIsVerifying(false);
        }
        return;
      }

      // Token exists -> verify with backend before revealing dashboard
      try {
        const response = await axiosInstance.get("/admin/me", { timeout: 3500 });
        if (mounted) {
          if (response?.data?.success) {
            setShowAdminLogin(false);
          } else {
            if (clearAuth) clearAuth();
            setShowAdminLogin(true);
          }
        }
      } catch (err) {
        if (mounted) {
          if (clearAuth) clearAuth();
          setShowAdminLogin(true);
        }
      } finally {
        if (mounted) {
          setIsVerifying(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  // Keep showAdminLogin in sync with isAuthenticated after initial verification
  useEffect(() => {
    if (!isVerifying) {
      if (isAuthenticated) {
        setShowAdminLogin(false);
      } else {
        setShowAdminLogin(true);
      }
    }
  }, [isAuthenticated, isVerifying]);

  // Resend OTP countdown effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleStartClick = () => router.push("/aboutDetail");

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    const result = await adminLogin(adminEmail, adminPassword);

    if (result.success) {
      console.log("✅ Login successful, redirecting...");
      // The buttons will automatically show because isAuthenticated will be true
      // Add redirect logic here if needed (e.g., router.push('/admin/dashboard'))
    } else {
      console.log("❌ Login failed:", result.error);
      // Show error message to user
    }
  };

  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Please enter your admin email address.");
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    const res = await sendForgotOtp(forgotEmail);
    setForgotLoading(false);

    if (res.success) {
      setForgotStep(2);
      setForgotMessage(res.message || "OTP has been sent to your email.");
      setResendCooldown(60);
    } else {
      setForgotError(res.error || "Failed to send OTP. Please check your email.");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    const res = await resetAdminPassword(forgotEmail, forgotOtp.trim(), newPassword);
    setForgotLoading(false);

    if (res.success) {
      setForgotStep(3);
    } else {
      setForgotError(res.error || "Failed to reset password. Please check your OTP.");
    }
  };

  const handleBackToLogin = () => {
    setShowForgotModal(false);
    setShowAdminLogin(true);
    setForgotError(null);
    setForgotMessage(null);
    setForgotStep(1);
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");
    if (clearError) clearError();
  };

  const handlePlayDemoClick = () => {
    // Check if speech is permanently disabled
    const isSpeechPermanentlyDisabled = localStorage.getItem('speechPermanentlyDisabled') === 'true';
    
    if (!isSpeechPermanentlyDisabled) {
      // Enable sounds and speech for demo only if not permanently disabled
      localStorage.setItem('speechEnabled', 'true');
      localStorage.setItem('clickSoundsEnabled', 'true');
      
      // Set trigger flag for auto-speech
      localStorage.setItem('triggerAutoSpeech', 'true');
      
      console.log('🎮 PLAY DEMO clicked - triggering auto speech');
    } else {
      console.log('🔊 ❌ Speech permanently disabled - enabling click sounds only for playDemo');
      // Speech is permanently disabled - only enable click sounds
      localStorage.setItem('speechEnabled', 'false');
      localStorage.setItem('clickSoundsEnabled', 'true');
      // Don't set triggerAutoSpeech when speech is permanently disabled
    }
    
    // Navigate to playDemo
    router.push('/playDemo');
  };

  const navButtons = isAuthenticated ? [
    // { label: "TEAM ACCESS", onClick: () => router.push("/team-access") },
    // { label: "PLAY DEMO", onClick: handlePlayDemoClick },
    { label: "REVIEW TEAMS", onClick: () => router.push("/reviewTeams") },
    { label: "TRANSLATION", onClick: () => router.push("/translations") },
    { label: "GLOBAL CSS", onClick: () => router.push("/globalCss") },
    { label: "Logout", onClick: () => setShowQuitPopup(true) },
  ] : [
    // { label: "PLAY DEMO", onClick: handlePlayDemoClick },
    { label: "REVIEW TEAMS", onClick: () => router.push("/reviewTeams") },
    { label: "Logout", onClick: () => setShowQuitPopup(true) },
  ];

  if (isVerifying) {
    return (
      <div className="relative min-h-screen w-full bg-white flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4a017] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#111] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* DESKTOP + TABLET */}
          <Image
            src={img}
            alt=""
            fill
            priority={index === 0}
            className="
        hidden sm:block
        object-cover
        object-center
      "
          />

          {/* MOBILE VERSION */}
          <div className="block sm:hidden absolute inset-0">
            <Image
              src={img}
              alt=""
              fill
              priority={index === 0}
              className="
          object-cover
          object-[60%_center]
          scale-[1.2]
        "
            />
          </div>
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Admin Login Popup */}
      {showAdminLogin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-125 p-4 rounded-md overflow-hidden shadow-lg">
            {/* TOP WHITE STRIP */}
            <div className="bg-white h-10 border-b border-gray-300"></div>

            {/* BODY */}
            <div className="bg-[#9FB4CC] px-8 py-6">
              {/* Title */}
              <h2 className="text-xl text-black text-center mb-1">
                ADMIN LOGIN
              </h2>

              <p className="text-sm text-gray-700 text-center mb-6">
                Enter your credentials to continue
              </p>

              {/* Error */}
              {error && (
                <div className="mb-4 p-2 bg-red-200 border border-red-400 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleAdminLogin}
                className="space-y-4"
                autoComplete="off"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm text-black mb-1">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (error) clearError();
                    }}
                    className="
              w-full px-3 py-2
              bg-white border border-gray-400
              text-black outline-none
              focus:border-black
            "
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-black mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (error) clearError();
                      }}
                      className="
                w-full px-3 py-2 pr-10
                bg-white border border-gray-400
                text-black outline-none
                focus:border-black
              "
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (error) clearError();
                      setForgotEmail(adminEmail || "");
                      setForgotOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setForgotError(null);
                      setForgotMessage(null);
                      setForgotStep(1);
                      setShowAdminLogin(false);
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-[#1e3a5f] hover:text-black hover:underline cursor-pointer transition font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex justify-center mt-4">
                  {/* Login */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
              px-8 py-2
              bg-[#7A9CC4]
              text-black
              border border-black
              hover:bg-[#6A8CB4]
              transition
              disabled:opacity-50
            "
                  >
                    {loading ? "Loading..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Popup */}
      {showForgotModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-125 p-4 rounded-md overflow-hidden shadow-lg">
            {/* TOP WHITE STRIP */}
            <div className="bg-white h-10 border-b border-gray-300"></div>

            {/* BODY */}
            <div className="bg-[#9FB4CC] px-8 py-6">
              {/* Step 1: Request OTP */}
              {forgotStep === 1 && (
                <>
                  <h2 className="text-xl text-black text-center mb-1 font-semibold">
                    FORGOT PASSWORD
                  </h2>
                  <p className="text-sm text-gray-700 text-center mb-6">
                    Enter your admin email to receive a 6-digit OTP code
                  </p>

                  {forgotError && (
                    <div className="mb-4 p-2 bg-red-200 border border-red-400 text-red-700 text-sm">
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleSendForgotOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm text-black mb-1">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError(null);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-400 text-black outline-none focus:border-black"
                        placeholder="admin@example.com"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="px-6 py-2 bg-white text-black border border-black hover:bg-gray-100 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="px-6 py-2 bg-[#7A9CC4] text-black border border-black hover:bg-[#6A8CB4] transition disabled:opacity-50 cursor-pointer font-medium"
                      >
                        {forgotLoading ? "Sending OTP..." : "Send OTP"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Step 2: Enter OTP & New Password */}
              {forgotStep === 2 && (
                <>
                  <h2 className="text-xl text-black text-center mb-1 font-semibold">
                    RESET PASSWORD
                  </h2>
                  <p className="text-xs text-gray-700 text-center mb-4">
                    Enter the 6-digit OTP sent to <strong className="text-black">{forgotEmail}</strong>
                  </p>

                  {forgotMessage && (
                    <div className="mb-3 p-2 bg-green-100 border border-green-400 text-green-800 text-xs text-center">
                      {forgotMessage}
                    </div>
                  )}

                  {forgotError && (
                    <div className="mb-3 p-2 bg-red-200 border border-red-400 text-red-700 text-sm">
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                    {/* OTP Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm text-black">6-Digit OTP</label>
                        <button
                          type="button"
                          disabled={resendCooldown > 0 || forgotLoading}
                          onClick={() => handleSendForgotOtp()}
                          className="text-xs text-blue-900 hover:underline disabled:text-gray-600 disabled:no-underline cursor-pointer"
                        >
                          {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP"}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={forgotOtp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setForgotOtp(val);
                          if (forgotError) setForgotError(null);
                        }}
                        maxLength={6}
                        placeholder="••••••"
                        className="w-full px-3 py-2 bg-white border border-gray-400 text-black text-center tracking-[0.4em] font-mono text-lg outline-none focus:border-black"
                        required
                        autoFocus
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm text-black mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (forgotError) setForgotError(null);
                          }}
                          className="w-full px-3 py-2 pr-10 bg-white border border-gray-400 text-black outline-none focus:border-black"
                          placeholder="Min 6 characters"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm text-black mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (forgotError) setForgotError(null);
                          }}
                          className="w-full px-3 py-2 pr-10 bg-white border border-gray-400 text-black outline-none focus:border-black"
                          placeholder="Re-enter password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-5">
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="px-6 py-2 bg-white text-black border border-black hover:bg-gray-100 transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="px-6 py-2 bg-[#7A9CC4] text-black border border-black hover:bg-[#6A8CB4] transition disabled:opacity-50 cursor-pointer font-medium"
                      >
                        {forgotLoading ? "Resetting..." : "Reset Password"}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Step 3: Success */}
              {forgotStep === 3 && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-xl text-black font-semibold mb-2">
                    PASSWORD CHANGED!
                  </h2>
                  <p className="text-sm text-gray-700 mb-6">
                    Your password has been changed successfully. You can now login with your new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail(forgotEmail);
                      setAdminPassword("");
                      handleBackToLogin();
                    }}
                    className="px-8 py-2 bg-[#7A9CC4] text-black border border-black hover:bg-[#6A8CB4] transition cursor-pointer font-medium"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quit Confirmation Popup */}
      {showQuitPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-125 rounded-md overflow-hidden shadow-lg">
            {/* TOP WHITE STRIP */}
            <div className="bg-white h-10"></div>

            {/* BODY */}
            <div className="bg-[#9FB4CC] py-6 px-8 text-center">
              {/* Text */}
              <p className="text-lg text-black mb-6">
                Are you sure you want to logout?
              </p>

              {/* Buttons */}
              <div className="flex justify-center gap-6">
                {/* OK */}
                <button
                  onClick={() => {
                    // Reset speech functionality for next session
                    localStorage.removeItem('speechPermanentlyDisabled');
                    localStorage.removeItem('triggerAutoSpeech');
                    localStorage.removeItem('speechEnabled');
                    localStorage.removeItem('clickSoundsEnabled');
                    
                    logout();
                    setShowQuitPopup(false);
                    setShowAdminLogin(true);
                    setAdminEmail("");
                    setAdminPassword("");
                    // router.push("/");
                  }}
                  className="
                    px-10 py-2
                    bg-white
                    text-black
                    border border-blue-500
                    hover:bg-[#6A8CB4]
                    transition
                  "
                >
                  OK
                </button>

                {/* Cancel */}
                <button
                  onClick={() => setShowQuitPopup(false)}
                  className="
                    px-10 py-2
                    bg-white
                    text-black
                    border border-blue-500
                    hover:bg-[#6A8CB4]
                    transition
                  "
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Left Button */}
      {isAuthenticated && (
        <div className="absolute w-auto max-w-[65%] sm:max-w-none md:w-90 top-0 md:top-8 left-0 z-10">
          <GameButton
            label="EIS Simulation"
            onClick={handleStartClick}
            variant="primary"
            // className="w-[350px] h-[70px] text-[28px]"
            className="py-2! px-4! text-xl! w-full md:px-10 md:py-2"
          />
        </div>
      )}

      {/* Top Right Admin Heading */}
      {isAuthenticated && (
        <div className="absolute top-2 sm:top-4 md:top-8 right-4 sm:right-6 md:right-10 z-20 pointer-events-none select-none text-right">
          <div className="inline-flex flex-col items-end">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-widest text-yellow-400 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              ADMIN
            </h1>
            <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.28em] text-white/90 uppercase drop-shadow-md -mt-0.5 sm:-mt-1">
              PANEL
            </span>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="z-20 px-2 relative mt-60 sm:mt-60 md:absolute md:bottom-0 md:right-0 md:mb-3 md:px-0">
          <div className="grid grid-cols-1 sm:flex md:flex md:gap-[2px] gap-3 w-full md:w-auto md:h-12">
            {navButtons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`
                  flex-1 bg-black text-yellow-400 text-sm sm:text-base font-bold py-3 px-6 tracking-widest uppercase border border-gray-700 hover:bg-gray-900 transition-colors whitespace-nowrap
                  md:flex-1 md:flex md:items-center md:justify-center md:h-full md:px-8 md:py-0 md:border md:border-gray-700 md:tracking-widest md:uppercase md:bg-black md:text-yellow-400 md:hover:bg-gray-900 md:whitespace-nowrap
                  ${btn.label === "QUIT" ? "bg-[#1a0505] md:bg-[#1a0505] md:hover:bg-[#2a0808]" : ""}
                `}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hero Overlay */}
      <div className=" z-20 w-full
  relative mt-4
  md:absolute md:bottom-35 md:left-0">
        <HeroOverlay />
      </div>
    </div>
  );
};

export default StartingScreen;
