"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import IMAGES from "@/utils/imagePaths";

const AWARE_WIDTH = 2.5;
const INTEREST_WIDTH = 30.5;
const EXPERIMENT_WIDTH = 30.5;
const ADOPT_WIDTH = 3;

const TOTAL_SEGMENT_WIDTH = AWARE_WIDTH + INTEREST_WIDTH + EXPERIMENT_WIDTH + ADOPT_WIDTH;
const SEG_AWARE_PCT = (AWARE_WIDTH / TOTAL_SEGMENT_WIDTH) * 100;
const SEG_INTEREST_PCT = (INTEREST_WIDTH / TOTAL_SEGMENT_WIDTH) * 100;
const SEG_EXPERIMENT_PCT = (EXPERIMENT_WIDTH / TOTAL_SEGMENT_WIDTH) * 100;

const MANAGER_DISPLAY_ORDER = [1, 3, 2, 4, 8, 13, 19, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24];
const MANAGER_ORDERED_NAMES = [
  'Emma Stuart',
  'Bert Heinze',
  'Stefanie Durand',
  'Frank Raponi',
  'Martin Buerli',
  'Per Joos',
  'Randy Longhorn',
  'Jill Atherson',
  'Linda Pastorakis',
  'Adam deGroote',
  'Samuel Stein',
  'Roberta Fong',
  'Adrian Muster',
  'Pradeep Gupta',
  'John Peters',
  'Daniel Wang',
  'Wilma Grollmyer',
  'Luis Fernandez',
  'Jean Bardotte',
  'Thomas Kupik',
  'Fred Smithson',
  'Anna Belloni',
  'Ivan Tarowski',
  'Laszlo Por'
];

const sortManagersForDisplay = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    let indexA = -1;
    let indexB = -1;
    if (a.managerId != null) {
      indexA = MANAGER_DISPLAY_ORDER.indexOf(Number(a.managerId));
    }
    if (indexA === -1 && a.name) {
      const cleanA = a.name.toLowerCase().replace(/phd|\./g, '').trim();
      indexA = MANAGER_ORDERED_NAMES.findIndex(n => cleanA.includes(n.toLowerCase()));
    }

    if (b.managerId != null) {
      indexB = MANAGER_DISPLAY_ORDER.indexOf(Number(b.managerId));
    }
    if (indexB === -1 && b.name) {
      const cleanB = b.name.toLowerCase().replace(/phd|\./g, '').trim();
      indexB = MANAGER_ORDERED_NAMES.findIndex(n => cleanB.includes(n.toLowerCase()));
    }

    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
};

function StatusLabelBar() {
  return (
    <div className="relative h-[30px] leading-none w-full mb-1">
      <div
        className="absolute flex items-center justify-center text-[15px] h-[30px] font-semibold bg-[#D5DAF0] text-[#3155D8]"
        style={{ right: 'calc(100% - (2.5% + 9px))', width: '19%' }}
      >
        Aware
      </div>
      <div
        className="absolute flex items-center justify-center text-[15px] h-[30px] font-semibold bg-[#9CA8DB] text-white"
        style={{ left: 'calc(2.5% + 14px)', width: '30.5%' }}
      >
        Interested
      </div>
      <div
        className="absolute flex items-center justify-center text-[15px] h-[30px] font-semibold bg-[#3559CB] text-white"
        style={{ left: 'calc(33% + 19px)', width: '30.5%' }}
      >
        Experiment
      </div>
      <div
        className="absolute flex items-center justify-center h-[46px] text-[15px] font-semibold bg-[#C52331] text-white shrink-0 px-[8%] -mt-2"
        style={{
          left: 'calc(63.5% + 24px)',
          width: '24%',
          clipPath: 'polygon(0% 16.67%, 65% 16.67%, 65% 0%, 100% 50%, 65% 100%, 65% 83.33%, 0% 83.33%)',
        }}
      >
        <span>Adopter</span>
      </div>
    </div>
  );
}

