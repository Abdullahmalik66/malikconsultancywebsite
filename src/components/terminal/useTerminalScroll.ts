import { useEffect, RefObject } from 'react';

/**
 * Custom hook to automatically scroll the closest scrollable parent container to the bottom.
 * Useful for terminal-like append logs.
 */
export const useTerminalScroll = (
  triggerRef: RefObject<HTMLElement | null>,
  deps: any[]
) => {
  useEffect(() => {
    if (triggerRef.current) {
      // Traverse up to find the scrollable viewport container
      let parent = triggerRef.current.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          parent.scrollTop = parent.scrollHeight;
          break;
        }
        parent = parent.parentElement;
      }
    }
  }, deps);
};
