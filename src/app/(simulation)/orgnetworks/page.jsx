"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GameButton from '@/components/Buttons/GameButton';
import SimulationHeader from '@/components/common/SimulationHeader';
import SimulationFooter from '@/components/common/SimulationFooter';
import { useDevice } from '@/hooks/useDevice';

import { IMAGES } from '@/utils/imagePaths';
import { useSoundContext } from '@/contexts/SoundContext';
import CoffeeGroups from '@/components/orgnetwork/CoffeeGroups';
import ExternalLinks from '@/components/orgnetwork/ExternalLinks';
import TeamsTaskforces from '@/components/orgnetwork/TeamsTaskforces';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';
// ─────────────────────────────────────────────────────────────────────────────
// Network definitions
// ─────────────────────────────────────────────────────────────────────────────
const NETWORKS = [
  {
    key: 'network2',
    label: 'Coffee Groups',
    image: IMAGES.ALL.UZZI.NET1,
    mapImage: IMAGES.ALL.ORG_CHART,
    clickable: true,
    color: '#b8860b',
  },
  {
    key: 'network3',
    label: 'External Links',
    image: IMAGES.ALL.UZZI.NET2,
    mapImage: IMAGES.ALL.ORG_CHART,
    clickable: true,
    color: '#c0392b',
  },
  {
    key: 'network1',
    label: 'Teams / Taskforces',
    image: IMAGES.ALL.UZZI.NET3,
    mapImage: IMAGES.ALL.ORG_CHART,
    clickable: true,
    color: '#2c6e8a',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Color-coded group legend — shown only in External Links view
// ─────────────────────────────────────────────────────────────────────────────
const GROUP_LEGENDS = [
  {
    bgColor: '#f5d020',
    textColor: '#4a3500',
    people: [
      'Emma Stuart (CEO)',
      'Per Joos (CTO)',
      'Adam deGroote (Facilities)',
      'Anna Belloni (Marketing & Comm)',
    ],
  },
  {
    bgColor: '#4a7fc1',
    textColor: '#ffffff',
    people: [
      'Frank Raponi (CHRO)',
      'Luis Fernandez (Fixed Products)',
      'Fred Smithson (Regulatory Office)',
      'Ivan Tarowski (Intl. Roaming)',
    ],
  },
  {
    bgColor: '#5cb85c',
    textColor: '#ffffff',
    people: [
      'Adam deGroote (Facilities)',
      'Adrian Muster (Legal Office)',
      'Daniel Wang (Mobile Products)',
      'Thomas Kupik (Consumer Sales)',
    ],
  },
  {
    bgColor: '#e8706a',
    textColor: '#ffffff',
    people: [
      'Martin Buerli (CFO)',
      'Wilma Grollmyer (Procurement)',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function OrgNetworksPage() {
  const router = useRouter();
  const device = useDevice();
  const { playClickSound } = useSoundContext();

  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState('network3');
  const [imgError, setImgError] = useState(false);
  const { gameState, MAX_DEMO_DECISIONS } = usePlayDemoGame();
  const history = gameState?.history || [];

  // ✅ Unlock conditions
  const hasCoffeeGroups = history.some(item => item?.initiativeId === 'coffee');
  const hasTeamsTaskforce = history.some(item => item?.initiativeId === 'get_teams');

  const isCoffeeGroups = selectedKey === 'network2';
  const isExternalLinks = selectedKey === 'network3';
  const isTeamsTaskforces = selectedKey === 'network1';

  const activeNet = NETWORKS.find((n) => n.key === selectedKey) ?? null;

  const handleClick = (net) => {
    if (net.key === 'network3') {
      playClickSound();
      setImgError(false);
      setSelectedKey(net.key);
      return;
    }
    if (net.key === 'network2' && !hasCoffeeGroups) return;
    if (net.key === 'network1' && !hasTeamsTaskforce) return;
    playClickSound();
    setImgError(false);
    setSelectedKey(net.key);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile / Tablet view
  // ─────────────────────────────────────────────────────────────────────────
  if (device === 'mobile' || device === 'tablet') {
    return (
      <div className="h-screen bg-[#f4f4f2] flex flex-col overflow-hidden">
        {/* Header */}
        <SimulationHeader
          leftContent={(
            <GameButton
              onClick={() => { playClickSound(); router.push('/playDemo'); }}
              variant="default"
              size="lg"
              className="py-2! px-2! sm:px-6! text-sm! sm:text-xl! min-w-[80px] sm:min-w-[260px]"
            >
              <span className="sm:hidden">EIS</span>
              <span className="hidden sm:inline">EIS Simulation</span>
            </GameButton>
          )}
          rightContent={(
            <div className="flex gap-2 sm:gap-3 items-center">
              <GameButton
                label="ORG CHART"
                onClick={() => { playClickSound(); router.push('/orgchart'); }}
                variant="nav"
                size="md"
                className="py-2! px-2! sm:px-4! text-xs! sm:text-sm! min-w-[80px] sm:min-w-[140px]"
              />
              <GameButton
                onClick={() => { playClickSound(); router.push('/playDemo'); }}
                variant="nav"
                size="md"
                className="py-2! px-2! sm:px-4! text-xs! sm:text-sm! min-w-[50px] sm:min-w-[160px]"
              >
                <span className="sm:hidden">BACK</span>
                <span className="hidden sm:inline">BACK TO PLAY</span>
              </GameButton>
            </div>
          )}
        />

        {/* Mobile/Tablet Network Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Network selector */}
          <div className="shrink-0 bg-white border-b border-gray-300 px-2 py-3">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {NETWORKS.map((net) => {
                const isLocked =
                  (net.key === 'network2' && !hasCoffeeGroups) ||
                  (net.key === 'network1' && !hasTeamsTaskforce);
                const isSelected = selectedKey === net.key;
                return (
                  <button
                    key={net.key}
                    onClick={() => {
                      if (!isLocked && net.clickable) handleClick(net);
                    }}
                    disabled={!net.clickable || isLocked}
                    className={`flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[100px] p-2 rounded-lg transition-all ${isSelected ? '' : 'hover:bg-gray-50'
                      } ${!net.clickable ? 'opacity-50 cursor-not-allowed' : isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0"
                      style={{
                        boxShadow: isSelected && net.clickable
                          ? `0 0 0 3px ${net.color}`
                          : '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Image src={net.image} alt={net.label} fill className="object-cover" />
                    </div>
                    <span
                      className="text-[10px] sm:text-xs font-bold text-center leading-tight"
                      style={{ color: isSelected && net.clickable ? net.color : '#555' }}
                    >
                      {net.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto bg-white">
            {activeNet ? (
              <div className="flex flex-col h-full overflow-hidden">

                {/* Coffee Groups UI */}
                {isCoffeeGroups && (
                  <div className="h-full bg-white overflow-hidden flex flex-col min-h-0">
                    <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
                      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-[clamp(14rem,18vw,20rem)_1fr] gap-[clamp(1rem,2vw,3rem)] px-[clamp(1rem,2vw,2.5rem)] py-[clamp(0.8rem,1.5vh,1.5rem)]">
                        <div className="grid auto-rows-max gap-[clamp(0.2rem,0.6vh,0.7rem)] self-start">
                          {GROUP_LEGENDS.map((group, i) => (
                            <div key={i} className="border border-black/20 px-[0.8vw] py-[0.7vw]" style={{ background: group.bgColor }}>
                              {group.people.map((person, pi) => (
                                <p key={pi} className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold" style={{ color: group.textColor }}>
                                  {person}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="min-w-0 grid grid-rows-[1fr_auto] gap-[1vh]">
                          <div className="grid grid-cols-[clamp(10rem,16vw,18rem)_1fr] items-start gap-[clamp(1rem,2vw,3rem)]">
                            <div className="self-start pt-[1vh]">
                              <h1 className="text-[clamp(2.4rem,5vw,5rem)] leading-[0.95] font-semibold tracking-tight text-black">
                                Coffee<br />Groups
                              </h1>
                            </div>
                            <div className="grid place-items-start-center min-w-0">
                              <Image src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART} alt="Coffee Groups network" width={1400} height={1000} priority onError={(e) => { e.currentTarget.style.display = "none"; }} className="object-contain w-auto h-auto max-w-full max-h-[68vh] min-w-[24rem]" />
                            </div>
                          </div>
                          <div className="pt-[1vh] pb-[1.5vh]">
                            <p className="text-[clamp(0.72rem,0.82vw,1rem)] leading-[1.55] text-black max-w-[60rem]">
                              You have observed over the last few days that there are <strong>8 groups of managers</strong><br />
                              who get together regularly for coffee, lunch, or informal meetings online.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* External Links UI */}
                {isExternalLinks && (
                  <div className="h-full overflow-y-auto bg-[#f7f7f5]">
                    <div className="px-6 lg:px-10 pt-6 pb-3">
                      <h1 className="text-3xl xl:text-5xl font-semibold tracking-tight text-black">External Links</h1>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 xl:gap-10 px-6 lg:px-10 items-start">
                      <div className="flex flex-col gap-3 w-full max-w-[320px]">
                        {GROUP_LEGENDS.map((group, i) => (
                          <div key={i} className="border border-black/15 shadow-sm px-3 py-2" style={{ background: group.bgColor }}>
                            {group.people.map((person, pi) => (
                              <p key={pi} className="text-[11px] xl:text-[12px] font-semibold leading-[1.45]" style={{ color: group.textColor }}>{person}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center xl:justify-start items-start w-full overflow-hidden">
                        <div className="relative w-full max-w-[850px]">
                          <Image src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART} alt="External Links network" width={900} height={650} priority onError={(e) => { e.currentTarget.style.display = "none"; }} className="w-full h-auto object-contain" />
                        </div>
                      </div>
                    </div>
                    <div className="px-6 lg:px-10 pt-6 pb-6">
                      <p className="text-[12px] xl:text-[13px] leading-[1.8] text-[#222] max-w-[950px]">
                        You have observed over the past days that certain individuals belong to the same social groups as they tend to share <strong>Political Views</strong> (yellow and blue), meet regularly at the <strong>Tennis Club</strong> (green), or are involved in the same <strong>Charity</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Teams / Taskforces UI */}
                {isTeamsTaskforces && (
                  <div className="h-full bg-white overflow-hidden flex flex-col min-h-0">
                    <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
                      <div className="w-full max-w-[1600px] mx-auto grid grid-rows-[auto_1fr_auto] px-[clamp(1rem,2vw,2rem)] py-[clamp(0.8rem,1.2vh,1.2rem)] gap-[1vh]">
                        <div>
                          <h1 className="text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] font-semibold tracking-tight text-black">Teams/Taskforces</h1>
                        </div>
                        <div className="grid grid-cols-[minmax(14rem,20vw)_1fr] gap-[clamp(1rem,2vw,2.5rem)] items-start">
                          <div className="grid auto-rows-max gap-[clamp(0.5rem,0.8vh,0.9rem)] self-start">
                            <div className="bg-[#F59787] border border-black/20 px-[0.8vw] py-[0.65vw]">
                              <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.28] font-semibold">
                                John Peters (Internet Products)<br />
                                Daniel Wang (Mobile Products)<br />
                                Luis Fernandez (Fixed Products)<br />
                                Thomas Kupik (Consumer Sales)<br />
                                Laszlo Por (Corporate Sales)<br />
                                Ivan Tarowski (Intl. Roaming)
                              </p>
                            </div>
                            <div className="bg-[#CAD8EC] p-3">
                              <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.28] font-semibold">
                                Bert Heinze (Ext. Fin. Controller)<br />
                                Martin Buerli (CFO)<br />
                                Per Joos (CTO)<br />
                                Samuel Stein (Treasury)<br />
                                Adrian Muster (Legal Office)<br />
                                Wilma Grollmyer (Procurement)
                              </p>
                            </div>
                            <div className="bg-[#FFFF00] p-3">
                              <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.28] font-semibold">
                                Emma Stuart (CEO)<br />
                                Martin Buerli (CFO)<br />
                                Per Joos (CTO)<br />
                                Randy Longhorn (CCO)<br />
                                Frank Raponi (CHRO)
                              </p>
                            </div>
                          </div>
                          <div className="min-w-0 grid place-items-start">
                            <Image src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART} alt="Teams Taskforces network" width={1800} height={1400} priority onError={(e) => { e.currentTarget.style.display = "none"; }} className="object-contain w-full h-auto max-w-[clamp(42rem,58vw,72rem)] max-h-[68vh]" />
                          </div>
                        </div>
                        <div className="pb-[1vh]">
                          <p className="text-[clamp(0.72rem,0.82vw,1rem)] leading-[1.55] text-[#222] max-w-[85ch]">
                            Formal task forces have been established to drive strategic initiatives. These teams bring together cross-functional expertise and leadership.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select a network to view details</p>
              </div>
            )}
          </div>
        </div>
        {/* ✅ Footer is INSIDE the outer wrapper div */}
        <SimulationFooter
          timeLabel={`TIME (${gameState?.time || 0})`}
          usedDays={gameState?.time || 0}
          decisionInfo={`DECISION ${gameState?.decisionNumber || 0} / ${MAX_DEMO_DECISIONS}`}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Desktop view
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton
              label="EIS Simulation"
              onClick={() => { playClickSound(); router.push('/aboutDetail'); }}
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
                id="orgnetworks-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                {/* ORG CHART */}
                <div style={{ gridColumnStart: 2 }} className="w-full flex justify-center">
                  <GameButton
                    label="ORG CHART"
                    onClick={() => { playClickSound(); router.push('/orgchart'); }}
                    variant="nav"
                    size="md"
                    className="px-4 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
                {/* BACK TO PLAY */}
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    label="BACK TO ACTION"
                    onClick={() => { playClickSound(); router.push('/playDemo'); }}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => { playClickSound(); window.print(); }}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px]"
              />
            </div>
          </div>
        )}
      />

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">

        {/* LEFT SIDEBAR */}
        <div
          className="flex-shrink-0 flex flex-col items-center pt-8 pb-4 px-3 overflow-hidden"
          style={{ width: '220px', borderRight: '1px solid #ddd' }}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div
                className="w-10 h-10 rounded-full animate-spin"
                style={{ border: '4px solid #d4a017', borderTopColor: 'transparent' }}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-8 w-full">
                {NETWORKS.map((net) => {
                  const isLocked =
                    (net.key === 'network2' && !hasCoffeeGroups) ||
                    (net.key === 'network1' && !hasTeamsTaskforce);
                  const isSelected = selectedKey === net.key;

                  return (
                    <div
                      key={net.key}
                      onClick={() => { playClickSound(); handleClick(net); }}
                      className="flex flex-col items-center gap-2 w-full select-none"
                      style={{
                        cursor: net.clickable ? 'pointer' : 'default',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (net.clickable) e.currentTarget.style.transform = 'scale(1.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '110px',
                          height: '110px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          opacity: isLocked ? 0.4 : 1,
                          boxShadow: isSelected && net.clickable
                            ? `0 0 0 2px ${net.color}33`
                            : 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <Image src={net.image} alt={net.label} fill className="object-cover" />
                      </div>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          textAlign: 'center',
                          lineHeight: 1.3,
                          letterSpacing: '0.02em',
                          color: isLocked ? '#aaa' : isSelected ? net.color : '#555',
                          transition: 'color 0.2s',
                        }}
                      >
                        {net.label}
                      </span>
                    </div>
                  );
                })}

                <div className="mt-auto pt-6 px-1 text-center">
                  <p style={{ fontSize: '11px', color: '#999', lineHeight: 1.5 }}>
                    Click on any network to explore<br />
                    formal and informal organizational connections
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT MAIN AREA */}
        <div className="flex-1 relative bg-white overflow-hidden flex flex-col">

          {activeNet ? (
            <div className="flex flex-col h-full overflow-hidden">

              {/* Coffee Groups UI */}
              {isCoffeeGroups && (
                <div className="h-full bg-white overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
                    <div className="w-full max-w-[1600px] mx-auto grid grid-cols-[clamp(14rem,18vw,20rem)_1fr] gap-[clamp(1rem,2vw,3rem)] px-[clamp(1rem,2vw,2.5rem)] py-[clamp(0.8rem,1.5vh,1.5rem)]">
                      <div className="grid auto-rows-max gap-[clamp(0.2rem,0.6vh,0.7rem)] self-start">
                        <div className="bg-[#b7bd6d] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Emma Stuart (CEO)<br />
                            Bert Heinze (Ext. Fin. Controller)<br />
                            Randy Longhorn (CCO)<br />
                            John Peters (Internet Products)
                          </p>
                        </div>
                        <div className="bg-[#ffff00] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Stefanie Durand (Pers. Assistant)<br />
                            Frank Raponi (CHRO)<br />
                            Linda Pastorakis (Business Excellence)<br />
                            Adrian Muster (Legal Office)<br />
                            Anna Belloni (Marketing & Comm)
                          </p>
                        </div>
                        <div className="bg-[#cad8ec] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Per Joos (CTO)<br />
                            Wilma Grollmyer (Procurement)
                          </p>
                        </div>
                        <div className="bg-[#e0bf5f] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Martin Buerli (CFO)<br />
                            Jill Atherson (Personnel & Training)<br />
                            Adam deGroote (Facilities)<br />
                            Samuel Stein (Treasury)<br />
                            Pradeep Gupta (IT)<br />
                            Thomas Kupik (Consumer Sales)
                          </p>
                        </div>
                        <div className="bg-[#6d8fd6] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Daniel Wang (Mobile Products)<br />
                            Laszlo Por (Corporate Sales)<br />
                            Ivan Tarowski (Intl. Roaming)
                          </p>
                        </div>
                        <div className="bg-[#f59787] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Jill Atherson (Personnel & Training)<br />
                            Linda Pastorakis (Business Excellence)<br />
                            Anna Belloni (Marketing & Comm)
                          </p>
                        </div>
                        <div className="bg-[#ff0000] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold text-white">
                            Samuel Stein (Treasury)<br />
                            Laszlo Por (Corporate Sales)
                          </p>
                        </div>
                        <div className="bg-[#a8cb8c] border border-black/20 px-[0.8vw] py-[0.7vw]">
                          <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.35] font-semibold">
                            Martin Buerli (CFO)<br />
                            Pradeep Gupta (IT)<br />
                            Wilma Grollmyer (Procurement)<br />
                            Jean Bardotte (Operations)
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0 grid grid-rows-[1fr_auto] gap-[1vh]">
                        <div className="grid grid-cols-[clamp(10rem,16vw,18rem)_1fr] items-start gap-[clamp(1rem,2vw,3rem)]">
                          <div className="self-start pt-[1vh]">
                            <h1 className="text-[clamp(2.4rem,5vw,5rem)] leading-[0.95] font-semibold tracking-tight text-black">
                              Coffee<br />Groups
                            </h1>
                          </div>
                          <div className="grid place-items-start-center min-w-0">
                            <Image
                              src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART}
                              alt="Coffee Groups network"
                              width={1400}
                              height={1000}
                              priority
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                              className="object-contain w-auto h-auto max-w-full max-h-[68vh] min-w-[24rem]"
                            />
                          </div>
                        </div>
                        <div className="pt-[1vh] pb-[1.5vh]">
                          <p className="text-[clamp(0.72rem,0.82vw,1rem)] leading-[1.55] text-black max-w-[60rem]">
                            You have observed over the last few days that there are{' '}
                            <strong>8 groups of managers</strong><br />
                            who get together regularly for coffee, lunch, or informal meetings online.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* External Links UI */}
              {isExternalLinks && (
                <div className="h-full overflow-y-auto bg-[#f7f7f5]">
                  <div className="px-6 lg:px-10 pt-6 pb-3">
                    <h1 className="text-3xl xl:text-5xl font-semibold tracking-tight text-black">
                      External Links
                    </h1>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6 xl:gap-10 px-6 lg:px-10 items-start">
                    <div className="flex flex-col gap-3 w-full max-w-[320px]">
                      {GROUP_LEGENDS.map((group, i) => (
                        <div
                          key={i}
                          className="border border-black/15 shadow-sm px-3 py-2"
                          style={{ background: group.bgColor }}
                        >
                          {group.people.map((person, pi) => (
                            <p
                              key={pi}
                              className="text-[11px] xl:text-[12px] font-semibold leading-[1.45]"
                              style={{ color: group.textColor }}
                            >
                              {person}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center xl:justify-start items-start w-full overflow-hidden">
                      <div className="relative w-full max-w-[850px]">
                        <Image
                          src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART}
                          alt="External Links network"
                          width={900}
                          height={650}
                          priority
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 lg:px-10 pt-6 pb-6">
                    <p className="text-[12px] xl:text-[13px] leading-[1.8] text-[#222] max-w-[950px]">
                      You have observed over the past days that certain individuals belong to the same social groups as they tend to share{' '}
                      <strong>Political Views</strong> (yellow and blue), meet regularly at the{' '}
                      <strong>Tennis Club</strong> (green), or are actively involved in the same{' '}
                      <strong>Charity</strong> (orange).
                    </p>
                  </div>
                </div>
              )}

              {/* Teams/Taskforces UI */}
              {isTeamsTaskforces && (
                <div className="h-full bg-white overflow-hidden flex flex-col min-h-0">
                  <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
                    <div className="w-full max-w-[1600px] mx-auto grid grid-rows-[auto_1fr_auto] px-[clamp(1rem,2vw,2rem)] py-[clamp(0.8rem,1.2vh,1.2rem)] gap-[1vh]">
                      <div>
                        <h1 className="text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] font-semibold tracking-tight text-black">
                          Teams/Taskforces
                        </h1>
                      </div>
                      <div className="grid grid-cols-[minmax(14rem,20vw)_1fr] gap-[clamp(1rem,2vw,2.5rem)] items-start">
                        <div className="grid auto-rows-max gap-[clamp(0.5rem,0.8vh,0.9rem)] self-start">
                          <div className="bg-[#F59787] border border-black/20 px-[0.8vw] py-[0.65vw]">
                            <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.28] font-semibold">
                              John Peters (Internet Products)<br />
                              Daniel Wang (Mobile Products)<br />
                              Luis Fernandez (Fixed Products)<br />
                              Thomas Kupik (Consumer Sales)<br />
                              Laszlo Por (Corporate Sales)<br />
                              Ivan Tarowski (Intl. Roaming)
                            </p>
                          </div>
                          <div className="bg-[#CAD8EC] border border-black/20 px-[0.8vw] py-[0.65vw]">
                            <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.28] font-semibold">
                              Bert Heinze (Ext. Fin. Controller)<br />
                              Martin Buerli (CFO)<br />
                              Per Joos (CTO)<br />
                              Samuel Stein (Treasury)<br />
                              Adrian Muster (Legal Office)<br />
                              Wilma Grollmyer (Procurement)
                            </p>
                          </div>
                          <div className="bg-[#FFFF00] border border-black/20 px-[0.8vw] py-[0.65vw]">
                            <p className="text-[clamp(0.62rem,0.72vw,0.82rem)] leading-[1.28] font-semibold">
                              Emma Stuart (CEO)<br />
                              Martin Buerli (CFO)<br />
                              Per Joos (CTO)<br />
                              Randy Longhorn (CCO)<br />
                              Frank Raponi (CHRO)
                            </p>
                          </div>
                        </div>
                        <div className="min-w-0 grid place-items-start pl-[clamp(1rem,3vw,4rem)]">
                          <Image
                            src={activeNet?.mapImage || IMAGES.ALL.ORG_CHART}
                            alt="Teams Taskforces network"
                            width={1800}
                            height={1400}
                            priority
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            className="object-contain w-full h-auto max-w-[clamp(42rem,58vw,72rem)] max-h-[68vh]"
                          />
                        </div>
                      </div>
                      <div className="pb-[1vh]">
                        <p className="text-[clamp(0.72rem,0.82vw,1rem)] leading-[1.55] text-[#222] max-w-[85ch]">
                          You found out that currently there are{' '}
                          <strong>3 important Task Forces/Committees/Formal Teams</strong>{' '}
                          at FrontMedia. They are the{' '}
                          <strong>Expansion Taskforce</strong> (yellow), the{' '}
                          <strong>Purchasing Committee</strong> (blue), and the{' '}
                          <strong>New Products Development Committee</strong> (red),
                          which is meeting very regularly too.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedKey && !isCoffeeGroups && !isExternalLinks && !isTeamsTaskforces && (
                <div className="flex-1 flex items-center justify-center">
                  <p>Selected: {selectedKey} but no component matched</p>
                </div>
              )}

            </div>

          ) : activeNet && imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
              <div style={{ fontSize: '48px', opacity: 0.2, marginBottom: '12px' }}>🖼️</div>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Network diagram for <strong>{activeNet.label}</strong> could not be loaded.
              </p>
              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                Check the mapImage path in the NETWORKS config.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-10">
              <div>
                <div style={{ fontSize: '48px', opacity: 0.2, marginBottom: '12px' }}>🌐</div>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
                  Select a network to view details
                </p>
                <p style={{ fontSize: '14px', color: '#999', lineHeight: 1.5 }}>
                  Click on any network option on the left to explore<br />
                  formal and informal organizational connections
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <SimulationFooter
        timeLabel={`TIME (${gameState?.time || 0})`}
        usedDays={gameState?.time || 0}
        decisionInfo={`DECISION ${gameState?.decisionNumber || 0} / ${MAX_DEMO_DECISIONS}`}
      />
    </div>
  );
}