'use client';

import Image from 'next/image';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useSoundContext } from '@/contexts/SoundContext';


const AWARE_WIDTH = 2.5;
const INTEREST_WIDTH = 30.5;
const EXPERIMENT_WIDTH = 30.5;
const ADOPT_WIDTH = 3;

/**
 * STATUS LABEL BAR
 */
function StatusLabelBar({ content = {} }) {

  return (
    <div id="manager-list-top-status-bar" className="flex h-4 md:h-6 leading-none">

      {/* AWARE */}
      <div
        style={{
          width: '19%',
          marginLeft: '-26px',
          marginRight: '2px',
        }}
        className="
          relative
          flex
          items-center
          justify-center
          text-[15px]
          h-[30px]
          md:text-xs
          font-bold
          bg-[#D5DAF0]
          text-[#3155D8]
          overflow-visible
        "
      >
        {content.managerStatusAwareText || 'Aware'}
      </div>

      {/* INTEREST */}
      <div
        style={{
          width: '28%',
          marginLeft: '1px',
          marginRight: '1px',
        }}
        className="
          flex
          items-center
          justify-center
          text-[15px]
          h-[30px]
          md:text-[11px]
          font-bold
          bg-[#9CA8DB]
          text-white
        "
      >
        {content.managerStatusInterestText || 'Interested'}
      </div>

      {/* EXPERIMENT */}
      <div
        style={{
          width: '28%',
          marginLeft: '1px',
          marginRight: '2px',
        }}
        className="
          flex
          items-center
          justify-center
          text-[12px]
          h-[30px]
          md:text-[11px]
          font-bold
          bg-[#3559CB]
          text-white
        "
      >
        {content.managerStatusExperimentText || 'Experiment'}
      </div>

      {/* ADOPT */}
      <div
        style={{
          width: '19%',
          marginLeft: '2px',
          marginRight: '0px',
          clipPath:
            'polygon(0% 16.67%, 65% 16.67%, 65% 0%, 100% 50%, 65% 100%, 65% 83.33%, 0% 83.33%)',
        }}
        className="
          flex
          items-center
          justify-center
          h-[45px]
          text-[12px]
          md:text-[11px]
          font-bold
          bg-[#C52331]
          text-white
          shrink-0
          pr-[10%]
          -mt-2
        "
      >
        <span>
          {content.managerStatusAdoptText || 'Adopt'}
        </span>
      </div>

    </div>
  );
}

export default function ManagerListPlayDemo({
  managers,
  onSelectManager,
  onClickManager,
  onMouseLeave,
  showInitiativeMode = false,
  setShowInitiativeMode,
  setShowDecisionScreen,
  isAnimatingProgress = false,
  content = {},
}) {
  const { playClickSound } = useSoundContext();

  const [animatedManagers, setAnimatedManagers] = useState({});
  const [blinkToggle, setBlinkToggle] = useState(false);
  const blinkIntervalRef = useRef(null);
  const soundIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const managersRef = useRef(managers);

  useEffect(() => {
    managersRef.current = managers;
  }, [managers]);

  const calcPercent = (managerData, playerObj) => {
    const aLimit = playerObj?.awarenessLimit ?? 1;
    const iLimit = playerObj?.interestLimit ?? 1;
    const eLimit = playerObj?.experimentationLimit ?? playerObj?.experimentLimit ?? 1;
    const adLimit = playerObj?.adoptionLimit ?? 1;

    const aFill = ((managerData?.aware ?? 0) / aLimit) * AWARE_WIDTH;
    const iFill = ((managerData?.interest ?? 0) / iLimit) * INTEREST_WIDTH;
    const eFill = (((managerData?.experimentation ?? managerData?.experiment ?? 0) / eLimit) * EXPERIMENT_WIDTH);
    const adFill = ((managerData?.adopted ?? 0) / adLimit) * ADOPT_WIDTH;

    return Math.max(0, Math.min(aFill + iFill + eFill + adFill, 100));
  };

  useEffect(() => {
    const handleAnimation = async (e) => {
      const changes = e.detail;

      const updates = {};
      changes.forEach((item) => {
        const playerObj = managersRef.current?.find(m => m.managerId === item.managerId) || {};
        const oldPercent = calcPercent(item.oldManager, playerObj);
        const newPercent = calcPercent(item.newManager, playerObj);
        const diff = newPercent - oldPercent;

        if (diff > 0.1) {
          updates[item.managerId] = {
            oldPercent,
            increasePercent: diff
          };
        }
      });

      if (Object.keys(updates).length === 0) return;

      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setAnimatedManagers(updates);
      setBlinkToggle(true);

      blinkIntervalRef.current = setInterval(() => {
        setBlinkToggle(prev => !prev);
      }, 250);

      soundIntervalRef.current = setInterval(() => {
        playClickSound();
      }, 250);

      timeoutRef.current = setTimeout(() => {
        clearInterval(blinkIntervalRef.current);
        clearInterval(soundIntervalRef.current);
        setBlinkToggle(false);
        setAnimatedManagers({});
      }, 2000);
    };

    window.addEventListener('animate-manager-progress', handleAnimation);
    return () => {
      window.removeEventListener('animate-manager-progress', handleAnimation);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [playClickSound]);

  const mainRef = useRef(null);

  const [rowHeight, setRowHeight] = useState(15);

  /**
   * RESPONSIVE ROW HEIGHT
   */
  const recalculate = useCallback(() => {
    const el = mainRef.current;
    if (!el || !managers || !managers.length) return;
    if (window.innerWidth >= 1024) {
      let calcHeight = Math.floor(el.clientHeight / managers.length);
      if (calcHeight > 32) calcHeight = 32;
      setRowHeight(calcHeight);
    } else if (window.innerWidth >= 768) {
      setRowHeight(16);
    } else {
      setRowHeight(16);
    }
  }, [managers]);

  useEffect(() => {
    recalculate();
    const ro = new ResizeObserver(recalculate);
    if (mainRef.current) {
      ro.observe(mainRef.current);
    }
    return () => ro.disconnect();
  }, [recalculate]);

  // Determine dynamic widths based on screen size for proper alignment
  const [spacerWidth, setSpacerWidth] = useState(110);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setSpacerWidth(200);
      else if (window.innerWidth >= 1024) setSpacerWidth(180);
      else if (window.innerWidth >= 768) setSpacerWidth(160);
      else setSpacerWidth(140);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (

    <aside
      id="manager-list-aside"
      className={`
        w-full
        md:w-1/2
        lg:w-[40%]
        max-w-[620px]
        shrink-0
        flex-col
        self-start
        md:self-auto
        bg-[#fff]
        ${showInitiativeMode && !isAnimatingProgress ? 'hidden md:flex' : 'flex'}
      `}
      style={{ height: 'auto' }}
    >

      {/* TOP STATUS BAR */}
      <div className="shrink-0 flex mt-2 mb-0">
        <div style={{ width: `${spacerWidth}px` }} className="shrink-0" />
        <div className="flex-1 -ml-10">
          <StatusLabelBar content={content} />
        </div>
      </div>

      {/* MAIN */}
      <div
        ref={mainRef}
        className="relative"
        style={{
          flex: typeof window !== 'undefined' && window.innerWidth >= 768 ? '1 1 auto' : 'none',
          minHeight: 0,
        }}
      >

        {/* BACKGROUND PHASES - desktop only */}
        <div
          id="manager-list-bg-phases"
          className="
            absolute
            top-0
            bottom-0
            z-1
            pointer-events-none
            flex
            hidden md:flex
          "
          style={{
            left: `${spacerWidth}px`,
            right: '0px',
          }}
        >

          {/* AWARE */}
          <div
            style={{
              width: '2.5%',
              marginLeft: '9px',
            }}
            className="
              shrink-0
              bg-[#D5DAF0]
              border-r
              border-[#3157CD]/20
            "
          />

          {/* INTEREST */}
          <div
            style={{
              width: '30.5%',
              marginLeft: '5px',
            }}
            className="
              shrink-0
              bg-[#9CA8DB]
              border-r
              border-[#3157CD]/20
            "
          />

          {/* EXPERIMENT */}
          <div
            style={{
              width: '30.5%',
              marginLeft: '2px',
            }}
            className="
              shrink-0
              bg-[#3559CB]
            "
          />

          {/* ADOPT */}
          <div
            style={{
              width: '3%',
              marginLeft: '5px',
            }}
            className="
              shrink-0
              bg-[#C52331]
            "
          />

        </div>

        {/* ROWS */}
        <div
          id="manager-list-rows-wrapper"
          className="
            relative
            z-2
            w-full
            h-auto
            md:h-full
          "
          onMouseLeave={() => onMouseLeave?.()}
        >

          <div
            className="grid w-full h-auto md:h-full md:gap-y-0 lg:gap-y-0"
            style={{
              gridTemplateColumns: '1.5fr',
              gridAutoRows: `${rowHeight}px`,
              alignContent: 'center',
            }}
          >

            {managers.map((player, idx) => {

              const parts = player.name.split(' ');
              const first = parts[0];
              const last = parts.slice(1).join(' ');

              const aware = player.aware ?? 0;
              const interest = player.interest ?? 0;
              const experiment = player.experimentation ?? player.experiment ?? 0;
              const adopted = player.adopted ?? 0;

              const awarenessLimit = player.awarenessLimit ?? 1;
              const interestLimit = player.interestLimit ?? 1;
              const experimentationLimit = player.experimentationLimit ?? player.experimentLimit ?? 1;
              const adoptionLimit = player.adoptionLimit ?? 1;

              const awareFill = (aware / awarenessLimit) * AWARE_WIDTH;
              const interestFill = (interest / interestLimit) * INTEREST_WIDTH;
              const experimentFill = (experiment / experimentationLimit) * EXPERIMENT_WIDTH;
              const adoptFill = (adopted / adoptionLimit) * ADOPT_WIDTH;

              let progress = awareFill + interestFill + experimentFill + adoptFill;
              progress = Math.max(0, Math.min(progress, 100));

              return (

                <div
                  key={idx}
                  id={`manager-list-row-${player.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="
                    flex
                    items-center
                    overflow-hidden
                  "
                >

                  {/* MANAGER LABEL CONTAINER */}
                  <div
                    id={`manager-label-container-${player.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center shrink-0 overflow-hidden pr-0"
                    style={{ width: `${spacerWidth}px` }}
                  >

                    {/* PROFILE HOVER WRAPPER (INFO + AVATAR) */}
                    <div 
                      className="flex items-center cursor-pointer"
                        onMouseEnter={() => onSelectManager?.(player)}
                      >
                      {/* INFO */}
                      <div
                        id={`manager-info-indicator-${player.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="w-1.5 shrink-0 text-[13px] text-[#7D4D50] text-center italic ml-0.5 mr-0.5"
                      >
                        {player.indicator ? 'i' : ''}
                      </div>

                      {/* AVATAR */}
                      <div
                        id={`manager-avatar-${player.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="w-3.5 h-3.5 shrink-0 rounded-full overflow-hidden border border-[#8F8F8F] mr-1.5 relative"
                      >
                        <Image
                          src={player.image}
                          alt={player.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* NAME */}
                    <div
                      id={`manager-name-${player.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="
                        flex-1
                        flex
                        items-baseline
                        overflow-hidden
                        whitespace-nowrap
                        cursor-pointer
                      "
                      style={{ color: player.color }}
                      
                      onClick={() => {
                        playClickSound?.();
                        onClickManager?.(player);
                      }}
                    >
                      <span className="text-[18px] leading-none hover:underline">
                        <span className="text-[20px] font-bold leading-none">
                          {first.charAt(0)}
                        </span>
                        <span className="text-[15px] leading-none">
                          {first.slice(1)}
                        </span>
                        &nbsp;
                      </span>

                      <span
                        className="
                          text-[18px]
                          font-extrabold
                          leading-none
                          hover:underline
                        "
                      >
                        {last}
                      </span>

                      {player.phd && (
                        <span
                          className="
                            text-[7px]
                            text-[#666]
                            italic
                            ml-0.5
                          "
                        >
                          PhD
                        </span>
                      )}
                    </div>

                  </div>

                  {/* PROGRESS BAR */}
                  <div
                    id={`manager-progress-bar-${player.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="
                      w-[50%]
                      mr-0
                      bg-[#F8F8FB]
                      border-2
                      border-[#1F4FFF]
                      rounded-full
                      overflow-hidden
                      relative
                    "
                    style={{
                      height: typeof window !== 'undefined' && window.innerWidth >= 1700 ? '24px' : '20px',
                    }}
                  >

                    {/* DIVIDER 10% */}
                    <div
                      className="
                        absolute
                        left-[10%]
                        top-0
                        bottom-0
                        w-0.5
                        bg-[#F4F6FF]
                      "
                    />

                    {/* DIVIDER 50% */}
                    <div
                      className="
                        absolute
                        left-[50%]
                        top-0
                        bottom-0
                        w-0.5
                        bg-[#F4F6FF]
                      "
                    />

                    {/* DIVIDER 90% */}
                    <div
                      className="
                        absolute
                        left-[90%]
                        top-0
                        bottom-0
                        w-0.5
                        bg-[#F4F6FF]
                      "
                    />

                    {/* PROGRESS FILL */}
                    <div
                      id="manager-progress-fill"
                      className="
                        absolute
                        left-2
                        top-[2px]
                        bottom-[2px]
                        bg-[#C52331]
                        transition-all
                        duration-500
                      "
                      style={{ width: `${progress}%` }}
                    />

                    {/* HIDE/UNHIDE MASK FOR BLINK EFFECT */}
                    {animatedManagers[player.managerId] && blinkToggle && (
                      <div
                        className="
                          absolute
                          top-0
                          bottom-0
                          bg-[#F8F8FB]
                          z-10
                        "
                        style={{
                          left: `${animatedManagers[player.managerId].oldPercent}%`,
                          width: `calc(${animatedManagers[player.managerId].increasePercent}% + 2px)`,
                        }}
                      />
                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>

      {/* BOTTOM STATUS BAR */}
      <div className="shrink-0 flex mt-0 mb-3">
        <div style={{ width: `${spacerWidth}px` }} className="shrink-0" />
        <div className="flex-1 -ml-10">
          <StatusLabelBar content={content} />
        </div>
      </div>

      {/* FLOATING INITIATIVES LIST TOGGLE BUTTON */}
      {!showInitiativeMode && (
        <button
          onClick={() => {
            playClickSound?.();
            setShowInitiativeMode?.(true);
            setShowDecisionScreen?.(false);
          }}
          className="fixed bottom-12 right-4 md:hidden z-50 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#3157CD] text-white font-bold text-xs shadow-lg active:scale-95 transition-transform"
        >
          <span>Initiatives List</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      )}

    </aside>

  );
}






