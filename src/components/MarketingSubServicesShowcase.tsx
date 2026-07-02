import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubServiceData {
  id: string;
  num: string;
  title: string;
  description: string;
  points: string[];
  outcome: string;
  solidBg: string;
  borderColor: string;
  accentText: string;
  headingColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}

const subServices: SubServiceData[] = [
  {
    id: 'full-funnel-growth',
    num: '01',
    title: 'Full-Funnel Growth Strategy',
    description: 'I help organisations move from channel-level thinking to full-funnel growth architecture.',
    points: [
      'Funnel and journey mapping',
      'Channel role definition',
      'Acquisition and retention strategy',
      'KPI and growth model design',
      'Budget allocation logic'
    ],
    outcome: 'What you get: A clear growth system that aligns marketing, sales, and customer journeys into one measurable flow.',
    solidBg: 'bg-[#893F04]', // Deep burnt copper
    borderColor: 'border-white/15',
    accentText: 'text-[#F5E8D0]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#F5E8D0]',
    badgeText: 'text-[#893F04]'
  },
  {
    id: 'conversion-cro',
    num: '02',
    title: 'Conversion & CRO Systems',
    description: 'Traffic without conversion is wasted budget. I design systems that continuously improve how users convert across web, campaigns, and journeys.',
    points: [
      'Conversion funnel analysis',
      'Landing page optimisation',
      'UX and behaviour tracking',
      'A/B testing frameworks',
      'Conversion psychology mapping'
    ],
    outcome: 'What you get: Higher conversion rates, lower acquisition cost, and more value from existing traffic.',
    solidBg: 'bg-[#1c2a26]', // Deep slate forest green
    borderColor: 'border-white/15',
    accentText: 'text-[#a8e6cf]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#a8e6cf]',
    badgeText: 'text-[#1c2a26]'
  },
  {
    id: 'performance-attribution',
    num: '03',
    title: 'Performance Marketing & Attribution',
    description: 'I help teams understand what is actually driving growth — not just platform-level numbers.',
    points: [
      'Channel performance modelling',
      'Attribution logic design',
      'CAC and ROI tracking',
      'Budget optimisation frameworks',
      'Cross-channel performance analysis'
    ],
    outcome: 'What you get: A clear picture of where growth comes from and how to scale it efficiently.',
    solidBg: 'bg-[#2b261b]', // Dark bronze / olive
    borderColor: 'border-white/15',
    accentText: 'text-[#fff0b3]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#fff0b3]',
    badgeText: 'text-[#2b261b]'
  },
  {
    id: 'account-based-growth',
    num: '04',
    title: 'Account-Based Growth (ABM)',
    description: 'For B2B organisations, growth comes from precision, not volume.',
    points: [
      'Target account identification',
      'Persona and buying group mapping',
      'Personalised multi-touch campaigns',
      'Sales-marketing alignment frameworks',
      'Engagement tracking'
    ],
    outcome: 'What you get: More relevant outreach, stronger engagement, and higher-value pipeline.',
    solidBg: 'bg-[#352311]', // Deep espresso brown
    borderColor: 'border-white/15',
    accentText: 'text-[#e6ddff]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#e6ddff]',
    badgeText: 'text-[#352311]'
  },
  {
    id: 'personalisation-lifecycle',
    num: '05',
    title: 'Personalisation & Lifecycle Marketing',
    description: 'Growth happens when experiences adapt to customer behaviour.',
    points: [
      'Lifecycle journey design',
      'Segmentation and trigger logic',
      'Campaign automation flows',
      'Personalisation strategy',
      'Retention and loyalty loops'
    ],
    outcome: 'What you get: More engaged customers, higher retention, and increased lifetime value.',
    solidBg: 'bg-[#8A6258]', // Rosewood terracotta
    borderColor: 'border-white/15',
    accentText: 'text-[#FAF7F2]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-white',
    badgeText: 'text-[#8A6258]'
  },
  {
    id: 'experimentation-engine',
    num: '06',
    title: 'Growth Experimentation Engine',
    description: 'The fastest-growing companies don’t guess — they test continuously.',
    points: [
      'Experimentation roadmap',
      'Hypothesis design',
      'Testing frameworks',
      'Data-driven decision model',
      'Learning system design'
    ],
    outcome: 'What you get: A structured way to improve performance continuously, not occasionally.',
    solidBg: 'bg-[#893F04]', // Deep burnt copper
    borderColor: 'border-white/15',
    accentText: 'text-[#F5E8D0]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-white',
    badgeText: 'text-[#893F04]'
  }
];

