"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/utils/axiosInstance';

const MAX_DEMO_DECISIONS = 10;
const DEMO_SESSION_KEY = 'boostai_demo_session';

// Module-level gate to prevent multiple API calls across Strict Mode remounts
let globalIsCreatingSession = false;
let demoSessionLoadPromise = null;

export default function usePlayDemoGame() {
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoEnded, setIsDemoEnded] = useState(false);
  const [demoStats, setDemoStats] = useState(null);

  // Load from localStorage on mount or create new session
  useEffect(() => {
    const loadOrCreateDemoSession = async () => {
      if (demoSessionLoadPromise) {
        console.log('[usePlayDemoGame] Waiting for shared demo session load promise');
        try {
          await demoSessionLoadPromise;
        } catch (err) {
          // If the shared session load failed, continue and let this instance retry.
          console.error('[usePlayDemoGame] Shared demo session load failed:', err);
        }

        const restoredSession = localStorage.getItem(DEMO_SESSION_KEY);
        if (restoredSession) {
          try {
            const parsed = JSON.parse(restoredSession);
            if (parsed.sessionId && parsed.gameState) {
              setSessionId(parsed.sessionId);
              setGameState(parsed.gameState);
              setInitiatives(parsed.initiatives || []);
              setIsDemoEnded(parsed.isDemoEnded || false);
              setDemoStats(parsed.demoStats || null);
            }
          } catch (e) {
            localStorage.removeItem(DEMO_SESSION_KEY);
          }
        }

        setLoading(false);
        return;
      }

      demoSessionLoadPromise = (async () => {
        // Double-check localStorage first (synchronous) - this is fast, do it first
        const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession);
            if (parsed.sessionId && parsed.gameState) {
              console.log('Using saved session from localStorage, validating with API');
              setSessionId(parsed.sessionId);
              setGameState(parsed.gameState);
              setInitiatives(parsed.initiatives || []);
              setIsDemoEnded(parsed.isDemoEnded || false);
              setDemoStats(parsed.demoStats || null);
              try {
                await fetchGameState(parsed.sessionId);
              } catch (fetchError) {
                console.error('[usePlayDemoGame] Error validating saved session:', fetchError);
              }
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem(DEMO_SESSION_KEY);
          }
        }
        
        // Prevent multiple simultaneous calls using module-level variable
        if (globalIsCreatingSession) {
          console.log('Demo session creation already in progress, waiting...');
          // Don't return immediately - wait for the other call to complete
          // Poll for 5 seconds max
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds (100ms * 50)
          
          while (globalIsCreatingSession && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            
            // Check if session was created by other call
            const checkSession = localStorage.getItem(DEMO_SESSION_KEY);
            if (checkSession) {
              try {
                const parsed = JSON.parse(checkSession);
                if (parsed.sessionId && parsed.gameState) {
                  console.log('Other call created session, using it');
                  setSessionId(parsed.sessionId);
                  setGameState(parsed.gameState);
                  setInitiatives(parsed.initiatives || []);
                  setIsDemoEnded(parsed.isDemoEnded || false);
                  setDemoStats(parsed.demoStats || null);
                  setLoading(false);
                  return;
                }
              } catch (e) {
                // ignore
              }
            }
          }
          
          // If still creating, give up and let this call proceed
          console.log('Timeout waiting for other call, proceeding...');
        }
        
        try {
          globalIsCreatingSession = true;
          setLoading(true);
          setError(null);
          
          console.log('[usePlayDemoGame] Creating new demo session...');
          
          // No valid saved session, create new one (with 10s timeout)
          const response = await axiosInstance.post('/game/demo-session', {}, { timeout: 10000 });
          
          console.log('[usePlayDemoGame] API response received:', response.data);

          if (response.data.success) {
            const { sessionId, gameState, initiatives } = response.data.data;
            console.log('[usePlayDemoGame] Session created:', sessionId);
            setSessionId(sessionId);
            setGameState(gameState);
            setInitiatives(initiatives || []);
            setIsDemoEnded(false);
            setDemoStats(null);
            
            // Save to localStorage
            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
              sessionId,
              gameState,
              initiatives: initiatives || [],
              isDemoEnded: false,
              demoStats: null
            }));
            console.log('[usePlayDemoGame] Session saved to localStorage');
          } else {
            throw new Error(response.data.message || 'Failed to create demo session');
          }
        } catch (err) {
          console.error('[usePlayDemoGame] Error creating demo session:', err);
          console.error('[usePlayDemoGame] Error details:', err.message, err.response?.data);
          setError(err.response?.data?.message || err.message || 'Failed to create demo session');
          throw err;
        } finally {
          console.log('[usePlayDemoGame] Setting loading to false');
          setLoading(false);
          // Reset flag after a delay to prevent immediate re-calls
          setTimeout(() => {
            globalIsCreatingSession = false;
          }, 1000);
        }
      })();

      try {
        await demoSessionLoadPromise;
      } finally {
        demoSessionLoadPromise = null;
      }
    };

    loadOrCreateDemoSession();
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (sessionId && gameState) {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
        sessionId,
        gameState,
        initiatives,
        isDemoEnded,
        demoStats
      }));
    }
  }, [sessionId, gameState, initiatives, isDemoEnded, demoStats]);

  // Check if demo limit reached
  useEffect(() => {
    if (gameState && gameState.decisionNumber >= MAX_DEMO_DECISIONS) {
      setIsDemoEnded(true);
      setDemoStats({
        totalDays: gameState.time || 0,
        decisionsMade: gameState.decisionNumber || 0,
        adopters: gameState.managers?.filter(m => m.adopted > 0).length || 0,
        totalManagers: gameState.managers?.length || 0
      });
    }
  }, [gameState]);

  // Submit decision
  const submitDecision = async (decisionData) => {
    if (!sessionId) return null;
    
    // Check if demo limit already reached
    if (gameState?.decisionNumber >= MAX_DEMO_DECISIONS) {
      setIsDemoEnded(true);
      return null;
    }

    try {
      const response = await axiosInstance.post(`/game/decision/${sessionId}`, decisionData);
      
      if (response.data.success) {
        setGameState(response.data.data);
        
        // Check if this was the last allowed decision
        if (response.data.data.decisionNumber >= MAX_DEMO_DECISIONS) {
          setIsDemoEnded(true);
          setDemoStats({
            totalDays: response.data.data.time || 0,
            decisionsMade: response.data.data.decisionNumber || 0,
            adopters: response.data.data.managers?.filter(m => m.adopted > 0).length || 0,
            totalManagers: response.data.data.managers?.length || 0
          });
        }
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit decision');
      }
    } catch (err) {
      console.error('Error submitting decision:', err);
      
      // Check if error is due to demo limit
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage?.toLowerCase().includes('demo limit') || 
          errorMessage?.toLowerCase().includes('limit reached')) {
        setIsDemoEnded(true);
        setDemoStats({
          totalDays: gameState?.time || 0,
          decisionsMade: gameState?.decisionNumber || 0,
          adopters: gameState?.managers?.filter(m => m.adopted > 0).length || 0,
          totalManagers: gameState?.managers?.length || 0
        });
      }
      
      throw err;
    }
  };

  // Fetch current game state from API
  const fetchGameState = useCallback(async (overrideSessionId) => {
    const id = overrideSessionId || sessionId;
    if (!id) return null;
    
    try {
      console.log('[usePlayDemoGame] Fetching game state for session:', id);
      const response = await axiosInstance.get(`/game/state/${id}`);
      const data = response.data.data;
      
      console.log('[usePlayDemoGame] Game state fetched:', data);
      setGameState(data);
      
      // Check if demo limit reached after fetching
      if (data.decisionNumber >= MAX_DEMO_DECISIONS) {
        setIsDemoEnded(true);
        setDemoStats({
          totalDays: data.time || 0,
          decisionsMade: data.decisionNumber || 0,
          adopters: data.managers?.filter(m => m.adopted > 0).length || 0,
          totalManagers: data.managers?.length || 0
        });
      }
      
      return data;
    } catch (error) {
      console.error('[usePlayDemoGame] Error fetching game state:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch game state');
      return null;
    }
  }, [sessionId]);

  // Restart demo - create new session (clears old one)
  const restartDemo = useCallback(async () => {
    // Clear old session from localStorage first
    localStorage.removeItem(DEMO_SESSION_KEY);
    
    setIsDemoEnded(false);
    setDemoStats(null);
    setSessionId(null);
    setGameState(null);
    setInitiatives([]);
    setError(null);
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/game/demo-session');
      
      if (response.data.success) {
        const { sessionId, gameState, initiatives } = response.data.data;
        setSessionId(sessionId);
        setGameState(gameState);
        setInitiatives(initiatives || []);
        
        // Save new session to localStorage
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          sessionId,
          gameState,
          initiatives: initiatives || [],
          isDemoEnded: false,
          demoStats: null
        }));
      } else {
        throw new Error(response.data.message || 'Failed to create demo session');
      }
    } catch (err) {
      console.error('Error restarting demo:', err);
      setError(err.response?.data?.message || err.message || 'Failed to restart demo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Quit demo - clears localStorage
  const quitDemo = useCallback(() => {
    localStorage.removeItem(DEMO_SESSION_KEY);
    // Reset speech flag when quitting demo
    localStorage.setItem('demoSpeechPlayed', 'false');
    // Reset demo message dismissal flag
    localStorage.removeItem('demoMessageDismissed');
    setSessionId(null);
    setGameState(null);
    setInitiatives([]);
    setIsDemoEnded(false);
    setDemoStats(null);
  }, []);

  return {
    sessionId,
    gameState,
    initiatives,
    loading,
    error,
    isDemoEnded,
    demoStats,
    MAX_DEMO_DECISIONS,
    submitDecision,
    restartDemo,
    quitDemo,
    fetchGameState,
    DEMO_SESSION_KEY
  };
}
