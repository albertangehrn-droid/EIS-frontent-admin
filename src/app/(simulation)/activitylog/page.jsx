"use client";

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import GameButton from '@/components/Buttons/GameButton';
import SimulationHeader from '@/components/common/SimulationHeader';
import SimulationFooter from '@/components/common/SimulationFooter';
import IMAGES from '@/utils/imagePaths';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';
import { useSoundContext } from '@/contexts/SoundContext';

function ReportSection({ title, dayLabel, rows, adopters }) {
  return (
    <section className="bg-[#efefef]">
      {/* Header */}
      <div className="px-3 py-[6px] border-b border-black/40 bg-[#efefef]">
        <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.02em] text-black">
          <span>{title}</span>

          {dayLabel ? (
            <span className="font-normal text-black">
              ({dayLabel.toLowerCase()})
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2 text-[11px] sm:text-[12px] leading-[1.35] text-black whitespace-pre-wrap font-[Arial]">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={
              index !== rows.length - 1
                ? 'mb-[10px]'
                : 'mb-[6px]'
            }
          >
            <div>
              <span className="font-bold uppercase">
                {row.label}:
              </span>{' '}

              <span className="font-normal">
                {row.value || '—'}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-[4px]">
          <span className="font-bold uppercase">
            ADOPTERS:
          </span>{' '}

          <span>{adopters}</span>
        </div>
      </div>
    </section>
  );
}

