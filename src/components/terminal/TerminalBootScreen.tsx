import React, { useState, useEffect } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';

interface TerminalBootScreenProps {
  onComplete: () => void;
}

export const TerminalBootScreen: React.FC<TerminalBootScreenProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  // Staged Boot Sequence Delays
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Stage 1: System Init
    timers.push(setTimeout(() => {
      setStepIndex(1);
      terminalAudio.playKeyClick();
    }, 400));

    // Stage 2: Profile Loading
    timers.push(setTimeout(() => {
      setStepIndex(2);
      terminalAudio.playKeyClick();
    }, 1000));

    // Stage 3: Location & Origin
    timers.push(setTimeout(() => {
      setStepIndex(3);
      terminalAudio.playKeyClick();
    }, 1800));

    // Stage 4: Journey Analysis
    timers.push(setTimeout(() => {
      setStepIndex(4);
      terminalAudio.playKeyClick();
    }, 2600));

    // Stage 5: System Ready & Prompt
    timers.push(setTimeout(() => {
      setStepIndex(5);
      terminalAudio.playBootBeep();
    }, 3600));

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  // Keyboard Event Listener for Enter or Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerTransition();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex]);

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
      onClick={triggerTransition}
    >
      
      {/* Top Banner Box */}
      <div className="flex flex-col gap-6">
        
        {/* Retro Box Border Banner matching screenshot style */}
        <div className="text-xs sm:text-sm tracking-widest text-[#ffb000] opacity-90 overflow-x-auto">
          <div>+-----------------------------------------------------------------------+</div>
          <div className="flex justify-between px-4 py-1 font-bold">
            <span>| malik://life_story_terminal</span>
            <span>v1.0 |</span>
          </div>
          <div>+-----------------------------------------------------------------------+</div>
        </div>

        {/* Boot Sequence Content Lines */}
        <div className="space-y-4 text-sm sm:text-base md:text-lg pt-2">
          
          {stepIndex >= 1 && (
            <div className="flex items-center gap-2 animate-fade-in text-[#ffb000]/90">
              <span className="text-[#00ff66]">✓</span>
              <span>Initializing system . . .</span>
            </div>
          )}

          {stepIndex >= 2 && (
            <div className="flex flex-col gap-1 pl-4 border-l-2 border-[#ffb000]/30 my-2 animate-fade-in">
              <div className="text-xs font-bold tracking-widest text-[#ffb000]/60 uppercase">OPERATOR_PROFILE</div>
              <div className="text-base sm:text-xl font-bold text-[#ffb000]">ABDULLAH_MALIK</div>
            </div>
          )}

          {stepIndex >= 3 && (
            <div className="space-y-1 text-[#ffb000]/90 font-mono text-sm sm:text-base pt-2 animate-fade-in">
              <div className="flex justify-between max-w-md">
                <span>Location . . . . . . . . . .</span>
                <span className="font-bold text-white">Espoo, Finland</span>
              </div>
              <div className="flex justify-between max-w-md">
                <span>Origin . . . . . . . . . . .</span>
                <span className="font-bold text-white">Lahore, Pakistan</span>
              </div>
            </div>
          )}

          {stepIndex >= 4 && (
            <div className="pt-4 space-y-2 animate-fade-in">
              <div className="text-xs font-bold tracking-widest text-[#ffb000]/70 uppercase">
                ANALYZING_SYSTEM_EVOLUTION:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-lg text-sm sm:text-base">
                <div className="p-2 bg-black/50 border border-[#ffb000]/40 rounded flex items-center gap-2">
                  <span className="text-[#00ff66]">→</span>
                  <span className="font-bold text-[#ffb000]">Marketing</span>
                </div>
                <div className="p-2 bg-black/50 border border-[#ffb000]/40 rounded flex items-center gap-2">
                  <span className="text-[#00ff66]">→</span>
                  <span className="font-bold text-[#ffb000]">Data</span>
                </div>
                <div className="p-2 bg-black/50 border border-[#ffb000]/40 rounded flex items-center gap-2">
                  <span className="text-[#00ff66]">→</span>
                  <span className="font-bold text-[#ffb000]">AI</span>
                </div>
              </div>
            </div>
          )}

          {stepIndex >= 5 && (
            <div className="pt-4 text-[#00ff66] font-bold text-sm sm:text-base animate-pulse flex items-center gap-2">
              <span>System ready. All parameters initialized.</span>
            </div>
          )}

        </div>

      </div>

      {/* Bottom Prompt / Keypress Indicator */}
      <div className="pt-8 pb-2 flex flex-col items-center sm:items-start gap-3">
        {stepIndex >= 5 ? (
          <div className="w-full p-4 rounded bg-black/70 border border-[#ffb000]/60 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#ffb000] hover:text-[#0b0904] transition-all group shadow-[0_0_20px_rgba(255,176,0,0.25)]">
            <div className="flex items-center gap-3 font-bold text-sm sm:text-base tracking-widest">
              <span className="animate-ping text-[#00ff66]">{"\u003E\u003E\u003E"}</span>
              <span>PRESS [ ENTER ] TO CONTINUE</span>
              <span className="animate-pulse">|</span>
            </div>
            <span className="text-xs uppercase tracking-widest font-mono border border-current px-2 py-0.5 rounded opacity-80 group-hover:opacity-100">
              [ENTER]
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#ffb000]/50 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb000] animate-ping" />
            <span>INITIALIZING SYSTEM PROTOCOLS . . .</span>
          </div>
        )}
      </div>

    </div>
  );
};
