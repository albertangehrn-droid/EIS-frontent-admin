"use client";

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import IMAGES from '@/utils/imagePaths';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const pathname = usePathname();
  const audioRef = useRef(null);
  
  // Sound states
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [clickSoundsEnabled, setClickSoundsEnabled] = useState(true);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [lastSpokenText, setLastSpokenText] = useState(null);
  const [isInSoundRoute, setIsInSoundRoute] = useState(false);
  
  // Load saved preferences from localStorage and auto-enable for game routes
  useEffect(() => {
    const savedSpeechState = localStorage.getItem('speechEnabled');
    const savedClickState = localStorage.getItem('clickSoundsEnabled');
    
    // Default to enabled if no saved preference
    const speechState = savedSpeechState !== null ? savedSpeechState === 'true' : true;
    const clickState = savedClickState !== null ? savedClickState === 'true' : true;
    const savedVolume = localStorage.getItem('speechVolume');
    
    setSpeechEnabled(speechState);
    setClickSoundsEnabled(clickState);
    if (savedVolume !== null) {
      setSpeechVolume(parseFloat(savedVolume));
    }
  }, []);

  // Initialize audio ref
  useEffect(() => {
    audioRef.current = new Audio(IMAGES.SOUNDS.CLICK);
  }, []);
  
  // Check if we're in game or playDemo routes and auto-enable sounds only on specific conditions
  useEffect(() => {
    const inPlayDemo = pathname?.startsWith('/playDemo') || false;
    const inGame = pathname?.startsWith('/game') || false;
    const inSoundRoute = inPlayDemo || inGame;
    setIsInSoundRoute(inSoundRoute);
    
    // Enable sounds only on 3 specific conditions
    if (inSoundRoute) {
      const isFirstLogin = localStorage.getItem('firstGameLogin') === null;
      const isResumeAfterQuit = sessionStorage.getItem('resumedAfterQuit') === 'true';
      const isFirstDemo = localStorage.getItem('firstDemoSession') === null;
      
      // Condition 1: First time login to game
      if (inGame && isFirstLogin) {
        localStorage.setItem('firstGameLogin', 'false');
        localStorage.setItem('speechEnabled', 'true');
        localStorage.setItem('clickSoundsEnabled', 'true');
        setSpeechEnabled(true);
        setClickSoundsEnabled(true);
        
        // Don't set gameSpeechPlayed here - let the component handle it
      }
      // Condition 2: Resume after quit
      else if (isResumeAfterQuit) {
        sessionStorage.removeItem('resumedAfterQuit');
        localStorage.setItem('speechEnabled', 'true');
        localStorage.setItem('clickSoundsEnabled', 'true');
        setSpeechEnabled(true);
        setClickSoundsEnabled(true);
      }
      // Condition 3: First time demo session
      else if (inPlayDemo && isFirstDemo) {
        localStorage.setItem('firstDemoSession', 'false');
        localStorage.setItem('speechEnabled', 'true');
        localStorage.setItem('clickSoundsEnabled', 'true');
        setSpeechEnabled(true);
        setClickSoundsEnabled(true);
        
        // Don't set demoSpeechPlayed here - let the component handle it
      }
    }
    
    // Stop speech when leaving sound routes
    if (!inSoundRoute && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [pathname]);
  
  // Toggle functions
  const toggleSpeech = () => {
    const newState = !speechEnabled;
    setSpeechEnabled(newState);
    localStorage.setItem('speechEnabled', newState.toString());
    
    // Stop current speech if disabling
    if (!newState && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };
  
  const toggleClickSounds = () => {
    const newState = !clickSoundsEnabled;
    setClickSoundsEnabled(newState);
    localStorage.setItem('clickSoundsEnabled', newState.toString());
  };

  const handleVolumeChange = (newVol) => {
    localStorage.setItem('speechVolume', newVol.toString());
    
    // Restart current speech with new volume if something was playing
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking && lastSpokenText) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(lastSpokenText);
        utterance.volume = newVol;
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };

  const increaseVolume = () => {
    setSpeechVolume((prev) => {
      const newVol = parseFloat(Math.min(prev + 0.1, 1.0).toFixed(1));
      handleVolumeChange(newVol);
      return newVol;
    });
  };

  const decreaseVolume = () => {
    setSpeechVolume((prev) => {
      const newVol = parseFloat(Math.max(prev - 0.1, 0.0).toFixed(1));
      handleVolumeChange(newVol);
      return newVol;
    });
  };

  const stopCurrentSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

    
  // Global sound control functions
  const playClickSound = () => {
    if (clickSoundsEnabled && isInSoundRoute && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };
  
  const values = {
    speechEnabled,
    clickSoundsEnabled,
    speechVolume,
    isInSoundRoute,
    lastSpokenText,
    setLastSpokenText,
    toggleSpeech,
    toggleClickSounds,
    increaseVolume,
    decreaseVolume,
    stopCurrentSpeech,
    playClickSound,
  };
  
  return (
    <SoundContext.Provider value={values}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within SoundProvider');
  }
  return context;
}

export default SoundProvider;
