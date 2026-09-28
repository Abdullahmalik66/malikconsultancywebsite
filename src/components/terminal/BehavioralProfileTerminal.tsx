import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTypewriter } from './useTypewriter';
import { TerminalLine } from './TerminalLine';
import { useTerminalScroll } from './useTerminalScroll';
import { terminalAudio } from '@/utils/terminalAudio';
import { BEHAVIORAL_FACTORS, FactorData, AspectData } from './behavioralProfileData';

interface BehavioralProfileTerminalProps {
  onBackToMenu: () => void;
  onRestart: () => void;
  onSelectOtherMode: (modeId: number) => void;
}

type ViewState =
  | 'intro'
  | 'system_map'
  | 'executive_summary'
  | 'strengths'
  | 'challenges'
  | 'factor_choice'
  | 'factor_view'
  | 'summary_view'
  | 'exit';

const CHOICE_OPTIONS = [
  'agreeableness',
  'conscientiousness',
  'extraversion',
  'emotional_stability',
  'openness',
  'summary'
];

// Reusable animated terminal-native score distribution graph
interface TerminalDistributionGraphProps {
  title: string;
  leftLabel: string;
  rightLabel: string;
  score: number;
  status: string;
  percentile: string;
  isActive: boolean;
  onAnimationComplete: () => void;
}