export default function ActivityLogPage() {
  const router = useRouter();
  const sectionRefs = useRef({});
  const { gameState, loading } = usePlayDemoGame();
  const { playClickSound } = useSoundContext();

  // Transform game state history into activity log format
  const activityData = useMemo(() => {
    if (!gameState?.history) return [];

    return gameState.history.map((decision, index) => ({
      id: index,
      dec: `${decision.decisionNumber}`,
      time: `Day ${decision.decisionNumber}`,
      event: decision.initiativeId || 'Initiative',
      result: decision.targetManagers?.length > 0 ? 'Success' : 'Pending',
      sectionKey: `decision-${index}`
    }));
  }, [gameState]);

  // Transform game state history into report sections
  const reportData = useMemo(() => {
    if (!gameState?.history) return [];

    return gameState.history.map(
      (decision, index) => ({
        id: `decision-${index}`,

        title: `DECISION ${decision.decisionNumber}`,

        dayLabel: `day ${decision.decisionNumber}`,

        rows: [
          {
            label: 'TACTIC',

            value:
              decision.initiativeId ||
              'Not specified'
          },

          {
            label: 'RATIONALE',

            value:
              decision.rationale || '—'
          },

          {
            label: 'OUTCOME',

            value:
              decision.feedbackMessage ||
              'No feedback'
          }
        ],

        adopters: 0
      })
    );
  }, [gameState]);

  const [selectedRowIndex, setSelectedRowIndex] = useState(0);
  const selectedSectionKey = activityData[selectedRowIndex]?.sectionKey;

  const scrollToSection = (sectionKey) => {
    const el = sectionRefs.current?.[sectionKey];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };
  console.log('gameState-----------------------------------buwbibqdibdqb9b', gameState);

  const scrollToDate = (date) => {
    const el = document.getElementById(`date-${date}`);
    if (el) {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  const playClick = () => {
    // Click sound disabled
  };

  return (
    <div className="h-screen bg-[#d9d9d9] flex flex-col overflow-hidden">
      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              label="EIS Simulation"
              onClick={() => {
                playClick();
                router.push('/aboutDetail');
              }}
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
                id="activitylog-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                {/* SAVE SESSION REPORT */}
                <div style={{ gridColumnStart: 3 }} className="w-full flex justify-center">
                  <GameButton
                    label="SAVE SESSION REPORT"
                    onClick={() => window.print()}
                    variant="nav"
                    size="md"
                    className="px-4 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
                {/* BACK TO ACTION */}
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    label="BACK TO ACTION"
                    onClick={() =>
                      router.push('/playDemo')
                    }
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => window.print()}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px]"
              />
            </div>
          </div>
        )}
      />

      <main className="p-4 sm:p-5 flex-1 overflow-y-auto xl:overflow-hidden relative font-sans">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src={IMAGES.ALL.KEN}
            alt="Background watermark"
            fill
            className="object-cover grayscale opacity-[0.22]"
            priority
          />
        </div>

        <div className="w-full mx-auto relative z-10 h-full">
          {/* Title */}
          <div className="text-[26px] sm:text-[30px] leading-tight tracking-[0.02em] text-[#0e214f] mb-4 font-[Arial]">
            ACTIVITY LOG
          </div>

          {/* MAIN GRID */}
          <div className="relative grid grid-cols-1 xl:grid-cols-[430px_120px_minmax(0,1fr)] gap-4 xl:gap-4 items-start xl:h-[calc(100%-50px)] pb-6">

            {/* LEFT TABLE */}
            <section
              className="
                bg-[#f2f2f2]/95
                border
                border-[#8d8d8d]
                overflow-hidden
                shadow-sm

                h-[260px]
                sm:h-[320px]

                xl:h-[calc(100vh-220px)]
                xl:max-h-[calc(100vh-220px)]

                min-h-0
                flex
                flex-col
              "
            >
              {/* Header */}
              <div className="grid grid-cols-[55px_70px_1fr_55px] sm:grid-cols-[70px_75px_1fr_60px] gap-0 text-[11px] sm:text-[12px] leading-none font-bold text-black px-2 py-2 border-b border-black/30 bg-[#dfdfdf]">
                <div>Dec</div>

                <div>Time</div>

                <div>Event</div>

                <div className="text-right">
                  Result
                </div>
              </div>

              {/* Rows */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {activityData.map((row, index) => {
                  const isSelected =
                    index ===
                    selectedRowIndex;

                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => {
                        playClickSound();

                        setSelectedRowIndex(
                          index
                        );

                        requestAnimationFrame(
                          () =>
                            scrollToSection(
                              row.sectionKey
                            )
                        );
                      }}
                      className={[
                        'w-full text-left grid grid-cols-[55px_70px_1fr_55px] sm:grid-cols-[70px_75px_1fr_60px]',
                        'px-1.5 sm:px-2 py-[3px]',
                        'text-[11px] sm:text-[12px]',
                        'leading-[1.1]',
                        'font-[Arial]',
                        'border-b border-black/10',
                        'transition-colors duration-150',
                        isSelected
                          ? 'bg-black/10'
                          : 'hover:bg-black/5'
                      ].join(' ')}
                    >
                      <div className="whitespace-pre">
                        {row.dec}
                      </div>

                      <div className="whitespace-pre">
                        {row.time}
                      </div>

                      <div className="pr-0.5 truncate">
                        {row.event || (
                          <span className="text-black/50">
                            (start)
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {row.result}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer text */}
              <div className="block xl:hidden px-3 py-2 text-[11px] text-black/70 italic border-t border-black/20 bg-[#f4f4f4]">
                Click on any line to see more details
              </div>
            </section>

            {/* CENTER TEXT */}
            <div className="hidden xl:flex items-center justify-center h-[calc(100vh-260px)] text-center px-4 pointer-events-none">
              <div className="text-[14px] italic leading-[1.5] text-black/75 font-[Arial]">
                <>
                  Click on any line
                  <br />
                  to see more details
                </>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <section
              className="
                bg-[#efefef]/95
                border
                border-[#8d8d8d]
                overflow-hidden
                shadow-sm

                h-[300px]
                sm:h-[380px]

                xl:h-[calc(100vh-220px)]
                xl:max-h-[calc(100vh-220px)]

                min-h-0
                flex
                flex-col
              "
            >
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {reportData.map(
                  (section) => (
                    <div
                      key={section.id}
                      ref={(node) => {
                        if (node) {
                          sectionRefs.current[
                            section.id
                          ] = node;
                        }
                      }}
                      className={[
                        'border-b border-black/30',
                        'transition-all duration-200',
                        section.id ===
                          selectedSectionKey
                          ? 'bg-white/30'
                          : ''
                      ].join(' ')}
                    >
                      <ReportSection
                        title={
                          section.title
                        }
                        dayLabel={
                          section.dayLabel
                        }
                        rows={section.rows}
                        adopters={
                          section.adopters
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <SimulationFooter usedDays={gameState?.time || 0} />
    </div>
  );
}

