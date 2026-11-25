"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GameButton from "@/components/Buttons/GameButton";
import SimulationHeader from "@/components/common/SimulationHeader";
// import GameSimulationFooter from '@/components/common/GameSimulationFooter';
import SimulationFooter from "@/components/common/SimulationFooter";
import IMAGES from "@/utils/imagePaths";
import { strategyData } from "@/data/strategyData";
import axiosInstance from "@/utils/axiosInstance";
import { useSoundContext } from '@/contexts/SoundContext';
import usePlayDemoGame from '@/hooks/usePlayDemoGame';

export default function YourStrategyPage() {
  const router = useRouter();
  const { playClickSound } = useSoundContext();

  const [strategyConfig, setStrategyConfig] = useState(null);

  // Load configuration from API
  useEffect(() => {
    const fetchStrategyConfig = async () => {
      try {
        const response = await axiosInstance.get('/page-config/yourstrategy');
        if (response.data?.success && response.data?.data) {
          setStrategyConfig(response.data.data);
        }
      } catch (err) {
        console.error("Error loading strategy page config:", err);
      }
    };
    fetchStrategyConfig();
  }, []);

  const getStyle = (key, defaultStyle = '') => {
    const styleString = strategyConfig?.styles?.[key] ?? defaultStyle;
    const styleObj = {};
    if (!styleString) return styleObj;
    styleString.split(';').forEach((rule) => {
      const parts = rule.split(':');
      if (parts.length >= 2) {
        const prop = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        if (prop && val) {
          const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          styleObj[camelProp] = val;
        }
      }
    });
    return styleObj;
  };

  const { gameState, sessionId, MAX_DEMO_DECISIONS } = usePlayDemoGame();
  // const [strategyText, setStrategyText] = useState(strategyData.defaultStrategyText);
  const [strategyText, setStrategyText] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // 'saving', 'success', 'error', ''
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const saveTimeoutRef = useRef(null);
  const lastSavedTextRef = useRef(null);

  // console.log("sessionId", sessionId )

  // Function to save strategy immediately
  const saveStrategyNow = async (textToSave) => {
    if (!sessionId) return;

    try {
      const response = await axiosInstance.patch(
        `/game/strategy-text/${sessionId}`,
        {
          strategyText: textToSave,
        },
      );

      if (response.data.success) {
        lastSavedTextRef.current = textToSave;
        return true;
      }
    } catch (error) {
      console.error("Error saving strategy:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const fetchGameState = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/game/state/${sessionId}`);
        // Load strategy text from API if available
        const apiText = response.data.data.strategyText;

        if (apiText && apiText.trim() !== "") {
          // ✅ User ka saved data
          setStrategyText(apiText);
          lastSavedTextRef.current = apiText;
        } else {
          // ✅ Default text only when no user data
          setStrategyText(strategyData.defaultStrategyText);
          lastSavedTextRef.current = strategyData.defaultStrategyText;
        }

        setDataLoaded(true);

        // ✅ NEW: Team name logic
        const apiTeamName = response.data.data.teamName;
        if (apiTeamName && apiTeamName.trim() !== "") {
          setTeamName(apiTeamName);
        } else {
          setTeamName(strategyData.defaultTeamName);
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
        // Set default text on error
        setStrategyText(strategyData.defaultStrategyText);
        lastSavedTextRef.current = strategyData.defaultStrategyText;
        setDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameState();
  }, [sessionId]);

  // Auto-save with debounce (5 seconds)
  useEffect(() => {
    // if (!sessionId || strategyText === strategyData.defaultStrategyText) return;
    if (!sessionId || !strategyText || strategyText.trim() === "" || isLoading) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving status
    setSaveStatus("saving");

    // Debounce: wait 5 seconds after user stops typing before saving
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axiosInstance.patch(
          `/game/strategy-text/${sessionId}`,
          {
            strategyText,
          },
        );

        if (response.data.success) {
          lastSavedTextRef.current = strategyText;
          setSaveStatus("success");
          // Clear success message after 2 seconds
          setTimeout(() => setSaveStatus(""), 2000);
        }
      } catch (error) {
        console.error("Error auto-saving strategy:", error);
        setSaveStatus("error");
        // Clear error message after 3 seconds
        setTimeout(() => setSaveStatus(""), 3000);
      }
    }, 2000); // Wait 5 seconds after user stops typing

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [strategyText, sessionId]);

  // Save on page unload/close
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      // Check if there are unsaved changes
      if (strategyText && strategyText !== lastSavedTextRef.current && sessionId && !isLoading) {
        // Cancel the debounce timeout if exists
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Save immediately before leaving
        await saveStrategyNow(strategyText);

        // Show warning (some browsers still show this)
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [strategyText, sessionId]);

  return (
    <div
      id="strategy-page-root"
      className="h-screen bg-[#d9d9d9] flex flex-col overflow-hidden"
      style={getStyle('pageStyle')}
    >
      <SimulationHeader
        leftContent={(
          <div className="flex flex-col gap-0.5 sm:gap-1 mt-3">
            <GameButton id="shared-btn-eis-simulation"
              label="EIS Simulation"
              onClick={() => {
                playClickSound();
                router.push('/aboutDetail');
              }}
              variant="compact"
              size="lg"
              className="!font-semibold !py-1"
            />
            <span className="text-[#d4a017] text-[9px] sm:text-[10px] italic pl-1 hidden sm:block">
              Sim Version 2.2, 2026
            </span>
          </div>
        )}

        rightContent={(
          <div className="flex items-center gap-1 mt-3">
            {/* Mobile buttons */}
            <div className="flex lg:hidden flex-col gap-1">
              <GameButton id="shared-btn-mission"
                label="MISSION"
                onClick={() => {
                  playClickSound();
                  router.push("/mission");
                }}
                variant="nav"
                size="sm"
                className="w-auto !min-w-0 !px-3 !py-1.5 !text-xs !min-h-0"
              />
              <GameButton id="shared-btn-back"
                label="BACK"
                onClick={() => {
                  playClickSound();
                  router.push("/playDemo");
                }}
                variant="nav"
                size="sm"
                className="w-auto !min-w-0 !px-3 !py-1.5 !text-xs !min-h-0"
              />
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex flex-col items-end justify-center gap-[2px] h-full relative top-[2px]">
              <div
                id="strategy-desktop-nav-buttons"
                style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 150px 180px', gap: '4px' }}
              >
                {/* VIEW MISSION */}
                <div style={{ gridColumnStart: 3 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-view-mission"
                    label="VIEW MISSION"
                    onClick={() => { playClickSound(); router.push("/mission"); }}
                    variant="nav"
                    size="md"
                    className="px-4 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
                {/* BACK TO PLAY */}
                <div style={{ gridColumnStart: 5 }} className="w-full flex justify-center">
                  <GameButton
                    id="shared-btn-back-to-play"
                    label="BACK TO PLAY"
                    onClick={() => { playClickSound(); router.push("/playDemo"); }}
                    variant="nav"
                    size="md"
                    className="px-6 py-0 !text-[1.2rem] !font-semibold !whitespace-nowrap !w-full"
                  />
                </div>
              </div>
              <GameButton id="shared-btn-print"
                label="PRINT"
                onClick={() => {
                  playClickSound();
                  window.print();
                }}
                variant="nav"
                size="sm"
                className="text-[13px] px-4 py-0 leading-none !h-[20px] !min-h-[20px] !w-[120px] mt-[2px]"
              />
            </div>
          </div>
        )}
      />

      <main id="strategy-main" className="p-4 sm:p-5 flex-1 overflow-auto relative">
        <div id="strategy-watermark-wrapper" className="absolute inset-0 pointer-events-none">
          <Image
            id="strategy-watermark-image"
            src={strategyConfig?.assets?.bgWatermarkImage || IMAGES.ALL.KEN}
            alt="Background watermark"
            fill
            className="object-cover grayscale opacity-[0.22]"
            priority
          />
        </div>
        <div id="strategy-content-wrapper" className="max-w-[1240px] mx-auto relative z-10">
          <div id="strategy-header-container" className="mb-2 text-[16px] sm:text-[19px] leading-tight font-sans text-[#1a1a1a]">
            <span id="strategy-header-prefix" style={getStyle('headerPrefixStyle')}>
              {strategyConfig?.content?.strategyHeaderPrefix ?? "These are the Key Points of"}{" "}
            </span>
            <strong id="strategy-header-bold" style={getStyle('headerBoldStyle')}>
              {strategyConfig?.content?.strategyHeaderBold ?? "your Strategy:"}{" "}
            </strong>
            <em
              id="strategy-header-suffix"
              className="text-[14px] sm:text-[15px] text-[#2e2e2e] cursor-pointer hover:underline"
              style={getStyle('headerSuffixStyle')}
              onClick={() => setIsDialogOpen(true)}
            >
              {strategyConfig?.content?.strategyHeaderSuffix ?? "Click here to see more about"}
            </em>
          </div>

          <div id="strategy-editor-wrapper" className="relative border border-[#bcbcbc] bg-[#ececec] p-2" style={getStyle('editorBoxStyle')}>
            <textarea
              id="strategy-editor-textarea"
              value={dataLoaded ? (strategyText || "") : ""}
              onChange={(event) => setStrategyText(event.target.value)}
              placeholder={isLoading ? "Loading..." : ""}
              className="strategy-editor w-full h-[300px] sm:h-[340px] resize-none overflow-y-auto bg-transparent px-2 py-1 text-[18px] sm:text-[22px] leading-[1.35] text-[#222] outline-none"
              style={getStyle('editorTextStyle')}
              spellCheck={false}
              disabled={isLoading}
            />
            {isDialogOpen && (
              <>
                <div id="strategy-dialog-overlay" className="fixed inset-0 z-40" onClick={() => setIsDialogOpen(false)} />
                <div id="strategy-dialog-content" className="absolute top-1 bottom-1 left-[29px] right-1 sm:top-2 sm:bottom-2 sm:left-[33px] sm:right-2 bg-[#fafafa] border border-[#ccc] shadow-sm z-50 p-4 sm:p-5 overflow-y-auto text-[13.5px] sm:text-[14.5px] font-sans text-[#333] leading-snug">
                  <p id="strategy-dialog-p1" className="mb-4">
                    This is your <strong>first challenge!</strong> To develop and agree on a <strong>Strategy</strong> determining how you, as a Team, will intervene at FrontMedia and succeed in achieving your change and innovation management <strong>Mission</strong> during the next 6 months.
                  </p>
                  <p id="strategy-dialog-p2" className="mb-4">
                    Your <strong>Implementation Strategy</strong> should include considerations related to:
                  </p>
                  <div id="strategy-dialog-list" className="mb-4 space-y-1">
                    <div id="strategy-dialog-list-item-1" className="flex"><span className="mr-2">&gt;</span><span>Which is the best approach to <strong>diffuse</strong> the adoption of this innovation at FrontMedia (eg. top-down, bottom-up, ...)?</span></div>
                    <div id="strategy-dialog-list-item-2" className="flex"><span className="mr-2">&gt;</span><span>Would it be good to agree on some <strong>steps</strong> or <strong>milestones</strong> to structure your progress during the 6 months?</span></div>
                    <div id="strategy-dialog-list-item-3" className="flex"><span className="mr-2">&gt;</span><span>Which <strong>interventions</strong> or combination of interventions shall you favour (have another look at the INTERVENTIONS List)?</span></div>
                    <div id="strategy-dialog-list-item-4" className="flex"><span className="mr-2">&gt;</span><span>Are there any <strong>principles</strong> or <strong>values</strong> you believe you should consider during this change management project?</span></div>
                    <div id="strategy-dialog-list-item-5" className="flex"><span className="mr-2">&gt;</span><span>How can you as a Team best leverage your <strong>individual experiences</strong> &amp; <strong>insights</strong> on making change happen, and ideally rapidly?</span></div>
                    <div id="strategy-dialog-list-item-6" className="flex"><span className="mr-2">&gt;</span><span>...</span></div>
                  </div>
                  <p id="strategy-dialog-p3">
                    Start by allocating <strong>maximum 15 minutes</strong> to the reflection/discussion of the implementation strategy to adopt, aiming at reaching a <strong>good consensus</strong> - different team members might have initially pretty different views on how to best proceed in such a situation - and <strong>summarize the key points</strong> of your implementation strategy on this Page.
                  </p>
                </div>
              </>
            )}
          </div>

          <div id="strategy-footer-section" className="mt-4 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4 sm:gap-5 items-start">
            <div id="strategy-team-container" className="min-w-0">
              <div id="strategy-team-label" className="text-[18px] sm:text-[20px] lg:text-[24px] text-[#1f1f1f] mb-1" style={getStyle('teamLabelStyle')}>
                <span id="strategy-team-label-prefix">{strategyConfig?.content?.teamLabelPrefix ?? "Our"}{" "}</span>
                <strong id="strategy-team-label-bold">{strategyConfig?.content?.teamLabelBold ?? "Change Agents Team Name:"}</strong>
              </div>
              <textarea
                id="strategy-team-textarea"
                value={dataLoaded ? (teamName || "") : ""}
                placeholder={isLoading ? "Loading..." : ""}
                rows={2}
                readOnly
                className="w-full max-h-[100px] sm:max-h-[140px] border-b border-[#9a9a9a] bg-transparent text-[22px] sm:text-[26px] lg:text-[34px] leading-[1.08] text-black outline-none resize-none overflow-y-auto"
              />

              <div id="strategy-save-status" className="mt-4 flex justify-center xl:justify-start items-center gap-3">
                <div id="strategy-save-status-text" className="text-[13px] sm:text-[14px] h-6 flex items-center">
                  {saveStatus === "saving" && (
                    <span id="strategy-status-saving" className="text-gray-600 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-gray-600 rounded-full animate-pulse"></span>
                      Saving...
                    </span>
                  )}
                  {saveStatus === "success" && (
                    <span id="strategy-status-success" className="text-green-600 font-semibold flex items-center gap-1">
                      <span>✓</span> Saved
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span id="strategy-status-error" className="text-red-600 font-semibold flex items-center gap-1">
                      <span>✗</span> Failed to save
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div id="strategy-revision-note" className="text-[12px] sm:text-[13px] lg:text-[15px] leading-[1.35] text-[#222] pt-1 order-first xl:order-last" style={getStyle('revisionNoteStyle')}>
              {strategyConfig?.content?.revisionNoteText ?? strategyData.revisionNote}
            </div>
          </div>

        </div>
      </main>
      <SimulationFooter
        timeLabel={`TIME (${gameState?.time || 0})`}
        usedDays={gameState?.time || 0}
        decisionInfo={`DECISION ${gameState?.decisionNumber || 0} / ${MAX_DEMO_DECISIONS}`}
      />

      {/* Removed old modal */}

      <style jsx>{`
        .strategy-editor {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(1.35em - 2px),
            #757575 calc(1.35em - 2px),
            #757575 1.35em
          );
          background-attachment: local;
          background-origin: content-box;
          background-position-y: 1px;
        }
        @media (max-width: 1024px) {
          .strategy-editor {
            font-size: 17px;
          }
        }
        @media (max-width: 760px) {
          .strategy-editor {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}




