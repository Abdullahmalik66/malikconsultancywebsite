import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Tv, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { terminalAudio } from '../../lib/terminalAudio';

interface CRTScreenWrapperProps {
  children: React.ReactNode;
  currentScreenIndex?: number;
}

export const CRTScreenWrapper: React.FC<CRTScreenWrapperProps> = ({ children, currentScreenIndex = 1 }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(terminalAudio.getMuted());
  const [hasCRTScanlines, setHasCRTScanlines] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const muted = terminalAudio.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      terminalAudio.playKeyClick();
    }
  };

  const toggleCRT = () => {
    setHasCRTScanlines(prev => !prev);
    terminalAudio.playKeyClick();
  };

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
    terminalAudio.playKeyClick();
  };

  return (
    <div className="min-h-screen w-full bg-[#070604] text-[#ffb000] font-mono selection:bg-[#ffb000] selection:text-[#0b0904] flex flex-col justify-between items-center p-3 sm:p-6 md:p-10 relative overflow-hidden">
      
      {/* Outer Retro Bezel Top Controls Header */}
      <header className="w-full max-w-[1400px] flex items-center justify-between z-30 pb-3 border-b border-[#ffb000]/20 text-xs tracking-wider">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#ffb000]/10 border border-[#ffb000]/30 text-[#ffb000] hover:bg-[#ffb000] hover:text-[#0b0904] transition-all font-bold uppercase"
            onClick={() => terminalAudio.playKeyClick()}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Site</span>
          </Link>
          <span className="hidden sm:inline-block text-[#ffb000]/50">|</span>
          <span className="hidden sm:inline-block font-mono text-[#ffb000]/80">
            SYSTEM_STATUS: <span className="text-[#00ff66] font-bold">ONLINE</span> [PHASE_0{currentScreenIndex}/03]
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-xs font-mono uppercase cursor-pointer ${
              !isAudioMuted 
                ? 'bg-[#ffb000]/20 border-[#ffb000] text-[#ffb000]' 
                : 'bg-black/40 border-[#ffb000]/30 text-[#ffb000]/40 hover:text-[#ffb000]'
            }`}
            title="Toggle Web Audio SFX"
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{!isAudioMuted ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={toggleCRT}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-xs font-mono uppercase cursor-pointer ${
              hasCRTScanlines 
                ? 'bg-[#ffb000]/20 border-[#ffb000] text-[#ffb000]' 
                : 'bg-black/40 border-[#ffb000]/30 text-[#ffb000]/40 hover:text-[#ffb000]'
            }`}
            title="Toggle CRT Screen Filters"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{hasCRTScanlines ? 'CRT FX: ON' : 'CRT FX: OFF'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreenMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#ffb000]/30 bg-black/40 text-[#ffb000]/70 hover:text-[#ffb000] hover:border-[#ffb000] transition-all text-xs font-mono uppercase cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main CRT Monitor Enclosure Frame */}
      <main className="w-full max-w-[1400px] flex-1 my-4 relative flex flex-col justify-center items-center z-20">
        
        {/* Retro Monitor Physical Bezel Rim */}
        <div className="w-full h-full min-h-[75vh] md:min-h-[82vh] bg-[#16130c] border-[10px] sm:border-[16px] md:border-[22px] border-[#221c12] rounded-[24px] sm:rounded-[36px] md:rounded-[48px] shadow-[0_0_80px_rgba(255,176,0,0.12),inset_0_0_30px_rgba(0,0,0,0.9)] p-2 sm:p-4 md:p-6 relative flex flex-col justify-between overflow-hidden">
          
          {/* Bezel Power LED indicator dot */}
          <div className="absolute top-2 right-6 sm:top-3 sm:right-10 flex items-center gap-2 z-40">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66] animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-[#ffb000]/40 uppercase hidden sm:inline">POWER_OK</span>
          </div>

          {/* Actual CRT Phosphor Display Screen Tube - Warm dark olive/amber phosphor glass matching reference */}
          <div 
            className={`relative w-full flex-1 rounded-[16px] sm:rounded-[24px] overflow-hidden flex flex-col p-4 sm:p-8 md:p-12 text-[#ffdb4d] ${
              hasCRTScanlines ? 'crt-barrel-screen' : ''
            }`}
            style={{ 
              background: 'radial-gradient(circle at center, #141b0d 0%, #0d1208 60%, #060904 100%)',
              boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.96), inset 0 0 50px rgba(0, 0, 0, 0.95)'
            }}
          >
            
            {/* Phosphor Amber Text Glow & Ambient Light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,0,0.05)_0%,transparent_75%)] pointer-events-none z-10" />

            {/* CRT Screen Scanline Rows Effect - Clean Dark Scanlines */}
            {hasCRTScanlines && (
              <div 
                className="absolute inset-0 pointer-events-none z-20 opacity-35"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, transparent, transparent 50%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.5))',
                  backgroundSize: '100% 4px'
                }}
              />
            )}

            {/* Dark Screen Edge Vignette Overlay */}
            {hasCRTScanlines && (
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.9), inset 0 0 35px rgba(0, 0, 0, 0.95)'
                }}
              />
            )}

            {/* Screen Content Viewport */}
            <div className="relative z-30 flex-1 flex flex-col justify-between overflow-y-auto pr-1">
              {children}
            </div>

          </div>

        </div>

      </main>

      {/* Footer System Status Ribbon */}
      <footer className="w-full max-w-[1400px] flex items-center justify-between text-[11px] font-mono text-[#ffb000]/50 pt-2 z-30 border-t border-[#ffb000]/10">
        <div>
          <span>MALIK_SYSTEMS // ENTERPRISE INTELLIGENCE TERMINAL</span>
        </div>
        <div className="hidden sm:block">
          <span>KEYBOARD: [ENTER / ARROWS / NUMS 1-5] ACTIVE</span>
        </div>
      </footer>

      {/* Scoped CSS for CRT Curved Screen Glass Effect & Phosphor Bloom */}
      <style>{`
        .crt-barrel-screen {
          text-shadow: 0 0 8px rgba(255, 210, 0, 0.75), 0 0 16px rgba(255, 176, 0, 0.4);
        }
      `}</style>

    </div>
  );
};
