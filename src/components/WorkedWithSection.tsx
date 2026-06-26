import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAllClientLogos, ClientLogoItem, getClientShowcaseSettings } from '../lib/firebase/cms';

interface LogoItem {
  name: string;
  src: string;
  padding: string;
}

// Ring 0 (Innermost static ring: w-[100px] h-[100px])
const ring0Logos: LogoItem[] = [
  { name: 'Adpro', src: '/images/logos/adpro.svg', padding: 'p-3' },
  { name: 'VTT', src: '/images/logos/vtt.png', padding: 'p-3.5' },
  { name: 'QuietOn', src: '/images/logos/quieton.jpeg', padding: 'p-3' },
];

// Ring 1 (Radius 340px, w-[120px] h-[120px])
const ring1Logos: LogoItem[] = [
  { name: 'Mercedes-Benz', src: '/images/logos/mercedes-benz-logo-png_seeklogo-190348.png', padding: 'p-3.5' },
  { name: 'Vodafone', src: '/images/logos/hd-vodafone-logo-transparent-background-701751694713984m4g61ghlmo.png', padding: 'p-3.5' },
  { name: 'Nissan', src: '/images/logos/Nissan.png', padding: 'p-3' },
  { name: 'Pirelli', src: '/images/logos/pirelli-logo.png', padding: 'p-3.5' },
  { name: 'Deutsche GigaNetz', src: '/images/logos/Deutsche_Giganetz_logo.svg.png', padding: 'p-3' },
  { name: 'Vaisala', src: '/images/logos/Vaisala_logo.svg.png', padding: 'p-4' },
];

// Ring 2 (Radius 500px, w-[140px] h-[140px])
const ring2Logos: LogoItem[] = [
  { name: 'Neste', src: '/images/logos/Neste_logo.png', padding: 'p-3' },
  { name: 'PriceRunner', src: '/images/logos/PriceRunner_Logo_2019.svg.png', padding: 'p-2' },
  { name: 'Swarovski', src: '/images/logos/swarovski-logo.png', padding: 'p-3' },
  { name: 'iLoq', src: '/images/logos/iloq.png', padding: 'p-3' },
  { name: 'McDonald\'s', src: '/images/logos/McDonald\'s_Golden_Arches.svg.png', padding: 'p-3' },
  { name: 'Kaarisilta', src: '/images/logos/Kaarisilta_logo.png', padding: 'p-2.5' },
  { name: 'Avaus', src: '/images/logos/avaus.jpg', padding: 'p-2.5' },
];

// Ring 3 (Radius 660px, w-[140px] h-[140px])
const ring3Logos: LogoItem[] = [
  { name: 'Renault', src: '/images/logos/renaultlogo.png', padding: 'p-2' },
  { name: 'HBO', src: '/images/logos/HBO_Portugal.svg.png', padding: 'p-2.5' },
  { name: 'Viking Line', src: '/images/logos/Viking_Line_wordmark.svg.png', padding: 'p-1.5' },
  { name: 'Revieve', src: '/images/logos/Revieve_Logo_Negative.png', padding: 'p-2' },
  { name: 'AM Kiinteistöpalvelut', src: '/images/logos/AMkiinestopalvelut.png', padding: 'p-2' },
  { name: 'Woodor Design', src: '/images/logos/woodordesign.jpeg', padding: 'p-2' },
];

// Flat list for mobile marquee
const allLogos = [...ring0Logos, ...ring1Logos, ...ring2Logos, ...ring3Logos];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
}

