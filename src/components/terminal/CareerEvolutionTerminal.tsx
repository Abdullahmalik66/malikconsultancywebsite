import React, { useState, useEffect, useRef } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';

interface CareerEvolutionTerminalProps {
  onBackToMenu: () => void;
  onRestart: () => void;
  onSelectOtherMode: (modeId: number) => void;
}

interface StepContent {
  step: number;
  headerMeta?: {
    processingText: string;
    detectingText: string;
    transitionText: string;
  };
  title: string;
  lines: string[];
}

const careerStepsData: StepContent[] = [
  {
    step: 0,
    title: '[CAREER EVOLUTION]',
    lines: [
      'Nothing about this career was planned.',
      '',
      'It started with curiosity.',
      'And doing whatever worked.',
      '',
      'No titles.',
      'No clear path.',
      '',
      'Just momentum.'
    ]
  },
  {
    step: 1,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting early phase...',
      transitionText: '→ Learning → Execution → Survival'
    },
    title: '[THE BEGINNING]',
    lines: [
      'It started at Askaticket.',
      '',
      'Learning SEO.',
      'Writing content.',
      'Figuring out how the internet actually works.',
      '',
      'No shortcuts.',
      'Just trial and error.',
      '',
      'Then came MobiWac.',
      '',
      'Digital marketing.',
      'Real responsibility.',
      '',
      'In two years,',
      'I moved into a manager role.',
      '',
      'Not by design.',
      'But by necessity.',
      '',
      'Managing teams.',
      'Running campaigns.',
      'Handling clients.',
      '',
      'At the same time,',
      'doing freelance and gig work.',
      '',
      'Learning faster than any structured job could offer.',
      '',
      'This phase was raw.',
      '',
      'Messy.',
      'Fast.',
      'Unfiltered.',
      '',
      'But it built the foundation.'
    ]
  },
  {
    step: 2,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting transition...',
      transitionText: '→ Local → Global'
    },
    title: '[THE SHIFT TO EUROPE]',
    lines: [
      'Then I moved to Finland.',
      '',
      'New country.',
      'New system.',
      'New expectations.',
      '',
      'Master’s in Marketing.',
      '',
      'And the real shift started here.',
      '',
      'At QuietOn.',
      '',
      'Digital Marketing Manager.',
      '',
      'But this was different.',
      '',
      'Presales marketing.',
      'Data-driven personas.',
      '',
      'Collecting data from multiple sources.',
      'Extracting features.',
      'Understanding patterns.',
      '',
      'Not guessing audiences.',
      'Designing them.',
      '',
      'Then building campaigns on top of that.',
      '',
      'This was the first time',
      'marketing became analytical.',
      '',
      'Structured.',
      'Intentional.'
    ]
  },
  {
    step: 3,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting scale...',
      transitionText: '→ Markets → Platforms → Complexity'
    },
    title: '[WORKING ACROSS MARKETS]',
    lines: [
      'Then came Azerion.',
      '',
      'Working with Portugal and Nordic markets.',
      '',
      'Partner ecosystem:',
      'Microsoft Bing.',
      'Yahoo.',
      'Gemini.',
      '',
      'Different markets.',
      'Different behaviour.',
      'Same objective.',
      '',
      'Performance at scale.',
      '',
      'Learning how platforms,',
      'data,',
      'and distribution actually connect.',
      '',
      'This is where complexity increased.',
      '',
      'And thinking had to level up.'
    ]
  },
  {
    step: 4,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting evolution...',
      transitionText: '→ Execution → Productisation'
    },
    title: '[BUILDING SYSTEMS]',
    lines: [
      'Then at Adpro,',
      'everything changed.',
      '',
      'This is where productisation started.',
      '',
      'Turning services into repeatable systems.',
      '',
      'Growth hacking mindset.',
      '',
      'Not just running campaigns,',
      'but designing growth engines.',
      '',
      'Building digital marketing as a function.',
      '',
      'Not tasks.',
      'Not campaigns.',
      '',
      'A system.',
      '',
      'That can run,',
      'scale,',
      'and evolve.'
    ]
  },
  {
    step: 5,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting alignment...',
      transitionText: '→ Marketing → Sales → Customer Success'
    },
    title: '[CONNECTING THE FUNNEL]',
    lines: [
      'At Revieve,',
      'the focus shifted again.',
      '',
      'ABM marketing.',
      'B2B2C model.',
      '',
      'Now it wasn’t just marketing.',
      '',
      'It was alignment.',
      '',
      'Marketing.',
      'Sales.',
      'Customer success.',
      '',
      'Working as one system.',
      '',
      'Understanding the full journey.',
      '',
      'Not just acquisition.',
      '',
      'But how revenue actually happens.',
      '',
      'This is where business understanding deepened.'
    ]
  },
  {
    step: 6,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting transformation...',
      transitionText: '→ Data → Architecture → AI'
    },
    title: '[THE DATA & AI SHIFT]',
    lines: [
      'At Avaus,',
      'everything connected.',
      '',
      'Marketing.',
      'Data.',
      'Architecture.',
      '',
      'Bridging activation and data teams.',
      '',
      'Building systems that connect both.',
      '',
      'Then came Generative AI.',
      '',
      'Not as theory.',
      '',
      'But as real products.',
      '',
      'Building Finland’s early POCs in GenAI.',
      '',
      'Companies like:',
      'Vaisala',
      'VTT Technical Research Centre of Finland',
      'Pirelli Tyres',
      '',
      'Working on real use cases.',
      '',
      'RAG systems.',
      'LLM pipelines.',
      'Business problem solving.',
      '',
      'This is where the shift happened.',
      '',
      'From marketing,',
      'to data,',
      'to AI systems.'
    ]
  },
  {
    step: 7,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting current phase...',
      transitionText: '→ AI → Agents → Enterprise scale'
    },
    title: '[CURRENT STATE]',
    lines: [
      'Now at VTT.',
      '',
      'The focus is different.',
      '',
      'Production-grade AI.',
      '',
      'Building AI agents.',
      '',
      'First SDR agent in Salesforce.',
      '',
      'Working with Agentforce.',
      '',
      'Enhancing copilots.',
      'Running AI trainings.',
      '',
      'Leading innovation.',
      '',
      'Now operating inside',
      'an AI Center of Excellence.',
      '',
      'This is no longer experimentation.',
      '',
      'This is enterprise AI.'
    ]
  }
];

