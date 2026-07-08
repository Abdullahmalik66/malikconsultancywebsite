import React, { useState, useEffect, useRef } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';
import { OriginStoryTerminal } from './OriginStoryTerminal';
import { CareerEvolutionTerminal } from './CareerEvolutionTerminal';
import { CertificationsTerminal } from './CertificationsTerminal';
import { AITransformationJourneyTerminal } from './AITransformationJourneyTerminal';
import { CognitiveProfileTerminal } from './CognitiveProfileTerminal';
import { BehavioralProfileTerminal } from './BehavioralProfileTerminal';

interface ExplorationMode {
  id: number;
  title: string;
  commandName: string;
}

const explorationModes: ExplorationMode[] = [
  { id: 1, title: 'Origin Story', commandName: 'origin' },
  { id: 2, title: 'Career Evolution', commandName: 'career' },
  { id: 3, title: 'From Marketing to AI Transformation Journey', commandName: 'journey' },
  { id: 4, title: 'Cognitive Profile', commandName: 'cognitive' },
  { id: 5, title: 'Behavioral Profile', commandName: 'behavioral' },
  { id: 6, title: 'Certifications', commandName: 'certifications' }
];

interface TerminalSystemExplorerProps {
  onRestart: () => void;
}

export const TerminalSystemExplorer: React.FC<TerminalSystemExplorerProps> = ({ onRestart }) => {
  const [selectedModeId, setSelectedModeId] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [commandLogs, setCommandLogs] = useState<{ command: string; output: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedModeId]);

  // Global Keydown Handler for keys 1-6
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if a sub-mode is active
      if (selectedModeId !== null) return;

      // Don't intercept if typing in any input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement === inputRef.current
      ) {
        return;
      }

      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const id = parseInt(e.key, 10);
        handleSelectMode(id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModeId]);

  const handleSelectMode = (id: number) => {
    terminalAudio.playKeyClick();
    terminalAudio.playEnterSound();
    setSelectedModeId(id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim().toLowerCase();
    if (!val) return;

    terminalAudio.playEnterSound();

    if (['1', '2', '3', '4', '5', '6'].includes(val)) {
      const id = parseInt(val, 10);
      handleSelectMode(id);
      setInputVal('');
      return;
    }

    if (val === 'origin' || val.includes('origin')) {
      handleSelectMode(1);
      setInputVal('');
      return;
    }
    if (val === 'career' || val.includes('career')) {
      handleSelectMode(2);
      setInputVal('');
      return;
    }
    if (val === 'journey' || val.includes('marketing') || val.includes('transformation')) {
      handleSelectMode(3);
      setInputVal('');
      return;
    }
    if (val === 'cognitive' || val.includes('logic') || val.includes('profile')) {
      handleSelectMode(4);
      setInputVal('');
      return;
    }
    if (val === 'behavioral' || val.includes('personality') || val.includes('behavior')) {
      handleSelectMode(5);
      setInputVal('');
      return;
    }
    if (val === 'certifications' || val.includes('cert')) {
      handleSelectMode(6);
      setInputVal('');
      return;
    }

    if (val === 'menu' || val === 'back' || val === 'clear') {
      setSelectedModeId(null);
      setInputVal('');
      return;
    }

    if (val === 'restart') {
      onRestart();
      return;
    }

    // Unrecognized command
    setCommandLogs(prev => [
      ...prev,
      { command: inputVal, output: `Unrecognized option '${inputVal}'. Enter a number (1-6) or option title.` }
    ]);
    setInputVal('');
  };

  // Mode 1 (Origin Story)
  if (selectedModeId === 1) {
    return (
      <OriginStoryTerminal
        onBackToMenu={() => setSelectedModeId(null)}
        onRestart={onRestart}
        onSelectOtherMode={(modeId) => setSelectedModeId(modeId)}
      />
    );
  }

  // Mode 2 (Career Evolution)
  if (selectedModeId === 2) {
    return (
      <CareerEvolutionTerminal
        onBackToMenu={() => setSelectedModeId(null)}
        onRestart={onRestart}
        onSelectOtherMode={(modeId) => setSelectedModeId(modeId)}
      />
    );
  }

  // Mode 3 (Marketing to AI Transformation Journey)
  if (selectedModeId === 3) {
    return (
      <AITransformationJourneyTerminal
        onBackToMenu={() => setSelectedModeId(null)}
        onRestart={onRestart}
        onSelectOtherMode={(modeId) => setSelectedModeId(modeId)}
      />
    );
  }

  // Mode 4 (Cognitive Profile)
  if (selectedModeId === 4) {
    return (
      <CognitiveProfileTerminal
        onBackToMenu={() => setSelectedModeId(null)}
        onRestart={onRestart}
        onSelectOtherMode={(modeId) => setSelectedModeId(modeId)}
      />
    );
  }

  // Mode 5 (Behavioral Profile)
  if (selectedModeId === 5) {
    return (
      <BehavioralProfileTerminal
        onBackToMenu={() => setSelectedModeId(null)}
        onRestart={onRestart}
        onSelectOtherMode={(modeId) => setSelectedModeId(modeId)}
      />
    );
  }

  // Mode 6 (Certifications)
  if (selectedModeId === 6) {
    return (
      <CertificationsTerminal
        onBackToMenu={() => setSelectedModeId(null)}
        onRestart={onRestart}
        onSelectOtherMode={(modeId) => setSelectedModeId(modeId)}
      />
    );
  }


  return (
    <div className="flex flex-col justify-between h-full min-h-[460px] font-mono leading-relaxed select-none text-[#ffb000] text-sm sm:text-base md:text-lg">
      
      <div className="flex flex-col gap-6">
        
        {/* Main Terminal Menu Selection */}
        {selectedModeId === null ? (
          <div className="flex flex-col gap-6 pt-2">
            
            {/* Header prompt instruction */}
            <div className="text-[#00ff66] font-bold flex items-center gap-2">
              <span>{"\u003E\u003E\u003E"}</span>
              <span>Select exploration mode:</span>
            </div>

            {/* 1-6 Mode Options List */}
            <div className="flex flex-col gap-3 pl-4 sm:pl-6 text-white font-bold">
              {explorationModes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className="flex items-center gap-3 cursor-pointer hover:text-[#00ff66] hover:translate-x-1 transition-all group w-fit"
                >
                  <span className="text-[#ffb000] font-bold group-hover:text-[#00ff66]">
                    {mode.id}.
                  </span>
                  <span className="group-hover:underline">
                    {mode.title}
                  </span>
                </div>
              ))}
            </div>

            {/* History logs if unrecognized commands entered */}
            {commandLogs.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#ffb000]/20 text-xs sm:text-sm">
                {commandLogs.map((log, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <div className="text-[#ffb000]/60">&gt; {log.command}</div>
                    <div className="text-[#ff5555]">{log.output}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        ) : (
          /* Active Selected Mode Placeholder Display */
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex items-center justify-between border-b border-[#ffb000]/30 pb-3 text-xs tracking-widest text-[#ffb000]/70">
              <span className="text-[#00ff66] font-bold">
                MODE 0{selectedModeId} // {explorationModes.find(m => m.id === selectedModeId)?.title.toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedModeId(null)}
                className="text-xs text-[#ffb000] hover:underline cursor-pointer font-bold"
              >
                [BACK TO MENU]
              </button>
            </div>

            <div className="p-4 rounded bg-black/60 border border-[#ffb000]/40 flex flex-col gap-3">
              <div className="text-[#00ff66] font-bold text-lg sm:text-xl">
                {selectedModeId}. {explorationModes.find(m => m.id === selectedModeId)?.title}
              </div>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed font-light">
                [Mode 0{selectedModeId} initialized. Ready to build step-by-step content for this section.]
              </p>
            </div>

            <div className="text-xs text-[#ffb000]/70 flex items-center gap-2">
              <span>Type</span>
              <span className="text-white font-bold border border-[#ffb000]/40 px-1.5 py-0.5 rounded cursor-pointer" onClick={() => setSelectedModeId(null)}>menu</span>
              <span>or press [1-6] to switch mode.</span>
            </div>
          </div>
        )}

      </div>

      {/* Terminal Command Input Prompt */}
      <div className="pt-8 pb-2 flex flex-col gap-2">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-3 w-full border-t border-[#ffb000]/20 pt-4">
          <span className="text-[#00ff66] font-bold whitespace-nowrap">
            {"\u003E\u003E\u003E"} Insert command:
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={selectedModeId === null ? "type 1-6 or option name..." : "type 1-6 or 'menu'..."}
              className="w-full bg-transparent border-none outline-none font-mono text-sm sm:text-base text-[#ffb000] placeholder:text-[#ffb000]/30"
              autoFocus
            />
            <span className="w-2 h-5 bg-[#ffb000] ml-0.5 animate-pulse inline-block" />
          </div>
        </form>
      </div>

    </div>
  );
};
