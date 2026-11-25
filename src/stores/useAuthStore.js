import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '@/utils/axiosInstance';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Admin Login Action
      adminLogin: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          const response = await axiosInstance.post('/admin/login', {
            email,
            password,
          });

          if (response.data && response.data.success) {
            const { token, user } = response.data.data;
            
            set({
              user,
              token,
              role: 'admin',
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            console.log('✅ Admin Login Successful:', { user, token });
            return { success: true, data: response.data };
          } else {
            const errorMsg = response.data?.message || 'Login failed';
            set({ loading: false, error: errorMsg });
            console.log('❌ Login Failed:', errorMsg);
            return { success: false, error: errorMsg };
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
          set({ loading: false, error: errorMsg });
          console.log('❌ Login Error:', errorMsg);
          return { success: false, error: errorMsg };
        }
      },

      // Send Forgot Password OTP
      sendForgotOtp: async (email) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post('/admin/forgot-password', { email });
          set({ loading: false, error: null });
          return { success: true, message: response.data?.message || 'OTP sent successfully' };
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Verify OTP
      verifyForgotOtp: async (email, otp) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post('/admin/verify-otp', { email, otp });
          set({ loading: false, error: null });
          return { success: true, message: response.data?.message || 'OTP verified' };
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Invalid OTP';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Reset Admin Password
      resetAdminPassword: async (email, otp, newPassword) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post('/admin/reset-password', {
            email,
            otp,
            newPassword,
          });
          set({ loading: false, error: null });
          return { success: true, message: response.data?.message || 'Password reset successfully' };
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message || 'Failed to reset password';
          set({ loading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      // Logout Action
      logout: () => {
        // Comprehensive speech reset for next session
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
          
          speechKeys.forEach(key => {
            localStorage.removeItem(key);
          });
          
          // Also clear any session storage items
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('speechSessionActive');
            sessionStorage.removeItem('demoSpeechCompleted');
          }
          
          console.log('🔊 Speech functionality completely reset');
        };
        
        // Reset speech
        resetSpeechFunctionality();
        
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        console.log('?? Admin Logged Out - Speech Reset');
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },

      // Update User Data
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      // Clear Error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
