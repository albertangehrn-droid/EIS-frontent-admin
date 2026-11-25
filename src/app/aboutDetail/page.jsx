"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import IMAGES from '@/utils/imagePaths';
import GameButton from '@/components/Buttons/GameButton';
import SimulationHeader from '@/components/common/SimulationHeader';

const AboutDetail = () => {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f5f2ee]">

      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              onClick={() => router.push('/')}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            >
              <span className="sm:hidden">EIS</span>
              <span className="hidden sm:inline">EIS Simulation</span>
            </GameButton>
          </div>
        )}
        rightContent={(
          <div className="flex items-center gap-1 mt-3">
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="about-detail-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    label="BACK TO ACTION"
                    onClick={handleBack}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => { window.print(); }}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px] opacity-50 cursor-not-allowed"
                disabled
              />
            </div>
          </div>
        )}
      />

      {/* Body Content */}
      {/* Body Content */}
      <div className="relative z-5 pt-[10px] sm:pt-[10px] md:pt-[20px] pb-8 sm:pb-12 md:pb-16 bg-[rgba(245,242,238,0.92)] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <p className="text-base sm:text-lg md:text-xl leading-[1.8] sm:leading-[1.9] md:leading-[2] text-[#2a2a2a]">
            The <strong>EIS Simulation</strong> is conceived as a key component
            of an intensive <strong>Learning Experience</strong> designed for
            groups of managers and decision makers interested in extending their understanding
            of the dynamics of <strong>Diffusion of AI Techniques</strong> in large organizations.
          </p>
          <p className="text-base sm:text-lg md:text-xl leading-loose text-[#2a2a2a] mt-6 sm:mt-8 md:mt-10">
            Any type of feedback, suggestions and ideas are welcome
          </p>
          <p className="text-sm sm:text-base md:text-lg italic text-[#444] mt-2 sm:mt-3">Albert A. Angehrn</p>
          <p className="text-sm sm:text-base md:text-lg italic text-[#444] mt-1">albert.angehrn@insead.edu</p>

          {/* Bottom Distribution Info */}
          <div className="mt-10 sm:mt-12 md:mt-16 pt-4 sm:pt-5 md:pt-6 border-t border-gray-300">
            <p className="text-sm sm:text-base font-bold italic text-[#1a1a1a]">
              This Simulation is still in limited distribution
            </p>
            <p className="text-sm sm:text-base text-[#1a1a1a] mt-2">
              For distribution/deployment information or other requests, email{' '}
              <strong>info@alpha-simulations.com</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Music Button */}
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 z-20">
        <button
          onClick={toggleMusic}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-black/80 rounded-full flex items-center justify-center hover:bg-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-[#d4a820]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isPlaying ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </button>
      </div>

      <audio ref={audioRef} loop>
        <source src={IMAGES.SOUNDS.WTELL} type="audio/wav" />
      </audio>
    </div>
  );
};

export default AboutDetail;