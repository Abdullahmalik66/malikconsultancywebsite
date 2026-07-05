import React, { useState, useEffect, useRef } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';

interface OriginStoryTerminalProps {
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
  question: string;
}

const originStepsData: StepContent[] = [
  {
    step: 0,
    title: '[ORIGIN STORY]',
    lines: [
      'It didn’t start with AI.',
      '',
      'It started with a screen,',
      'and a lot of unanswered questions.',
      '',
      'Back in Lahore,',
      'there was no roadmap, no network, no shortcuts.',
      '',
      'Just curiosity,',
      'and the need to figure things out myself.',
      '',
      'So I started building.',
      '',
      'Content. Campaigns. SEO.',
      'Not because I had a strategy—',
      'but because it was the only way forward.',
      '',
      'Every small win was hard-earned.',
      'Every mistake forced me to think differently.',
      '',
      'That phase didn’t just teach me marketing.',
      '',
      'It built something deeper:',
      'how to learn fast,',
      'adapt faster,',
      'and move without waiting for permission.'
    ],
    question: 'Was this just about survival,\nor was I unknowingly building something bigger?'
  },
  {
    step: 1,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting next phase...',
      transitionText: '→ Transition: local → global'
    },
    title: '[THE FIRST SHIFT]',
    lines: [
      'At some point, building wasn’t enough.',
      '',
      'I needed a bigger arena.',
      '',
      'So I left.',
      '',
      'New country.',
      'New system.',
      'Zero familiarity.',
      '',
      'Everything reset.',
      '',
      'Comfort disappeared.',
      'Uncertainty became the default.',
      '',
      'But that’s where things changed.',
      '',
      'I stopped thinking like a marketer.',
      '',
      'And started thinking like a system builder.',
      '',
      'Campaigns became data.',
      'Data became decisions.',
      'Decisions became growth.',
      '',
      'That shift changed everything.',
      '',
      'What started as execution...',
      'was turning into something deeper.'
    ],
    question: 'Was I still building campaigns—\nor was I starting to build systems that scale?'
  },
  {
    step: 2,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting pattern...',
      transitionText: '→ Service → Product → System'
    },
    title: '[THE NEXT SHIFT]',
    lines: [
      'At some point, I realised something.',
      '',
      'Services don’t scale.',
      'Systems do.',
      '',
      'Up until then,',
      'I was solving problems one campaign at a time.',
      '',
      'Good results.',
      'Real impact.',
      'But always starting from zero.',
      '',
      'So I changed the approach.',
      '',
      'Instead of doing more work—',
      'I started designing repeatable systems.',
      '',
      'Playbooks.',
      'Frameworks.',
      'Growth engines.',
      '',
      'This was the beginning of something bigger.',
      '',
      'Not just executing tasks,',
      'but turning knowledge into assets.',
      '',
      'That’s when things accelerated.',
      '',
      'Because once you productise thinking,',
      'you don’t just deliver results—',
      '',
      'you build something that compounds.'
    ],
    question: 'Was this still marketing—\nor had I already crossed into something else?'
  },
  {
    step: 3,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting evolution...',
      transitionText: '→ Marketing → Data → Intelligence'
    },
    title: '[THE REAL TURNING POINT]',
    lines: [
      'At first, it all looked like growth.',
      '',
      'Better campaigns.',
      'Bigger clients.',
      'Stronger results.',
      '',
      'But something felt off.',
      '',
      'More performance didn’t mean more control.',
      '',
      'More tools didn’t mean more clarity.',
      '',
      'Everything was getting faster…',
      'but not necessarily smarter.',
      '',
      'That’s when it clicked.',
      '',
      'The problem wasn’t marketing.',
      '',
      'The problem was how decisions were made.',
      '',
      'So I went deeper.',
      '',
      'Into data.',
      'Into systems.',
      'Into how businesses actually operate under the surface.',
      '',
      'And that’s where everything changed.',
      '',
      'Because once you understand the system,',
      'you don’t just optimise campaigns.',
      '',
      'You reshape how the entire machine works.'
    ],
    question: 'Was this still growth marketing,\nor was I stepping into something far more complex?'
  },
  {
    step: 4,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting phase...',
      transitionText: '→ Intelligence → AI → Transformation'
    },
    title: '[THE SHIFT TO AI]',
    lines: [
      'At some point, everything started pointing in one direction.',
      '',
      'Data was no longer enough.',
      '',
      'Dashboards explained the past.',
      'But they didn’t drive decisions.',
      '',
      'And businesses didn’t need more reports.',
      'They needed systems that could think.',
      '',
      'That’s when AI stopped being interesting—',
      'and became necessary.',
      '',
      'So I leaned in.',
      '',
      'Not as a trend.',
      'But as the next logical step.',
      '',
      'From analysing data',
      'to building systems that act on it.',
      '',
      'From insights',
      'to intelligence.',
      '',
      'From manual decisions',
      'to automated reasoning.',
      '',
      'This wasn’t a pivot.',
      '',
      'It was an evolution.',
      '',
      'Everything I had built before',
      'finally connected.'
    ],
    question: 'Was I just using AI—\n\nor was I starting to build systems\nthat could run parts of a business on their own?'
  },
  {
    step: 5,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting external impact...',
      transitionText: '→ Internet → AI → LLM revolution'
    },
    title: '[THE INFLECTION POINT]',
    lines: [
      'Then something changed globally.',
      '',
      'ChatGPT happened.',
      '',
      'LLMs entered the mainstream.',
      '',
      'Suddenly, AI was not just for labs or hype decks.',
      '',
      'It was usable.',
      'Accessible.',
      'Practical.',
      '',
      'Everyone could see it.',
      '',
      'But most people still didn’t understand it.',
      '',
      'They saw outputs.',
      'I saw systems.',
      '',
      'They saw prompts.',
      'I saw workflows.',
      '',
      'They saw tools.',
      'I saw architecture.',
      '',
      'That moment mattered.',
      '',
      'Because for the first time,',
      'the gap between idea and execution disappeared.',
      '',
      'You could build faster than ever.',
      '',
      'But only if you knew what you were building.',
      '',
      'That’s when everything accelerated again.',
      '',
      'Not just learning AI.',
      '',
      'But designing how AI fits into real business systems.'
    ],
    question: 'Was this just another technology wave—\nor was this the moment everything I learned finally made sense?'
  },
  {
    step: 6,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Detecting applied intelligence...',
      transitionText: '→ POC → Enterprise adoption → LLM systems'
    },
    title: '[FROM THEORY TO REAL SYSTEMS]',
    lines: [
      'That’s when it moved from idea to execution.',
      '',
      'While working with Avaus,',
      'we didn’t just talk about Generative AI.',
      '',
      'We built it.',
      '',
      'Early proofs of concept.',
      'Real use cases.',
      'Real constraints.',
      '',
      'Not demos.',
      'Not experiments that sit on slides.',
      '',
      'Actual systems trying to solve complex problems.',
      '',
      'This is where LLMs became practical.',
      '',
      'We started building:',
      '→ Retrieval-based systems',
      '→ Context-aware assistants',
      '→ Early RAG pipelines',
      '',
      'Not perfect.',
      'But real enough to test what works.',
      '',
      'And more importantly,',
      'what doesn’t.',
      '',
      'We helped companies understand something critical.',
      '',
      'AI is easy to demo.',
      'But hard to implement properly.',
      '',
      'Because the real challenge isn’t the model.',
      '',
      'It’s the system around it.',
      '',
      'Data quality.',
      'Context design.',
      'Architecture.',
      'Business fit.',
      '',
      'That phase changed everything again.',
      '',
      'Because now it wasn’t theory anymore.',
      '',
      'It was execution under pressure.'
    ],
    question: 'Was I still exploring AI—\n\nor was I already building the foundation\nof enterprise-grade AI systems?'
  },
  {
    step: 7,
    headerMeta: {
      processingText: 'System processing...',
      detectingText: 'Running final synthesis...',
      transitionText: '→ Journey → Pattern → Mission'
    },
    title: '[FINAL STATE]',
    lines: [
      'Looking back,',
      'nothing was random.',
      '',
      'From marketing,',
      'to data,',
      'to AI.',
      '',
      'From execution,',
      'to systems,',
      'to agents.',
      '',
      'Every step was building on the last one.',
      '',
      'Not chasing trends.',
      'Not jumping roles.',
      '',
      'Just following one core idea:',
      '',
      'How do you turn complexity',
      'into something that actually works?',
      '',
      'Today, that question defines everything I do.',
      '',
      'Designing AI systems,',
      'that don’t just generate output—',
      '',
      'but drive real decisions,',
      'real actions,',
      'real business impact.',
      '',
      'And this is not the end.',
      '',
      'It’s just the current state of the system.'
    ],
    question: 'Because the question still remains.\n\nHow far can AI actually go inside a business?\n\nAnd more importantly—\n\nwhat kind of systems are we going to build next?'
  }
];

