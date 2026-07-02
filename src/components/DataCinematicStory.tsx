import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const renderLineWithHighlight = (text: string) => {
  const target1 = "active commercial intelligence";
  const target2 = "step in";
  
  if (text.includes(target1)) {
    const parts = text.split(target1);
    return (
      <span>
        {parts[0]}
        <span className="text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold">{target1}</span>
        {parts[1]}
      </span>
    );
  }
  
  if (text.includes(target2)) {
    const parts = text.split(target2);
    return (
      <span>
        {parts[0]}
        <span className="text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold">{target2}</span>
        {parts[1]}
      </span>
    );
  }
  
  return <span>{text}</span>;
};

interface TypewriterLineProps {
  lines: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  onComplete?: () => void;
  isActive: boolean;
}

const TypewriterLine: React.FC<TypewriterLineProps> = ({
  lines,
  typingSpeed = 30,
  pauseDuration = 800,
  onComplete,
  isActive
}) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>(lines.map(() => ''));
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    if (currentLineIndex >= lines.length) {
      if (onComplete) onComplete();
      return;
    }

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    const currentTargetText = lines[currentLineIndex];
    if (currentCharIndex < currentTargetText.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const next = [...prev];
          next[currentLineIndex] = currentTargetText.slice(0, currentCharIndex + 1);
          return next;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, typingSpeed + Math.random() * 10);
      return () => clearTimeout(timer);
    } else {
      setIsPaused(true);
    }
  }, [currentLineIndex, currentCharIndex, isPaused, lines, typingSpeed, pauseDuration, isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="flex flex-col gap-4 font-display text-left">
      {displayedLines.map((line, i) => {
        const isActiveLine = i === currentLineIndex;
        const isCompletedLine = i < currentLineIndex;
        const isFinished = currentLineIndex >= lines.length;
        if (!line && !isActiveLine && !isCompletedLine) return null;
        
        let textStyleClass = 'text-white/40';
        if (isActiveLine) {
          textStyleClass = 'text-[#EAFF00] drop-shadow-[0_0_12px_rgba(234,255,0,0.15)]';
        } else if (isFinished && i === lines.length - 1) {
          textStyleClass = 'text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.2)] font-semibold';
        }

        return (
          <div
            key={i}
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-tight transition-all duration-500 min-h-[1.2em] flex items-center ${textStyleClass}`}
          >
            {renderLineWithHighlight(line)}
            {isActiveLine && !isPaused && (
              <span className="w-1.5 h-[1.1em] bg-[#EAFF00] ml-2 inline-block animate-pulse shadow-[0_0_8px_#EAFF00]" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function DataCinematicStory() {
  const [activePhase, setActivePhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection observer to trigger typing when section enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-[#1e0a05] py-24 md:py-32 overflow-hidden border-t border-white/5"
    >
      {/* Soft background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-white rounded-full blur-xs animate-ping" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[60%] left-[70%] w-3 h-3 bg-[#EAFF00]/35 rounded-full blur-sm animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] left-[10%] w-1.5 h-1.5 bg-[#EAFF00]/25 rounded-full blur-xs animate-bounce" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[80%] left-[40%] w-2.5 h-2.5 bg-white/15 rounded-full blur-xs animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 z-10 flex flex-col gap-16 md:gap-24">
        
        {/* Step 1 Typewriter */}
        {isInView && (
          <TypewriterLine 
            lines={[
              "Most organisations think they need more data.",
              "They don't.",
              "They have an activation problem."
            ]}
            isActive={activePhase >= 0}
            onComplete={() => {
              if (activePhase === 0) setTimeout(() => setActivePhase(1), 1000);
            }}
          />
        )}

        {/* Step 2 Typewriter */}
        <TypewriterLine 
          lines={[
            "Raw signals are everywhere.",
            "Siloed across campaign channels, web visits, CRM events, and sales systems."
          ]}
          isActive={activePhase >= 1}
          onComplete={() => {
            if (activePhase === 1) setTimeout(() => setActivePhase(2), 1000);
          }}
        />

        {/* Step 3 Typewriter */}
        <TypewriterLine 
          lines={[
            "Dashboards report what happened.",
            "But they rarely change what happens next."
          ]}
          isActive={activePhase >= 2}
          onComplete={() => {
            if (activePhase === 2) setTimeout(() => setActivePhase(3), 1000);
          }}
        />

        {/* Step 4 Final Resolution */}
        <TypewriterLine 
          lines={[
            "This is where I step in.",
            "Turning raw data into active commercial intelligence."
          ]}
          isActive={activePhase >= 3}
          pauseDuration={1000}
        />

      </div>
    </div>
  );
}
