import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set) => ({
      // ==================== AUTH STATE ====================
      token: null,
      gameTeam: null,
      sessionId: null,
      teamId: null,

      // ==================== GAME DATA ====================
      initiatives: null, // Array of initiatives from login response

      // ==================== AUTH ACTIONS ====================
      setAuthData: (data) => {
        const { token, gameTeam, sessionId, teamId, initiatives } = data;
        set({
          token,
          gameTeam,
          sessionId,
          teamId,
          initiatives: initiatives || null,
        });
      },

      logout: () => {
        set({
          token: null,
          gameTeam: null,
          sessionId: null,
          teamId: null,
          initiatives: null,
        });
      },

      resetSession: () => {
        set({
          // Auth data remains
        });
      },

      setInitiatives: (initiatives) => {
        set({ initiatives });
      },
    }),
    {
      name: 'game-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields to localStorage
        token: state.token,
        gameTeam: state.gameTeam,
        sessionId: state.sessionId,
        teamId: state.teamId,
        initiatives: state.initiatives,
      }),
    }
  )
);

export default useGameStore;
