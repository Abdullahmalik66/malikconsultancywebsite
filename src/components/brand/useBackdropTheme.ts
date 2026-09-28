/**
 * Detects whether a fixed-position point on screen currently sits over a
 * dark or light backdrop, so a fixed-position brand mark can switch between
 * exactly two colour sets (rather than continuously cycling hues, which
 * doesn't reliably suit every section background).
 *
 * Implementation: samples `document.elementFromPoint` at a screen
 * coordinate just above the floating nav (where the fixed nav itself has
 * nothing rendered, so the sample always hits real page content), walks up
 * the DOM for the first element with an opaque background-color, and
 * classifies it by perceptual luminance. Re-samples on scroll/resize.
 */
import { useEffect, useRef, useState } from 'react';

export type BackdropTheme = 'dark' | 'light';

function parseRgba(color: string): [number, number, number, number] | null {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => parseFloat(part.trim()));
  const [r, g, b, a = 1] = parts;
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b, a];
}

function perceptualLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function useBackdropTheme(sampleX = 28, sampleY = 12): BackdropTheme {
  const [theme, setTheme] = useState<BackdropTheme>('dark');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const sample = () => {
      const el = document.elementFromPoint(sampleX, sampleY);
      let node: Element | null = el;
      while (node) {
        const rgba = parseRgba(getComputedStyle(node).backgroundColor);
        if (rgba && rgba[3] > 0.5) {
          const luminance = perceptualLuminance(rgba[0], rgba[1], rgba[2]);
          setTheme(luminance > 0.5 ? 'light' : 'dark');
          return;
        }
        node = node.parentElement;
      }
    };

    const scheduleSample = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        sample();
      });
    };

    sample();
    window.addEventListener('scroll', scheduleSample, { passive: true });
    window.addEventListener('resize', scheduleSample);
    return () => {
      window.removeEventListener('scroll', scheduleSample);
      window.removeEventListener('resize', scheduleSample);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [sampleX, sampleY]);

  return theme;
}
