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
    title: 'Cross-Channel Performance Marketing',
    description: 'I guide growth teams in strategic yield optimization of customer acquisition capital across global digital platforms. Data is active only when it increases the return on your marketing investment. We move beyond simple traffic acquisition to build high-conversion loops driven by unified, live performance indicators.',
    points: [
      'Cross-channel budget allocation logic',
      'Yield optimization on global ad platforms',
      'Real-time conversion tracking',
      'Attribution modeling & scaling parameters',
      'Customer acquisition cost (CAC) reduction frameworks'
    ],
    outcome: 'A structured media model maximizing acquisition efficiency across digital networks.',
    solidBg: 'bg-[#2A1008]', // Deep dark terracotta
    borderColor: 'border-white/10',
    accentText: 'text-[#E2C08A]', // Sand/gold accent
    isDark: true
  },
  {
    id: 'strategy',
    num: '02',
    title: 'Activation Planning & Strategy',
    description: 'Data is a cost until it drives a transaction. I help organizations architect custom roadmaps to transition data from passive warehouses into real-time activation pipelines. The goal is to move customer profiles directly into trigger-based campaigns, real-time personalization, and autonomous sales touchpoints.',
    points: [
      'Warehouse-to-campaign mapping',
      'Customer Data Platform (CDP) strategy',
      'Event-driven trigger mapping',
      'Activation scoring frameworks',
      'Stack dependency auditing'
    ],
    outcome: 'A comprehensive activation blueprint ready to connect databases to the commercial execution layer.',
    solidBg: 'bg-[#7C2D12]', // Terracotta rust copper
    borderColor: 'border-white/10',
    accentText: 'text-[#FAF8F3]', // Warm ivory accent
    isDark: true
  },
  {
    id: 'crm',
    num: '03',
    title: 'CRM Ecosystem & MarTech Orchestration',
    description: 'Unifying your commercial stack ensures that Sales, Marketing, and Customer Support share a single source of truth. I audit and configure CRM suites, customer tools, and marketing systems to eliminate signal fragmentation, data discrepancies, and execution latency.',
    points: [
      'CRM stack auditing & alignment',
      'Cross-channel data flows',
      'Marketing automation setup',
      'Customer event tracking logic',
      'Data sync latency reduction'
    ],
    outcome: 'An optimized CRM stack communicating in real-time with zero data silos.',
    solidBg: 'bg-[#E2C08A]', // Warm tan/gold/sand
    borderColor: 'border-[#2A1008]/10',
    accentText: 'text-[#2A1008]', // Deep terracotta accent
    isDark: false
  },
  {
    id: 'integration',
    num: '04',
    title: 'Agentic Data Integration',
    description: 'AI agents and automation layers require high-integrity, real-time context to make correct decisions. I architect pipelines that translate database records and live signals into structured context feeds for custom AI agents and autonomous decision engines.',
    points: [
      'Context pipeline engineering',
      'Real-time event streams',
      'Prompt data-hydration pipelines',
      'Agent memory systems',
      'Guardrails & context caching'
    ],
    outcome: 'An integration layer supplying high-fidelity data to active AI execution systems.',
    solidBg: 'bg-[#FAF8F3]', // Warm ivory
    borderColor: 'border-[#2A1008]/10',
    accentText: 'text-[#7C2D12]', // Rust copper accent
    isDark: false
  },
  {
    id: 'predictive',
    num: '05',
    title: 'Predictive Customer Intelligence',
    description: 'Anticipating customer intent allows you to act before friction or churn occurs. I build custom modeling layers that score churn risk, predict purchase propensity, and identify high-value customer milestones to trigger preventative activation workflows.',
    points: [
      'Churn risk scoring',
      'Purchase propensity models',
      'Customer Lifetime Value (LTV) forecasting',
      'Segment behavior analysis',
      'Automated reactivation triggers'
    ],
    outcome: 'An active scoring engine triggering preventative customer interactions dynamically.',
    solidBg: 'bg-[#3B160C]', // Deep chocolate mahogany
    borderColor: 'border-white/10',
    accentText: 'text-[#E2C08A]', // Sand/gold accent
    isDark: true
  },
  {
    id: 'dashboards',
    num: '06',
    title: 'Commercial Performance Dashboards',
    description: 'Executives require real-time visibility into what is driving growth. I build custom performance indicators that map pipeline conversions, acquisition yield, and activation ROI into a single, high-fidelity business dashboard.',
    points: [
      'Executive KPI mapping',
      'Growth velocity tracking',
      'Multi-touch attribution modeling',
      'Pipeline lifecycle visualization',
      'Real-time ROI calculations'
    ],
    outcome: 'A unified analytics interface providing absolute clarity on commercial execution and returns.',
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
              Data is a liability until it drives a decision. Most organisations do not lack data. They lack activation.
            </p>
            <p className="text-[#7C2D12] font-mono text-sm tracking-widest uppercase font-semibold">
              The use cases are unclear. The data is fragmented. The pipelines stay static. Attribution is guessed. And integrations are built without real-time activation in mind.
            </p>
            <p>
              This is where the service becomes practical. I help organisations connect the data layer to the commercial layer to turn raw customer signals into accelerated acquisition, predictive retention, and measurable growth.
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
                        Learn more <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What you get:</h4>
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
                                Learn more <ArrowRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Right column: bullet points and outcome */}
                        <div className="flex flex-col gap-8">
                          <div>
                            <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What you get:</h4>
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
