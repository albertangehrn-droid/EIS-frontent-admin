/**
 * Reusable speech utilities for game components
 * Handles API feedback text reading with interaction-based speech
 */

import { useSpeechContext } from '@/contexts/SpeechContext';
import { useState, useEffect } from 'react';

/**
 * Hook for game speech functionality
 * Provides interaction-based speech for API responses and feedback
 */
import { useSoundContext } from '@/contexts/SoundContext';

export const useGameSpeech = () => {
  const { speechEnabled } = useSpeechContext();
  const { speechVolume, lastSpokenText, setLastSpokenText } = useSoundContext();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);

  // Handle interaction - enable speech after first interaction
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      console.log('GameSpeech: interaction detected - speech enabled');
    }
  };

  // Clean text for speech (remove HTML tags, normalize whitespace)
  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<') // Replace HTML entities
      .replace(/&gt;/g, '>') // Replace HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  // Function to speak text on interaction (no chunking)
  const speakText = (text) => {
    const cleanText = cleanTextForSpeech(text);
    
    // Prevent restarting the exact same text if it's currently speaking
    if (
      cleanText === lastSpokenText &&
      typeof window !== 'undefined' &&
      window.speechSynthesis &&
      window.speechSynthesis.speaking
    ) {
      console.log('GameSpeech: Already speaking this text, ignoring click to prevent restart.');
      return;
    }

    setLastSpokenText(cleanText);
    console.log('GameSpeech speaking:', cleanText.substring(0, 50) + '...');
    
    // Cancel any ongoing speech first
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.volume = speechVolume !== undefined ? speechVolume : 1.0;
        utterance.onstart = () => {
          console.log('GameSpeech started');
          setIsSpeechPlaying(true);
        };
        utterance.onend = () => {
          console.log('GameSpeech ended');
          setIsSpeechPlaying(false);
        };
        utterance.onerror = (e) => {
          console.log('GameSpeech error:', e);
          setIsSpeechPlaying(false);
        };
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      } catch (error) {
        console.log('GameSpeech synthesis error:', error.message);
        setIsSpeechPlaying(false);
      }
    }
  };

  // Function to speak text without requiring interaction (for API responses)
  const speakTextAuto = (text) => {
    const cleanText = cleanTextForSpeech(text);

    // Prevent restarting the exact same text if it's currently speaking
    if (
      cleanText === lastSpokenText &&
      typeof window !== 'undefined' &&
      window.speechSynthesis &&
      window.speechSynthesis.speaking
    ) {
      console.log('GameSpeech: Already speaking this text, ignoring auto to prevent restart.');
      return;
    }

    setLastSpokenText(cleanText);
    console.log('GameSpeech AUTO speaking:', cleanText.substring(0, 50) + '...');
    
    // Cancel any ongoing speech first
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.volume = speechVolume !== undefined ? speechVolume : 1.0;
        utterance.onstart = () => {
          console.log('GameSpeech AUTO started');
          setIsSpeechPlaying(true);
        };
        utterance.onend = () => {
          console.log('GameSpeech AUTO ended');
          setIsSpeechPlaying(false);
        };
        utterance.onerror = (e) => {
          console.log('GameSpeech AUTO error:', e);
          setIsSpeechPlaying(false);
        };
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      } catch (error) {
        console.log('GameSpeech AUTO synthesis error:', error.message);
        setIsSpeechPlaying(false);
      }
    }
  };

  // Function to stop speech
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeechPlaying(false);
      console.log('GameSpeech stopped');
    }
  };

  // Function to speak feedback from API response
  const speakFeedback = (feedbackData, options = {}) => {
    if (!feedbackData) return;
    
    const { 
      includeTitle = true, 
      includeDecisionNumber = false,
      decisionNumber = null,
      customPrefix = null,
      auto = false // New parameter for automatic speech
    } = options;
    
    let textToSpeak = '';
    
    // Add custom prefix or title
    if (customPrefix) {
      textToSpeak += customPrefix + '. ';
    } else if (includeTitle) {
      textToSpeak += 'Feedback. ';
    }
    
    // Add decision number if requested
    if (includeDecisionNumber && decisionNumber) {
      textToSpeak += `Decision Number ${decisionNumber}. `;
    }
    
    // Add the main feedback content
    if (feedbackData.processedMessage) {
      textToSpeak += feedbackData.processedMessage;
    } else if (feedbackData.primary && feedbackData.primary.message) {
      // Handle primary feedback from API
      textToSpeak += feedbackData.primary.message;
      console.log('GameSpeech: Found primary.message:', feedbackData.primary.message);
    } else if (feedbackData.all && feedbackData.all.length > 0) {
      // Fallback to raw feedback data
      textToSpeak += feedbackData.all.join(' ');
      console.log('GameSpeech: Using feedback.all array:', feedbackData.all.length, 'items');
    } else if (typeof feedbackData === 'string') {
      textToSpeak += feedbackData;
      console.log('GameSpeech: Using string feedback:', feedbackData.substring(0, 50) + '...');
    } else {
      console.log('GameSpeech: No valid feedback data found:', feedbackData);
    }
    
    if (textToSpeak.trim()) {
      if (auto) {
        speakTextAuto(textToSpeak);
      } else {
        speakText(textToSpeak);
      }
    }
  };

  return {
    hasInteracted,
    isSpeechPlaying,
    handleInteraction,
    speakText,
    speakTextAuto,
    stopSpeech,
    speakFeedback,
    cleanTextForSpeech
  };
};

/**
 * Component wrapper for clickable speech elements
 * Makes any text clickable to speak it
 */
export const SpeechClickable = ({ 
  children, 
  text, 
  className = '', 
  onClick = null,
  speakOptions = {}
}) => {
  const { handleInteraction, speakFeedback, speakText } = useGameSpeech();
  
  const handleClick = () => {
    handleInteraction();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }
    
    // Speak the text
    if (text) {
      if (typeof text === 'object' && text.processedMessage) {
        // It's feedback data
        speakFeedback(text, speakOptions);
      } else {
        // It's plain text
        speakText(text);
      }
    }
  };
  
  return (
    <div 
      className={`cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Click to hear this text read aloud"
    >
      {children}
    </div>
  );
};

export default useGameSpeech;
