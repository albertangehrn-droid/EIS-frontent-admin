"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GameButton from '@/components/Buttons/GameButton';

export default function SimulationFooter({ timeLabel = 'TIME (63)', showProgress = true, usedDays = 5, decisionInfo = null }) {
  const router = useRouter();
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const totalDays = 120;
  const blocksCount = 20;
  const daysPerBlock = totalDays / blocksCount;
  const progressPercentage = Math.round((usedDays / totalDays) * 100);

  return (
    <footer className="h-8 sm:h-9 bg-[#111] border-t-2 border-[#333] px-2 sm:px-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-1 sm:gap-3 flex-1">
        <GameButton label="YOUR STRATEGY" onClick={() => router.push('/yourstrategy')} variant="footer" size="sm" className="text-[9px] sm:text-xs" />
        <GameButton label="SCORE" onClick={() => router.push('/score')} variant="footer" size="sm" className="text-[9px] sm:text-xs" />
        <GameButton label="ACTIVITY LOG" onClick={() => router.push('/activitylog')} variant="footer" size="sm" className="text-[9px] sm:text-xs" />
        <span className="text-[#d4a017] text-[10px] sm:text-xs font-bold tracking-wide hidden sm:inline">{timeLabel}</span>
        
        {showProgress && (
          <div className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-4 flex-1">
            <div className="flex gap-[1px] sm:gap-[2px] w-full">
              {Array.from({ length: blocksCount }).map((_, index) => {
                const blockStart = index * daysPerBlock + 1;
                const blockEnd = (index + 1) * daysPerBlock;
                const isCompleted = blockEnd <= usedDays;
                const isPartial = blockStart <= usedDays && blockEnd > usedDays;
                const blockWidth = isPartial ? ((usedDays - blockStart + 1) / daysPerBlock) * 100 : (isCompleted ? 100 : 0);
                
                return (
                  <div
                    key={index}
                    className="relative group flex-1"
                    onMouseEnter={() => setHoveredBlock(index)}
                    onMouseLeave={() => setHoveredBlock(null)}
                  >
                    <div className="w-full h-[10px] sm:h-[13px] border border-[#555] bg-[#2a2a2a] overflow-hidden relative">
                      <div
                        className="h-full bg-[#dc2626] transition-all duration-300"
                        style={{ width: `${blockWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[7px] sm:text-[8px] text-white/70 font-medium">
                        {blockStart}-{blockEnd}
                      </div>
                    </div>
                    {hoveredBlock === index && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-[#1a1a1a] text-white text-[9px] sm:text-[10px] rounded whitespace-nowrap z-10 border border-[#555]">
                        Days {blockStart}-{blockEnd}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="text-[#d4a017] text-[9px] sm:text-xs font-bold tracking-wide whitespace-nowrap">
              {usedDays}/120
            </span>
            {decisionInfo && (
              <span className="text-[#d4a017] text-[9px] sm:text-xs font-bold tracking-wide whitespace-nowrap ml-2 sm:ml-4 border-l border-[#555] pl-2 sm:pl-4">
                {decisionInfo}
              </span>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
