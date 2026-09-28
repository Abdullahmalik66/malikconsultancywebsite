import React, { useState, useEffect, useRef, useMemo } from 'react';
import { terminalAudio } from '@/utils/terminalAudio';
import { STEP_LINES, TerminalItem } from './terminalConstants';
import { TerminalLine } from './TerminalLine';
import { useTypewriter } from './useTypewriter';
import { useTerminalScroll } from './useTerminalScroll';

interface CertificationsTerminalProps {
  onBackToMenu: () => void;
  onRestart: () => void;
  onSelectOtherMode: (modeId: number) => void;
}

type ViewState = 'intro' | 'query_select' | 'sector_display';

export const CertificationsTerminal: React.FC<CertificationsTerminalProps> = ({
  onBackToMenu,
  onRestart,
  onSelectOtherMode
}) => {
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFlickering, setIsFlickering] = useState<boolean>(false);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compile active target lines depending on the view state
  const activeStepTargetLines = useMemo((): TerminalItem[] => {
    if (viewState === 'intro') {
      return STEP_LINES[1] || [];
    }
    if (viewState === 'sector_display') {
      if (selectedSector === 5) {
        // Concatenate all domains for full register printout
        return [
          ...(STEP_LINES[2] || []),
          ...(STEP_LINES[3] || []),
          ...(STEP_LINES[4] || []),
          ...(STEP_LINES[5] || [])
        ];
      }
      if (selectedSector && selectedSector >= 1 && selectedSector <= 4) {
        // Map sectors 1-4 to steps 2-5
        return STEP_LINES[selectedSector + 1] || [];
      }
    }
    return [];
  }, [viewState, selectedSector]);

  const activeTextOnlyLines = useMemo(() => {
    return activeStepTargetLines.map(item => item.text);
  }, [activeStepTargetLines]);

  // Typewriter hook for the current display lines
  const { typedLines, isTyping, skip } = useTypewriter(
    activeTextOnlyLines,
    14, // Slightly faster for snappier queries
    !isProcessing && activeTextOnlyLines.length > 0,
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
  const triggerFlickerAndChangeState = (nextState: ViewState, sectorId?: number) => {
    setIsProcessing(true);
    terminalAudio.playGlitchSound();
    setIsFlickering(true);

    setTimeout(() => {
      setIsFlickering(false);
    }, 300);

    setTimeout(() => {
      if (sectorId !== undefined) {
        setSelectedSector(sectorId);
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
      triggerFlickerAndChangeState('query_select');
    }
  };

  const processQuerySelection = (sectorId: number) => {
    triggerFlickerAndChangeState('sector_display', sectorId);
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

    // Explore redirects to specific modes (only by command name, not raw numbers to avoid conflicts with 1-5 selection)
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
    if (val === 'journey' || val === 'transformation' || val === 'marketing to ai') {
      onSelectOtherMode(3);
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

    // Query domain selections (available in query_select or sector_display views)
    if (viewState === 'query_select' || viewState === 'sector_display') {
      if (['1', '2', '3', '4', '5'].includes(val)) {
        processQuerySelection(parseInt(val, 10));
        setInputVal('');
        return;
      }
      if (val.includes('marketing') || val.includes('analytics')) {
        processQuerySelection(1);
        setInputVal('');
        return;
      }
      if (val.includes('advertising') || val.includes('ad')) {
        processQuerySelection(2);
        setInputVal('');
        return;
      }
      if (val.includes('ai') && !val.includes('enterprise')) {
        processQuerySelection(3);
        setInputVal('');
        return;
      }
      if (val.includes('enterprise')) {
        processQuerySelection(4);
        setInputVal('');
        return;
      }
      if (val === 'all' || val === 'matrix') {
        processQuerySelection(5);
        setInputVal('');
        return;
      }
    }

    setInputVal('');
  };

  // Global ENTER progression shortcut
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

      {/* Top Header Ribbon */}
      <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66] font-bold">
            PATH: CERTIFICATIONS_MATRIX // VIEW_{viewState.toUpperCase()}
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

      {/* Screen Log Viewport */}
      <div className="flex-1 py-4 flex flex-col justify-start overflow-y-auto">
        <div className="flex flex-col gap-1">

          {/* Intro Typing View */}
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

          {/* Sector Selection Query Prompt */}
          {viewState === 'query_select' && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="text-[#00ff66] font-bold">
                &gt; load certifications_matrix --mode=interactive
              </div>
              <div className="text-white">Classification complete. Matrix indexing operational.</div>
              <div className="text-xs text-[#ffb000]/30">--------------------------------------------------</div>
              
              <div className="text-[#00ff66] font-bold">[CERTIFICATIONS DATABASE]</div>
              <div className="pl-2 space-y-1 font-bold text-white">
                <div>1. Marketing / Analytics</div>
                <div>2. Advertising</div>
                <div>3. AI / Generative AI / Systems</div>
                <div>4. Enterprise AI / Ecosystem</div>
                <div>5. All Domains (Full Register)</div>
              </div>

              <div className="text-[#00ff66] font-bold pt-2 animate-pulse">
                &gt;&gt;&gt; Enter sector code (1-5) or category name:
              </div>
            </div>
          )}

          {/* Sector Display Page */}
          {viewState === 'sector_display' && (
            <div className="flex flex-col gap-2">
              <div className="text-[#00ff66] font-bold">
                &gt; query certifications_database --domain={
                  selectedSector === 5 ? 'all' : `sector_0${selectedSector}`
                }
              </div>
              
              {/* Typewriter printout of the queried records */}
              {typedLines.map((line, idx) => {
                const isCurrentLine = idx === typedLines.length - 1 && isTyping;
                const originalItem = activeStepTargetLines[idx];
                return (
                  <TerminalLine
                    key={`sector-${idx}`}
                    text={line}
                    isCert={originalItem?.isCert}
                    certNameLength={originalItem?.certNameLength}
                    isCurrentLine={isCurrentLine}
                  />
                );
              })}

              {/* Follow-up Prompts shown when typing finishes */}
              {!isTyping && (
                <div className="mt-4 pt-4 border-t border-[#ffb000]/20 flex flex-col gap-4">
                  <div className="text-[#00ff66] font-bold">
                    &gt;&gt;&gt; Query completed successfully.
                  </div>
                  
                  <div className="text-white space-y-1">
                    <div>You can query another sector (1-5), restart the system,</div>
                    <div>reach me, or return to explore other chapters.</div>
                  </div>

                  <div className="text-[#00ff66] font-bold">
                    Domain list: 1. Marketing | 2. Advertising | 3. AI | 4. Enterprise AI | 5. All
                  </div>

                  <div className="text-[#ffb000]/70 text-xs">
                    If explore: 1. Origin Story | 2. Career Evolution | 3. From Marketing to AI Journey | 4. Cognitive Profile | 5. Behavioral Profile
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
                ? "contacting credentials registry..."
                : isTyping
                ? "press ENTER to bypass register printout..."
                : viewState === 'query_select'
                ? "type 1-5 or category name..."
                : viewState === 'sector_display'
                ? "query next sector (1-5) or type menu, restart..."
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
