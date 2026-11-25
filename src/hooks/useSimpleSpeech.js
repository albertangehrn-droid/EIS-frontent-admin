"use client";

import { useSoundContext } from '@/contexts/SoundContext';
import { useSpeechContext } from '@/contexts/SpeechContext';
import { useState, useRef, useEffect } from 'react';

export default function useSimpleSpeech() {
  const { speechEnabled, setSpeechEnabled } = useSoundContext();
  const { isPlayDemoRoute } = useSpeechContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasAutoSpoken = useRef(false);
  
  // Simple speech function
  const speak = (text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    // Check if speech is permanently disabled
    if (localStorage.getItem('speechPermanentlyDisabled') === 'true') {
      return;
    }

    if (!speechEnabled) {
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure for clear speech
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Handle events
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Speech started:', text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('🔊 Speech ended:', text);
    };

    utterance.onerror = (error) => {
      // Don't log errors for speech cancellation (this is expected behavior)
      if (error.error === 'interrupted' || error.error === 'canceled') {
        console.log('🔊 Speech interrupted/canceled - normal behavior');
      } else {
        console.error('🔊 Speech error:', error);
      }
      setIsSpeaking(false);
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  };

  // Auto-speech for demo session (only once)
  const useDemoAutoSpeech = (shouldSpeak = false) => {
    useEffect(() => {
      // Check if speech is permanently disabled
      if (localStorage.getItem('speechPermanentlyDisabled') === 'true') {
        return;
      }

      // Check if we should trigger auto-speech
      const shouldTrigger = shouldSpeak && 
                           isPlayDemoRoute && 
                           speechEnabled && 
                           !hasAutoSpoken.current &&
                           localStorage.getItem('triggerAutoSpeech') === 'true';

      if (shouldTrigger) {
        console.log('🔊 Starting demo auto-speech');
        
        // Clear the trigger
        localStorage.removeItem('triggerAutoSpeech');
        
        // Mark as spoken
        hasAutoSpoken.current = true;

        // Speak demo session text
        const demoText = `Welcome to EIS Simulation Demo. In this GAME SESSION you will be taking over as a Change Agent at FrontMedia. To succeed, you will need to develop a STRATEGY, manage your TIME wisely, collect information about managers, and change their attitudes. By launching appropriate INITIATIVES, you can make a real difference at FrontMedia. Your SCORE and ACTIVITY LOG will help you track your progress.`;
        
        speak(demoText);
      }
    }, [shouldSpeak, isPlayDemoRoute, speechEnabled]);
  };

  // Stop speech
  const stop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (error) {
        // Ignore errors during cancellation (this is expected behavior)
        console.log('🔊 Speech stop attempted - normal behavior');
        setIsSpeaking(false);
      }
    }
  };

  return {
    isSpeaking,
    speak,
    stop,
    useDemoAutoSpeech
  };
}