export const CareerEvolutionTerminal: React.FC<CareerEvolutionTerminalProps> = ({
  onBackToMenu,
  onRestart,
  onSelectOtherMode
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeStepData = careerStepsData[currentStep];

  // Character-by-character typewriter loop synchronized 1:1 with audio clicks
  useEffect(() => {
    if (currentStep > 7 || !activeStepData) return;

    setIsTyping(true);
    setTypedLines([]);

    let lineIndex = 0;
    let charIndex = 0;
    let currentLineList: string[] = [];

    const interval = setInterval(() => {
      if (lineIndex < activeStepData.lines.length) {
        const targetLine = activeStepData.lines[lineIndex];

        if (targetLine === '') {
          currentLineList = [...currentLineList, ''];
          setTypedLines([...currentLineList]);
          lineIndex++;
          charIndex = 0;
        } else {
          charIndex++;
          const partial = targetLine.slice(0, charIndex);
          
          const copy = [...currentLineList];
          copy[lineIndex] = partial;
          currentLineList = copy;
          setTypedLines([...copy]);

          const typedChar = targetLine[charIndex - 1];
          if (typedChar && typedChar !== ' ' && charIndex % 2 === 0) {
            terminalAudio.playKeyClick();
          }

          if (charIndex >= targetLine.length) {
            lineIndex++;
            charIndex = 0;
          }
        }
      } else {
        setIsTyping(false);
        terminalAudio.playBootBeep();
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [currentStep]);

  // Keep input focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep, isProcessing, isTyping]);

  // Navigate Forward (ENTER)
  const handleNextStep = () => {
    if (isProcessing) return;

    if (isTyping && activeStepData) {
      // Instant reveal current step text
      setTypedLines([...activeStepData.lines]);
      setIsTyping(false);
      terminalAudio.playKeyClick();
      return;
    }

    if (currentStep < 7) {
      terminalAudio.playEnterSound();
      setIsProcessing(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsProcessing(false);
      }, 350);
    } else if (currentStep === 7) {
      terminalAudio.playEnterSound();
      setIsProcessing(true);
      setTimeout(() => {
        terminalAudio.playBootBeep();
        setCurrentStep(8); // Final End Screen
        setIsProcessing(false);
      }, 350);
    }
  };

  // Navigate Backward (BACKSPACE)
  const handlePrevStep = () => {
    if (isProcessing) return;

    if (currentStep > 0) {
      terminalAudio.playKeyClick();
      setIsProcessing(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsProcessing(false);
      }, 250);
    } else {
      // Back from step 0 returns to main menu
      onBackToMenu();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture Enter if the input element is not currently focused to avoid blocking form submission
      if (e.key === 'Enter') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          handleNextStep();
        }
      } else if (e.key === 'Backspace' && inputVal === '') {
        e.preventDefault();
        handlePrevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isProcessing, isTyping, activeStepData, inputVal]);

  const handleCommandFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim().toLowerCase();
    
    if (!val) {
      handleNextStep();
      return;
    }

    terminalAudio.playEnterSound();

    if (val === 'back' || val === 'prev' || val === 'b') {
      handlePrevStep();
      setInputVal('');
      return;
    }

    if (val === 'continue' || val === 'next' || val === 'n') {
      handleNextStep();
      setInputVal('');
      return;
    }

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

    if (val === 'explore' || val === 'menu') {
      onBackToMenu();
      setInputVal('');
      return;
    }

    if (val === '1' || val === 'origin') {
      onSelectOtherMode(1);
      setInputVal('');
      return;
    }
    if (val === '2' || val === 'journey' || val === 'transformation') {
      onSelectOtherMode(3);
      setInputVal('');
      return;
    }
    if (val === '3' || val === 'cognitive' || val === 'profile') {
      onSelectOtherMode(4);
      setInputVal('');
      return;
    }
    if (val === '4' || val === 'behavioral' || val === 'personality') {
      onSelectOtherMode(5);
      setInputVal('');
      return;
    }
    if (val === '5' || val === 'certifications' || val === 'cert') {
      onSelectOtherMode(6);
      setInputVal('');
      return;
    }
    setInputVal('');
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[460px] text-[#ffb000] font-mono text-sm sm:text-base md:text-lg leading-relaxed select-none">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66] font-bold">
            PATH: CAREER_EVOLUTION // STEP_0{Math.min(currentStep, 7)}/07
          </span>
          <span className="hidden sm:inline text-[#ffb000]/40">|</span>
          <span className="hidden sm:inline text-[#ffb000]/60">
            [ENTER: NEXT | BACKSPACE: PREV]
          </span>
        </div>
        <button
          onClick={onBackToMenu}
          className="text-xs text-[#ffb000] hover:underline cursor-pointer font-bold"
        >
          [MENU]
        </button>
      </div>

      {/* Clean Screen Display Viewport */}
      <div className="flex-1 py-4 flex flex-col justify-start">
        
        {/* Render ACTIVE current step cleanly */}
        {currentStep <= 7 && activeStepData && !isProcessing && (
          <div className="flex flex-col gap-4">
            
            {/* Header transition metadata */}
            {activeStepData.step > 0 && activeStepData.headerMeta && (
              <div className="flex flex-col gap-1 border-b border-[#ffb000]/20 pb-3 text-xs sm:text-sm">
                <div className="text-[#ffb000]/80 font-bold">&gt; continue</div>
                <div className="text-[#00ff66]">{activeStepData.headerMeta.processingText}</div>
                <div className="text-[#00ff66]">{activeStepData.headerMeta.detectingText}</div>
                <div className="text-[#00ff66] font-bold">{activeStepData.headerMeta.transitionText}</div>
                <div className="text-[#ffb000]/30 text-xs">
                  --------------------------------------------------
                </div>
              </div>
            )}

            {/* Title */}
            <div className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-wider">
              {activeStepData.title}
            </div>

            {/* Synchronized typewriter lines */}
            <div className="flex flex-col gap-1 text-white/95 font-normal">
              {typedLines.map((line, lineIdx) => {
                const isCurrentLine = lineIdx === typedLines.length - 1 && isTyping;

                return (
                  <div key={lineIdx} className={line === '' ? 'h-3' : 'min-h-[1.2em]'}>
                    {line}
                    {isCurrentLine && (
                      <span className="inline-block w-2 h-5 bg-[#ffb000] ml-0.5 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Prompt helper ribbon */}
            {!isTyping && (
              <div className="pt-3 text-[#00ff66] font-bold text-xs sm:text-sm animate-pulse flex items-center justify-between gap-4">
                <span>{"\u003E\u003E\u003E"} Press ENTER to continue</span>
                <span className="text-[#ffb000]/60 text-xs font-normal">
                  [Press BACKSPACE to go back]
                </span>
              </div>
            )}

          </div>
        )}

        {/* Processing Indicator during step transitions */}
        {isProcessing && (
          <div className="flex flex-col gap-2 text-[#00ff66] font-bold animate-pulse py-6">
            <div>&gt; continue</div>
            <div>System processing...</div>
          </div>
        )}

        {/* FINAL END OF CAREER EVOLUTION DISPLAY */}
        {currentStep === 8 && !isProcessing && (
          <div className="flex flex-col gap-5 pt-2">
            <div className="text-[#ffb000]/80 font-bold">&gt; continue</div>
            <div className="text-[#00ff66] font-bold">System processing...</div>
            <div className="text-[#ffb000]/30 text-xs">
              --------------------------------------------------
            </div>

            <div className="text-[#00ff66] font-bold text-lg sm:text-xl">
              {"\u003E\u003E\u003E"} End of Career Evolution
            </div>

            <div className="text-white font-normal space-y-1">
              <div>Path completed successfully.</div>
            </div>

            <div className="text-[#ffb000] font-bold pt-2">
              {"\u003E\u003E\u003E"} type: restart | connect | explore
            </div>

            <div className="pt-2 text-white/90 space-y-2">
              <div className="text-[#00ff66] font-bold">If explore:</div>
              <div className="pl-4 space-y-1 font-bold">
                <div>1. Origin Story</div>
                <div>2. From Marketing to AI Transformation Journey</div>
                <div>3. Cognitive Profile</div>
                <div>4. Behavioral Profile</div>
                <div>5. Certifications</div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </div>

      {/* CLI Command Line Input Prompt */}
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
            placeholder={
              isTyping
                ? "press ENTER to skip typing..."
                : currentStep < 8
                ? "ENTER = next | BACKSPACE = back..."
                : "type restart | connect | 1-5..."
            }
            className="w-full bg-transparent border-none outline-none font-mono text-sm sm:text-base text-[#ffb000] placeholder:text-[#ffb000]/30"
            autoFocus
          />
          <span className="w-2 h-5 bg-[#ffb000] ml-0.5 animate-pulse inline-block" />
        </div>
      </form>

    </div>
  );
};
