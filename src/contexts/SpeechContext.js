"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSoundContext } from './SoundContext';

const SpeechContext = createContext();

export function SpeechProvider({ children }) {
  const pathname = usePathname();
  const { speechEnabled } = useSoundContext();
  const [isPlayDemoRoute, setIsPlayDemoRoute] = useState(false);

  useEffect(() => {
    const inPlayDemo = pathname?.startsWith('/playDemo') || false;
    const inGame = pathname?.startsWith('/game') || false;
    setIsPlayDemoRoute(inPlayDemo);
    
    // Force stop speech when leaving speech routes or speech disabled
    if (!inPlayDemo && !inGame) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [pathname]);

  return (
    <SpeechContext.Provider value={{ speechEnabled, isPlayDemoRoute }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeechContext() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeechContext must be used within SpeechProvider');
  }
  return context;
}

export default SpeechProvider;
