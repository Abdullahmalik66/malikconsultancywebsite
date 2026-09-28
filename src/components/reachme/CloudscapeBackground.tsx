import React from 'react';

/**
 * "Dreamscape Horizon" — an ambient, cinematic skyscape.
 *
 * Art direction:
 *  - Three parallax cloud layers (far / mid / near) create pseudo-3D depth:
 *    far clouds are small, slow and hazy; near clouds are large, brighter,
 *    softer and glide faster — the same visual grammar as a real horizon.
 *  - A breathing sun halo with a slowly swaying ray fan warms the top corner.
 *  - Tiny light motes rise like dust caught in morning light.
 *  - The sky tone crossfades between dawn blue and soft lavender over ~44s.
 *
 * Everything animates with GPU-composited transforms/opacity only,
 * and all motion is disabled under `prefers-reduced-motion`.
 */

interface CloudSpec {
  top: string;
  scale: number;
  duration: number; // seconds for a full screen crossing
  delay: number; // negative delay pre-distributes clouds across the sky
  opacity: number;
  blur: number;
  bobDuration: number;
}

const CLOUDS: CloudSpec[] = [
  // ── Far layer: small, slow, hazy (deep in the scene)
  { top: '5%', scale: 0.5, duration: 95, delay: -18, opacity: 0.6, blur: 10, bobDuration: 13 },
  { top: '13%', scale: 0.42, duration: 105, delay: -62, opacity: 0.5, blur: 12, bobDuration: 15 },
  { top: '22%', scale: 0.56, duration: 88, delay: -80, opacity: 0.55, blur: 11, bobDuration: 12 },
  // ── Mid layer: the storytellers of the scene
  { top: '30%', scale: 0.9, duration: 62, delay: -28, opacity: 0.75, blur: 14, bobDuration: 10 },
  { top: '42%', scale: 0.78, duration: 70, delay: -54, opacity: 0.68, blur: 15, bobDuration: 12 },
  { top: '52%', scale: 0.84, duration: 66, delay: -10, opacity: 0.7, blur: 14, bobDuration: 11 },
  // ── Near layer: large, bright, dreamy (floats past the viewer)
  { top: '60%', scale: 1.35, duration: 42, delay: -15, opacity: 0.92, blur: 18, bobDuration: 9 },
  { top: '72%', scale: 1.6, duration: 36, delay: -27, opacity: 0.95, blur: 21, bobDuration: 11 },
  { top: '80%', scale: 1.45, duration: 46, delay: -40, opacity: 0.9, blur: 20, bobDuration: 10 },
];

interface MoteSpec {
  left: string;
  bottom: string;
  size: number;
  duration: number;
  delay: number;
}

const MOTES: MoteSpec[] = [
  { left: '12%', bottom: '18%', size: 4, duration: 24, delay: -4 },
  { left: '26%', bottom: '8%', size: 3, duration: 30, delay: -14 },
  { left: '41%', bottom: '14%', size: 5, duration: 26, delay: -9 },
  { left: '58%', bottom: '6%', size: 3, duration: 32, delay: -20 },
  { left: '71%', bottom: '16%', size: 4, duration: 22, delay: -2 },
  { left: '84%', bottom: '10%', size: 3, duration: 28, delay: -17 },
  { left: '93%', bottom: '22%', size: 4, duration: 25, delay: -11 },
];

function Cloud({ spec }: { spec: CloudSpec }) {
  return (
    <div
      className="rm-cloud-drift absolute left-0"
      style={{
        top: spec.top,
        animationDuration: `${spec.duration}s`,
        animationDelay: `${spec.delay}s`,
      }}
    >
      <div className="rm-cloud-bob" style={{ animationDuration: `${spec.bobDuration}s` }}>
        <div style={{ transform: `scale(${spec.scale})`, opacity: spec.opacity }}>
          <div
            className="rm-cloud-shape"
            style={{ filter: `blur(${spec.blur}px) drop-shadow(0 14px 18px rgba(126, 156, 200, 0.28))` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CloudscapeBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* ── Sky base: still dawn blue */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#CFE3F6] via-[#E7F1FA] to-[#F0ECF7]" />

      {/* ── Sky tone crossfade: warms toward soft lavender then returns */}
      <div className="rm-sky-shift absolute inset-0 bg-gradient-to-b from-[#D6DFF6] via-[#EFEFF9] to-[#F2E9F3]" />

      {/* ── Sun halo: layered breathing glow in the top-right */}
      <div className="absolute -top-[16%] right-[4%] w-[560px] h-[560px]">
        <div
          className="rm-sun absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,248,222,0.9) 0%, rgba(255,244,214,0.45) 30%, rgba(255,246,225,0.12) 55%, transparent 72%)',
          }}
        />
        <div
          className="rm-sun absolute inset-[18%] rounded-full"
          style={{
            animationDelay: '-4.5s',
            background:
              'radial-gradient(circle, rgba(255,253,244,0.95) 0%, rgba(255,247,222,0.35) 45%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Sun rays: oversized conic fan, swaying almost imperceptibly */}
      <div
        className="rm-rays absolute -top-[62%] -right-[28%] w-[1200px] h-[1200px]"
        style={{
          background:
            'conic-gradient(from 155deg at 50% 50%, transparent 0deg, rgba(255,246,214,0.16) 6deg, transparent 13deg, rgba(255,246,214,0.10) 22deg, transparent 30deg, rgba(255,246,214,0.14) 41deg, transparent 50deg, rgba(255,246,214,0.08) 60deg, transparent 70deg)',
          transformOrigin: '50% 50%',
        }}
      />

      {/* ── Parallax cloud layers (far → near) */}
      {CLOUDS.map((spec, i) => (
        <Cloud key={i} spec={spec} />
      ))}

      {/* ── Light motes: dust rising through morning light */}
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="rm-mote absolute rounded-full bg-white"
          style={{
            left: m.left,
            bottom: m.bottom,
            width: m.size,
            height: m.size,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            boxShadow: '0 0 10px 3px rgba(255,255,255,0.75), 0 0 22px 8px rgba(255,250,230,0.28)',
          }}
        />
      ))}

      {/* ── Horizon mist: grounds the scene, softens the lower third */}
      <div className="absolute bottom-0 left-0 right-0 h-[32%] bg-gradient-to-t from-white/70 via-white/25 to-transparent" />
    </div>
  );
}
