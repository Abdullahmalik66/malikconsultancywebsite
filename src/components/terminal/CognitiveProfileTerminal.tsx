import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTypewriter } from './useTypewriter';
import { TerminalLine } from './TerminalLine';
import { useTerminalScroll } from './useTerminalScroll';
import { terminalAudio } from '../../lib/terminalAudio';

interface CognitiveProfileTerminalProps {
  onBackToMenu: () => void;
  onRestart: () => void;
  onSelectOtherMode: (modeId: number) => void;
}

type ViewState = 'intro' | 'graph_reveal' | 'command_branch' | 'exit';
type CommandBranchSubView = 'none' | 'explain' | 'raw';

const INTRO_LINES = [
  '> run cognitive_analysis',
  '',
  'Initializing cognitive scan...',
  'Loading assessment data...',
  'Mapping reasoning patterns...',
  'Benchmarking against population...',
  '',
  'Scan complete.',
  ''
];

const GRAPH_BASE_LINES = [
  '                ███',
  '             █████████',
  '          ███████████████',
  '       █████████████████████',
  '    ███████████████████████████',
  '--------------------------------------------',
  '  0    2    4    6    8    10',
];

const EXPLAIN_LINES = [
  '[INTERPRETATION]',
  '',
  'Logical score: 10',
  'Percentile: 98+',
  '',
  'This indicates:',
  '- Fast pattern recognition',
  '- Efficient processing of complex information',
  '- High abstraction capability',
  '',
  'Typical behaviour:',
  '→ Converts ambiguity into structured thinking',
  '→ Identifies patterns early',
  '→ Solves complex problems with less iteration',
  ''
];

const RAW_LINES = [
  '[RAW REPORT OUTPUT]',
  '',
  'Abdullah Malik - Logical ability',
  '',
  'Alva’s logic test assesses logical ability, i.e., how efficiently one processes complex information and draws accurate conclusions from it.',
  '',
  'Above average',
  '98th percentile and above.',
  '',
  'Your score on the logic test is 10, which is above average.',
  '',
  'Alva Labs interprets logical ability by benchmarking your score against others in the working population.',
  '',
  'A score of above average indicates a person often requires considerably less time and effort to interpret abstract information and form logical conclusions.',
  '',
  'People with similar scores often have the ability to acquire and apply new knowledge, interpret abstract information and reason logically. They tend to enjoy working with intellectually demanding problems and thus need to feel challenged to enjoy their work.',
  '',
  'Keep in mind when interpreting your results that logical ability is far from the only factor determining job performance or career success. Personality, motivation, values, and experience are also important, and strengths in one area may outweigh weaknesses in another.',
  '',
  '* The most common standard scores are 5 and 6. The percentile ranges for these scores are wide due to the fact that they cover a large proportion of the population.',
  ''
];

