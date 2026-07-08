import React, { useState, useEffect, useRef, useMemo } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';
import { TerminalLine } from './TerminalLine';
import { useTypewriter } from './useTypewriter';
import { useTerminalScroll } from './useTerminalScroll';

interface AITransformationJourneyTerminalProps {
  onBackToMenu: () => void;
  onRestart: () => void;
  onSelectOtherMode: (modeId: number) => void;
}

interface JourneyPhase {
  title: string;
  subtitle: string;
  lines: string[];
}

const JOURNEY_PHASES: Record<number, JourneyPhase> = {
  1: {
    title: '[PHASE 1: ANALYTICAL MARKETING & DATA STRATEGY]',
    subtitle: 'Transitioning from execution to metrics-driven targeting.',
    lines: [
      '• Transition from Lahore to Finland: Entered a new academic and professional landscape, triggering a shift toward engineering-minded workflows.',
      '• QuietOn (Digital Marketing Manager): Built the foundation of feature-based marketing. Collected multi-source presales user data, extracted customer behavior traits, and engineered analytical buyer personas.',
      '• Azerion (Regional scale): Directed multi-market search and display performance across Nordics and Portugal, managing operations within Microsoft Bing, Yahoo, and Gemini ad networks.'
    ]
  },
  2: {
    title: '[PHASE 2: SYSTEM PRODUCTISATION & FUNNEL ALIGNMENT]',
    subtitle: 'Converting custom workflows into repeatable, high-scale software engines.',
    lines: [
      '• Adpro (Growth Hacking Systems): Shifted from ad-hoc marketing tasks to system design, productising digital growth services into modular, predictable systems.',
      '• Revieve (ABM Revenue Engines): Unified enterprise alignment across Marketing, Sales, and Customer Success. Structured a holistic data funnel to track consumer journeys and optimize B2B2C conversion rates.'
    ]
  },
  3: {
    title: '[PHASE 3: DEEP DATA & ENTERPRISE AGENTIC AI]',
    subtitle: 'Engineering RAG architectures, custom LLM pipelines, and autonomous agents.',
    lines: [
      '• Avaus (GenAI Architecture): Bridged analytics and engineering to implement Finland\'s earliest business proof-of-concepts in Generative AI. Designed RAG setups and LLM prompt pipelines for Vaisala, VTT, and Pirelli Tyres.',
      '• VTT (AI Center of Excellence): Implementing production-grade enterprise automation. Building autonomous SDR agents in Salesforce, configuring Agentforce copilots, and designing corporate AI enablement training.'
    ]
  }
};

const INTRO_LINES = [
  '> load marketing_to_ai_transformation_journey',
  '',
  'System processing...',
  'Accessing classified transformation record...',
  'Decryption complete.',
  '',
  '--------------------------------------------------',
  '',
  '[TRANSFORMATION JOURNEY INDEX]',
  '',
  'Evolution of Abdullah Malik from a digital marketer',
  'into an Enterprise AI Agent Architect.',
  'This journey is cataloged into 3 chronological phases.',
  ''
];

type ViewState = 'intro' | 'menu' | 'phase_view';