export default function WorkedWithSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Load showcase logos from Firebase Realtime Database
  const [dbLogos, setDbLogos] = useState<ClientLogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Organisation I Worked With:");
  const [description, setDescription] = useState("A selection of organisations I’ve worked with through consulting-led engagements, contributing to growth, data, and AI-driven initiatives.");

  useEffect(() => {
    let active = true;
    
    // Load logos
    getAllClientLogos()
      .then((data) => {
        if (active) {
          setDbLogos(data.filter((item) => item.active));
        }
      })
      .catch((err) => {
        console.error("Failed to load showcase logos:", err);
      });

    // Load settings
    getClientShowcaseSettings()
      .then((settings) => {
        if (active) {
          setTitle(settings.title);
          setDescription(settings.description);
        }
      })
      .catch((err) => {
        console.error("Failed to load showcase settings:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Radii matching the reference image layout - expanded for spaciousness
  const R_inner = 180;  // Ring 0 (Innermost filled arch)
  const R_mid1 = 340;   // Ring 1 (Mercedes, Vodafone, Nissan)
  const R_mid2 = 500;   // Ring 2 (Neste, PriceRunner, etc.)
  const R_outer = 660;  // Ring 3 (Renault, HBO, etc.)

  const getRingLogos = (ringIndex: number): { name: string; src: string; padding: string }[] => {
    const ringDbLogos = dbLogos.filter((l) => l.ringIndex === ringIndex);
    if (ringDbLogos.length > 0) {
      return [...ringDbLogos]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((l) => ({
          name: l.name,
          src: l.logoUrl,
          padding: l.padding,
        }));
    }
    
    // Fallback to static lists
    switch (ringIndex) {
      case 0:
        return ring0Logos;
      case 1:
        return ring1Logos;
      case 2:
        return ring2Logos;
      case 3:
        return ring3Logos;
      default:
        return [];
    }
  };

  const getInitialAngle = (index: number, total: number, isRing: 'inner' | 'mid1' | 'mid2' | 'outer') => {
    if (prefersReducedMotion) {
      // Static placement in the top-half arch
      if (isRing === 'inner') {
        const angles = [198, 234, 270, 306, 342];
        return angles[index] || 270;
      } else if (isRing === 'mid1') {
        const angles = [215, 270, 325];
        return angles[index] || 270;
      } else if (isRing === 'mid2') {
        const angles = [195, 245, 295, 345];
        return angles[index] || 270;
      } else {
        const angles = [188, 229, 270, 311, 352];
        return angles[index] || 270;
      }
    } else {
      // Rotation placement around 360 degrees
      const baseAngle = (360 / total) * index;
      if (isRing === 'inner') {
        return baseAngle;
      } else {
        const offset = isRing === 'mid1' ? 45 : isRing === 'mid2' ? 15 : 75;
        return baseAngle + offset;
      }
    }
  };

  // Combine logos for mobile marquee fallback
  const activeAllLogos = dbLogos.length > 0
    ? [...dbLogos]
        .sort((a, b) => {
          if (a.ringIndex !== b.ringIndex) return a.ringIndex - b.ringIndex;
          return a.sortOrder - b.sortOrder;
        })
        .map((l) => ({ name: l.name, src: l.logoUrl, padding: l.padding }))
    : [...ring0Logos, ...ring1Logos, ...ring2Logos, ...ring3Logos];

  return (
    <section 
      className="relative pt-32 pb-0 px-6 md:px-12 lg:px-24 bg-white dark:bg-[#16151A] overflow-visible transition-colors duration-500" 
      id="organisations-worked-with"
    >
      {/* Background Ambient Radial Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[740px] pointer-events-none z-0" 
        style={{
          backgroundImage: 'radial-gradient(circle at bottom, var(--m3-primary-radial-glow, rgba(103, 80, 164, 0.04)) 0%, transparent 65%)'
        }}
      />

      <style>{`
        :root {
          --m3-primary-radial-glow: rgba(103, 80, 164, 0.05);
        }
        html.dark {
          --m3-primary-radial-glow: rgba(208, 188, 255, 0.035);
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto relative z-10 overflow-visible">
        {/* Header Section */}
        <div className="flex flex-col items-start text-left mb-16">
          <div className="flex items-center gap-2 mb-4 justify-start">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d55a7] dark:text-[#d0bcff]">
              collaborations
            </span>
            <div className="h-px w-8 bg-[#6d55a7]/20 dark:bg-[#d0bcff]/20" />
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-[56px] font-display font-medium text-m3-on-surface leading-[1.1] mb-6 tracking-[-0.03em]"
          >
            {title}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-m3-on-surface/60 font-sans leading-relaxed max-w-[750px]"
          >
            {description}
          </motion.p>

          {/* Orbits rotate continuously */}
        </div>

        {/* Orbit System (Desktop & Tablet) */}
        {/* Heights map exactly to scaled baseline of the outer circle to eliminate vertical gaps */}
        <div 
          className="hidden sm:flex relative w-full items-end justify-center select-none overflow-hidden h-[407px] md:h-[503px] lg:h-[629px] xl:h-[740px]"
        >
          {/* Internal Scaler Wrapper */}
          <div 
            className="absolute origin-bottom scale-[0.55] sm:scale-[0.55] md:scale-[0.68] lg:scale-[0.85] xl:scale-100 transition-transform duration-700 ease-out" 
            style={{ width: '1320px', height: '740px', bottom: '0px' }}
          >
            {/* SVG Background concentric orbits */}
            <svg 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[1320px] h-[740px] pointer-events-none overflow-visible z-0" 
              style={{ width: 1320, height: 740 }}
            >
              <defs>
                <linearGradient id="orbit-gradient-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--m3-primary)" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="var(--m3-primary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--m3-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Ring 0 (Radius 180px) */}
              <circle cx="660" cy="740" r="180" fill="none" stroke="url(#orbit-gradient-stroke)" strokeWidth="1.25" />
              
              {/* Ring 1 (Radius 340px) */}
              <circle cx="660" cy="740" r="340" fill="none" stroke="url(#orbit-gradient-stroke)" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Ring 2 (Radius 500px) */}
              <circle cx="660" cy="740" r="500" fill="none" stroke="url(#orbit-gradient-stroke)" strokeWidth="1" />
              
              {/* Ring 3 (Radius 660px) */}
              <circle cx="660" cy="740" r="660" fill="none" stroke="url(#orbit-gradient-stroke)" strokeWidth="1.25" />
            </svg>

            {/* Concentric Step-Gradient Glow Domes */}
            {/* Ring 3 Background (Radius 660px) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#6d55a7]/[0.01] dark:border-white/[0.005] pointer-events-none z-0 orbit-glow-3" 
              style={{ width: R_outer * 2, height: R_outer * 2 }}
            />

            {/* Ring 2 Background (Radius 500px) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#6d55a7]/[0.02] dark:border-white/[0.01] pointer-events-none z-0 orbit-glow-2" 
              style={{ width: R_mid2 * 2, height: R_mid2 * 2 }}
            />

            {/* Ring 1 Background (Radius 340px) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#6d55a7]/[0.04] dark:border-white/[0.02] pointer-events-none z-0 orbit-glow-1" 
              style={{ width: R_mid1 * 2, height: R_mid1 * 2 }}
            />

            {/* Ring 0 Background (Radius 180px - Innermost) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#6d55a7]/[0.06] dark:border-white/[0.03] pointer-events-none z-0 orbit-glow-0" 
              style={{ width: R_inner * 2, height: R_inner * 2 }}
            />

            {/* Ring 0 - (Radius 180px, Logo: w-[100px] h-[100px]) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10" 
              style={{ width: R_inner * 2, height: R_inner * 2 }}
            >
              <div 
                className={`w-full h-full relative ${prefersReducedMotion ? '' : 'animate-orbit-ccw-slow'}`}
              >
                {getRingLogos(0).map((logo, idx, arr) => {
                  const initialAngle = getInitialAngle(idx, arr.length, 'inner');
                  const logoSize = 100;
                  return (
                    <div 
                      key={`ring0-${idx}`} 
                      className="absolute left-1/2 top-1/2" 
                      style={{ 
                        width: logoSize, 
                        height: logoSize,
                        '--initial-angle': `${initialAngle}deg`,
                        '--radius': `${R_inner}px`,
                        transform: 'translate(-50%, -50%) rotate(calc(var(--orbit-angle) + var(--initial-angle))) translateX(var(--radius)) rotate(calc(-1 * (var(--orbit-angle) + var(--initial-angle))))'
                      } as React.CSSProperties}
                    >
                      {/* Transparent Floating Logo Wrapper */}
                      <div className="w-full h-full flex items-center justify-center hover:scale-115 transition-all duration-300 group cursor-pointer relative z-20">
                        <img 
                          src={logo.src} 
                          alt={logo.name} 
                          className={`max-w-full max-h-full object-contain ${logo.padding} grayscale opacity-75 dark:brightness-0 dark:invert group-hover:grayscale-0 group-hover:opacity-100 group-hover:dark:brightness-100 group-hover:dark:invert-0 transition-all duration-500`}
                          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))' }}
                          loading="lazy"
                        />
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1A102E] text-white text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap z-50">
                          {logo.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ring 1 - (Radius 340px, Logo: w-[120px] h-[120px]) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10" 
              style={{ width: R_mid1 * 2, height: R_mid1 * 2 }}
            >
              <div 
                className={`w-full h-full relative ${prefersReducedMotion ? '' : 'animate-orbit-cw-slow'}`}
              >
                {getRingLogos(1).map((logo, idx, arr) => {
                  const initialAngle = getInitialAngle(idx, arr.length, 'mid1');
                  const logoSize = 120;
                  return (
                    <div 
                      key={`ring1-${idx}`} 
                      className="absolute left-1/2 top-1/2" 
                      style={{ 
                        width: logoSize, 
                        height: logoSize,
                        '--initial-angle': `${initialAngle}deg`,
                        '--radius': `${R_mid1}px`,
                        transform: 'translate(-50%, -50%) rotate(calc(var(--orbit-angle) + var(--initial-angle))) translateX(var(--radius)) rotate(calc(-1 * (var(--orbit-angle) + var(--initial-angle))))'
                      } as React.CSSProperties}
                    >
                      {/* Transparent Floating Logo Wrapper */}
                      <div className="w-full h-full flex items-center justify-center hover:scale-115 transition-all duration-300 group cursor-pointer relative z-20">
                        <img 
                          src={logo.src} 
                          alt={logo.name} 
                          className={`max-w-full max-h-full object-contain ${logo.padding} grayscale opacity-75 dark:brightness-0 dark:invert group-hover:grayscale-0 group-hover:opacity-100 group-hover:dark:brightness-100 group-hover:dark:invert-0 transition-all duration-500`}
                          style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))' }}
                          loading="lazy"
                        />
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1A102E] text-white text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap z-50">
                          {logo.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ring 2 - (Radius 500px, Logo: w-[140px] h-[140px]) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10" 
              style={{ width: R_mid2 * 2, height: R_mid2 * 2 }}
            >
              <div 
                className={`w-full h-full relative ${prefersReducedMotion ? '' : 'animate-orbit-ccw-medium'}`}
              >
                {getRingLogos(2).map((logo, idx, arr) => {
                  const initialAngle = getInitialAngle(idx, arr.length, 'mid2');
                  const logoSize = 140;
                  return (
                    <div 
                      key={`ring2-${idx}`} 
                      className="absolute left-1/2 top-1/2" 
                      style={{ 
                        width: logoSize, 
                        height: logoSize,
                        '--initial-angle': `${initialAngle}deg`,
                        '--radius': `${R_mid2}px`,
                        transform: 'translate(-50%, -50%) rotate(calc(var(--orbit-angle) + var(--initial-angle))) translateX(var(--radius)) rotate(calc(-1 * (var(--orbit-angle) + var(--initial-angle))))'
                      } as React.CSSProperties}
                    >
                      {/* Transparent Floating Logo Wrapper */}
                      <div className="w-full h-full flex items-center justify-center hover:scale-115 transition-all duration-300 group cursor-pointer relative z-20">
                        <img 
                          src={logo.src} 
                          alt={logo.name} 
                          className={`max-w-full max-h-full object-contain ${logo.padding} grayscale opacity-75 dark:brightness-0 dark:invert group-hover:grayscale-0 group-hover:opacity-100 group-hover:dark:brightness-100 group-hover:dark:invert-0 transition-all duration-500`}
                          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))' }}
                          loading="lazy"
                        />
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1A102E] text-white text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap z-50">
                          {logo.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ring 3 - (Radius 660px, Logo: w-[140px] h-[140px]) */}
            <div 
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10" 
              style={{ width: R_outer * 2, height: R_outer * 2 }}
            >
              <div 
                className={`w-full h-full relative ${prefersReducedMotion ? '' : 'animate-orbit-cw-very-slow'}`}
              >
                {getRingLogos(3).map((logo, idx, arr) => {
                  const initialAngle = getInitialAngle(idx, arr.length, 'outer');
                  const logoSize = 140;
                  return (
                    <div 
                      key={`ring3-${idx}`} 
                      className="absolute left-1/2 top-1/2" 
                      style={{ 
                        width: logoSize, 
                        height: logoSize,
                        '--initial-angle': `${initialAngle}deg`,
                        '--radius': `${R_outer}px`,
                        transform: 'translate(-50%, -50%) rotate(calc(var(--orbit-angle) + var(--initial-angle))) translateX(var(--radius)) rotate(calc(-1 * (var(--orbit-angle) + var(--initial-angle))))'
                      } as React.CSSProperties}
                    >
                      {/* Transparent Floating Logo Wrapper */}
                      <div className="w-full h-full flex items-center justify-center hover:scale-115 transition-all duration-300 group cursor-pointer relative z-20">
                        <img 
                          src={logo.src} 
                          alt={logo.name} 
                          className={`max-w-full max-h-full object-contain ${logo.padding} grayscale opacity-75 dark:brightness-0 dark:invert group-hover:grayscale-0 group-hover:opacity-100 group-hover:dark:brightness-100 group-hover:dark:invert-0 transition-all duration-500`}
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))' }}
                          loading="lazy"
                        />
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1A102E] text-white text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap z-50">
                          {logo.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Central Node Avatar Badge at Bottom Center (Origin Point) */}
        {/* Placed outside the overflow-hidden system, aligned with Section Baseline */}
        <div 
          className="absolute left-1/2 bottom-0 z-30"
          style={{
            width: 120,
            height: 120,
            transform: 'translate(-50%, 50%)'
          }}
        >
          {/* Enlarged Avatar Badge (120px / w-[120px] h-[120px]) */}
          <div className="w-[120px] h-[120px] flex items-center justify-center rounded-full bg-white dark:bg-[#1E1C24] border-2 border-[#6d55a7]/30 dark:border-[#d0bcff]/40 shadow-2xl p-1 select-none pointer-events-auto">
            <img 
              src="/images/472164386_10170748401095387_7067836675242530090_n.jpg"
              alt="Abdullah Malik"
              className="w-full h-full rounded-full object-cover brightness-95"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150";
              }}
            />
          </div>
        </div>

        {/* Mobile View: Infinite Loop Marquee (Screen < 640px) */}
        <div className="block sm:hidden relative w-full overflow-hidden py-6 mt-4 z-10">
          {/* Fade Masks */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-[#16151A] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-[#16151A] to-transparent z-10 pointer-events-none" />
          
          <div className="flex w-[200%] gap-6 animate-marquee whitespace-nowrap">
            {activeAllLogos.map((logo, idx) => (
              <div 
                key={`mobile-1-${idx}`} 
                className="inline-flex items-center justify-center px-6 py-4 bg-white border border-[#6d55a7]/10 dark:border-white/10 rounded-2xl shadow-sm min-w-[120px] h-16 hover:border-[#6d55a7]/30 transition-colors"
              >
                <img 
                  src={logo.src} 
                  alt={logo.name} 
                  className="max-h-8 object-contain filter grayscale opacity-80" 
                  loading="lazy"
                />
              </div>
            ))}
            {activeAllLogos.map((logo, idx) => (
              <div 
                key={`mobile-2-${idx}`} 
                className="inline-flex items-center justify-center px-6 py-4 bg-white border border-[#6d55a7]/10 dark:border-white/10 rounded-2xl shadow-sm min-w-[120px] h-16 hover:border-[#6d55a7]/30 transition-colors"
              >
                <img 
                  src={logo.src} 
                  alt={logo.name} 
                  className="max-h-8 object-contain filter grayscale opacity-80" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
