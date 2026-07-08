import { useState, useEffect, useRef } from 'react';
import { terminalAudio } from '../../lib/terminalAudio';

/**
 * Custom hook to simulate retro typewriter rendering of text lines sequentially.
 */
export const useTypewriter = (
  lines: string[],
  speed = 18,
  active = true,
  onComplete?: () => void
) => {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Keep track of printing state
  const stateRef = useRef({
    lines,
    lineIndex: 0,
    charIndex: 0,
    currentLines: [] as string[]
  });

  useEffect(() => {
    if (!active || lines.length === 0) {
      setTypedLines([]);
      setIsTyping(false);
      return;
    }

    setTypedLines([]);
    setIsTyping(true);

    stateRef.current = {
      lines,
      lineIndex: 0,
      charIndex: 0,
      currentLines: []
    };

    let timer: NodeJS.Timeout;

    const tick = () => {
      const { lines: targetLines, lineIndex, charIndex, currentLines } = stateRef.current;

      if (lineIndex >= targetLines.length) {
        setIsTyping(false);
        terminalAudio.playBootBeep();
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
        return;
      }

      const targetLine = targetLines[lineIndex];

      if (targetLine === '') {
        const nextLines = [...currentLines, ''];
        stateRef.current.currentLines = nextLines;
        stateRef.current.lineIndex = lineIndex + 1;
        stateRef.current.charIndex = 0;
        setTypedLines(nextLines);
        timer = setTimeout(tick, speed);
      } else {
        const nextCharIndex = charIndex + 1;
        const partial = targetLine.slice(0, nextCharIndex);
        const nextLines = [...currentLines];
        nextLines[lineIndex] = partial;

        stateRef.current.currentLines = nextLines;
        stateRef.current.charIndex = nextCharIndex;
        setTypedLines(nextLines);

        // Play typewriter keyboard click
        const typedChar = targetLine[charIndex];
        if (typedChar && typedChar !== ' ' && nextCharIndex % 2 === 0) {
          terminalAudio.playKeyClick();
        }

        if (nextCharIndex >= targetLine.length) {
          stateRef.current.lineIndex = lineIndex + 1;
          stateRef.current.charIndex = 0;
        }

        timer = setTimeout(tick, speed);
      }
    };

    timer = setTimeout(tick, speed);

    return () => clearTimeout(timer);
  }, [lines, active, speed]);

  const skip = () => {
    if (!isTyping) return;
    setIsTyping(false);
    setTypedLines(lines);
    stateRef.current.currentLines = [...lines];
    stateRef.current.lineIndex = lines.length;
    stateRef.current.charIndex = 0;
    terminalAudio.playBootBeep();
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  return { typedLines, isTyping, skip };
};