export const AITransformationJourneyTerminal: React.FC<AITransformationJourneyTerminalProps> = ({
  onBackToMenu,
  onRestart,
  onSelectOtherMode
}) => {
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFlickering, setIsFlickering] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compile active target text lines depending on the view state
  const activeStepTargetLines = useMemo((): string[] => {
    if (viewState === 'intro') {
      return INTRO_LINES;
    }
    if (viewState === 'phase_view' && selectedPhase && JOURNEY_PHASES[selectedPhase]) {
      const phase = JOURNEY_PHASES[selectedPhase];
      return [
        '---',
        '',
        phase.title,
        `subtitle: ${phase.subtitle}`,
        '',
        ...phase.lines,
        ''
      ];
    }
    return [];
  }, [viewState, selectedPhase]);

  // Typewriter hook for current lines
  const { typedLines, isTyping, skip } = useTypewriter(
    activeStepTargetLines,
    14, // fast, crisp typing speed
    !isProcessing && activeStepTargetLines.length > 0,
    () => {
      // Stopped auto-transition to let the user manual press ENTER
    }
  );

  // Auto-scroll screen
  useTerminalScroll(scrollAnchorRef, [typedLines, isTyping, viewState, isProcessing]);

  // Maintain active input focus
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [viewState, isProcessing, isTyping]);

  // Combined transition handler with CRT flicker and synthesized audio glitches
  const triggerFlickerAndChangeState = (nextState: ViewState, phaseId?: number) => {
    setIsProcessing(true);
    terminalAudio.playGlitchSound();
    setIsFlickering(true);

    setTimeout(() => {
      setIsFlickering(false);
    }, 300);

    setTimeout(() => {
      if (phaseId !== undefined) {
        setSelectedPhase(phaseId);
      }
      setViewState(nextState);
      setIsProcessing(false);
    }, 450);
  };

  const handleProgress = () => {
    if (isProcessing) return;

    if (isTyping) {
      skip();
      return;
    }

    if (viewState === 'intro') {
      triggerFlickerAndChangeState('menu');
    }
  };

  const processPhaseSelection = (phaseId: number) => {
    triggerFlickerAndChangeState('phase_view', phaseId);
  };

  const handleCommandFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim().toLowerCase();

    if (!val) {
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
      onBackToMenu();
      setInputVal('');
      return;
    }

    // explore redirects (only by command name, not raw numbers to avoid conflicts with 1-3 selection)
    if (val === 'origin' || val === 'origin story') {
      onSelectOtherMode(1);
      setInputVal('');
      return;
    }
    if (val === 'career' || val === 'career evolution') {
      onSelectOtherMode(2);
      setInputVal('');
      return;
    }
    if (val === 'cognitive' || val === 'profile' || val === 'logic') {
      onSelectOtherMode(4);
      setInputVal('');
      return;
    }
    if (val === 'behavioral' || val === 'personality') {
      onSelectOtherMode(5);
      setInputVal('');
      return;
    }
    if (val === 'certifications' || val === 'cert') {
      onSelectOtherMode(6);
      setInputVal('');
      return;
    }

    // Selection query
    if (viewState === 'menu' || viewState === 'phase_view') {
      if (['1', '2', '3'].includes(val)) {
        processPhaseSelection(parseInt(val, 10));
        setInputVal('');
        return;
      }
    }

    setInputVal('');
  };

  // Keyboard listeners for quick ENTER bypass
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          handleProgress();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, viewState, isProcessing]);

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

      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66] font-bold">
            PATH: TRANSFORMATION_JOURNEY // SECTOR_{viewState.toUpperCase()}
          </span>
          <span className="hidden sm:inline text-[#ffb000]/40">|</span>
          <span className="hidden sm:inline text-[#ffb000]/60">
            [ENTER: NEXT]
          </span>
        </div>
        <button
          onClick={onBackToMenu}
          className="text-xs text-[#ffb000] hover:underline cursor-pointer font-bold"
        >
          [MENU]
        </button>
      </div>

      {/* Screen view log stream */}
      <div className="flex-1 py-4 flex flex-col justify-start overflow-y-auto">
        <div className="flex flex-col gap-1 text-white">

          {/* Intro Mode */}
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
                  <span>{"\u003E\u003E\u003E"} Press ENTER to initialize query interface</span>
                </div>
              )}
            </>
          )}

          {/* Phase Menu Selection */}
          {viewState === 'menu' && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="text-[#00ff66] font-bold">
                &gt; load marketing_to_ai_transformation_journey --mode=interactive
              </div>
              <div className="text-white">Classification complete. Journey registry database online.</div>
              <div className="text-xs text-[#ffb000]/30">--------------------------------------------------</div>
              
              <div className="text-[#00ff66] font-bold">[JOURNEY REGISTRY ARCHIVES]</div>
              <div className="pl-2 space-y-1 font-bold text-white">
                <div>1. Analytical Marketing & Data Strategy (Early Shift)</div>
                <div>2. System Productisation & Funnel Alignment (Growth Era)</div>
                <div>3. Deep Data & Enterprise Agentic AI (Agentic Era)</div>
              </div>

              <div className="text-[#00ff66] font-bold pt-2 animate-pulse">
                &gt;&gt;&gt; Enter sector code (1-3) to read phase profile:
              </div>
            </div>
          )}

          {/* Individual Phase Page View */}
          {viewState === 'phase_view' && (
            <div className="flex flex-col gap-2">
              <div className="text-[#00ff66] font-bold">
                &gt; query journey_log --sector=phase_0{selectedPhase}
              </div>

              {typedLines.map((line, idx) => {
                const isCurrentLine = idx === typedLines.length - 1 && isTyping;
                return (
                  <TerminalLine
                    key={`phase-${idx}`}
                    text={line}
                    isCurrentLine={isCurrentLine}
                  />
                );
              })}

              {!isTyping && (
                <div className="mt-4 pt-4 border-t border-[#ffb000]/20 flex flex-col gap-4">
                  <div className="text-[#00ff66] font-bold">
                    &gt;&gt;&gt; Phase profile loading complete.
                  </div>
                  
                  <div className="text-white space-y-1">
                    <div>You can read another phase (1-3), restart the system,</div>
                    <div>reach me, or return to explore other chapters.</div>
                  </div>

                  <div className="text-[#00ff66] font-bold">
                    Phase list: 1. Analytical Marketing | 2. Funnel Productisation | 3. Agentic AI
                  </div>

                  <div className="text-[#ffb000]/70 text-xs">
                    If explore: 1. Origin Story | 2. Career Evolution | 3. Cognitive Profile | 4. Behavioral Profile | 5. Certifications
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        <div ref={scrollAnchorRef} />
      </div>

      {/* Interactive Command Input Prompt */}
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
                ? "querying registry database..."
                : isTyping
                ? "press ENTER to bypass register printout..."
                : viewState === 'menu'
                ? "type 1-3 to load phase profile..."
                : viewState === 'phase_view'
                ? "load next phase (1-3) or type menu, restart..."
                : "press ENTER to progress..."
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
