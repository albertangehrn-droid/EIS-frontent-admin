"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import GameButton from '@/components/Buttons/GameButton';
import ManagerListPlayDemo from '@/components/playdemo/ManagerListPlayDemo';
import SimulationHeader from '@/components/common/SimulationHeader';
import SimulationFooter from '@/components/common/SimulationFooter';
import IMAGES from '@/utils/imagePaths';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';
import { playerRows } from '@/data/orgChartData';
import { navButtons, initiativeDetails } from '@/data/initiativesData';
import { helpDialogData } from '@/data/helpDialogData';
import { GAME_INTRO_SPEECH_TEXT } from '@/data/demoSpeechData';
import { useMissionSpeech } from '@/hooks/useSpeechSynthesis';
import { useGameSpeech } from '@/utils/gameSpeechUtils';
import { useSpeechContext } from '@/contexts/SpeechContext';
import OrgChartViewPlayDemo from '@/components/playdemo/OrgChartViewPlayDemo';
import ManagerProfileViewPlayDemo from '@/components/playdemo/ManagerProfileViewPlayDemo';
import DemoSessionViewPlayDemo from '@/components/playdemo/DemoSessionViewPlayDemo';
import DecisionScreenPlayDemo from '@/components/playdemo/DecisionScreenPlayDemo';
import InitiativesListPlayDemo from '@/components/playdemo/InitiativesListPlayDemo';
import GameHelpDialogPlayDemo from '@/components/playdemo/GameHelpDialogPlayDemo';
import LaunchWarningDialogPlayDemo from '@/components/playdemo/LaunchWarningDialogPlayDemo';
import GameOverDialogPlayDemo from '@/components/playdemo/GameOverDialogPlayDemo';
import DemoEndedDialog from '@/components/playdemo/DemoEndedDialog';
import { useSoundContext } from '@/contexts/SoundContext';

