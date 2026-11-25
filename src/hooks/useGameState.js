import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import useGameStore from '@/stores/useGameStore';

/**
 * Custom hook to fetch and manage game state
 * Reduces code duplication across game pages
 */
export default function useGameState() {
  const sessionId = useGameStore(state => state.sessionId);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameState = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/game/state/${sessionId}`);
        setGameState(response.data.data); 
      } catch (error) {
        console.error('Error fetching game state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameState();
  }, [sessionId]);

  return { gameState, loading, sessionId };
}
