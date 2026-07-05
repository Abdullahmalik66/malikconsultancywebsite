import React, { useState, useEffect } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';

interface TerminalIntroScreenProps {
  onComplete: () => void;
}

export const TerminalIntroScreen: React.FC<TerminalIntroScreenProps> = ({ onComplete }) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isTextComplete, setIsTextComplete] = useState(false);

  const fullText = `I help organisations turn AI into something real—not another buzzword or slide deck. My journey started in marketing, where I learned how growth actually happens on the ground. Over time, I moved into data and then into AI, focusing on one thing: building systems that deliver measurable impact, not just theoretical potential. Today, I work at the intersection of business, data, and machine intelligence—helping companies move from experimentation to real transformation.`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        if (index % 5 === 0) {
          terminalAudio.playKeyClick();
        }
        index++;
      } else {
        setIsTextComplete(true);
        terminalAudio.playBootBeep();
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, []);

  // Keyboard Event Listener for Enter or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isTextComplete) {
          // Fast-forward text if pressed early
          setTypedText(fullText);
          setIsTextComplete(true);
        } else {
          triggerTransition();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTextComplete]);

  const triggerTransition = () => {
    terminalAudio.playEnterSound();
    terminalAudio.playGlitchSound();
    setIsGlitching(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  return (
    <div 
      className={`flex flex-col justify-between h-full min-h-[460px] font-mono leading-relaxed select-none transition-all ${
        isGlitching ? 'opacity-0 scale-95 filter invert blur-sm' : 'opacity-100'
      }`}
      onClick={() => {
        if (!isTextComplete) {
          setTypedText(fullText);
          setIsTextComplete(true);
        } else {
          triggerTransition();
        }
      }}
    >
      
      {/* Upper Terminal Panel Block */}
      <div className="flex flex-col gap-6 max-w-4xl">
        
        {/* Terminal Header Info Tag */}
        <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb000] animate-ping" />
            <span>EXECUTIVE_STATEMENT // INTRODUCTION</span>
          </div>
          <span className="font-bold">FILE: INTRODUCTION_ABOUT_ME.TXT</span>
        </div>

        {/* Big Retro ASCII Art Salutation for ABDULLAH MALIK */}
        <div className="space-y-4 pt-2">
          <div className="text-[#ffb000] font-mono text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-bold leading-none tracking-tighter drop-shadow-[0_0_14px_rgba(255,176,0,0.9)] select-none overflow-x-auto py-2">
            <pre className="font-mono">
{`  A   ____  ____  _   _ _     _        _    _   _    __  __   A   _     ___ _  __
 / \\ | __ )|  _ \\| | | | |   | |      / \\  | | | |  |  \\/  | / \\ | |   |_ _| |/ /
/ _ \\|  _ \\| | | | | | | |   | |     / _ \\ | |_| |  | |\\/| |/ _ \\| |    | || ' / 
/ ___ \\ |_) | |_| | |_| | |___| |___ / ___ \\|  _  |  | |  | / ___ \\ |___ | || . \\ 
/_/   \\_\\____/|____/ \\___/|_____|_____/_/   \\_\\_| |_|  |_|  |_/_/   \\_\\_____|___|_|\\_\\`}
            </pre>
          </div>

          {/* Terminal Paragraph Block */}
          <div className="text-base sm:text-lg md:text-xl font-mono text-[#ffb000]/95 leading-relaxed sm:leading-loose pt-2 tracking-wide font-light min-h-[160px]">
            {typedText}
            {!isTextComplete && (
              <span className="inline-block w-2.5 h-5 bg-[#ffb000] ml-1 animate-pulse" />
            )}
          </div>
        </div>

        {/* Separator Dashed Line matching reference image */}
        <div className="pt-6 text-[#ffb000]/40 overflow-hidden text-xs sm:text-sm select-none">
          ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        </div>

      </div>

      {/* Bottom Prompt / Keypress Indicator */}
      <div className="pt-8 pb-2 flex flex-col items-center sm:items-start gap-3">
        {isTextComplete ? (
          <div className="w-full p-4 rounded bg-black/70 border border-[#ffb000]/60 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#ffb000] hover:text-[#0b0904] transition-all group shadow-[0_0_20px_rgba(255,176,0,0.25)]">
            <div className="flex items-center gap-3 font-bold text-sm sm:text-base tracking-widest">
              <span className="animate-ping text-[#00ff66]">{"\u003E\u003E\u003E"}</span>
              <span>PRESS [ ENTER ] TO EXPLORE SYSTEM ARCHITECTURE</span>
              <span className="animate-pulse">|</span>
            </div>
            <span className="text-xs uppercase tracking-widest font-mono border border-current px-2 py-0.5 rounded opacity-80 group-hover:opacity-100">
              [ENTER]
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#ffb000]/60 flex items-center gap-2 cursor-pointer">
            <span className="text-[#00ff66]">→</span>
            <span>[CLICK / PRESS ENTER TO SKIP TYPING]</span>
          </div>
        )}
      </div>

    </div>
  );
};
