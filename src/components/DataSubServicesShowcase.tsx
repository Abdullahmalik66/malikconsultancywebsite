import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, ChevronDown, Plus, Minus } from 'lucide-react';
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
  isDark: boolean;
}

const subServices: SubServiceData[] = [
  {
    id: 'marketing',
    num: '01',
    title: 'Cross-Channel Performance Intelligence',
    description: 'I help growth teams understand which channels, audiences, campaigns, and journeys are actually creating commercial movement — not just clicks, impressions, or isolated platform results.',
    points: [
      'Cross-channel acquisition performance model',
      'CAC, ROAS, pipeline, and conversion signal mapping',
      'Attribution gap analysis across paid, owned, CRM, and sales touchpoints',
      'Budget allocation logic based on commercial return',
      'Live performance indicator framework'
    ],
    outcome: 'A clearer view of where growth is coming from, where spend is leaking, and which channels deserve more investment.',
    solidBg: 'bg-[#2A1008]', // Deep dark terracotta
    borderColor: 'border-white/10',
    accentText: 'text-[#E2C08A]', // Sand/gold accent
    isDark: true
  },
  {
    id: 'strategy',
    num: '02',
    title: 'Customer Data Activation Strategy',
    description: 'I help organisations move customer data from passive storage into active journeys, triggers, segments, and decision flows that can be used by marketing, sales, and customer teams.',
    points: [
      'Customer data activation roadmap',
      'Audience and lifecycle segmentation logic',
      'Trigger-based campaign architecture',
      'First-party data activation planning',
      'Channel and journey dependency mapping'
    ],
    outcome: 'A practical activation blueprint that turns customer signals into personalised journeys, faster campaign execution, and measurable commercial action.',
    solidBg: 'bg-[#7C2D12]', // Terracotta rust copper
    borderColor: 'border-white/10',
    accentText: 'text-[#FAF8F3]', // Warm ivory accent
    isDark: true
  },
  {
    id: 'crm',
    num: '03',
    title: 'CRM & MarTech Orchestration',
    description: 'I help align CRM, marketing automation, analytics, and customer data systems so teams can work from cleaner signals and coordinated customer journeys.',
    points: [
      'CRM and MarTech stack audit',
      'Customer journey data flow mapping',
      'Lead, lifecycle, and conversion event alignment',
      'Marketing automation logic',
      'Data quality and sync issue diagnosis'
    ],
    outcome: 'A more connected commercial stack where marketing, sales, and customer teams can act on shared customer signals with less friction.',
    solidBg: 'bg-[#E2C08A]', // Warm tan/gold/sand
    borderColor: 'border-[#2A1008]/10',
    accentText: 'text-[#2A1008]', // Deep terracotta accent
    isDark: false
  },
  {
    id: 'integration',
    num: '04',
    title: 'AI-Ready Data Integration',
    description: 'AI agents and automation systems need reliable customer context. I help design the data layer that gives AI systems the right signals, rules, and context to support better decisions.',
    points: [
      'AI-ready data source mapping',
      'Context pipeline design',
      'Event and behaviour stream planning',
      'Data quality checks for AI workflows',
      'Guardrail and context logic for agentic systems'
    ],
    outcome: 'A trusted context layer that allows AI systems to act on relevant, timely, and commercially useful customer data.',
    solidBg: 'bg-[#FAF8F3]', // Warm ivory
    borderColor: 'border-[#2A1008]/10',
    accentText: 'text-[#7C2D12]', // Rust copper accent
    isDark: false
  },
  {
    id: 'predictive',
    num: '05',
    title: 'Predictive Customer Intelligence',
    description: 'I help teams anticipate customer intent before friction, churn, or missed opportunity appears in the numbers.',
    points: [
      'Churn and retention signal mapping',
      'Purchase propensity logic',
      'Customer lifetime value modelling',
      'Behavioural segmentation',
      'Reactivation and next-best-action trigger design'
    ],
    outcome: 'A customer intelligence layer that helps teams identify who is likely to convert, churn, grow, or need action next.',
    solidBg: 'bg-[#3B160C]', // Deep chocolate mahogany
    borderColor: 'border-white/10',
    accentText: 'text-[#E2C08A]', // Sand/gold accent
    isDark: true
  },
  {
    id: 'dashboards',
    num: '06',
    title: 'Commercial Intelligence Dashboards',
    description: 'I build executive-ready performance views that connect marketing activity, customer behaviour, pipeline movement, and revenue outcomes into one decision layer.',
    points: [
      'Executive KPI framework',
      'Acquisition, retention, and pipeline dashboard logic',
      'Multi-touch attribution view',
      'Lifecycle performance tracking',
      'Real-time ROI and commercial signal reporting'
    ],
    outcome: 'A decision interface that shows what is driving growth, what is slowing it down, and where action should happen next.',
    solidBg: 'bg-[#7C2D12]', // Terracotta rust copper
    borderColor: 'border-white/10',
    accentText: 'text-[#FAF8F3]', // Warm ivory accent
    isDark: true
  }
];

