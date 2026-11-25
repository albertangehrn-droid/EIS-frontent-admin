import { initiativesLeft as leftInitiatives, initiativesRight as rightInitiatives, initiativeDetails } from '@/data/initiativesData';
import { useRef, useEffect, useState } from 'react';
import { useSoundContext } from '@/contexts/SoundContext';
import { useGameSpeech } from '@/utils/gameSpeechUtils';
import IMAGES from '@/utils/imagePaths';

export default function InitiativesListPlayDemo({
  selectedInitiative,
  setSelectedInitiative,
  detail,
  onBack,
  onLaunch,
  initiatives,
  onShowDetails,
  history = [],
  isDemoEnded,
  setShowDemoEndedDialog
}) {

  const { playClickSound } = useSoundContext();
  const { handleInteraction, speakText } = useGameSpeech();

  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");

  const getInitiativeName = (item) => item.name || item;
  const getInitiativeId = (item) => item.id || item;

  // Get detail from API initiatives if available, otherwise use static detail prop
  const getDetail = () => {

    if (selectedInitiative) {

      // First try to find in static data with various matching strategies
      const normalizeKey = (str) => str.toLowerCase().replace(/[-_\s]/g, '');

      const selectedInitiativeNormalized =
        normalizeKey(selectedInitiative);

      // Try exact match first
      let staticDetail = initiativeDetails[selectedInitiative];

      // Try name match
      if (!staticDetail) {
        staticDetail =
          initiativeDetails[getInitiativeName(selectedInitiative)];
      }

      // Try fuzzy match by normalizing
      if (!staticDetail) {
        staticDetail =
          initiativeDetails[
          Object.keys(initiativeDetails).find(key =>

            normalizeKey(key) === selectedInitiativeNormalized ||

            normalizeKey(key) ===
            normalizeKey(getInitiativeName(selectedInitiative))

          )
          ];
      }

      if (staticDetail) {
        return staticDetail;
      }

      // If API initiatives exist, try to get description from there
      if (initiatives && initiatives.length > 0) {

        const selected = initiatives.find(init =>
          (init.id || init.name) === selectedInitiative
        );

        if (selected && selected.description) {
          return {
            description: selected.description,
            note: selected.note
          };
        }
      }
    }

    // Fallback to detail prop
    return detail;
  };

  const currentDetail = getDetail();

  return (
    <div id="initiatives-list-root" className="flex flex-col h-full px-2.5">

      {/* INITIATIVES Header */}
      <div id="initiatives-list-header" className="shrink-0 flex items-center justify-between px-2.5 h-[34px] mt-0.5">

        {/* <button
          id="initiatives-list-back-btn"
          onClick={() => { playClickSound(); onBack(); }}
          className="bg-transparent border-none cursor-pointer text-xs text-[#111] font-bold font-sans"
        >
          &lt; BACK
        </button> */}

        <div
          id="initiatives-list-title-wrapper"
          className="
            flex
            items-center
            justify-center
            gap-1.5
            flex-1
          "
        >
          <div
            className="
              shrink-0
              flex
              items-center
              px-2.5
              h-[34px]
              mt-0.5
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                gap-1.5
                flex-1
              "
            >
              <span
                id="initiatives-list-title"
                className="
                  inline-flex
                  items-center
                  justify-center
                  mt-2
                  h-[30px]
                  md:h-[34px]
                  text-[18px]
                  md:text-[22px]
                  font-normal
                  tracking-[0.08em]
                  px-10
                  md:px-16
                  min-w-[300px]
                  md:min-w-[420px]
                  uppercase
                  leading-none
                "
                style={{
                  backgroundColor: '#000000',
                  color: '#D4A017',
                  fontFamily: '"Times New Roman", serif'
                }}
              >
                INITIATIVES
              </span>
            </div>
          </div>

          {onShowDetails && (
            <button
              id="initiatives-list-show-details-btn"
              onClick={() => {
                playClickSound();
                onShowDetails();
              }}
              title="View Details"
              className="hidden md:flex lg:hidden items-center justify-center bg-black hover:bg-gray-800 text-[#d4a017] w-6 h-6 rounded border border-gray-600 transition-colors shrink-0 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5 text-[#d4a017]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          )}
        </div>

        <div id="initiatives-list-header-spacer" className="w-[30px]" />
      </div>

      {/* Two-column list */}
      <div
        id="initiatives-list-columns"
        className="
          mt-3
          shrink-0
          grid
          grid-cols-2
          gap-x-10
          gap-y-1
          px-6
          py-2
          pb-1
        "
      >

        {/* LEFT */}
        <div id="initiatives-list-left-column" className="text-center">
          {leftInitiatives.map(item => (
            <button
              key={getInitiativeId(item)}
              id="initiative-btn"
              onClick={() => {
                playClickSound();
                if (isDemoEnded) {
                  setShowDemoEndedDialog?.(true);
                  return;
                }
                setSelectedInitiative(getInitiativeId(item));
              }}
              className="
                block
                w-full
                text-center
                bg-transparent
                border-none
                cursor-pointer
                py-[2px]
                leading-[1.2]
                whitespace-normal
                break-words
                text-[11px]
                md:text-[13px]
                lg:text-[15px]
                font-semibold
                tracking-normal
                font-sans
              "
            >
              {getInitiativeName(item)}
            </button>
          ))}
        </div>

        {/* RIGHT */}
        <div id="initiatives-list-right-column" className="text-center">
          {rightInitiatives.map(item => (
            <button
              key={getInitiativeId(item)}
              id="initiative-btn"
              onClick={() => {
                playClickSound();
                if (isDemoEnded) {
                  setShowDemoEndedDialog?.(true);
                  return;
                }
                setSelectedInitiative(getInitiativeId(item));
              }}
              className="
                block
                w-full
                text-center
                bg-transparent
                border-none
                cursor-pointer
                py-[2px]
                leading-[1.2]
                whitespace-normal
                break-words
                text-[11px]
                md:text-[13px]
                lg:text-[15px]
                font-semibold
                tracking-normal
                font-sans
              "
            >
              {getInitiativeName(item)}
            </button>
          ))}
        </div>

      </div>

      {/* Description scroll box */}
      <div
        id="initiatives-description-box"
        className="
          mt-3
          border
          border-[#a6a6a6]
          bg-white
          overflow-y-auto
          px-4
          py-3
          text-[15px]
          md:text-[16px]
          leading-[1.5]
          h-[90px]
          md:h-[110px]
          lg:h-[150px]
          max-h-[230px]
          w-[85%]
          mx-auto
          self-center
          shrink-0
          cursor-pointer
        "
      >
        {selectedInitiative ? (
          <>
            <p 
              id="initiatives-description-text"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction();
                const title = (currentDetail?.title || getInitiativeName(selectedInitiative)).toUpperCase();
                const desc = currentDetail?.description || '';
                speakText(`${title}. ${desc}`);
              }}
            >
              <span
                id="initiatives-description-title"
                className="font-bold mr-1"
                style={{ fontSize: '17px', fontWeight: 'bold', color: '#c62828' }}
              >
                {getInitiativeName(selectedInitiative).toUpperCase()}:
              </span>{' '}
              {currentDetail?.description || 'Loading description...'}
            </p>

            {currentDetail?.note && (
              <p
                id="initiatives-description-note"
                className="mt-2.5 leading-relaxed cursor-pointer"
                style={{ fontStyle: 'italic', color: '#444', fontSize: '13px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteraction();
                  speakText(currentDetail.note);
                }}
              >
                {currentDetail.note}
              </p>
            )}
          </>
        ) : (
          <span
            id="initiatives-empty-text"
            className="text-[#666] text-[18px] font-normal leading-relaxed cursor-pointer block"
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction();
              speakText('Click on any initiative for a short description!');
            }}
          >
            Click on any initiative for a short description!
          </span>
        )}
      </div>

      {/* Spinner + launch link */}
      <div id="initiatives-launch-footer" className="shrink-0 flex flex-col items-center border-t border-t-0 mt-1.5 pt-1.5 pb-2 gap-1">

        <span id="initiatives-launch-spinner" className="text-[22px] text-[#070303] inline-block animate-spin">⟳</span>

        <button
          id="initiatives-launch-btn"
          onClick={() => {
            playClickSound();
            if (IMAGES?.SOUNDS?.TIME) {
              const audio = new Audio(IMAGES.SOUNDS.TIME);
              audio.play().catch(e => console.warn('Audio play failed', e));
            }

            // 🔥 Only these 3 initiatives should show popup
            const specialInitiatives = {
              "Coffee Groups": "coffee",
              "External Links": "external_links",
              "Get Teams": "get_teams",
            };

            const backendInitiativeId =
              specialInitiatives[selectedInitiative];

            let alreadySelected = false;

            // 🔥 Popup works ONLY for these 3 initiatives
            if (backendInitiativeId) {
              alreadySelected = history?.some(
                item =>
                  item?.initiativeId?.toLowerCase()?.trim() ===
                  backendInitiativeId?.toLowerCase()?.trim()
              );
            }

            if (alreadySelected) {

              // 🔥 Coffee Groups
              if (selectedInitiative === "Coffee Groups") {
                setDuplicateMessage(
                  `You already have this information about internal informal networks, and do not need to spend time to get it again. Rather select a different Initiative.`
                );
              }
              // 🔥 External Links
              else if (selectedInitiative === "External Links") {
                setDuplicateMessage(
                  `You already have this information about extemal\ninformal networks, and do not need to spend time to\nget it again. Rather select a different Initiative.`
                );
              }
              // 🔥 Get Teams
              else if (selectedInitiative === "Get Teams") {
                setDuplicateMessage(
                  `You already have this information about Taskforces and Committees (formal internal networks), and do not need to spend time to get it again. Rather select a different Initiative.`
                );
              }

              setShowDuplicatePopup(true);
              return;
            }

            onLaunch();

          }}
          className="bg-transparent border-none cursor-pointer text-[16px] font-bold text-[#111] underline font-sans"
        >
          Click here to Launch the selected Initiative
        </button>

      </div>

      {/* DUPLICATE POPUP */}
      {showDuplicatePopup && (
        <div id="initiatives-duplicate-popup-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div id="initiatives-duplicate-popup-container" className="w-[500px] rounded-md overflow-hidden shadow-lg">
            <div id="initiatives-duplicate-popup-top-bar" className="bg-white h-[40px]"></div>
            <div
              id="initiatives-duplicate-popup-body"
              className="bg-[#9FB4CC] py-6 px-8 text-center"
            >
              <p id="initiatives-duplicate-popup-message" className="text-[17px] leading-[1.7] text-black whitespace-pre-line">
                {duplicateMessage}
              </p>
              <div id="initiatives-duplicate-popup-actions" className="flex justify-center mt-6">
                <button
                  id="initiatives-duplicate-popup-ok-btn"
                  onClick={() => {
                    playClickSound();
                    setShowDuplicatePopup(false);
                  }}
                  className="px-10 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}