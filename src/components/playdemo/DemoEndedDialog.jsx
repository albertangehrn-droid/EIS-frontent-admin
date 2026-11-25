"use client";

import { useSoundContext } from '@/contexts/SoundContext';

export default function DemoEndedDialog({ show, onClose }) {
  const { playClickSound } = useSoundContext();

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
      onClick={() => {
        playClickSound();
        onClose?.();
      }}
    >
      <div
        className="w-[90%] max-w-[450px] rounded-md overflow-hidden shadow-lg font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Empty Header Spacer */}
        <div className="bg-white h-[32px]" />

        {/* Content Section */}
        <div className="bg-[#9FB4CC] py-6 px-8 text-center text-black">
          <p className="text-sm font-bold leading-relaxed mb-6">
            You have now taken another 10 decisions! Please use
            the empty text box to provide a brief explanation of
            how this choice fits your current strategy. This will be
            helpful later on, when reviewing how successful your
            change strategy was. Thanks!
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => {
                playClickSound();
                onClose?.();
              }}
              className="px-8 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition text-sm font-bold"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