export default function MarketingSubServicesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = rect.height - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Divided into 6 segments
  const segmentSize = 1 / 6;
  const activeIndex = Math.min(5, Math.floor(scrollProgress / segmentSize));

  return (
    <div className="w-full bg-[#FAF7F2] text-[#24170F] transition-colors duration-500">
      
      {/* Intro Block: Editorial & Apple-inspired clarity */}
      <section className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-4 text-left">
        <div className="w-full">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#7A4E2D] block mb-4">Core Sub-Services</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#24170F] tracking-tight uppercase mb-10 leading-tight">
            Six engines that turn marketing into a scalable growth system.
          </h2>
          
          <div className="text-lg md:text-xl font-sans text-[#24170F]/75 font-light leading-relaxed space-y-6 max-w-5xl">
            <p>
              Most marketing efforts fail to scale not because of poor creative, but because of fragmented execution and disconnected measurement.
            </p>
            <p className="text-[#7A4E2D] font-mono text-sm tracking-widest uppercase font-semibold">
              I build growth systems that connect strategy → execution → measurement → optimisation into one continuous engine.
            </p>
          </div>
        </div>
      </section>

      {/* Showcase Scroll Area */}
      {isMobile ? (
        /* Mobile/Tablet Stacked Layout */
        <div className="px-6 md:px-12 pb-32 flex flex-col gap-12 max-w-[1750px] mx-auto pt-8">
          {subServices.map((service) => {
            return (
              <div
                key={service.id}
                className={`relative p-8 md:p-12 rounded-[40px] ${service.solidBg} border ${service.borderColor} shadow-xl flex flex-col gap-8 text-left overflow-hidden ${service.textColor}`}
              >
                {/* Upper Right Number Label */}
                <div className="absolute top-6 right-8 text-5xl font-display font-light select-none pointer-events-none text-[#24170F]/10">
                  {service.num}
                </div>

                <div>
                  <h3 className={`text-2xl md:text-3xl font-display font-medium pr-12 mb-4 leading-tight ${service.headingColor}`}>
                    {service.title}
                  </h3>
                  <p className={`text-base leading-relaxed font-sans font-light mb-6 ${service.textColor}`}>
                    {service.description}
                  </p>
                  <div className="mt-4">
                    <Link to="/reach-me">
                      <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer ${service.badgeBg} ${service.badgeText} hover:opacity-90`}>
                        Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What we provide:</h4>
                    <ul className="grid grid-cols-1 gap-3 text-sm font-sans">
                      {service.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-4 h-4 ${service.accentText} mt-0.5 flex-shrink-0`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-[#24170F]/10 pt-4 mt-6">
                      <p className={`text-sm md:text-base font-medium font-sans leading-relaxed ${service.headingColor}`}>
                        {service.outcome}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Pinned Scroll Layout */
        <div ref={containerRef} className="relative w-full h-[600vh] bg-[#FAF7F2]">
          <div className="sticky top-0 h-screen w-full flex items-start pt-[12vh] justify-center overflow-hidden">
            
            <div className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-center relative">
              
              {/* Stack Viewport Wrapper */}
              <div className="relative w-full h-[74vh] min-h-[580px] flex items-center justify-center overflow-visible">
                {subServices.map((service, index) => {
                  const isActive = index === activeIndex;
                  const isPast = index < activeIndex;
                  const isPeeking = index === activeIndex + 1;

                  let yOffset = "100%"; 
                  let scaleOffset = 0.94;
                  let opacityOffset = 0;

                  if (isActive) {
                    yOffset = "0%";
                    scaleOffset = 1;
                    opacityOffset = 1;
                  } else if (isPeeking) {
                    yOffset = "92%"; 
                    scaleOffset = 0.97;
                    opacityOffset = 1;
                  } else if (isPast) {
                    yOffset = "-100%"; 
                    scaleOffset = 0.95;
                    opacityOffset = 0;
                  }

                  return (
                    <motion.div
                      key={service.id}
                      initial={false}
                      animate={{
                        y: yOffset,
                        scale: scaleOffset,
                        opacity: opacityOffset,
                        pointerEvents: isActive ? 'auto' : 'none'
                      }}
                      transition={{
                        duration: 0.7,
                        ease: [0.05, 0.7, 0.1, 1]
                      }}
                      className={`absolute w-full h-full p-12 md:p-16 rounded-[48px] ${service.solidBg} border ${service.borderColor} shadow-2xl flex flex-col justify-center text-left overflow-hidden ${service.textColor}`}
                      style={{ zIndex: 10 + index }}
                    >
                      {/* Upper Right Number Label */}
                      <div className="absolute top-10 right-14 text-6xl md:text-8xl font-display font-light select-none pointer-events-none text-[#24170F]/10">
                        {service.num}
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left column: Title & description & CTA */}
                        <div className="flex flex-col gap-6">
                          <h3 className={`text-3xl lg:text-5xl font-display font-medium leading-tight ${service.headingColor}`}>
                            {service.title}
                          </h3>
                          <p className={`text-base md:text-lg leading-relaxed font-sans font-light ${service.textColor}`}>
                            {service.description}
                          </p>
                          <div className="mt-4">
                            <Link to="/reach-me">
                              <button className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer ${service.badgeBg} ${service.badgeText} hover:opacity-90`}>
                                Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Right column: bullet points and outcome */}
                        <div className="flex flex-col gap-8">
                          <div>
                            <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What we provide:</h4>
                            <ul className="space-y-4 text-base font-sans">
                              {service.points.map((pt, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <CheckCircle2 className={`w-5 h-5 ${service.accentText} mt-0.5 flex-shrink-0`} />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t border-[#24170F]/10 pt-6">
                            <p className={`text-base md:text-lg font-medium font-sans leading-relaxed ${service.headingColor}`}>
                              {service.outcome}
                            </p>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
