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
    id: 'ai-maturity-assessment',
    num: '01',
    title: 'AI Maturity Assessment',
    description: 'I assess where your organisation actually stands with AI — not in theory, but in practice.',
    points: [
      'AI maturity framework evaluation',
      'Use-case and capability audit',
      'Data, technology, and team readiness analysis',
      'Gap identification across organisation',
      'Benchmarking against leading practices'
    ],
    outcome: 'What you get: A clear picture of where you are, what is missing, and what must be built to move forward.',
    solidBg: 'bg-[#2F143F]', // Deep purple core
    borderColor: 'border-white/15',
    accentText: 'text-[#E8DEF8]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#E8DEF8]',
    badgeText: 'text-[#2F143F]'
  },
  {
    id: 'ai-strategy-roadmapping',
    num: '02',
    title: 'AI Strategy & Roadmapping',
    description: 'AI without a structured roadmap leads to scattered experiments.',
    points: [
      'AI opportunity mapping',
      'prioritised use-case roadmap',
      'phased implementation approach',
      'value and impact alignment',
      'execution planning timeline'
    ],
    outcome: 'What you get: A practical roadmap that connects AI ambition to real execution and measurable outcomes.',
    solidBg: 'bg-[#4A2E26]', // Warm brown undertone
    borderColor: 'border-white/15',
    accentText: 'text-[#F5E8D0]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#F5E8D0]',
    badgeText: 'text-[#4A2E26]'
  },
  {
    id: 'leadership-enablement',
    num: '03',
    title: 'Leadership Enablement & Alignment',
    description: 'AI transformation fails when leadership is not aligned.',
    points: [
      'executive AI workshops',
      'decision-making frameworks',
      'leadership alignment sessions',
      'AI strategy communication frameworks',
      'cross-functional alignment design'
    ],
    outcome: 'What you get: Leadership clarity and alignment required to make AI initiatives move forward.',
    solidBg: 'bg-[#6A3F2E]', // Soft copper/brown
    borderColor: 'border-white/15',
    accentText: 'text-[#FAF7F2]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-white',
    badgeText: 'text-[#6A3F2E]'
  },
  {
    id: 'governance-responsible-adoption',
    num: '04',
    title: 'AI Governance & Responsible Adoption',
    description: 'Trust is the foundation of scalable AI.',
    points: [
      'governance model design',
      'risk classification frameworks',
      'data and AI policy definition',
      'responsible AI principles implementation',
      'monitoring and accountability structure'
    ],
    outcome: 'What you get: A structured foundation that allows AI to scale safely and responsibly.',
    solidBg: 'bg-[#2E1B16]', // Dark earthy tone
    borderColor: 'border-white/15',
    accentText: 'text-[#F5E8D0]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#F5E8D0]',
    badgeText: 'text-[#2E1B16]'
  },
  {
    id: 'workforce-capability-building',
    num: '05',
    title: 'Workforce Capability Building',
    description: 'AI adoption is not just tools — it is people.',
    points: [
      'AI training programs',
      'skill development frameworks',
      'team enablement workshops',
      'adoption playbooks',
      'role-based capability building'
    ],
    outcome: 'What you get: Teams that understand, trust, and actively use AI in their daily work.',
    solidBg: 'bg-[#2C1037]', // Deep violet core
    borderColor: 'border-white/15',
    accentText: 'text-[#E8DEF8]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-[#E8DEF8]',
    badgeText: 'text-[#2C1037]'
  },
  {
    id: 'ai-operating-model-design',
    num: '06',
    title: 'AI Operating Model Design',
    description: 'AI needs a new way of working, not just new tools.',
    points: [
      'operating model redesign',
      'role and responsibility mapping',
      'cross-team collaboration structures',
      'workflow transformation',
      'AI integration into daily processes'
    ],
    outcome: 'What you get: An organisation structured to use AI consistently, not occasionally.',
    solidBg: 'bg-[#2F143F]', // Deep purple core
    borderColor: 'border-white/15',
    accentText: 'text-[#E8DEF8]',
    headingColor: 'text-white',
    textColor: 'text-white/95',
    badgeBg: 'bg-white',
    badgeText: 'text-[#2F143F]'
  }
];

export default function AIMaturitySubServicesShowcase() {
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
    <div className="w-full bg-[#FAF7F2] text-[#12081A] transition-colors duration-500">
      
      {/* Intro Block: Executive & Advisory Clarity */}
      <section className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-4 text-left">
        <div className="w-full">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#4B2A5A] block mb-4">Core Capability Pillars</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#12081A] tracking-tight uppercase mb-10 leading-tight">
            Six pillars that move organisations from AI curiosity to enterprise capability.
          </h2>
          
          <div className="text-lg md:text-xl font-sans text-[#12081A]/75 font-light leading-relaxed space-y-6 max-w-5xl">
            <p>
              Technology is only an accelerator. Without cultural adoption, executive guidance, and team capability, AI initiatives stall at the pilot phase.
            </p>
            <p className="text-[#4B2A5A] font-mono text-sm tracking-widest uppercase font-semibold">
              I help leadership teams build the internal muscle, governance, and operating models required to make AI a durable competitive advantage.
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
                <div className="absolute top-6 right-8 text-5xl font-display font-light select-none pointer-events-none text-white/10">
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
                    <div className="border-t border-white/10 pt-4 mt-6">
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
          <div className="sticky top-0 h-[100svh] min-h-[100svh] md:h-screen w-full flex items-start pt-[12vh] justify-center overflow-hidden">
            
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
                      <div className="absolute top-10 right-14 text-6xl md:text-8xl font-display font-light select-none pointer-events-none text-white/10">
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

                          <div className="border-t border-white/10 pt-6">
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
