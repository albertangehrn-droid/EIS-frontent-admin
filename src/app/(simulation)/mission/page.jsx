"use client";

import { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameButton from '@/components/Buttons/GameButton';
import SimulationHeader from '@/components/common/SimulationHeader';
import SimulationFooter from '@/components/common/SimulationFooter';
import { useDevice } from '@/hooks/useDevice';
import { useSoundContext } from '@/contexts/SoundContext';
import { useSpeechContext } from '@/contexts/SpeechContext';
import { missionSections } from '@/data/missionData';
import { getMissionTextSection, missionTextSections } from '@/data/missionTextData';
import { cleanTextForSpeech } from '@/utils/textExtraction';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';

function MissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'playDemo';
  const [activeSection, setActiveSection] = useState('context');
  const showFooter = from === 'playDemo';
  const backDestination = from === 'starting' ? '/' : '/playDemo';
  const { playClickSound } = useSoundContext();
  const { speechEnabled } = useSpeechContext();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
const { gameState, MAX_DEMO_DECISIONS } = usePlayDemoGame();
  // Function to speak text on interaction (no chunking)
  const speakText = (text) => {
    if (!speechEnabled || !hasInteracted) return;
    
    console.log('Mission page speaking:', text.substring(0, 50) + '...');
    
    // Cancel any ongoing speech first
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
          console.log('Mission speech started');
          setIsSpeechPlaying(true);
        };
        utterance.onend = () => {
          console.log('Mission speech ended');
          setIsSpeechPlaying(false);
        };
        utterance.onerror = (e) => {
          console.log('Mission speech error:', e);
          setIsSpeechPlaying(false);
        };
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.log('Mission speech synthesis error:', error.message);
        setIsSpeechPlaying(false);
      }
    }
  };

  // Function to stop speech
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeechPlaying(false);
      console.log('Mission speech stopped');
    }
  };

  // Handle interaction - enable speech after first interaction
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      console.log('Mission page interaction detected - speech enabled');
    }
  };

  const currentSection = useMemo(
    () => missionSections.find((section) => section.id === activeSection) ?? missionSections[0],
    [activeSection],
  );
  //hello 

  return (
    <div className="h-screen flex flex-col bg-[#d9d9d9] overflow-hidden">
      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              label="EIS Simulation"
              onClick={() => { playClickSound(); handleInteraction(); router.push('/playDemo'); }}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            />
          </div>
        )}
        rightContent={(
          <div className="flex items-center gap-1 mt-3">
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="mission-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    label="BACK TO ACTION"
                    onClick={() => { playClickSound(); handleInteraction(); router.push(backDestination); }}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => { playClickSound(); handleInteraction(); window.print(); }}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px]"
              />
            </div>
          </div>
        )}
      />

      <main className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-6">
        <div className="h-full max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4 lg:gap-5">
          <section className="bg-[#e5e5e5] border border-[#bfbfbf] p-3 sm:p-4 h-full overflow-y-auto text-[#1b1b1b] leading-tight order-2 lg:order-1">
            <h1 
              className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-wide mb-3 sm:mb-4 text-[#242424] cursor-pointer hover:bg-[#d0d0d0] p-2 rounded transition-colors"
              onClick={() => {
                console.log('HEADING CLICKED - Starting debug...');
                handleInteraction();
                console.log('=== MISSION SPEECH DEBUG ===');
                console.log('Current section ID:', currentSection.id);
                console.log('Current section:', currentSection);
                
                // Test static text data import
                console.log('Testing getMissionTextSection function...');
                const textSection = getMissionTextSection(currentSection.id);
                console.log('Text section result:', textSection);
                
                if (textSection) {
                  console.log('SUCCESS: Text section found!');
                  console.log('Text section label:', textSection.label);
                  console.log('Text section text length:', textSection.text.length);
                  console.log('Text section preview:', textSection.text.substring(0, 100) + '...');
                  
                  const sectionText = `${textSection.label}. ${textSection.text}`;
                  const cleanText = cleanTextForSpeech(sectionText);
                  
                  console.log('Full section text length:', cleanText.length);
                  console.log('Full section preview:', cleanText.substring(0, 100) + '...');
                  
                  console.log('Calling speakText with:', cleanText.substring(0, 50) + '...');
                  speakText(cleanText);
                } else {
                  console.log('ERROR: No text section found for ID:', currentSection.id);
                  console.log('Available section IDs:', missionTextSections.map(s => s.id));
                  
                  // Fallback: just speak the label
                  console.log('Using fallback - speaking label only');
                  speakText(currentSection.label);
                }
                
                console.log('=== END DEBUG ===');
              }}
            >
              {currentSection.label.toUpperCase()}
            </h1>
            <div className="mission-content space-y-4 sm:space-y-5 text-[16px] sm:text-[18px] lg:text-[20px]">
              {currentSection.content}
            </div>
          </section>

          <aside className="flex flex-col justify-center gap-1.5 pb-3 w-full lg:w-[280px] justify-self-center lg:justify-self-end order-1 lg:order-2">
            <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {missionSections.map((section) => {
                const isActive = section.id === currentSection.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => { 
                      playClickSound(); 
                      handleInteraction();
                      
                      // Toggle speech: if same section and playing, stop; else speak
                      if (isSpeechPlaying && activeSection === section.id) {
                        console.log('STOPPING SPEECH - same section clicked');
                        stopSpeech();
                      } else {
                        setActiveSection(section.id);
                        
                        // Get full text content for speech
                        console.log('SECTION BUTTON CLICKED:', section.id);
                        const textSection = getMissionTextSection(section.id);
                        
                        if (textSection) {
                          const sectionText = `${textSection.label}. ${textSection.text}`;
                          const cleanText = cleanTextForSpeech(sectionText);
                          console.log('Speaking full section from button:', cleanText.substring(0, 50) + '...');
                          speakText(cleanText);
                        } else {
                          console.log('Fallback: speaking label only from button');
                          speakText(section.label);
                        }
                      }
                    }}
                    className={`relative shrink-0 text-center border border-white/70 py-2 px-3 sm:px-4 text-[14px] sm:text-[16px] lg:text-[18px] font-serif transition-colors whitespace-nowrap ${
                      isActive ? 'bg-[#070707] text-[#e6bb61]' : 'bg-black text-[#e6bb61] hover:bg-[#161616]'
                    }`}
                  >
                    {section.label}
                    {isActive ? (
                      <span className="hidden lg:block absolute -left-7 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[14px] border-y-transparent border-r-[28px] border-r-black" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 lg:mt-8 px-1 text-center text-[#141414] leading-tight hidden lg:block">
              <p className="text-[16px] lg:text-[18px]">
                Click on any paragraph to hear the text <strong className="text-black">read aloud</strong>.
              </p>
              <p className="text-[14px] lg:text-[16px] mt-1">
                on the small round button in the bottom right corner to <strong className="text-black">stop speech</strong> anytime.
              </p>
              <p className="text-[14px] lg:text-[16px] mt-5">Speech quality depends on your computer text-to-speech capabilities.</p>
              <p className="text-[14px] lg:text-[16px] mt-5">
                You can activate voice <strong className="text-black">(click to hear)</strong> on any long text field that you see on
                the different Simulation Screens.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {showFooter && <SimulationFooter
  timeLabel={`TIME (${gameState?.time || 0})`}
  usedDays={gameState?.time || 0}
  decisionInfo={`DECISION ${gameState?.decisionNumber || 0} / ${MAX_DEMO_DECISIONS}`}
/>}

      <style jsx>{`
        .mission-content p,
        .mission-content li {
          font-family: Arial, sans-serif;
          line-height: 1.3;
        }
        @media (min-width: 640px) {
          .mission-content p,
          .mission-content li {
            line-height: 1.25;
          }
        }
        .mission-content strong {
          color: #b1232b;
          font-weight: 800;
        }
        .mission-content ul,
        .mission-content ol {
          margin-left: 1.2rem;
          display: grid;
          gap: 0.4rem;
        }
        @media (min-width: 640px) {
          .mission-content ul,
          .mission-content ol {
            margin-left: 1.4rem;
            gap: 0.5rem;
          }
        }
        .mission-content li::marker {
          color: #8f1d22;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

export default function MissionPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#d9d9d9]">Loading...</div>}>
      <MissionContent />
    </Suspense>
  );
}
