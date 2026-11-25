import { useEffect, useRef, useState } from 'react';
import { useSpeechContext } from '@/contexts/SpeechContext';

/**
 * Reusable Speech Synthesis Hook
 * Automatically speaks text when dependencies change
 */
export function useSpeechSynthesis(text, options = {}) {
  const {
    autoSpeak = true,
    lang = 'en-US',
    rate = 0.95,
    pitch = 1,
    volume = 1,
    voiceName = null,
    delay = 0,
    enabled = true,
    onlyInPlayDemo = false
  } = options;

  const { speechEnabled, isPlayDemoRoute } = useSpeechContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    updateVoices();
    
    // Handle voices changed event
    speechSynthesis.onvoiceschanged = updateVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Speak function
  const speak = (textToSpeak) => {
    // Context-based control: only speak if enabled
    if (!speechEnabled || !enabled || !textToSpeak || typeof speechSynthesis === 'undefined') {
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set voice
    if (voiceName) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) utterance.voice = voice;
    }
    
    // Set speech properties
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;

    // Speak with delay
    if (delay > 0) {
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, delay);
    } else {
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-speak when text changes
  useEffect(() => {
    if (autoSpeak && text && speechEnabled) {
      speak(text);
    }
  }, [text, autoSpeak, enabled, speechEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop: () => speechSynthesis.cancel(),
    isSpeaking,
    voices,
    availableVoices: voices
  };
}

/**
 * Hook for manager-specific speech
 */
export function useManagerSpeech(selectedManager, options = {}) {
  const speechOptions = {
    autoSpeak: true,
    lang: 'en-US',
    rate: 0.9,
    delay: 500,
    ...options
  };

  // Create speech text from manager data
  const createSpeechText = (manager) => {
    if (!manager) return '';
    
    let text = `${manager.name}. `;
    
    if (manager.role) {
      text += `Role: ${manager.role}. `;
    }
    
    if (manager.phd) {
      text += 'They hold a PhD degree. ';
    }
    
    if (manager.description) {
      text += manager.description;
    }
    
    return text;
  };

  const speechText = createSpeechText(selectedManager);
  
  return useSpeechSynthesis(speechText, speechOptions);
}

/**
 * Hook for mission text speech
 */
export function useMissionSpeech(missionText, options = {}) {
  const speechOptions = {
    autoSpeak: true,
    lang: 'en-US',
    rate: 0.95,
    delay: 1000,
    voiceName: 'Samantha',
    ...options
  };

  return useSpeechSynthesis(missionText, speechOptions);
}

// Global force stop function
export function forceStopAllSpeech() {
  speechSynthesis.cancel();
  globalSpeechInstances.forEach(id => {
    // Force stop all tracked instances
  });
  globalSpeechInstances.clear();
}

export default useSpeechSynthesis;