export const CognitiveProfileTerminal: React.FC<CognitiveProfileTerminalProps> = ({
  onBackToMenu,
  onRestart,
  onSelectOtherMode
}) => {
  const [viewState, setViewState] = useState<ViewState>('intro');
  const [branchView, setBranchView] = useState<CommandBranchSubView>('none');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFlickering, setIsFlickering] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');

  // Graph build states
  const [renderedGraphLines, setRenderedGraphLines] = useState<string[]>([]);
  const [showMarker, setShowMarker] = useState<boolean>(false);
  const [showResultBlock, setShowResultBlock] = useState<boolean>(false);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [viewState, branchView, isProcessing]);

  // Combined transition screen switcher with audio and phosphor flicker
  const triggerFlickerAndChangeState = (nextState: ViewState, subView: CommandBranchSubView = 'none') => {
    setIsProcessing(true);
    terminalAudio.playGlitchSound();
    setIsFlickering(true);

    setTimeout(() => {
      setIsFlickering(false);
    }, 300);

    setTimeout(() => {
      setViewState(nextState);
      setBranchView(subView);
      setIsProcessing(false);
    }, 450);
  };

  // Compile active target text lines depending on the view state
  const activeStepTargetLines = useMemo((): string[] => {
    if (viewState === 'intro') {
      return INTRO_LINES;
    }
    if (viewState === 'command_branch') {
      if (branchView === 'explain') {
        return EXPLAIN_LINES;
      }
      if (branchView === 'raw') {
        return RAW_LINES;
      }
    }
    return [];
  }, [viewState, branchView]);

  // Typewriter hook for current lines
  const { typedLines, isTyping, skip } = useTypewriter(
    activeStepTargetLines,
    14, // crisp typing speed
    !isProcessing && activeStepTargetLines.length > 0,
    () => {
      // Manual enter trigger
    }
  );

  // Auto-scroll screen
  useTerminalScroll(scrollAnchorRef, [typedLines, isTyping, viewState, renderedGraphLines, showMarker, showResultBlock]);

  // Sequence graph build line-by-line
  useEffect(() => {
    if (viewState !== 'graph_reveal') return;

    setRenderedGraphLines([]);
    setShowMarker(false);
    setShowResultBlock(false);

    let currentLineIdx = 0;
    const interval = setInterval(() => {
      if (currentLineIdx < GRAPH_BASE_LINES.length) {
        setRenderedGraphLines(prev => [...prev, GRAPH_BASE_LINES[currentLineIdx]]);
        terminalAudio.playKeyClick();
        currentLineIdx++;
      } else {
        clearInterval(interval);
        
        // Show marker after delay
        setTimeout(() => {
          setShowMarker(true);
          terminalAudio.playKeyClick();

          // Show results block after delay
          setTimeout(() => {
            setShowResultBlock(true);
            terminalAudio.playEnterSound();
          }, 800);

        }, 600);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [viewState]);

  const handleProgress = () => {
    if (isProcessing) return;

    if (isTyping) {
      skip();
      return;
    }

    if (viewState === 'intro') {
      triggerFlickerAndChangeState('graph_reveal');
    } else if (viewState === 'graph_reveal' && showResultBlock) {
      triggerFlickerAndChangeState('command_branch', 'none');
    }
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
      if (viewState === 'command_branch' && branchView !== 'none') {
        // Return back to subview menu
        triggerFlickerAndChangeState('command_branch', 'none');
      } else {
        // Return to main system explorer
        onBackToMenu();
      }
      setInputVal('');
      return;
    }

    // Branching options
    if (viewState === 'command_branch') {
      if (val === 'explain') {
        triggerFlickerAndChangeState('command_branch', 'explain');
        setInputVal('');
        return;
      }
      if (val === 'raw') {
        triggerFlickerAndChangeState('command_branch', 'raw');
        setInputVal('');
        return;
      }
    }

    // Explore redirects in final exit state
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
      if (val === 'behavioral' || val === '4') {
        onSelectOtherMode(5);
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

  // Keyboard shortcut listener for Enter
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
  }, [isTyping, viewState, isProcessing, showResultBlock]);

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
        .marker-blink {
          animation: marker-pulse 1.2s infinite;
        }
        @keyframes marker-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Top Header Ribbon */}
      <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66] font-bold">
            PATH: COGNITIVE_PROFILE // STATUS_{viewState.toUpperCase()}
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
                  <span>{"\u003E\u003E\u003E"} Press ENTER to view results</span>
                </div>
              )}
            </>
          )}

          {/* Graph Reveal Stage */}
          {viewState === 'graph_reveal' && (
            <div className="flex flex-col gap-3">
              <div className="text-[#00ff66] font-bold">&gt; run cognitive_analysis --graph=distribution</div>
              
              {/* ASCII Bell Curve block (scaled and responsive) */}
              <div className="py-2 text-[10px] xs:text-xs sm:text-sm md:text-base leading-none whitespace-pre font-mono overflow-x-auto tracking-tighter text-[#ffb000]">
                <div className="text-[#00ff66] font-bold pb-2">[COGNITIVE DISTRIBUTION]</div>
                {renderedGraphLines.map((line, idx) => (
                  <div key={`g-${idx}`}>{line}</div>
                ))}
                {showMarker && (
                  <div className="text-[#00ff66] font-bold">
                    <div>{"                           ▲"}</div>
                    <div>
                      {"                    Abdullah Malik "}
                      <span className="text-[#ffb000] animate-pulse">█</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Score results block */}
              {showResultBlock && (
                <div className="mt-2 border-t border-[#ffb000]/20 pt-4 flex flex-col gap-2">
                  <div className="text-[#00ff66] font-bold">[COGNITIVE PROFILE]</div>
                  <div className="text-[#ffb000]/60 text-xs">Assessment conducted by Alva Labs AB</div>
                  
                  <div className="pl-2 space-y-1 font-bold text-white">
                    <div>Logical score: 10</div>
                    <div>Percentile: 98+</div>
                    <div>Classification: Above average</div>
                  </div>

                  <div className="text-[#00ff66] font-bold pt-2">
                    &gt;&gt;&gt; Cognitive Engine Status: High-performance reasoning detected
                  </div>

                  <div className="pt-4 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center gap-2">
                    <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Command branching stage */}
          {viewState === 'command_branch' && (
            <div className="flex flex-col gap-3">
              {branchView === 'none' && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="text-[#00ff66] font-bold">&gt; query cognitive_registry --sector=details</div>
                  <div className="text-white font-bold">[COGNITIVE PROFILE - INTEL ARCHIVE]</div>
                  <div className="text-white space-y-1">
                    <div>Abdullah Malik - Logic profile details online.</div>
                    <div>You can read the interpretation details, view the raw test data output,</div>
                    <div>or return back to explore other directory chapters.</div>
                  </div>

                  <div className="text-[#00ff66] font-bold pt-4">
                    &gt;&gt;&gt; Enter explain to see capability mapping, or raw to view report text:
                  </div>
                </div>
              )}

              {branchView !== 'none' && (
                <div className="flex flex-col gap-2">
                  <div className="text-[#00ff66] font-bold">
                    &gt; query cognitive_registry --view={branchView}
                  </div>

                  {typedLines.map((line, idx) => {
                    const isCurrentLine = idx === typedLines.length - 1 && isTyping;
                    return (
                      <TerminalLine
                        key={`branch-${idx}`}
                        text={line}
                        isCurrentLine={isCurrentLine}
                      />
                    );
                  })}

                  {!isTyping && (
                    <div className="mt-4 pt-4 border-t border-[#ffb000]/20 flex flex-col gap-2">
                      <div className="text-[#00ff66] font-bold">
                        &gt;&gt;&gt; Interpretation query completed.
                      </div>
                      <div className="text-[#ffb000]/70 text-xs">
                        Enter {branchView === 'explain' ? 'raw' : 'explain'} to view alternate block, or back to return.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Exit View State */}
          {viewState === 'exit' && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="text-[#ffb000]/30 text-xs">--------------------------------------------------</div>
              <div className="text-[#00ff66] font-bold text-lg sm:text-xl">
                {"\u003E\u003E\u003E"} End of Cognitive Profile
              </div>

              <div className="text-white font-normal space-y-1">
                <div>Cognitive profile loaded successfully.</div>
                <div>You can restart the system, connect with me, or continue exploring the journey.</div>
              </div>

              <div className="text-[#ffb000] font-bold pt-2">
                {"\u003E\u003E\u003E"} type: restart | connect | explore
              </div>

              <div className="pt-2 text-white/90 space-y-2">
                <div className="text-[#00ff66] font-bold">If explore:</div>
                <div className="pl-4 space-y-1 font-bold">
                  <div>1. Origin Story</div>
                  <div>2. Career Evolution</div>
                  <div>3. From Marketing to AI Transformation Journey</div>
                  <div>4. Behavioral Profile</div>
                  <div>5. Certifications</div>
                </div>
              </div>
            </div>
          )}

        </div>

        <div ref={scrollAnchorRef} />
      </div>

      {/* Input Form */}
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
                ? "contacting registry mainframe..."
                : isTyping
                ? "press ENTER to bypass diagnostic layout..."
                : viewState === 'intro'
                ? "press ENTER to view results..."
                : viewState === 'graph_reveal'
                ? showResultBlock
                  ? "press ENTER to continue..."
                  : "computational reveal in progress..."
                : viewState === 'command_branch'
                ? branchView === 'none'
                  ? "type explain, raw or back..."
                  : branchView === 'explain'
                  ? "type raw or back..."
                  : "type explain or back..."
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
