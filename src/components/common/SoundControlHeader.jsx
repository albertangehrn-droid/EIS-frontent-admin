"use client";

import { useSoundContext } from '@/contexts/SoundContext';
import { useGameSpeech } from '@/utils/gameSpeechUtils';

export default function SoundControlHeader() {
  const {
    decreaseVolume,
    increaseVolume
  } = useSoundContext();

  const { stopSpeech } = useGameSpeech();
  
  const stopCurrentSpeech = () => {
    stopSpeech();
  };

  return (
    <div className="flex flex-col gap-0.5 md:gap-1">
      {/* SPEECH CONTROLS */}
      {/* <div className="flex items-center gap-1 bg-black rounded-full p-0.5 border border-[#333]">
        <div 
          className="px-2 sm:px-3 py-0.5 sm:py-1 font-bold tracking-widest text-[10px] sm:text-xs lg:text-sm text-yellow-500 lowercase flex gap-1"
          style={{ textShadow: '1px 0 red, -1px 0 green' }}
        >
          <span>sound</span>
        </div>
        <button 
          onClick={decreaseVolume} 
          title="Decrease Volume"
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-full bg-black text-yellow-500 hover:bg-[#222] transition-colors font-bold border border-[#333] text-xs sm:text-sm lg:text-base leading-none pb-0.5"
        >
          -
        </button>
        <button 
          onClick={increaseVolume} 
          title="Increase Volume"
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-full bg-black text-yellow-500 hover:bg-[#222] transition-colors font-bold border border-[#333] text-xs sm:text-sm lg:text-base leading-none pb-0.5"
        >
          +
        </button>
        <button 
          onClick={stopCurrentSpeech} 
          title="Stop Speech"
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-full bg-black text-yellow-500 hover:bg-[#222] transition-colors font-bold border border-[#333] text-[10px] sm:text-xs lg:text-sm leading-none pb-0.5"
        >
          x
        </button>
      </div> */}
    </div>
  );
}