export default function SnapshotModal({ sessionId, onClose }) {
  const [sessionData, setSessionData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [strategyText, setStrategyText] = useState("");
  const spacerWidth = 180;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, historyRes, gameStateRes] = await Promise.all([
          axiosInstance.get(`/admin/sessions/${sessionId}`),
          axiosInstance.get(`/game/history/${sessionId}`).catch(() => ({ data: { data: null } })),
          axiosInstance.get(`/game/state/${sessionId}`).catch(() => ({ data: { data: null } }))
        ]);
        
        let fetchedStrategyText = "";
        if (sessionRes.data?.success) {
          setSessionData(sessionRes.data.data);
          if (sessionRes.data.data.strategyText) {
            fetchedStrategyText = sessionRes.data.data.strategyText;
          }
        }
        if (historyRes.data?.success) {
          setHistoryData(historyRes.data.data);
        }
        if (gameStateRes.data?.success && gameStateRes.data.data?.strategyText) {
          fetchedStrategyText = gameStateRes.data.data.strategyText;
        }

//         const defaultStrategyText = `1. Find them, top down
// 2. Catch them and grab their attention
// 3. Help them realize how lucky they are
// 4. Persuade & celebrate

// Guiding Principle: Execute or Evacuate!`;

        const defaultStrategyText = ``;

        setStrategyText(fetchedStrategyText || defaultStrategyText);
      } catch (err) {
        console.error("Failed to load session snapshot", err);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  /* Chart points */
  const maxWeeks = 22;
  const chartHeight = 232;

  const toX = (week) => 42 + ((week - 1) / (maxWeeks - 1)) * 738;
  const scaleY = (value, maxValue) => 252 - (value / maxValue) * chartHeight;

  /* ── PAPs LINE (BLUE) ─── */
  const papPoints = historyData?.weeklyData?.length > 0
    ? [...historyData.weeklyData].sort((a, b) => a.weekNumber - b.weekNumber).flatMap(w => [
        [w.weekNumber + 1, scaleY(w.papsBefore ?? 0, 243)],
        [w.weekNumber + 2, scaleY(w.papsAfter ?? 0, 243)]
      ])
    : (sessionData?.gameState?.history || []).reduce((acc, decision, index) => {
        const lastPap = index === 0 ? 121 : (acc[index - 1]?.[1] ? 243 - ((acc[index - 1][1] - 252) / -chartHeight) * 243 : 121);
        const newPap = lastPap + (decision.scoreImpact || 0);
        acc.push([index + 1, scaleY(newPap, 243)]);
        return acc;
      }, []);

  /* ─── ADOPTERS LINE (RED) ─── */
  const adopterPoints = historyData?.weeklyData?.length > 0
    ? [...historyData.weeklyData].sort((a, b) => a.weekNumber - b.weekNumber).flatMap(w => [
        [w.weekNumber + 1, scaleY(w.adoptedCountBefore ?? 0, 22)],
        [w.weekNumber + 2, scaleY(w.adoptedCountAfter ?? 0, 22)]
      ])
    : (sessionData?.gameState?.history || []).reduce((acc, decision, index) => {
        const lastAdopter = index === 0 ? 0 : (acc[index - 1]?.[1] ? 22 - ((acc[index - 1][1] - 252) / -chartHeight) * 22 : 0);
        const newAdopter = lastAdopter + (decision.stageChanges?.adopted || 0);
        acc.push([index + 1, scaleY(newAdopter, 22)]);
        return acc;
      }, []);

  const papToPoints = papPoints.map(([w, y]) => `${toX(w)},${y}`).join(' ');
  const adopterToPoints = adopterPoints.map(([w, y]) => `${toX(w)},${y}`).join(' ');

  const ScoreCircle = ({ size = 160, fontSize = 52 }) => (
    <div
      className="rounded-full flex flex-col items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 40% 35%, #e8f0f8 0%, #c8daea 60%, #b0ccdf 100%)',
        border: '1px solid #a0b8cc',
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
      }}
    >
      <div style={{ fontSize, lineHeight: 1, color: '#b52020', fontWeight: 'bold' }}>
        {historyData ? (historyData.summary?.score ?? 0) : (sessionData?.gameState?.score ?? 0)}
      </div>
      <div style={{ fontSize: Math.max(8, fontSize * 0.2), fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '0.04em', textAlign: 'center', marginTop: 3 }}>
        OVERALL SCORE
      </div>
      <div style={{ fontSize: Math.max(7, fontSize * 0.18), color: '#444', marginTop: 2, textAlign: 'center' }}>
        (Days per Adopter)
      </div>
    </div>
  );

  const statsData = [
    { val: `${historyData ? (historyData.currentDay ?? 0) : (sessionData?.gameState?.time ?? 0)}`, label: 'DAYS', sub: 'TIME ELAPSED' },
    { val: `${historyData ? (historyData.summary?.adoptedCount ?? 0) : (sessionData?.gameState?.adoptedCount ?? sessionData?.gameState?.managers?.filter((m) => m?.adopted > 0).length ?? 0)}`, label: '# OF ADOPTERS', sub: '' },
    { val: `${historyData ? (historyData.currentDecisionNumber ?? 0) : (sessionData?.gameState?.decisionNumber ?? 0)}`, label: '# OF DECISIONS', sub: '' },
    { val: `${historyData ? (historyData.summary?.paps ?? 0) : (sessionData?.gameState?.paps ?? 0)}`, label: '# OF PAPs', sub: '' },
  ];

  const StatCard = ({ val, label, sub, bigNum = 26, labelSize = 9, subSize = 8 }) => (
    <div
      className="flex flex-col items-center justify-center py-2 px-1"
      style={{
        background: 'radial-gradient(circle at 40% 35%, #e8f0f8 0%, #c8daea 100%)',
        border: '1px solid #a0b8cc',
      }}
    >
      <div style={{ fontSize: bigNum, lineHeight: 1, color: '#b52020', fontWeight: 'bold' }}>{val}</div>
      <div style={{ fontSize: labelSize, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginTop: 2, letterSpacing: '0.04em' }}>{label}</div>
      {sub && <div style={{ fontSize: subSize, color: '#555', textAlign: 'center' }}>{sub}</div>}
    </div>
  );

  const ChartSVG = () => (
    <svg viewBox="0 0 820 280" className="w-full h-full" preserveAspectRatio="none" style={{ display: 'block' }}>
      <rect x="0" y="0" width="820" height="280" fill="#ffffff" />
      {Array.from({ length: 23 }).map((_, i) => {
        const val = 22 - i;
        const y = 20 + i * (232 / 22);
        return (
          <g key={`h-${i}`}>
            <line x1="42" y1={y} x2="780" y2={y} stroke="#888" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
            <text x="36" y={y + 3.5} fontSize="9" fill="#b52020" textAnchor="end" fontFamily="Tahoma,Arial,Helvetica,sans-serif">{val}</text>
          </g>
        );
      })}
      {[243, 231, 220, 209, 198, 187, 176, 165, 154, 143, 132, 121, 110, 99, 88, 77, 66, 55, 44, 33, 22, 11, 0].map((v, i) => {
        const y = 20 + i * (232 / 22);
        return (
          <text key={`r-${i}`} x="786" y={y + 3.5} fontSize="9" fill="#1d4ed8" fontFamily="Tahoma,Arial,Helvetica,sans-serif">{v}</text>
        );
      })}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 42 + (i / 21) * 738;
        return <line key={`v-${i}`} x1={x} y1="20" x2={x} y2="252" stroke="#888" strokeWidth="0.5" opacity="0.3" />;
      })}
      {papToPoints && <polyline fill="none" stroke="#1d4ed8" strokeWidth="2.2" points={papToPoints} />}
      {adopterToPoints && <polyline fill="none" stroke="#b52020" strokeWidth="2.5" points={adopterToPoints} />}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 42 + (i / 21) * 738;
        return <text key={`x-${i}`} x={x} y="265" fontSize="9" fill="#1a1a1a" textAnchor="middle" fontFamily="Tahoma,Arial,Helvetica,sans-serif">{i + 1}</text>;
      })}
      <text x="410" y="278" fontSize="9" fill="#555" textAnchor="middle" fontFamily="Tahoma,Arial,Helvetica,sans-serif">Weeks</text>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-neutral-100 border-b border-black/10 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-neutral-800">
              Session Snapshot {sessionData?.teamName ? `- ${sessionData.teamName}` : ''}
            </h2>
            {sessionData && (
              <p className="text-sm text-neutral-600 font-semibold mt-1">
                Score: <span className="text-red-600 font-bold">{sessionData.gameState?.score ?? 0}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-black font-bold text-xl px-2"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto bg-white flex-1 relative flex gap-6 items-start">
          {loading ? (
            <div className="py-20 text-center text-neutral-500 w-full">Loading snapshot...</div>
          ) : !sessionData || !sessionData.gameState?.managers ? (
            <div className="py-20 text-center text-neutral-500 w-full">No manager data available</div>
          ) : (
            <>

                {/* LEFT COLUMN: MANAGER LIST */}
                <div className="w-[620px] shrink-0 relative">
                  
                  {/* TOP STATUS BAR */}
                  <div className="flex mt-2 mb-0 shrink-0">
                    <div style={{ width: `${spacerWidth}px` }} className="shrink-0" />
                    <div className="flex-1">
                      <StatusLabelBar />
                    </div>
                  </div>

                  {/* MAIN CONTENT AREA */}
                  <div className="relative w-full h-auto">
                    {/* BACKGROUND COLUMNS */}
                    <div
                      className="absolute top-0 bottom-0 z-0 pointer-events-none"
                      style={{ left: `${spacerWidth}px`, right: '0px' }}
                    >
                      <div className="absolute top-0 bottom-0 shrink-0 bg-[#D5DAF0] border-r border-[#3157CD]/20" style={{ left: '9px', width: '2.5%' }} />
                      <div className="absolute top-0 bottom-0 shrink-0 bg-[#9CA8DB] border-r border-[#3157CD]/20" style={{ left: 'calc(2.5% + 14px)', width: '30.5%' }} />
                      <div className="absolute top-0 bottom-0 shrink-0 bg-[#3559CB]" style={{ left: 'calc(33% + 19px)', width: '30.5%' }} />
                      <div className="absolute top-0 bottom-0 shrink-0 bg-[#C52331]" style={{ left: 'calc(63.5% + 24px)', width: '3%' }} />
                    </div>

                    {/* MANAGERS LIST */}
                    <div className="relative z-10 w-full h-auto">
                      <div 
                        className="grid w-full h-auto"
                        style={{ gridTemplateColumns: '1.5fr', alignContent: 'center' }}
                      >
                        {sortManagersForDisplay(sessionData.gameState.managers).map((player, idx) => {
                          const isResigned = Boolean(
                            player.resigned ||
                            player.isResigned ||
                            player.active === false ||
                            (player.name && player.name.toLowerCase().includes('frank') && (sessionData.gameState?.flags?.frankResigned || sessionData.flags?.frankResigned))
                          );
                          const parts = (player.name || '').split(' ');
                          const first = parts[0] || '';
                          const last = parts.slice(1).join(' ');

                          const finalColor = player.color || '#000';
                          
                          const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
                          const finalImage = player.image ? `${BACKEND_URL}${player.image}` : null;
                          
                          const finalPhd = player.phd || false;
                          const hasInfoIndicator = player.profileAvailable === true || player.indicator === true;

                          const aware = isResigned ? 0 : (player.aware ?? 0);
                          const interest = isResigned ? 0 : (player.interest ?? 0);
                          const experiment = isResigned ? 0 : (player.experimentation ?? player.experiment ?? 0);
                          const adopted = isResigned ? 0 : (player.adopted ?? 0);
                          
                          const awarenessLimit = player.awarenessLimit ?? 1;
                          const interestLimit = player.interestLimit ?? 1;
                          const experimentationLimit = player.experimentationLimit ?? player.experimentLimit ?? 1;
                          const adoptionLimit = player.adoptionLimit ?? 1;

                          const rAware = isResigned ? 0 : Math.min(aware / awarenessLimit, 1);
                          const rInterest = isResigned ? 0 : Math.min(interest / interestLimit, 1);
                          const rExperiment = isResigned ? 0 : Math.min(experiment / experimentationLimit, 1);
                          const rAdopt = isResigned ? 0 : Math.min(adopted / adoptionLimit, 1);

                          return (
                            <div key={idx} className="flex items-center h-[22px] overflow-visible relative">
                              {isResigned && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    left: 0,
                                    right: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    borderTop: '2.2px dashed #111111',
                                    zIndex: 40,
                                    height: 0,
                                    pointerEvents: 'none',
                                  }}
                                  title="Frank Raponi has resigned"
                                />
                              )}
                              
                              {/* LABEL */}
                              <div className={`flex items-center shrink-0 pr-0 overflow-hidden ${isResigned ? 'opacity-60' : ''}`} style={{ width: `${spacerWidth}px` }}>
                                <div className="flex items-center cursor-pointer min-w-0">
                                  <div
                                    className="shrink-0 flex items-center justify-center text-[13px] font-extrabold italic leading-none text-[#7D4D50] mr-1.5"
                                    style={{ width: '10px', minWidth: '10px', visibility: hasInfoIndicator ? 'visible' : 'hidden' }}
                                    aria-hidden={!hasInfoIndicator}
                                  >
                                    {hasInfoIndicator ? 'i' : ''}
                                  </div>
                                  <div className="w-4 h-4 shrink-0 rounded-full overflow-hidden border border-[#8F8F8F] relative">
                                    {finalImage && (
                                      <Image src={finalImage} alt={player.name} fill className="object-cover" />
                                    )}
                                  </div>
                                </div>
                                <div className={`flex-1 min-w-0 flex items-baseline overflow-hidden whitespace-nowrap ${isResigned ? 'line-through' : ''}`} style={{ color: finalColor }}>
                                  <span className="text-[14px] leading-none">
                                    <span>{first.charAt(0)}</span>
                                    <span className="text-[12px]">{first.slice(1)}</span>
                                    &nbsp;
                                  </span>
                                  <span className="text-[13px] font-semibold leading-none">{last}</span>
                                  {finalPhd && <span className="text-[6px] text-[#666] italic ml-0.5">PhD</span>}
                                </div>
                              </div>

                              {/* PROGRESS BAR */}
                              <div className={`w-[53%] h-[16px] bg-white border-2 border-[#1F4FFF] rounded-full overflow-visible relative ${isResigned ? 'opacity-60' : ''}`}>
                                {/* Front line */}
                                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[20px] h-[2px] bg-[#1F4FFF] z-[20] pointer-events-none" />
                                
                                {/* Dividers */}
                                <div className="absolute left-[10%] top-0 bottom-0 w-0.5 bg-[#F4F6FF]" />
                                <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-[#F4F6FF]" />
                                <div className="absolute left-[90%] top-0 bottom-0 w-0.5 bg-[#F4F6FF]" />

                                {/* Fill Segments */}
                                <div className="absolute left-2 right-1.5 top-[2px] bottom-[2px] flex overflow-hidden">
                                  <div className="relative shrink-0 h-full" style={{ width: `${SEG_AWARE_PCT}%` }}>
                                    <div className="absolute left-0 top-0 bottom-0 bg-[rgb(197,35,49)]" style={{ width: `${rAware * 100}%` }} />
                                  </div>
                                  <div className="relative shrink-0 h-full" style={{ width: `${SEG_INTEREST_PCT}%` }}>
                                    <div className="absolute left-0 top-0 bottom-0 bg-[rgb(197,35,49)]" style={{ width: `${rInterest * 100}%` }} />
                                  </div>
                                  <div className="relative shrink-0 h-full" style={{ width: `${SEG_EXPERIMENT_PCT}%` }}>
                                    <div className="absolute left-0 top-0 bottom-0 bg-[rgb(197,35,49)]" style={{ width: `${rExperiment * 100}%` }} />
                                  </div>
                                  <div className="relative flex-1 h-full">
                                    <div className="absolute left-0 top-0 bottom-0 bg-[rgb(197,35,49)]" style={{ width: `${rAdopt * 100}%` }} />
                                  </div>
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM STATUS BAR */}
                  <div className="flex mt-2 mb-0 shrink-0">
                    <div style={{ width: `${spacerWidth}px` }} className="shrink-0" />
                    <div className="flex-1">
                      <StatusLabelBar />
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: SCOREBOARD, CHART & STRATEGY */}
                <div className="flex-1 flex flex-col gap-6 min-w-[500px]">
                  {/* SCOREBOARD AND CHART ROW */}
                  <div className="flex gap-4">
                  {/* Score column */}
                  <div className="flex flex-col items-center justify-start w-[170px] shrink-0 bg-white border border-gray-200 p-3 rounded-md">
                    <ScoreCircle size={130} fontSize={40} />
                    <div className="grid grid-cols-2 gap-1 mt-4 w-full">
                      {statsData.map((s, i) => <StatCard key={i} {...s} bigNum={20} labelSize={8} subSize={7} />)}
                    </div>
                  </div>

                  {/* Chart column */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1 px-1">
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: '#b52020', letterSpacing: '0.04em' }}>
                        ADOPTERS (22 max)
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 'bold', color: '#1d4ed8', letterSpacing: '0.04em' }}>
                        POSITIVE ATTITUDE POINTS – PAPs (243 max)
                      </span>
                    </div>
                    <div className="flex-1 border border-[#555] bg-white overflow-hidden min-h-[200px]">
                      <ChartSVG />
                    </div>
                  </div>
                </div>
                {/* END SCOREBOARD AND CHART ROW */}

                  {/* STRATEGY NOTEPAD UNDER SCOREBOARD AND CHART */}
                  <div className="border-t border-dashed border-gray-300 pt-4 w-full">
                    <div className="mb-2 text-[14px] leading-tight font-sans text-[#1a1a1a]">
                      <span>These are the Key Points of </span>
                      <strong>your Strategy:</strong>
                    </div>

                    <div className="relative border border-[#bcbcbc] bg-[#ececec] p-4 rounded shadow-sm overflow-hidden h-[260px]">
                      {/* Watermark Background */}
                      <div className="absolute inset-0 pointer-events-none opacity-[0.12] grayscale">
                        <Image
                          src={IMAGES.ALL.KEN}
                          alt="Background watermark"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>

                      <div 
                        className="relative z-10 w-full h-full overflow-y-auto text-[16px] sm:text-[18px] leading-[1.35] text-[#222] font-sans whitespace-pre-wrap outline-none"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent calc(1.35em - 2px), #757575 calc(1.35em - 2px), #757575 1.35em)',
                          backgroundAttachment: 'local',
                          backgroundOrigin: 'content-box',
                          backgroundPositionY: '1px',
                        }}
                      >
                        {strategyText}
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] leading-snug font-sans text-[#4e4e4e] select-none text-center">
                      Feel free to come back anytime to revise your Strategy on the basis of the new insights gained.
                    </div>
                  </div>
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
