import { useState, useEffect, useRef } from 'react';
import CustomDropdown from '@/components/common/CustomDropdown';
import { processFeedback } from '@/utils/feedbackUtils';
import { useSoundContext } from '@/contexts/SoundContext';
import { useGameSpeech } from '@/utils/gameSpeechUtils';

export default function DecisionScreenPlayDemo({
  decisionNumber,
  selectedInitiative: initialInitiative,
  detail,
  selectedPersons,
  setSelectedPersons,
  rationale,
  setRationale,
  onBack,
  onSubmit,
  onDecisionSuccess,
  gameState,
  initiatives: propInitiatives,
  sessionId
, activeDropdownIndex, setActiveDropdownIndex }) {
  const { playClickSound } = useSoundContext();
  const { handleInteraction, speakFeedback, isSpeechPlaying, stopSpeech } = useGameSpeech();
  const submittingRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState(initialInitiative);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);

  // Use prop initiatives if provided
  const initiatives = propInitiatives || [];

  // Get managers from game state
  const managers = gameState?.managers || [];

  // Update local state when prop changes
  useEffect(() => {
    setSelectedInitiative(initialInitiative);
  }, [initialInitiative, initiatives]);

  // Get selected initiative object for targetType and maxTargets
  const selectedInitiativeObj = initiatives?.find(init =>
    init.name === selectedInitiative ||
    init.id === selectedInitiative ||
    init.name?.toLowerCase() === selectedInitiative?.toLowerCase() ||
    init.id?.toLowerCase() === selectedInitiative?.toLowerCase()
  );

  // Helper to check if Get Profiles initiative is selected
  const isGetProfilesInitiative =
    selectedInitiativeObj?.id === 'get_profiles' ||
    selectedInitiativeObj?.name === 'Get Profiles' ||
    selectedInitiative === 'Get Profiles' ||
    selectedInitiative === 'get_profiles' ||
    selectedInitiativeObj?.name?.toLowerCase().includes('get profiles') ||
    selectedInitiativeObj?.name?.toLowerCase().includes('get profile') ||
    selectedInitiative?.toLowerCase().includes('get profiles') ||
    selectedInitiative?.toLowerCase().includes('get profile');

  // Helper to check if Management Training initiative is selected
  const isTrainingInitiative =
    selectedInitiativeObj?.id === 'training' ||
    selectedInitiativeObj?.name === 'Management Training' ||
    selectedInitiative === 'Management Training' ||
    selectedInitiative === 'training' ||
    selectedInitiativeObj?.name?.toLowerCase().includes('training') ||
    selectedInitiative?.toLowerCase() === 'training' ||
    selectedInitiative?.toLowerCase().includes('management training');

  // Helper to check if Selective Email initiative is selected
  const isSelectiveEmailInitiative =
    selectedInitiativeObj?.name === 'Selective Email' ||
    selectedInitiative?.toLowerCase().includes('selective email');

  // Get list of managers who have already undergone training
  const trainedManagerIds = (() => {
    const ids = new Set();
    const names = new Set();
    if (gameState?.history) {
      gameState.history.forEach(item => {
        if (
          item.initiativeId === 'training' ||
          item.initiativeName === 'Management Training' ||
          item.initiativeId?.toLowerCase()?.includes('training') ||
          item.initiativeName?.toLowerCase()?.includes('training')
        ) {
          if (item.targetManagers) {
            item.targetManagers.forEach(m => {
              if (m) {
                if (typeof m === 'object') {
                  if (m.managerId !== undefined && m.managerId !== null) {
                    ids.add(Number(m.managerId));
                  }
                  if (m.name) {
                    names.add(m.name.toLowerCase().trim());
                  }
                } else if (typeof m === 'number') {
                  ids.add(m);
                } else if (typeof m === 'string') {
                  if (!isNaN(m)) {
                    ids.add(Number(m));
                  } else {
                    names.add(m.toLowerCase().trim());
                  }
                }
              }
            });
          }
        }
      });
    }
    return { ids, names };
  })();

  // Reset selected persons when initiative changes
  useEffect(() => {
    if (selectedInitiativeObj) {
      if (selectedInitiativeObj.targetType === 'all') {
        setSelectedPersons([]);
      } else if (selectedInitiativeObj.targetType === 'single') {
        setSelectedPersons([null]);
        setActiveDropdownIndex?.(null);
      } else if (selectedInitiativeObj.targetType === 'multiple') {
        setSelectedPersons(Array(selectedInitiativeObj.maxTargets).fill(null));
        setActiveDropdownIndex?.(null);
      }
    }
  }, [selectedInitiativeObj]);

  const validateAllDropdownsFilled = () => {
    if (!selectedInitiative) return false;

    // No validation needed for 'all' targets
    if (selectedInitiativeObj?.targetType === 'all') return true;

    // Special Exception: Get Profiles, Management Training, or Selective Email (At least 1 selection required)
    if (isGetProfilesInitiative || isTrainingInitiative || isSelectiveEmailInitiative) {
      return selectedPersons.some(p => p !== null);
    }

    // Default: Strict validation for all other initiatives (All selections required)
    if (
      selectedInitiativeObj?.targetType === 'single' ||
      selectedInitiativeObj?.targetType === 'multiple'
    ) {
      return selectedPersons.every(p => p !== null);
    }

    return true;
  };

  const handleDoItClick = () => {
    if (submittingRef.current) return;
    playClickSound();

    if (!validateAllDropdownsFilled()) {
      setShowValidationWarning(true);
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    if (!selectedInitiative) {
      alert('Please select an initiative');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!sessionId) {
      alert('Session not found. Please try again.');
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (selectedInitiativeObj?.targetType !== 'all') {
      if (isGetProfilesInitiative || isTrainingInitiative || isSelectiveEmailInitiative) {
        const atLeastOneFilled = selectedPersons.some(p => p !== null);
        if (!atLeastOneFilled) {
          setShowValidationWarning(true);
          submittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
      } else {
        const allFilled = selectedPersons.every(p => p !== null);
        if (!allFilled) {
          setShowValidationWarning(true);
          submittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
      }
    }

    const initiativeId = selectedInitiativeObj?.id || selectedInitiative;
    const targetManagers = selectedInitiativeObj?.targetType === 'all'
      ? managers.map(manager => manager.managerId)
      : selectedPersons.filter(p => p !== null);

    const requestData = {
      initiativeId,
      targetManagers
    };

    try {
      if (!onSubmit) {
        throw new Error('Submission handler not provided');
      }

      const result = await onSubmit(requestData);

      if (!result) {
        throw new Error('Decision submission did not return valid result');
      }

      onDecisionSuccess?.(result);

      const oldManagers = gameState?.managers || [];
      const newManagers = result.managers || [];
      const progressChanges = [];

      newManagers.forEach((newManager) => {
        const oldManager = oldManagers.find((m) => m.managerId === newManager.managerId);
        if (!oldManager) return;

        const oldProgress = (oldManager.aware || 0) + (oldManager.interest || 0) + (oldManager.experimentation ?? oldManager.experiment ?? 0) + (oldManager.adopted || 0);
        const newProgress = (newManager.aware || 0) + (newManager.interest || 0) + (newManager.experimentation ?? newManager.experiment ?? 0) + (newManager.adopted || 0);
        const increase = newProgress - oldProgress;

        if (increase > 0) {
          progressChanges.push({
            managerId: newManager.managerId,
            increase,
            oldProgress,
            newProgress,
            oldManager,
            newManager
          });
        }
      });

      const processedFeedback = processFeedback(
        result.feedback,
        gameState?.managers || []
      );

      setFeedbackData({
        processedMessage: processedFeedback,
        all: result.feedback?.all || [],
        primary: result.feedback?.primary || {},
        initiativeName: result.initiativeName,
        score: result.score,
        time: result.time,
        progressChanges
      });
      setShowFeedback(true);

      setTimeout(() => {
        speakFeedback({
          processedMessage: processedFeedback,
          all: result.feedback?.all || [],
          primary: result.feedback?.primary || {}
        }, {
          includeTitle: true,
          includeDecisionNumber: true,
          decisionNumber: decisionNumber + 1,
          auto: true
        });
      }, 1000);
    } catch (error) {
      console.log('=== DECISION API ERROR ===');
      console.error('Error submitting decision:', error);
      console.log('Error Message:', error.message);
      console.log('=== END API ERROR ===');

      const errorMsg = error.message || 'Failed to submit decision';
      alert(errorMsg);

      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div id="decision-screen-root" className="flex flex-col h-full px-10 py-6">

      {/* Header - only show when NOT in feedback mode */}
      {!showFeedback && (
        <div
          id="decision-screen-header"
          className="
            shrink-0
            flex
            items-center
            justify-center
            w-full
            mt-3
            mb-6
          "
        >
          {/* <button
            id="decision-screen-back-btn"
            onClick={() => {
              playClickSound();
              onBack();
            }}
            className="bg-transparent border-none cursor-pointer text-xs text-[#111] font-bold font-sans"
          >
            &lt; BACK
          </button> */}
          <span
            id="decision-screen-number-label"
            className="
              bg-[#EBEEFA]
              text-[#111]
              text-[20px]
              lg:text-[24px]
              font-extrabold
              tracking-[0.04em]
              font-['Times_New_Roman']
              px-25
              py-1
              uppercase
            "
          >
            DECISION No. {decisionNumber}
          </span>
          <div className="w-[50px]" />
        </div>
      )}

      {/* Conditional rendering: Feedback / Decision content */}
      {showFeedback ? (

        // Feedback View
        <div id="decision-feedback-view" className="flex-1 flex flex-col p-5 overflow-hidden">

          {/* Top Header Section */}
          <div
            id="decision-feedback-header"
            className="bg-[#EBEEFA] py-4 px-6 mb-4 shrink-0 cursor-pointer hover:bg-[#d8e0f5] transition-colors rounded"
            onClick={() => {
              handleInteraction();
              if (feedbackData) {
                speakFeedback(feedbackData, {
                  includeTitle: true,
                  includeDecisionNumber: true,
                  decisionNumber: decisionNumber
                });
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleInteraction();
                if (feedbackData) {
                  speakFeedback(feedbackData, {
                    includeTitle: true,
                    includeDecisionNumber: true,
                    decisionNumber: decisionNumber
                  });
                }
              }
            }}
            aria-label="Click to hear feedback read aloud"
          >
            <p id="decision-feedback-decision-number" className="text-center text-xl font-bold uppercase tracking-widest text-[#1e293b] mb-1">
              DECISION No. {decisionNumber}
            </p>
            <p id="decision-feedback-label" className="text-center text-xl font-bold uppercase tracking-widest text-[#c62828]">
              FEEDBACK {isSpeechPlaying && '(Speaking...)'}
            </p>
          </div>

          {/* Subtitle */}
          <p id="decision-feedback-subtitle" className="text-center italic text-[#2F4F4F] text-sm mb-4 shrink-0 px-2">
            Some time later ...
          </p>

          {/* Content Box */}
          <div id="decision-feedback-content-box" className="flex-1 border border-[#ccc] bg-white p-4 overflow-y-auto mb-4 min-h-0 rounded">
            {feedbackData?.processedMessage && (
              <div
                id="decision-feedback-text-wrapper"
                className="mb-4 p-3 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                onClick={() => {
                  handleInteraction();
                  speakFeedback(feedbackData, {
                    includeTitle: false,
                    includeDecisionNumber: false
                  });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInteraction();
                    speakFeedback(feedbackData, {
                      includeTitle: false,
                      includeDecisionNumber: false
                    });
                  }
                }}
                aria-label="Click to hear feedback content read aloud"
              >
                <p
                  id="decision-feedback-text"
                  className="text-sm text-[#333] whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: feedbackData.processedMessage.replace(/Advice/g, '<strong>Advice</strong>')
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div id="decision-feedback-progress-btn-wrapper" className="flex justify-center mb-4 mt-2">
            <style>
              {`
                @keyframes fast-bg-blink {
                  0%, 100% { background-color: #D0D6F0; }
                  50% { background-color: #f8fafc; }
                }
                .animate-fast-bg-blink {
                  animation: fast-bg-blink 0.5s ease-in-out infinite;
                }
              `}
            </style>
            <button
              id="decision-feedback-progress-btn"
              onClick={() => {
                playClickSound();
                if (isProgressAnimating) return;
                if (feedbackData?.progressChanges && feedbackData.progressChanges.length > 0) {
                  window.dispatchEvent(
                    new CustomEvent('animate-manager-progress', {
                      detail: feedbackData.progressChanges,
                    })
                  );
                  setIsProgressAnimating(true);
                  setTimeout(() => {
                    setIsProgressAnimating(false);
                  }, 2000);
                }
              }}
              className={`
                w-full
                border
                border-[#a1a1aa]
                py-1.5
                text-black
                text-[16px]
                ${isProgressAnimating ? 'animate-fast-bg-blink' : 'bg-[#E5EAF5] hover:bg-[#D0D6F0]'}
                transition-colors
              `}
            >
              Display "Progress"
            </button>
          </div>

          {/* Bottom Link */}
          <button
            id="decision-feedback-next-btn"
            onClick={() => {
              playClickSound();
              setShowFeedback(false);
              stopSpeech();
              onBack();
            }}
            className="block mx-auto text-[#c62828] underline cursor-pointer text-sm"
          >
            Next Decision
          </button>
        </div>

      ) : (

        // Decision content
        <div id="decision-content-root" className="flex-1 p-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Initiative dropdown */}
          <div id="decision-initiative-section" className="mb-5">
            <div
              id="decision-initiative-row"
              className="
                flex
                items-center
                justify-center
                gap-3
                w-full
              "
            >
              <label
                id="decision-initiative-label"
                className="
                  text-[15px]
                  font-bold
                  whitespace-nowrap
                "
              >
                Your Initiative:
              </label>

              <CustomDropdown
                value={selectedInitiativeObj?.name || selectedInitiative || ''}
                onChange={(val) => {
                  playClickSound();
                  setSelectedInitiative(val);
                }}
                options={[
                  { value: '', label: 'Select initiative...' },
                  ...(initiatives && initiatives.length > 0
                    ? initiatives.map((init) => ({
                        value: init.name,
                        label: init.name,
                      }))
                    : [{ value: 'no-initiatives', label: 'No initiatives available' }])
                ]}
                placeholder="Select initiative..."
                className="
                  w-[150px]
                  md:w-[200px]
                  lg:w-[240px]
                "
              />
            </div>

            <span
              id="decision-initiative-time-cost"
              className="
                text-[13px]
                font-bold
                text-[#666]
                block
                mt-1
                text-center
              "
            >
              {selectedInitiativeObj?.timeCost
                ? `(Takes ${selectedInitiativeObj.timeCost} days)`
                : ''}
            </span>
          </div>

          {/* Person selection dropdowns */}
          <div id="decision-person-selection" className="mb-5">
            {selectedInitiativeObj?.msg && selectedInitiativeObj.msg.trim() !== '' ? (
              <label id="decision-person-selection-msg" className="block text-[13px] font-bold mb-2">
                {selectedInitiativeObj.msg}
              </label>
            ) : null}

            {selectedInitiativeObj?.targetType !== 'all' && (
              <div className="grid grid-cols-2 gap-3">
                {selectedPersons.map((person, index) => (
                  <CustomDropdown
                    key={index}
                    value={person || ''}
                    onChange={(val) => {
                      playClickSound();
                      const newPersons = [...selectedPersons];
                      newPersons[index] = val ? parseInt(val) : null;
                      setSelectedPersons(newPersons);
                    }}
                    options={[
                      { value: '', label: 'Select person...' },
                      ...managers.map((manager) => {
                        const isAlreadySelected = selectedPersons.includes(manager.managerId) && selectedPersons[index] !== manager.managerId;

                        let shouldDisable = isAlreadySelected;
                        let label = manager.name;

                        if (isAlreadySelected) {
                          label = `${manager.name} (Already selected)`;
                        } else if (isGetProfilesInitiative) {
                          const isProfileAvailable = manager.profileAvailable === true;
                          if (isProfileAvailable) {
                            label = `${manager.name} (Profile available)`;
                            shouldDisable = true;
                          }
                        } else if (isTrainingInitiative) {
                          const isTrained =
                            trainedManagerIds.ids.has(Number(manager.managerId)) ||
                            trainedManagerIds.names.has(manager.name.toLowerCase().trim());
                          if (isTrained) {
                            label = `${manager.name} (Already trained)`;
                            shouldDisable = true;
                          }
                        }

                        return {
                          value: manager.managerId,
                          label: label,
                          disabled: shouldDisable,
                        };
                      })
                    ]}
                    placeholder="Select person..."
                  />
                ))}
              </div>
            )}
          </div>

          {/* Rationale textarea */}
          <div id="decision-rationale-section" className="mb-6">
            <label id="decision-rationale-label" className="block text-[13px] font-bold mb-2 bg-[#EBEEFA] inline-block px-2 py-1">
              Your rationale for this decision (optional):
            </label>
            <textarea
              id="decision-rationale-textarea"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Enter your reasoning here..."
              className="w-full min-h-20 p-2 text-xs border border-[#999] bg-white resize-y font-sans"
            />
          </div>

          {/* Actions */}
          <div id="decision-actions" className="flex flex-col items-center gap-2 -mt-5">
            <div id="decision-actions-spinner" className="text-lg cursor-pointer text-[#666] animate-spin">↻</div>

            <button
              id="decision-do-it-btn"
              type="button"
              onClick={handleDoItClick}
              disabled={isSubmitting}
              className="py-2.5 px-6 font-bold text-3xl cursor-pointer disabled:opacity-50 -mt-2"
            >
              {isSubmitting ? 'Submitting...' : 'Do It!'}
            </button>

            <button
              id="decision-dont-do-it-btn"
              onClick={() => {
                playClickSound();
                onBack();
              }}
              className="bg-transparent border-none cursor-pointer text-md text-[#666] underline"
            >
              ... or rather Don't do it
            </button>
          </div>

          {/* Validation Warning Dialog */}
          {showValidationWarning && (
            <div id="decision-validation-popup-overlay" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
              <div id="decision-validation-popup-container" className="w-[90%] max-w-[400px] rounded-md overflow-hidden shadow-lg">
                <div id="decision-validation-popup-top-bar" className="bg-white h-[32px]" />
                <div id="decision-validation-popup-body" className="bg-[#9FB4CC] py-5 px-6 text-center">
                  <p id="decision-validation-popup-message" className="text-sm text-black mb-4 font-bold">
                    {isSelectiveEmailInitiative
                      ? 'Select at least one manager for Selective Email.'
                      : 'First select the five persons!'}
                  </p>
                  <div id="decision-validation-popup-actions" className="flex justify-center">
                    <button
                      id="decision-validation-popup-ok-btn"
                      onClick={() => {
                        playClickSound();
                        setShowValidationWarning(false);
                      }}
                      className="px-8 py-2 bg-white text-black border border-blue-500 hover:bg-[#6A8CB4] transition text-sm font-bold"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