export default function DataSubServicesShowcase() {
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
    <div className="w-full bg-[#FAF8F3] text-[#2A1008] transition-colors duration-500">
      
      {/* Intro Block: Symmetrical and matched to system spacing */}
      <section className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-4 text-left">
        <div className="w-full">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#7C2D12] block mb-4">Our Sub-Services</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#2A1008] tracking-tight uppercase mb-10 leading-tight">
            Six ways I turn customer data into active commercial value.
          </h2>
          
          <div className="text-lg md:text-xl font-sans text-[#2A1008]/70 font-light leading-relaxed space-y-8 max-w-5xl">
            <p>
              Data is a liability until it changes a decision.
            </p>
            <p className="text-[#7C2D12] font-mono text-sm tracking-widest uppercase font-semibold">
              Most organisations have more than enough customer signals. The problem is that those signals live in disconnected systems, slow reports, static dashboards, and campaigns that cannot react fast enough.
            </p>
            <p>
              This service connects the data layer to the commercial layer — turning raw customer signals into acquisition, retention, personalisation, and measurable growth.
            </p>
          </div>
        </div>
      </section>

      {/* Showcase Scroll Area */}
      {isMobile ? (
        /* Mobile/Tablet Stacked Layout: Clean, warm vertical card flow */
        <div className="px-6 md:px-12 pb-32 flex flex-col gap-12 max-w-[1750px] mx-auto">
          {subServices.map((service) => {
            const isDark = service.isDark;
            return (
              <div
                key={service.id}
                className={`relative p-8 md:p-12 rounded-[40px] ${service.solidBg} border ${service.borderColor} shadow-xl flex flex-col gap-8 text-left overflow-hidden ${
                  isDark ? 'text-white' : 'text-[#2A1008]'
                }`}
              >
                {/* Stylish Upper Right Number Label */}
                <div className={`absolute top-6 right-8 text-5xl font-display font-light select-none pointer-events-none ${
                  isDark ? 'text-white/5' : 'text-[#2A1008]/5'
                }`}>
                  {service.num}
                </div>

                <div>
                  <h3 className={`text-2xl md:text-3xl font-display font-medium pr-12 mb-4 leading-tight ${
                    isDark ? 'text-white' : 'text-[#2A1008]'
                  }`}>
                    {service.title}
                  </h3>
                  <p className={`text-base leading-relaxed font-sans font-light mb-6 ${
                    isDark ? 'text-white/80' : 'text-[#2A1008]/85'
                  }`}>
                    {service.description}
                  </p>
                  <div className="mt-4">
                    <Link to="/reach-me">
                      <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer ${
                        isDark 
                          ? 'bg-[#FAF8F3] text-[#2A1008] hover:bg-[#FAF8F3]/90' 
                          : 'bg-[#2A1008] text-white hover:bg-[#2A1008]/90'
                      }`}>
                        Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What we provide:</h4>
                    <ul className={`grid grid-cols-1 gap-3 text-sm font-sans ${
                      isDark ? 'text-white/70' : 'text-[#2A1008]/75'
                    }`}>
                      {service.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-4 h-4 ${service.accentText} mt-0.5 flex-shrink-0`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <p className={`text-sm md:text-base font-medium mt-6 leading-relaxed ${
                      isDark ? 'text-white' : 'text-[#2A1008]'
                    }`}>
                      {service.outcome}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Pinned Scroll Layout: Wide cards that occupy the full width of the container. No right progress dots */
        <div ref={containerRef} className="relative w-full h-[600vh] bg-[#FAF8F3]">
          <div className="sticky top-0 h-screen w-full flex items-start pt-[12vh] justify-center overflow-hidden">
            
            <div className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-center relative">
              
              {/* Stack Viewport Wrapper (Stretches fully with no right side margins) */}
              <div className="relative w-full h-[74vh] min-h-[580px] flex items-center justify-center overflow-visible">
                {subServices.map((service, index) => {
                  const isActive = index === activeIndex;
                  const isPast = index < activeIndex;
                  const isPeeking = index === activeIndex + 1;
                  const isDark = service.isDark;

                  // Stack Peeking Motion Logic: collapsed peeking bar sitting at y: 92%
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
                    opacityOffset = 1; // Fully opaque preview
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
                        ease: [0.05, 0.7, 0.1, 1] // Emphasized M3 ease-out
                      }}
                      className={`absolute w-full h-full p-12 md:p-16 rounded-[48px] ${service.solidBg} border ${service.borderColor} shadow-2xl flex flex-col justify-center text-left overflow-hidden ${
                        isDark ? 'text-white' : 'text-[#2A1008]'
                      }`}
                      style={{ zIndex: 10 + index }}
                    >
                      {/* Stylish Upper Right Number Label */}
                      <div className={`absolute top-10 right-14 text-6xl md:text-8xl font-display font-light select-none pointer-events-none ${
                        isDark ? 'text-white/5' : 'text-[#2A1008]/5'
                      }`}>
                        {service.num}
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left column: Title & description & CTA */}
                        <div className="flex flex-col gap-6">
                          <h3 className={`text-3xl lg:text-5xl font-display font-medium leading-tight ${
                            isDark ? 'text-white' : 'text-[#2A1008]'
                          }`}>
                            {service.title}
                          </h3>
                          <p className={`text-base md:text-lg leading-relaxed font-sans font-light ${
                            isDark ? 'text-white/80' : 'text-[#2A1008]/85'
                          }`}>
                            {service.description}
                          </p>
                          <div className="mt-4">
                            <Link to="/reach-me">
                              <button className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer ${
                                isDark 
                                  ? 'bg-[#FAF8F3] text-[#2A1008] hover:bg-[#FAF8F3]/90' 
                                  : 'bg-[#2A1008] text-white hover:bg-[#2A1008]/90'
                              }`}>
                                Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Right column: bullet points and outcome */}
                        <div className="flex flex-col gap-8">
                          <div>
                            <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What we provide:</h4>
                            <ul className={`space-y-4 text-base font-sans ${
                              isDark ? 'text-white/70' : 'text-[#2A1008]/75'
                            }`}>
                              {service.points.map((pt, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <CheckCircle2 className={`w-5 h-5 ${service.accentText} mt-0.5 flex-shrink-0`} />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={`border-t pt-6 ${isDark ? 'border-white/10' : 'border-[#2A1008]/10'}`}>
                            <p className={`text-base md:text-lg font-medium font-sans leading-relaxed ${
                              isDark ? 'text-white' : 'text-[#2A1008]'
                            }`}>
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