// Mobile Navigation Dropdown Component
const MobileNavDropdown = ({ navButtons, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} id="play-demo-mobile-nav-container" className="relative">
      <button
        id="play-demo-mobile-nav-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-yellow-400 border border-gray-700 px-3 py-1.5 text-xs font-bold tracking-wide flex items-center gap-1"
      >
        MENU
        <svg
          id="play-demo-mobile-nav-icon"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div id="play-demo-mobile-nav-dropdown" className="absolute right-0 top-full mt-1 bg-black border border-gray-700 shadow-lg z-50 min-w-[140px]">
          {navButtons.map((btn) => (
            <button
              key={btn}
              id={`play-demo-mobile-nav-item-${btn.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                onNavigate(btn);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-yellow-400 font-bold tracking-wide hover:bg-gray-800 border-b border-gray-800 last:border-b-0"
            >
              {btn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function DesktopGameViewPlayDemo({ pageConfig = {} }) {
  const content = pageConfig.content || {};
  const styles = pageConfig.styles || {};
  const assets = pageConfig.assets || {};

  const router = useRouter();
  const { playClickSound } = useSoundContext();
  const { speakText, handleInteraction } = useGameSpeech();
  const {
    sessionId,
    gameState,
    initiatives,
    loading,
    error,
    isDemoEnded,
    demoStats,
    MAX_DEMO_DECISIONS,
    submitDecision,
    restartDemo,
    quitDemo,
    fetchGameState
  } = usePlayDemoGame();

  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [hideSectionC, setHideSectionC] = useState(false);
  const [showMobileInitiatives, setShowMobileInitiatives] = useState(false);
  const [showTabletDetails, setShowTabletDetails] = useState(false);
  const [showInitiativeMode, setShowInitiativeMode] = useState(false);
  const [showDecisionScreen, setShowDecisionScreen] = useState(false);
  const [decisionNumber, setDecisionNumber] = useState(0);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [rationale, setRationale] = useState('');
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [showLaunchWarning, setShowLaunchWarning] = useState(false);
  const [showQuitPopup, setShowQuitPopup] = useState(false);
  const [showDemoEndedDialog, setShowDemoEndedDialog] = useState(true);
  const [selectedManager, setSelectedManager] = useState(null);
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [isAnimatingProgress, setIsAnimatingProgress] = useState(false);

  // Get speech context for manual mute control
  const { userMuted, toggleSpeechMute, speechEnabled } = useSpeechContext();

  // Auto-speak game intro on load (only in playDemo routes)
  const { speak, stop, isSpeaking } = useMissionSpeech(GAME_INTRO_SPEECH_TEXT, {
    autoSpeak: false,
    delay: 0,
    enabled: true,
    onlyInPlayDemo: false,
    voiceName: null,
    rate: 0.9,
    pitch: 1,
    volume: 1
  });

  // Check if speech should play (only once per demo session)
  useEffect(() => {
    if (isInitialized && !loading && speechEnabled) {
      const demoSpeechPlayed = localStorage.getItem('demoSpeechPlayed');

      console.log('Speech Debug:', { isInitialized, loading, speechEnabled, demoSpeechPlayed });

      if (!demoSpeechPlayed || demoSpeechPlayed === 'false') {
        console.log('Playing speech...');
        setTimeout(() => {
          speak(GAME_INTRO_SPEECH_TEXT);
          localStorage.setItem('demoSpeechPlayed', 'true');
        }, 2000);
      } else {
        console.log('Speech already played, skipping...');
      }
    } else {
      console.log('Speech Debug - Conditions not met:', { isInitialized, loading, speechEnabled });
    }
  }, [isInitialized, loading, speechEnabled, speak]);

  // Initialize on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Track first load completion
  useEffect(() => {
    if (!loading && !firstLoadComplete) {
      setFirstLoadComplete(true);
    }
  }, [loading, firstLoadComplete]);

  // Listen for progress animation
  useEffect(() => {
    const handleAnimation = () => {
      setIsAnimatingProgress(true);
      setTimeout(() => { setIsAnimatingProgress(false); }, 2000);
    };
    window.addEventListener('animate-manager-progress', handleAnimation);
    return () => window.removeEventListener('animate-manager-progress', handleAnimation);
  }, []);

  // Update decision number from game state
  useEffect(() => {
    if (gameState) {
      setDecisionNumber(gameState.decisionNumber || 0);
    }
  }, [gameState]);

  const handleDecisionSuccess = (updatedState) => {
    console.log('[DesktopGameViewPlayDemo] Decision success, state already updated');
  };

  const handleResetSession = async () => {
    if (!sessionId) {
      alert('Session not found. Please try again.');
      return;
    }
    setShowQuitPopup(true);
  };

  const handleQuitConfirm = async () => {
    localStorage.setItem('demoSpeechPlayed', 'false');
    quitDemo();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : '/EIS/admin';
    window.location.href = basePath || '/EIS/admin';
  };

  const handleStartRealSession = () => {
    localStorage.setItem('demoSpeechPlayed', 'false');
    quitDemo();
    router.push('/');
  };

  const handleRestartDemo = async () => {
    await restartDemo();
    setShowInitiativeMode(false);
    setShowDecisionScreen(false);
    setSelectedInitiative(null);
    setSelectedPersons([]);
    setRationale('');
    setShowDemoEndedDialog(true);
  };

  if (!isInitialized || !firstLoadComplete) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#d4a017] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#111] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-[#111] text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-black text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayManagers = playerRows.map(staticManager => {
    const apiManager = gameState?.managers?.find(m =>
      m.name.includes(staticManager.name) ||
      staticManager.name.includes(m.name.split(' ')[0])
    );

    return {
      ...staticManager,
      managerId: apiManager?.managerId,
      image: staticManager.image,
      aware: apiManager?.aware ?? 0,
      interest: apiManager?.interest ?? 0,
      experiment: apiManager?.experimentation ?? 0,
      adopted: apiManager?.adopted ?? 0,
      awarenessLimit: apiManager?.awarenessLimit ?? 1,
      interestLimit: apiManager?.interestLimit ?? 7,
      experimentationLimit: apiManager?.experimentationLimit ?? 7,
      adoptionLimit: apiManager?.adoptionLimit ?? 1,
      role: apiManager?.role || 'Manager',
      description: apiManager?.description || staticManager.description,
      indicator: apiManager?.profileAvailable ?? staticManager.indicator,
      profileAvailable: apiManager?.profileAvailable ?? staticManager.profileAvailable ?? false,
    };
  });

  const detail = selectedInitiative ? initiativeDetails[selectedInitiative] : null;

  return (
    <div id="play-demo-root" className="h-screen flex flex-col overflow-hidden font-sans" style={{ backgroundColor: '#ffffff' }}>

      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <GameButton
                id="shared-btn-eis-simulation"
                label="EIS Simulation"
                onClick={() => {
                  playClickSound();
                  router.push('/aboutDetail');
                }}
                variant="compact"
                size="md"
              />
              <span
                id="play-demo-header-badge"
                className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: '#d4a017', color: '#000' }}
              >
                {content.demoBadgeText || 'DEMO'}
              </span>
            </div>
            <span
              id="play-demo-header-version"
              className="text-[9px] sm:text-[10px] italic pl-1 hidden sm:block"
              style={{ color: '#d4a017' }}
            >
              {content.headerVersionText || 'Sim Version 2.2, 2026'}
            </span>
          </div>
        )}
        centerContent={null}
        rightContent={(
          <div className="flex items-center gap-1">

            {/* Desktop view (lg and above) */}
            <div className="hidden lg:flex flex-col items-end gap-0.5">
              {/* Top Row: Nav Buttons */}
              <div id="play-demo-desktop-nav-buttons" className="flex items-center justify-end gap-1">
                {navButtons.map(btn => (
                  <GameButton
                    key={btn}
                    id={`play-demo-nav-btn-desktop-${btn.toLowerCase().replace(/\s+/g, '-')}`}
                    label={btn}
                    onClick={() => {
                      playClickSound();
                      if (btn === 'QUIT') handleResetSession();
                      else if (btn === 'INITIATIVES') { setShowInitiativeMode(true); setShowDecisionScreen(false); }
                      else if (btn === 'ORG CHART') router.push('/orgchart');
                      else if (btn === 'ORG NETWORK') router.push('/orgnetworks');
                      else if (btn === 'MISSION') router.push('/mission');
                      else router.push(`/playDemo${btn.toLowerCase().replace(/\s+/g, '')}`);
                    }}
                    variant="nav"
                    size="sm"
                    className="text-xs px-2 py-1 leading-tight !min-w-0 !w-auto !min-h-[42px] !min-w-[120px]"
                  />
                ))}
              </div>
              {/* Bottom Row: Print Button */}
              <GameButton
                id="shared-btn-print"
                label="PRINT"
                onClick={() => { playClickSound(); window.print(); }}
                variant="nav"
                size="sm"
                className="text-xs px-2 py-1 leading-tight !min-w-0 !w-auto !min-h-[42px] !min-w-[120px] mt-0.5"
              />
            </div>

            {/* Tablet view (md to lg) */}
            <div id="play-demo-tablet-nav-buttons" className="hidden md:grid lg:hidden grid-cols-3 gap-0.5 w-[240px]">
              {navButtons.map(btn => (
                <GameButton
                  key={btn}
                  id={`play-demo-nav-btn-tablet-${btn.toLowerCase().replace(/\s+/g, '-')}`}
                  label={btn}
                  onClick={() => {
                    playClickSound();
                    if (btn === 'QUIT') handleResetSession();
                    else if (btn === 'INITIATIVES') { setShowInitiativeMode(true); setShowDecisionScreen(false); }
                    else if (btn === 'ORG CHART') router.push('/orgchart');
                    else if (btn === 'ORG NETWORK') router.push('/orgnetworks');
                    else if (btn === 'MISSION') router.push('/mission');
                    else router.push(`/playDemo${btn.toLowerCase().replace(/\s+/g, '')}`);
                  }}
                  variant="nav"
                  size="sm"
                  className="text-[7.5px] px-0.5 py-0.5 leading-none !w-full !min-w-0 !min-h-[22px]"
                />
              ))}
              <GameButton
                id="shared-btn-print"
                label="PRINT"
                onClick={() => { playClickSound(); window.print(); }}
                variant="nav"
                size="sm"
                className="text-[7.5px] px-0.5 py-0.5 leading-none !w-full !min-w-0 !min-h-[22px]"
              />
            </div>

            {/* Mobile dropdown */}
            <div className="md:hidden">
              <MobileNavDropdown navButtons={navButtons} onNavigate={(btn) => {
                playClickSound();
                if (btn === 'QUIT') handleResetSession();
                else if (btn === 'INITIATIVES') { setShowInitiativeMode(true); setShowDecisionScreen(false); }
                else if (btn === 'ORG CHART') router.push('/orgchart');
                else if (btn === 'ORG NETWORK') router.push('/orgnetworks');
                else if (btn === 'MISSION') router.push('/mission');
                else router.push(`/playDemo${btn.toLowerCase().replace(/\s+/g, '')}`);
              }} />
            </div>

          </div>
        )}
      />

      <div id="play-demo-main-layout" className="flex flex-1 overflow-hidden">

        {!showOrgChart && (
          <ManagerListPlayDemo
            managers={displayManagers}
            onSelectManager={setSelectedManager}
            onClickManager={(player) => {
              if (showDecisionScreen && activeDropdownIndex !== null) {
                const targetIndex = selectedPersons.length === 1 ? 0 : activeDropdownIndex;
                if (!selectedPersons.includes(player.managerId)) {
                  const newPersons = [...selectedPersons];
                  newPersons[targetIndex] = player.managerId;
                  setSelectedPersons(newPersons);
                  setActiveDropdownIndex(null);
                }
              }
            }}
            onMouseLeave={() => setSelectedManager(null)}
            showInitiativeMode={showInitiativeMode}
            setShowInitiativeMode={setShowInitiativeMode}
            setShowDecisionScreen={setShowDecisionScreen}
            isAnimatingProgress={isAnimatingProgress}
          />
        )}

        <main
          id="play-demo-center-column"
          className={`flex-1 flex flex-col overflow-hidden ${selectedManager ? (
            <ManagerProfileViewPlayDemo selectedManager={selectedManager} />
          ) : showInitiativeMode ? (isAnimatingProgress ? 'hidden md:flex' : 'flex') : 'hidden md:flex'} ${showInitiativeMode ? '' : 'border-r border-[#aaa]'} bg-white relative`}
        >
          {selectedManager ? (
            <ManagerProfileViewPlayDemo selectedManager={selectedManager} />
          ) : showInitiativeMode ? (
            showTabletDetails ? (
              <div id="play-demo-tablet-details-panel" className="flex-1 flex flex-col bg-white overflow-hidden z-10">
                <div id="play-demo-tablet-details-header" className="shrink-0 bg-[#111] flex items-center justify-end h-[34px] px-3">
                  <button
                    id="play-demo-tablet-details-close-btn"
                    onClick={() => { playClickSound(); setShowTabletDetails(false); }}
                    className="text-white text-[11px] hover:text-[#d4a017] font-bold"
                  >
                    ✕ CLOSE
                  </button>
                </div>
                <div id="play-demo-tablet-details-content" className="flex-1 overflow-y-auto px-2.5 py-2 text-xs leading-relaxed text-[#111] bg-white">
                  {Object.values(initiativeDetails).map((d, i) => (
                    <div key={i} id="play-demo-tablet-detail-item" className="mb-2.5 pb-2 border-b border-[#ddd]">
                      <p id="play-demo-tablet-detail-text" className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleInteraction(); speakText(d.title + '. ' + d.description); }}>
                        <strong id="play-demo-tablet-detail-title">{d.title}:&nbsp;</strong>
                        {d.description}
                      </p>
                      {d.note && (
                        <div id="play-demo-tablet-detail-note" onClick={(e) => { e.stopPropagation(); handleInteraction(); speakText(d.note); }} className="cursor-pointer mt-1.5 p-1.5 rounded text-[11px] text-[#666] italic leading-snug">
                          {d.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full relative">
                <div className="flex-1 overflow-hidden relative">
                  {showDecisionScreen ? (
                    <DecisionScreenPlayDemo
                      decisionNumber={decisionNumber}
                      selectedInitiative={selectedInitiative}
                      detail={detail}
                      selectedPersons={selectedPersons}
                      setSelectedPersons={setSelectedPersons}
                      rationale={rationale}
                      setRationale={setRationale}
                      onBack={() => { playClickSound(); setShowDecisionScreen(false); }}
                      onDecisionSuccess={handleDecisionSuccess}
                      gameState={gameState}
                      initiatives={initiatives}
                      sessionId={sessionId}
                      isDemo={true}
                      decisionsLeft={MAX_DEMO_DECISIONS - (gameState?.decisionNumber || 0)}
                      onSubmit={async () => {
                        playClickSound();
                        try {
                          const selectedInitiativeObj = initiatives?.find(init =>
                            init.name === selectedInitiative || init.id === selectedInitiative
                          );
                          const initiativeId = selectedInitiativeObj?.id || selectedInitiative;

                          const result = await submitDecision({
                            initiativeId: initiativeId,
                            targetManagers: selectedPersons.filter(p => p),
                            rationale
                          });
                          if (result) {
                            setDecisionNumber(result.decisionNumber || decisionNumber + 1);
                          }
                          return result;
                        } catch (err) {
                          const msg = err.response?.data?.message || err.message || 'Failed to submit decision';
                          throw new Error(msg);
                        }
                      }}
                    />
                  ) : (
                    <InitiativesListPlayDemo
                      selectedInitiative={selectedInitiative}
                      setSelectedInitiative={setSelectedInitiative}
                      detail={detail}
                      onBack={() => { playClickSound(); setShowInitiativeMode(false); }}
                      initiatives={initiatives}
                      history={gameState?.history || []}
                      isDemoEnded={gameState?.decisionNumber >= MAX_DEMO_DECISIONS}
                      setShowDemoEndedDialog={setShowDemoEndedDialog}
                      onShowDetails={() => { playClickSound(); setShowTabletDetails(true); }}
                      onLaunch={() => {
                        playClickSound();
                        if (!selectedInitiative) {
                          setShowLaunchWarning(true);
                        } else if (gameState?.decisionNumber >= MAX_DEMO_DECISIONS) {
                          setShowDemoEndedDialog(true);
                        } else {
                          setShowDecisionScreen(true);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )
          ) : showOrgChart ? (
            <OrgChartViewPlayDemo
              gameState={gameState}
              hoveredPerson={hoveredPerson}
              setHoveredPerson={setHoveredPerson}
              onBack={() => { playClickSound(); setShowOrgChart(false); }}
            />
          ) : (
            <DemoSessionViewPlayDemo
              hideSectionC={hideSectionC}
              onHide={() => { playClickSound(); setHideSectionC(true); }}
              pageConfig={pageConfig}
            />
          )}
        </main>

        {showInitiativeMode && !selectedManager && (
          <aside
            id="play-demo-details-sidebar"
            className="hidden lg:flex lg:w-[25%] flex-col border-l border-[#aaa] shrink-0 bg-white"
          >
            {/* <div className="shrink-0 bg-[#111] flex items-center justify-center h-[34px] mt-0.5 px-1 overflow-hidden">
              <span className="text-[#d4a017] text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest xl:tracking-[0.15em] font-serif truncate">INITIATIVE DETAILS</span>
            </div> */}
            <div
              id="sidebar-initiatives-scroll"
              className="
                flex-1
                overflow-y-auto
                px-3
                py-2
                text-[15px]
                leading-[1.45]
                text-[#222]
                bg-white
                font-['Arial']
              "
            >
              {Object.values(initiativeDetails).map((d, i) => {
                const slug = d.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `item-${i}`;
                return (
                  <div
                    key={i}
                    id={`sidebar-initiative-block-${slug}`}
                    className="
                      mb-3
                      pb-3
                      border-b
                      border-[#cfcfcf]
                    "
                  >
                    <p id={`sidebar-initiative-text-${slug}`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handleInteraction(); speakText(d.title + '. ' + d.description); }}>
                      <strong
                        id="sidebar-initiative-title"
                        className="
                          font-normal
                          text-[14px]
                          tracking-[-0.01em]
                          text-[#111]
                        "
                      >
                        {d.title}:&nbsp;
                      </strong>
                      <span
                        id="sidebar-initiative-desc"
                        className="
                          text-[14px]
                          leading-[1.45]
                          text-[#222]
                          font-normal
                        "
                      >
                        {d.description}
                      </span>
                    </p>
                    {d.note && (
                      <div
                        id="sidebar-initiative-note" onClick={(e) => { e.stopPropagation(); handleInteraction(); speakText(d.note); }} className="cursor-pointer 
                          mt-2
                          text-[12px]
                          text-[#666]
                          italic
                          leading-[1.45]
                        "
                      >
                        {d.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

      </div>

      {/* MOBILE ONLY MANAGER PROFILE OVERLAY */}
      {selectedManager && (
        <div id="play-demo-mobile-profile-overlay" className="fixed inset-0 z-50 md:hidden flex flex-col bg-white">
          <div id="play-demo-mobile-profile-header" className="bg-[#111] text-white h-12 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
            <span id="play-demo-mobile-profile-title" className="font-bold text-[#d4a017] text-sm tracking-wide">MANAGER PROFILE</span>
            <button
              id="play-demo-mobile-profile-close-btn"
              onClick={() => { playClickSound(); setSelectedManager(null); }}
              className="text-white font-bold text-sm bg-transparent border border-white px-3 py-1 rounded hover:text-[#111] hover:bg-white transition-colors"
            >
              &times; CLOSE
            </button>
          </div>
          <div id="play-demo-mobile-profile-content" className="flex-1 relative">
            <ManagerProfileViewPlayDemo selectedManager={selectedManager} />
          </div>
        </div>
      )}

      <SimulationFooter
        timeLabel={`TIME (${gameState?.time || 0})`}
        usedDays={gameState?.time || 0}
        decisionInfo={`DECISION ${gameState?.decisionNumber || 0} / ${MAX_DEMO_DECISIONS}`}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <GameHelpDialogPlayDemo
        show={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
      />

      <LaunchWarningDialogPlayDemo
        show={showLaunchWarning}
        onClose={() => setShowLaunchWarning(false)}
      />

      <GameOverDialogPlayDemo
        show={showGameOverDialog}
        onClose={() => setShowGameOverDialog(false)}
        gameState={gameState}
      />

      <DemoEndedDialog
        show={isDemoEnded && showDemoEndedDialog}
        onClose={() => setShowDemoEndedDialog(false)}
      />

      {showQuitPopup && (
        <div id="play-demo-desktop-quit-popup-overlay" className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
          <div id="play-demo-desktop-quit-popup-container" className="w-[500px] rounded-md overflow-hidden shadow-lg">
            <div id="play-demo-desktop-quit-popup-top-bar" className="bg-white h-[40px]"></div>
            <div
              id="play-demo-desktop-quit-popup-body"
              className="py-6 px-8 text-center"
              style={{ backgroundColor: '#9FB4CC', color: '#000' }}
            >
              <p id="play-demo-desktop-quit-popup-message" className="text-lg mb-6">
                {content.quitConfirmText || 'Are you sure you want to quit? This will end your demo session.'}
              </p>
              <div className="flex justify-center gap-6">
                <button
                  id="play-demo-desktop-quit-popup-btn-yes"
                  onClick={() => { playClickSound(); handleQuitConfirm(); }}
                  className="px-10 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition"
                >
                  Yes
                </button>
                <button
                  id="play-demo-desktop-quit-popup-btn-no"
                  onClick={() => { playClickSound(); setShowQuitPopup(false); }}
                  className="px-10 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}