export const OriginStoryTerminal: React.FC<OriginStoryTerminalProps> = ({
  onBackToMenu,
  onRestart,
  onSelectOtherMode
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [typedQuestion, setTypedQuestion] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeStepData = originStepsData[currentStep];

  // Character-by-character typewriter loop synchronized 1:1 with audio clicks
  useEffect(() => {
    if (currentStep > 7 || !activeStepData) return;

    setIsTyping(true);
    setTypedLines([]);
    setTypedQuestion('');

    let lineIndex = 0;
    let charIndex = 0;
    let isQuestionPhase = false;
    let currentLineList: string[] = [];
    let currentQuestionStr = '';

    const interval = setInterval(() => {
      if (!isQuestionPhase) {
        // Typing body lines
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
          isQuestionPhase = true;
          charIndex = 0;
        }
      } else {
        // Typing question box
        const targetQ = activeStepData.question;
        if (charIndex < targetQ.length) {
          charIndex++;
          currentQuestionStr = targetQ.slice(0, charIndex);
          setTypedQuestion(currentQuestionStr);

          const typedChar = targetQ[charIndex - 1];
          if (typedChar && typedChar !== ' ' && typedChar !== '\n' && charIndex % 2 === 0) {
            terminalAudio.playKeyClick();
          }
        } else {
          setIsTyping(false);
          terminalAudio.playBootBeep();
          clearInterval(interval);
        }
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
      setTypedQuestion(activeStepData.question);
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
      // Only capture Backspace/Enter if input element isn't capturing custom typed text
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextStep();
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

    if (['1', '2', '3', '4'].includes(val)) {
      const modeId = parseInt(val, 10);
      onSelectOtherMode(modeId);
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
            PATH: ORIGIN_STORY // STEP_0{Math.min(currentStep, 7)}/07
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

      {/* Clean Screen Display Viewport (Clean Step-by-Step, No Infinite Scroll) */}
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
                const isCurrentLine = lineIdx === typedLines.length - 1 && isTyping && typedQuestion === '';

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

            {/* Question box */}
            {typedQuestion !== '' && (
              <div className="pt-3 text-[#ffb000] font-medium whitespace-pre-line border-l-2 border-[#ffb000]/50 pl-4 py-1 my-2 bg-black/40">
                {typedQuestion}
                {isTyping && (
                  <span className="inline-block w-2 h-5 bg-[#ffb000] ml-1 animate-pulse" />
                )}
              </div>
            )}

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

        {/* FINAL END OF ORIGIN STORY DISPLAY */}
        {currentStep === 8 && !isProcessing && (
          <div className="flex flex-col gap-5 pt-2">
            <div className="text-[#ffb000]/80 font-bold">&gt; continue</div>
            <div className="text-[#00ff66] font-bold">System processing...</div>
            <div className="text-[#ffb000]/30 text-xs">
              --------------------------------------------------
            </div>

            <div className="text-[#00ff66] font-bold text-lg sm:text-xl">
              {"\u003E\u003E\u003E"} End of Origin Story
            </div>

            <div className="text-white font-normal space-y-1">
              <div>Path completed successfully.</div>
              <div>You can restart the system, connect with me, or continue exploring the journey.</div>
            </div>

            <div className="text-[#ffb000] font-bold pt-2">
              {"\u003E\u003E\u003E"} type: restart | connect | explore
            </div>

            <div className="pt-2 text-white/90 space-y-2">
              <div className="text-[#00ff66] font-bold">If explore:</div>
              <div className="pl-4 space-y-1 font-bold">
                <div>1. Career Evolution</div>
                <div>2. Breakthrough Moments</div>
                <div>3. From Marketing to AI Transformation Journey</div>
                <div>4. Certifications</div>
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
                : "type restart | connect | 1-4..."
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