const TerminalDistributionGraph: React.FC<TerminalDistributionGraphProps> = ({
  title,
  leftLabel,
  rightLabel,
  score,
  status,
  percentile,
  isActive,
  onAnimationComplete
}) => {
  const [drawStep, setDrawStep] = useState<number>(0); // 0: init, 1: scale dots, 2: arrow marker, 3: locked/info
  const [dotsCount, setDotsCount] = useState<number>(0);

  useEffect(() => {
    if (!isActive) {
      setDrawStep(0);
      setDotsCount(0);
      return;
    }

    setDrawStep(1);
    let currentDots = 0;
    const interval = setInterval(() => {
      if (currentDots < 32) {
        setDotsCount(prev => prev + 1);
        currentDots++;
        terminalAudio.playKeyClick();
      } else {
        clearInterval(interval);
        // Step 2: Show arrow marker after brief delay
        setTimeout(() => {
          setDrawStep(2);
          terminalAudio.playKeyClick();
          // Step 3: Show score data and lock in results
          setTimeout(() => {
            setDrawStep(3);
            terminalAudio.playEnterSound();
            onAnimationComplete();
          }, 600);
        }, 400);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [isActive]);

  // Compute text margins for graph alignment
  const leftLabelOffset = 16; // Pad left label to exactly 16 chars
  const paddedLeftLabel = leftLabel.padEnd(leftLabelOffset, ' ');
  
  const dotIndex = Math.round((score / 10) * 31);
  const arrowIndex = leftLabelOffset + 1 + dotIndex; // left space + | + position
  
  const labelText = `Abdullah Malik (${score})`;
  const labelIndex = Math.max(0, arrowIndex - Math.round(labelText.length / 2));

  const scaleDotsString = '.'.repeat(dotsCount).padEnd(32, ' ');

  return (
    <div className="py-2 text-[10px] xs:text-xs sm:text-sm md:text-base leading-none font-mono whitespace-pre tracking-tighter text-[#ffb000]">
      <div className="text-[#00ff66] font-bold pb-1">[{title}]</div>
      
      {drawStep >= 1 && (
        <div>
          {paddedLeftLabel}
          <span>|</span>
          <span className="text-[#ffb000]/60">{scaleDotsString}</span>
          <span>|</span>
          <span className="pl-4">{rightLabel}</span>
        </div>
      )}

      {drawStep >= 2 && (
        <div className="text-[#00ff66] font-bold">
          <div>{' '.repeat(arrowIndex)}▲</div>
          <div>
            {' '.repeat(labelIndex)}
            {labelText}
            {drawStep === 2 && <span className="text-[#ffb000] animate-pulse">█</span>}
          </div>
        </div>
      )}

      {drawStep >= 3 && (
        <div className="mt-2 text-white font-normal pl-2 border-l border-[#00ff66]/30 space-y-1">
          <div>Status: <span className="text-[#00ff66] font-bold">{status}</span></div>
          <div>Percentile band: <span className="text-[#ffb000] font-bold">{percentile}</span></div>
        </div>
      )}
    </div>
  );
};

const INTRO_LINES = [
  '> run personality_analysis',
  '',
  'Loading behavioral dataset...',
  'Mapping personality architecture...',
  'Applying Five Factor model...',
  'Calibrating interpersonal traits...',
  'Linking strengths, risks, and work-style preferences...',
  '',
  'Profile constructed.',
  ''
];

export const BehavioralProfileTerminal: React.FC<BehavioralProfileTerminalProps> = ({
  onBackToMenu,
  onRestart,
  onSelectOtherMode
}) => {
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);
  const [activeAspectStep, setActiveAspectStep] = useState<number>(0); // 0: main factor, 1: aspect 1, 2: aspect 2, 3: aspect 3
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFlickering, setIsFlickering] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  // Line-by-line reveal animation states
  const [revealStep, setRevealStep] = useState<number>(0);

  // Graph state locks
  const [isMainGraphDone, setIsMainGraphDone] = useState<boolean>(false);
  const [isAspectGraphDone, setIsAspectGraphDone] = useState<boolean>(false);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute total reveal steps for current viewState
  const currentMaxSteps = useMemo(() => {
    switch (viewState) {
      case 'system_map': return 7;
      case 'executive_summary': return 5;
      case 'strengths': return 3;
      case 'challenges': return 3;
      case 'summary_view': return 7;
      case 'exit': return 4;
      default: return 0;
    }
  }, [viewState]);

  // Effect to automatically increment reveal step for staged text sections
  useEffect(() => {
    if (viewState === 'intro' || viewState === 'factor_choice' || viewState === 'factor_view') {
      setRevealStep(100); // bypass reveal limits
      return;
    }

    setRevealStep(0);
    let step = 0;
    const interval = setInterval(() => {
      if (step < currentMaxSteps) {
        step++;
        setRevealStep(step);
        terminalAudio.playKeyClick();
      } else {
        clearInterval(interval);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [viewState, currentMaxSteps]);

  const isRevealing = revealStep < currentMaxSteps;

  const skipReveal = () => {
    setRevealStep(100);
    terminalAudio.playKeyClick();
  };

  // Focus input automatically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [viewState, selectedFactorId, activeAspectStep, isProcessing]);

  // Combined screen switcher with CRT flicker and glitch sounds
  const triggerFlickerAndChangeState = (nextState: ViewState, factorId: string | null = null, aspectStep = 0) => {
    setIsProcessing(true);
    terminalAudio.playGlitchSound();
    setIsFlickering(true);

    setTimeout(() => {
      setIsFlickering(false);
    }, 300);

    setTimeout(() => {
      setViewState(nextState);
      setSelectedFactorId(factorId);
      setActiveAspectStep(aspectStep);
      setIsMainGraphDone(false);
      setIsAspectGraphDone(false);
      setIsProcessing(false);
    }, 450);
  };

  // Compile active target text lines depending on the view state
  const activeStepTargetLines = useMemo((): string[] => {
    if (viewState === 'intro') {
      return INTRO_LINES;
    }
    return [];
  }, [viewState]);

  // Typewriter hook for intro
  const { typedLines, isTyping, skip } = useTypewriter(
    activeStepTargetLines,
    14,
    !isProcessing && activeStepTargetLines.length > 0,
    () => {}
  );

  // Auto-scroll screen
  useTerminalScroll(scrollAnchorRef, [
    typedLines,
    isTyping,
    viewState,
    selectedFactorId,
    activeAspectStep,
    isMainGraphDone,
    isAspectGraphDone,
    revealStep
  ]);

  const activeFactorData = useMemo((): FactorData | undefined => {
    return BEHAVIORAL_FACTORS.find(f => f.id === selectedFactorId);
  }, [selectedFactorId]);

  const activeAspectData = useMemo((): AspectData | undefined => {
    if (!activeFactorData || activeAspectStep === 0) return undefined;
    return activeFactorData.aspects[activeAspectStep - 1];
  }, [activeFactorData, activeAspectStep]);

  // Step-back transition logic
  const handleBackStep = () => {
    if (isProcessing) return;

    terminalAudio.playKeyClick();

    if (viewState === 'system_map') {
      triggerFlickerAndChangeState('intro');
    } else if (viewState === 'executive_summary') {
      triggerFlickerAndChangeState('system_map');
    } else if (viewState === 'strengths') {
      triggerFlickerAndChangeState('executive_summary');
    } else if (viewState === 'challenges') {
      triggerFlickerAndChangeState('strengths');
    } else if (viewState === 'factor_choice') {
      triggerFlickerAndChangeState('challenges');
    } else if (viewState === 'factor_view') {
      if (activeAspectStep === 0) {
        triggerFlickerAndChangeState('factor_choice');
      } else if (activeAspectStep === 1) {
        setActiveAspectStep(0);
        setIsMainGraphDone(true);
      } else if (activeAspectStep === 2) {
        setActiveAspectStep(1);
        setIsAspectGraphDone(true);
      } else if (activeAspectStep === 3) {
        setActiveAspectStep(2);
        setIsAspectGraphDone(true);
      }
    } else if (viewState === 'summary_view') {
      triggerFlickerAndChangeState('factor_choice');
    } else if (viewState === 'exit') {
      triggerFlickerAndChangeState('summary_view');
    } else if (viewState === 'intro') {
      onBackToMenu();
    }
  };

  const handleProgress = () => {
    if (isProcessing) return;

    if (isTyping) {
      skip();
      return;
    }

    if (isRevealing) {
      skipReveal();
      return;
    }

    if (viewState === 'intro') {
      triggerFlickerAndChangeState('system_map');
    } else if (viewState === 'system_map') {
      triggerFlickerAndChangeState('executive_summary');
    } else if (viewState === 'executive_summary') {
      triggerFlickerAndChangeState('strengths');
    } else if (viewState === 'strengths') {
      triggerFlickerAndChangeState('challenges');
    } else if (viewState === 'challenges') {
      triggerFlickerAndChangeState('factor_choice');
    } else if (viewState === 'factor_view') {
      // Manage sequential aspect reveals inside factor deep dive
      if (activeAspectStep === 0 && isMainGraphDone) {
        setActiveAspectStep(1);
        setIsAspectGraphDone(false);
        terminalAudio.playEnterSound();
      } else if (activeAspectStep === 1 && isAspectGraphDone) {
        setActiveAspectStep(2);
        setIsAspectGraphDone(false);
        terminalAudio.playEnterSound();
      } else if (activeAspectStep === 2 && isAspectGraphDone) {
        setActiveAspectStep(3);
        setIsAspectGraphDone(false);
        terminalAudio.playEnterSound();
      }
    } else if (viewState === 'summary_view') {
      triggerFlickerAndChangeState('exit');
    }
  };

  const handleCommandFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim().toLowerCase();

    // Support empty enter submits for choice selections
    if (!val) {
      if (isRevealing) {
        skipReveal();
        return;
      }
      if (viewState === 'factor_choice') {
        const selectedOpt = CHOICE_OPTIONS[selectedOptionIndex];
        if (selectedOpt === 'summary') {
          triggerFlickerAndChangeState('summary_view');
        } else {
          triggerFlickerAndChangeState('factor_view', selectedOpt, 0);
        }
        return;
      }
      handleProgress();
      return;
    }

    terminalAudio.playEnterSound();

    // Universal Shell commands
    if (val === 'restart') {
      onRestart();
      setInputVal('');
      return;
    }

    if (val === 'connect' || val === 'reach') {
      window.location.href = '/reach-me';
      setInputVal('');
      return;
    }

    if (val === 'explore' || val === 'menu' || val === 'back') {
      handleBackStep();
      setInputVal('');
      return;
    }

    // Main Selection deep-dive routing
    if (viewState === 'factor_choice') {
      const matchedFactor = BEHAVIORAL_FACTORS.find(
        f => f.id === val || f.title.toLowerCase() === val
      );
      if (matchedFactor) {
        triggerFlickerAndChangeState('factor_view', matchedFactor.id, 0);
        setInputVal('');
        return;
      }

      if (val === 'summary' || val === 'profile') {
        triggerFlickerAndChangeState('summary_view');
        setInputVal('');
        return;
      }
    }

    // Sequenced Factor navigation shortcut
    if (viewState === 'factor_view' && activeAspectStep === 3 && isAspectGraphDone) {
      if (val === 'next') {
        const currentIdx = BEHAVIORAL_FACTORS.findIndex(f => f.id === selectedFactorId);
        if (currentIdx !== -1 && currentIdx < BEHAVIORAL_FACTORS.length - 1) {
          // Go to next factor
          const nextFactor = BEHAVIORAL_FACTORS[currentIdx + 1];
          triggerFlickerAndChangeState('factor_view', nextFactor.id, 0);
        } else {
          // Finished all factors, go to final summary
          triggerFlickerAndChangeState('summary_view');
        }
        setInputVal('');
        return;
      }
    }

    // Exit State explore redirects
    if (viewState === 'exit') {
      if (val === 'origin' || val === '1') {
        onSelectOtherMode(1);
        setInputVal('');
        return;
      }
      if (val === 'career' || val === '2') {
        onSelectOtherMode(2);
        setInputVal('');
        return;
      }
      if (val === 'journey' || val === '3') {
        onSelectOtherMode(3);
        setInputVal('');
        return;
      }
      if (val === 'cognitive' || val === '4') {
        onSelectOtherMode(4);
        setInputVal('');
        return;
      }
      if (val === 'certifications' || val === '5') {
        onSelectOtherMode(6);
        setInputVal('');
        return;
      }
    }

    setInputVal('');
  };

  // Keyboard shortcut listener for Enter, Backspace and Arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Arrow navigations inside choice directory
      if (viewState === 'factor_choice') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedOptionIndex(prev => (prev - 1 + CHOICE_OPTIONS.length) % CHOICE_OPTIONS.length);
          terminalAudio.playKeyClick();
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedOptionIndex(prev => (prev + 1) % CHOICE_OPTIONS.length);
          terminalAudio.playKeyClick();
          return;
        }
      }

      // 2. Back navigation triggers
      if (e.key === 'Backspace') {
        if (document.activeElement === inputRef.current && inputVal !== '') {
          // Allow normal typing deleting if input has value
          return;
        }
        e.preventDefault();
        handleBackStep();
        return;
      }

      // 3. Forward progression
      if (e.key === 'Enter') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          handleProgress();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTyping,
    viewState,
    isProcessing,
    activeAspectStep,
    isMainGraphDone,
    isAspectGraphDone,
    selectedOptionIndex,
    inputVal,
    revealStep
  ]);

  return (
    <div className={`flex flex-col justify-between h-full min-h-[460px] text-[#ffb000] font-mono text-sm sm:text-base md:text-lg leading-relaxed select-none ${isFlickering ? 'flicker-effect' : ''}`}>
      
      {/* Scoped CSS animation for highly pronounced phosphor CRT screen glitch flicker */}
      <style>{`
        @keyframes terminal-flicker-anim {
          0% { opacity: 0.25; transform: scaleY(0.96); filter: brightness(1.3) contrast(1.1); }
          12% { opacity: 0.9; transform: scaleY(1.02); filter: brightness(1.05); }
          25% { opacity: 0.15; transform: scaleY(0.92); filter: brightness(0.7) contrast(0.9); }
          37% { opacity: 0.8; transform: scaleY(1.01); filter: brightness(1.1); }
          50% { opacity: 0.3; transform: scaleY(0.97); filter: brightness(0.85); }
          62% { opacity: 0.95; transform: scaleY(1); }
          100% { opacity: 1; filter: brightness(1) contrast(1); }
        }
        .flicker-effect {
          animation: terminal-flicker-anim 0.35s ease-in-out;
        }
      `}</style>

      {/* Top Header Ribbon */}
      <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66] font-bold">
            PATH: BEHAVIORAL_PROFILE // SECTOR_{viewState.toUpperCase()}
          </span>
          <span className="hidden sm:inline text-[#ffb000]/40">|</span>
          <span className="hidden sm:inline text-[#ffb000]/60">
            [ENTER: NEXT | BACKSPACE: BACK]
          </span>
        </div>
        <button
          onClick={onBackToMenu}
          className="text-xs text-[#ffb000] hover:underline cursor-pointer font-bold"
        >
          [MENU]
        </button>
      </div>

      {/* Screen Log Viewport */}
      <div className="flex-1 py-4 flex flex-col justify-start overflow-y-auto">
        <div className="flex flex-col gap-1 text-white">

          {/* Intro Diagnostic Scan Stage */}
          {viewState === 'intro' && (
            <>
              {typedLines.map((line, idx) => {
                const isCurrentLine = idx === typedLines.length - 1 && isTyping;
                return (
                  <TerminalLine
                    key={`intro-${idx}`}
                    text={line}
                    isCurrentLine={isCurrentLine}
                  />
                );
              })}
              {!isTyping && (
                <div className="pt-3 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                  <span>{"\u003E\u003E\u003E"} Press ENTER to view system map</span>
                </div>
              )}
            </>
          )}

          {/* Top-Level System Map */}
          {viewState === 'system_map' && (
            <div className="flex flex-col gap-4 pt-2">
              {revealStep >= 1 && <div className="text-[#00ff66] font-bold">&gt; run personality_analysis --view=system_map</div>}
              {revealStep >= 2 && (
                <div>
                  <div className="text-[#00ff66] font-bold">[BEHAVIORAL SYSTEM MAP]</div>
                  <div className="text-[#ffb000]/60 text-xs mt-0.5 font-light">Assessment conducted by Alva Labs AB</div>
                </div>
              )}
              
              <div className="space-y-1.5 font-bold text-sm sm:text-base mt-2">
                {revealStep >= 3 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-white w-48 block">Agreeableness</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00ff66]">████████░░</span>
                      <span className="text-[#ffb000]">Friendly</span>
                    </div>
                  </div>
                )}
                {revealStep >= 4 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-white w-48 block">Conscientiousness</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00ff66]">███████░░░</span>
                      <span className="text-[#ffb000]">Diligent</span>
                    </div>
                  </div>
                )}
                {revealStep >= 5 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-white w-48 block">Extraversion</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00ff66]">███████░░░</span>
                      <span className="text-[#ffb000]">Outgoing</span>
                    </div>
                  </div>
                )}
                {revealStep >= 6 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-white w-48 block">Emotional Stability</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00ff66]">███████░░░</span>
                      <span className="text-[#ffb000]">Resilient</span>
                    </div>
                  </div>
                )}
                {revealStep >= 7 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-white w-48 block">Openness</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00ff66]">██████░░░░</span>
                      <span className="text-[#ffb000]">Balanced</span>
                    </div>
                  </div>
                )}
              </div>

              {!isRevealing && (
                <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                  <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                </div>
              )}
            </div>
          )}

          {/* Executive Summary */}
          {viewState === 'executive_summary' && (
            <div className="flex flex-col gap-3 pt-2">
              {revealStep >= 1 && <div className="text-[#00ff66] font-bold">&gt; query personality_database --factor=summary</div>}
              {revealStep >= 2 && <div className="text-[#00ff66] font-bold">[EXECUTIVE SUMMARY]</div>}
              
              <div className="space-y-3 pl-2 text-white">
                {revealStep >= 3 && (
                  <div>
                    Profile pattern detected:<br />
                    <span className="text-[#ffb000] font-bold">High-trust operator with strong execution energy</span>
                  </div>
                )}
                {revealStep >= 4 && (
                  <div className="space-y-1 font-bold">
                    <div>This behavioural system is optimised for:</div>
                    {revealStep >= 5 && (
                      <div className="text-[#00ff66]">
                        <div>- collaboration</div>
                        <div>- speed with responsibility</div>
                        <div>- high-pressure delivery</div>
                        <div>- cross-functional environments</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isRevealing && (
                <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                  <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                </div>
              )}
            </div>
          )}

          {/* Possible Strengths */}
          {viewState === 'strengths' && (
            <div className="flex flex-col gap-3 pt-2">
              {revealStep >= 1 && <div className="text-[#00ff66] font-bold">&gt; query personality_database --factor=strengths</div>}
              {revealStep >= 2 && <div className="text-[#00ff66] font-bold">[POSSIBLE STRENGTHS]</div>}
              
              {revealStep >= 3 && (
                <div className="space-y-2 font-bold text-[#00ff66] pl-2">
                  <div>→ Works hard to benefit the team and achieve common goals</div>
                  <div>→ Warm and friendly people person; makes others comfortable</div>
                  <div>→ Highly productive and able to work at a high tempo</div>
                </div>
              )}

              {!isRevealing && (
                <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                  <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                </div>
              )}
            </div>
          )}

          {/* Possible Challenges */}
          {viewState === 'challenges' && (
            <div className="flex flex-col gap-3 pt-2">
              {revealStep >= 1 && <div className="text-[#00ff66] font-bold">&gt; query personality_database --factor=challenges</div>}
              {revealStep >= 2 && <div className="text-[#00ff66] font-bold">[POSSIBLE CHALLENGES]</div>}
              
              {revealStep >= 3 && (
                <div className="space-y-2 font-bold text-[#ffb000] pl-2">
                  <div>→ Tends to have a hard time saying no and limit workload</div>
                  <div>→ May forget own needs while attending to others</div>
                  <div>→ Could come across as pushy when wanting things done</div>
                </div>
              )}

              {!isRevealing && (
                <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                  <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                </div>
              )}
            </div>
          )}

          {/* Main deep dive choice query with interactive arrow lists */}
          {viewState === 'factor_choice' && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="text-[#00ff66] font-bold">&gt; query personality_database --mode=deep_dive</div>
              <div className="text-white">Classification complete. Diagnostic matrix loaded.</div>
              <div className="text-xs text-[#ffb000]/30">--------------------------------------------------</div>

              <div className="text-[#00ff66] font-bold">[BEHAVIORAL DIRECTORY SECTORS]</div>
              <div className="pl-2 space-y-1 font-bold">
                {CHOICE_OPTIONS.map((opt, idx) => {
                  const isSelected = idx === selectedOptionIndex;
                  return (
                    <div
                      key={opt}
                      onClick={() => {
                        setSelectedOptionIndex(idx);
                        triggerFlickerAndChangeState(
                          opt === 'summary' ? 'summary_view' : 'factor_view',
                          opt === 'summary' ? null : opt,
                          0
                        );
                      }}
                      className="cursor-pointer flex items-center gap-2 group text-sm sm:text-base"
                    >
                      {isSelected ? (
                        <span className="text-[#00ff66] font-bold">
                          ► {opt === 'summary' ? 'summary (view work-fit mapping summary)' : opt}
                        </span>
                      ) : (
                        <span className="text-white/60 group-hover:text-white transition-colors">
                          &nbsp;&nbsp;{opt === 'summary' ? 'summary (view work-fit mapping summary)' : opt}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-[#00ff66] text-xs sm:text-sm pl-1 opacity-70 mt-2">
                [Use Up/Down Arrow keys to navigate menu, ENTER to execute]
              </div>
            </div>
          )}

          {/* Interactive factor view */}
          {viewState === 'factor_view' && activeFactorData && (
            <div className="flex flex-col gap-4">
              
              {/* Main Factor Graph */}
              <TerminalDistributionGraph
                title={activeFactorData.title}
                leftLabel={activeFactorData.leftLabel}
                rightLabel={activeFactorData.rightLabel}
                score={activeFactorData.score}
                status={activeFactorData.status}
                percentile={activeFactorData.percentile}
                isActive={activeAspectStep === 0}
                onAnimationComplete={() => setIsMainGraphDone(true)}
              />

              {/* Main interpretation text displayed when main graph completes */}
              {activeAspectStep === 0 && isMainGraphDone && (
                <div className="pl-2 space-y-2 mt-2 border-l border-[#ffb000]/20 text-white">
                  <p>{activeFactorData.interpretation}</p>
                  
                  <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                    <span>{"\u003E\u003E\u003E"} Press ENTER for aspects</span>
                  </div>
                </div>
              )}

              {/* Aspect 1 Reveal */}
              {activeAspectStep >= 1 && (
                <div className="border-t border-[#ffb000]/10 pt-4 flex flex-col gap-3">
                  <TerminalDistributionGraph
                    title={activeFactorData.aspects[0].title}
                    leftLabel={activeFactorData.aspects[0].leftLabel}
                    rightLabel={activeFactorData.aspects[0].rightLabel}
                    score={activeFactorData.aspects[0].score}
                    status={activeFactorData.aspects[0].status}
                    percentile={activeFactorData.aspects[0].percentile}
                    isActive={activeAspectStep === 1}
                    onAnimationComplete={() => setIsAspectGraphDone(true)}
                  />

                  {activeAspectStep === 1 && isAspectGraphDone && (
                    <div className="pl-2 space-y-2 mt-1 border-l border-[#00ff66]/30 text-white">
                      <div className="text-[#00ff66] font-bold text-xs">SIGNALS:</div>
                      {activeFactorData.aspects[0].signals.map((sig, idx) => (
                        <div key={`sig-0-${idx}`}>→ {sig}</div>
                      ))}
                      
                      <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                        <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aspect 2 Reveal */}
              {activeAspectStep >= 2 && (
                <div className="border-t border-[#ffb000]/10 pt-4 flex flex-col gap-3">
                  <TerminalDistributionGraph
                    title={activeFactorData.aspects[1].title}
                    leftLabel={activeFactorData.aspects[1].leftLabel}
                    rightLabel={activeFactorData.aspects[1].rightLabel}
                    score={activeFactorData.aspects[1].score}
                    status={activeFactorData.aspects[1].status}
                    percentile={activeFactorData.aspects[1].percentile}
                    isActive={activeAspectStep === 2}
                    onAnimationComplete={() => setIsAspectGraphDone(true)}
                  />

                  {activeAspectStep === 2 && isAspectGraphDone && (
                    <div className="pl-2 space-y-2 mt-1 border-l border-[#00ff66]/30 text-white">
                      <div className="text-[#00ff66] font-bold text-xs">SIGNALS:</div>
                      {activeFactorData.aspects[1].signals.map((sig, idx) => (
                        <div key={`sig-1-${idx}`}>→ {sig}</div>
                      ))}
                      
                      <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                        <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aspect 3 Reveal */}
              {activeAspectStep >= 3 && (
                <div className="border-t border-[#ffb000]/10 pt-4 flex flex-col gap-3">
                  <TerminalDistributionGraph
                    title={activeFactorData.aspects[2].title}
                    leftLabel={activeFactorData.aspects[2].leftLabel}
                    rightLabel={activeFactorData.aspects[2].rightLabel}
                    score={activeFactorData.aspects[2].score}
                    status={activeFactorData.aspects[2].status}
                    percentile={activeFactorData.aspects[2].percentile}
                    isActive={activeAspectStep === 3}
                    onAnimationComplete={() => setIsAspectGraphDone(true)}
                  />

                  {activeAspectStep === 3 && isAspectGraphDone && (
                    <div className="pl-2 space-y-2 mt-1 border-l border-[#00ff66]/30 text-white font-bold">
                      <div className="text-[#00ff66] text-xs">SIGNALS:</div>
                      {activeFactorData.aspects[2].signals.map((sig, idx) => (
                        <div key={`sig-2-${idx}`}>→ {sig}</div>
                      ))}

                      <div className="mt-4 pt-4 border-t border-[#ffb000]/20 flex flex-col gap-1 text-[#ffb000]/70 text-xs font-normal">
                        <div>Detailed analysis complete for sector {activeFactorData.id}.</div>
                        <div>
                          Type{' '}
                          <span className="text-[#00ff66]">
                            {selectedFactorId === 'openness' ? 'summary' : 'next'}
                          </span>{' '}
                          to progress, or <span className="text-[#00ff66]">back</span> to return.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Final Work Fit Summary */}
          {viewState === 'summary_view' && (
            <div className="flex flex-col gap-4 pt-2">
              {revealStep >= 1 && <div className="text-[#00ff66] font-bold">&gt; run behavioral_system_fit --mode=summary</div>}
              {revealStep >= 2 && <div className="text-[#00ff66] font-bold">[BEHAVIORAL SYSTEM SUMMARY]</div>}

              <div className="space-y-4 pl-2 text-white">
                {revealStep >= 3 && (
                  <div>
                    <div className="text-[#ffb000] font-bold">Profile type:</div>
                    <div className="pl-2">High-trust execution operator</div>
                  </div>
                )}

                {revealStep >= 4 && (
                  <div className="space-y-1">
                    <div className="text-[#ffb000] font-bold">Strength bias:</div>
                    <div className="pl-2 space-y-0.5 text-[#00ff66]">
                      <div>→ Collaboration</div>
                      <div>→ Responsibility</div>
                      <div>→ High tempo execution</div>
                      <div>→ Composure under pressure</div>
                    </div>
                  </div>
                )}

                {revealStep >= 5 && (
                  <div className="space-y-1">
                    <div className="text-[#ffb000] font-bold">Constraint vector:</div>
                    <div className="pl-2 space-y-0.5 text-[#ff3333]">
                      <div>→ Workload boundary risk</div>
                      <div>→ Conflict avoidance tendency</div>
                      <div>→ May over-accommodate others</div>
                    </div>
                  </div>
                )}

                {revealStep >= 6 && (
                  <div className="space-y-1">
                    <div className="text-[#ffb000] font-bold">Preferred environment:</div>
                    <div className="pl-2 space-y-0.5">
                      <div>→ Team-oriented</div>
                      <div>→ Supportive</div>
                      <div>→ Innovative</div>
                    </div>
                  </div>
                )}

                {revealStep >= 7 && (
                  <div className="space-y-1">
                    <div className="text-[#ffb000] font-bold">Likely work-fit signals:</div>
                    <div className="pl-2 space-y-0.5">
                      <div>→ Sales</div>
                      <div>→ Customer Service</div>
                      <div>→ Creative roles</div>
                    </div>
                  </div>
                )}

                {revealStep >= 7 && (
                  <div className="text-[#00ff66] font-bold pt-2">
                    &gt;&gt;&gt; Behavioral system calibrated for enterprise environments
                  </div>
                )}
              </div>

              {!isRevealing && (
                <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                  <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                </div>
              )}
            </div>
          )}

          {/* Final Exit State */}
          {viewState === 'exit' && (
            <div className="flex flex-col gap-3 pt-2">
              {revealStep >= 1 && (
                <>
                  <div className="text-[#ffb000]/30 text-xs">--------------------------------------------------</div>
                  <div className="text-[#00ff66] font-bold text-lg sm:text-xl">
                    {"\u003E\u003E\u003E"} End of Behavioral Profile
                  </div>
                </>
              )}

              {revealStep >= 2 && (
                <div className="text-white font-normal space-y-1">
                  <div>Behavioral profile loaded successfully.</div>
                  <div>You can restart the system, connect with me, or continue exploring the journey.</div>
                </div>
              )}

              {revealStep >= 3 && (
                <div className="text-[#ffb000] font-bold pt-2">
                  {"\u003E\u003E\u003E"} type: restart | connect | explore
                </div>
              )}

              {revealStep >= 4 && (
                <div className="pt-2 text-white/90 space-y-2">
                  <div className="text-[#00ff66] font-bold">If explore:</div>
                  <div className="pl-4 space-y-1 font-bold">
                    <div>1. Origin Story</div>
                    <div>2. Career Evolution</div>
                    <div>3. From Marketing to AI Transformation Journey</div>
                    <div>4. Cognitive Profile</div>
                    <div>5. Certifications</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        <div ref={scrollAnchorRef} />
      </div>

      {/* Input prompt field */}
      <form onSubmit={handleCommandFormSubmit} className="flex items-center gap-3 w-full border-t border-[#ffb000]/20 pt-4">
        <span className="text-[#00ff66] font-bold whitespace-nowrap">
          {"\u003E\u003E\u003E"} Insert command:
        </span>
        <div className="relative flex-1 flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isProcessing}
            placeholder={
              isProcessing
                ? "querying database register..."
                : isTyping || isRevealing
                ? "press ENTER to skip typing..."
                : viewState === 'intro'
                ? "press ENTER to view system map..."
                : viewState === 'system_map'
                ? "press ENTER to load summary..."
                : viewState === 'executive_summary'
                ? "press ENTER to view strengths..."
                : viewState === 'strengths'
                ? "press ENTER to view challenges..."
                : viewState === 'challenges'
                ? "press ENTER to load Deep Dive menu..."
                : viewState === 'factor_choice'
                ? "type factor (e.g. agreeableness) or summary..."
                : viewState === 'factor_view'
                ? activeAspectStep < 3 || !isAspectGraphDone
                  ? "press ENTER to progress diagnostics..."
                  : selectedFactorId === 'openness'
                  ? "type summary or back..."
                  : "type next or back..."
                : viewState === 'summary_view'
                ? "press ENTER to continue..."
                : "type restart, connect or 1-5..."
            }
            className="w-full bg-transparent border-none outline-none font-mono text-sm sm:text-base text-[#ffb000] placeholder:text-[#ffb000]/30 disabled:text-[#ffb000]/30"
            autoFocus
          />
          {!isProcessing && (
            <span className="w-2 h-5 bg-[#ffb000] ml-0.5 animate-pulse inline-block" />
          )}
        </div>
      </form>

    </div>
  );
};
