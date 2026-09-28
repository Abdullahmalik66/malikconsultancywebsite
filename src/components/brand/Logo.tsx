/**
 * Abdullah Malik Consultancy — Brand Mark: "The Bracket Mark"
 * ------------------------------------------------------------------
 * The name is set inside code-style brackets — [ ABDULLAH_MALIK ] — in a
 * geometric monospace face. It reads as engineered and precise: a direct,
 * legible nod to the AI/software craft at the centre of the practice,
 * while remaining a serious, professional consultancy mark (no unrelated
 * pictogram). The brackets double as a compact "[AM]" badge for square
 * contexts — social avatars, favicons, certificate seals.
 *
 * The mark is "alive" in two ways:
 *  1. It switches between exactly two fixed colour sets — one tuned for
 *     dark backdrops, one for light — based on what's actually rendered
 *     behind it (see `useBackdropTheme`), rather than continuously cycling
 *     hues (which never suits every section equally).
 *  2. The underscore between "ABDULLAH" and "MALIK" blinks like a terminal
 *     cursor.
 */
import { useBackdropTheme } from './useBackdropTheme';

export type LogoTone = 'auto' | 'ink' | 'brand' | 'neon' | 'white';

// Fixed colour pairs: a text colour plus a contrasting accent used for both
// the brackets and the blinking cursor underscore.
const TONE_STYLE: Record<Exclude<LogoTone, 'auto'>, { text: string; accent: string }> = {
  ink: { text: '#1a102e', accent: '#6d55a7' },
  brand: { text: '#6d55a7', accent: '#eaff00' },
  neon: { text: '#eaff00', accent: '#1a102e' },
  white: { text: '#ffffff', accent: '#eaff00' },
};

// The two "auto" states this mark switches between depending on the
// backdrop it currently sits over — a dark-bg set (white text, neon accent)
// and a light-bg set (ink text, brand-purple accent).
const AUTO_STYLE = {
  dark: TONE_STYLE.white,
  light: TONE_STYLE.ink,
};

interface WordmarkProps {
  className?: string;
  tagline?: string | false;
  align?: 'left' | 'center';
  /** Fixed colour for the brackets + blinking cursor underscore. Omit to inherit the adaptive `currentColor` set on a wrapping element. */
  accentColor?: string;
}

export function Wordmark({ className = '', tagline = '// CONSULTANCY', align = 'left', accentColor }: WordmarkProps) {
  const accentStyle = accentColor ? { color: accentColor } : undefined;
  return (
    <span className={`flex flex-col leading-none font-brand-mono ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      <span className="font-semibold tracking-tight text-[1em] whitespace-nowrap">
        <span style={accentStyle}>[</span>
        <span> ABDULLAH</span>
        <span className="brand-cursor-blink" style={accentStyle}>_</span>
        <span>MALIK </span>
        <span style={accentStyle}>]</span>
      </span>
      {tagline && (
        <span className="font-medium tracking-[0.3em] text-[0.32em] opacity-60 mt-1.5 uppercase whitespace-nowrap">
          {tagline}
        </span>
      )}
    </span>
  );
}

interface LogoProps {
  /** 'auto' = switches between a dark-backdrop and light-backdrop colour set based on what's actually behind it. Any other tone renders one fixed, static colour set — use for footers, print, exports. */
  tone?: LogoTone;
  tagline?: string | false;
  align?: 'left' | 'center';
  className?: string;
}

export default function Logo({ tone = 'auto', tagline = '// CONSULTANCY', align = 'left', className = '' }: LogoProps) {
  const backdrop = useBackdropTheme();
  const { text, accent } = tone === 'auto' ? AUTO_STYLE[backdrop] : TONE_STYLE[tone];

  return (
    <span className={`inline-flex transition-colors duration-300 ${className}`} style={{ color: text }}>
      <Wordmark align={align} tagline={tagline} accentColor={accent} />
    </span>
  );
}

interface LogoBadgeProps {
  className?: string;
  tone?: Exclude<LogoTone, 'auto'>;
  background?: string;
}

/**
 * Compact square "[AM]" badge for contexts a full wordmark doesn't fit:
 * social media avatars, favicons/app icons, certificate seals.
 */
export function LogoBadge({ className = 'w-16 h-16 text-xl', tone = 'ink', background }: LogoBadgeProps) {
  const { text, accent } = TONE_STYLE[tone];
  const defaultBg = tone === 'brand' ? '#6d55a7' : tone === 'white' ? '#ffffff' : '#1a102e';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl font-brand-mono font-bold ${className}`}
      style={{ background: background ?? defaultBg }}
    >
      <span style={{ color: accent }}>[</span>
      <span style={{ color: text }}>AM</span>
      <span style={{ color: accent }}>]</span>
    </span>
  );
}
