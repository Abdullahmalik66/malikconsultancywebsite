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
  solidBg: string; // Tailwind bg class with custom hex from user palette
  borderColor: string;
  accentText: string; // text color for deliverable titles/icons
  isDark: boolean; // boolean to determine light/dark text contrast dynamically
}

const subServices: SubServiceData[] = [
  {
    id: 'strategy',
    num: '01',
    title: 'AI Strategy & Value Roadmap',
    description: 'I help leadership teams define where AI should create business value, what to prioritise, and how to move from ambition to execution. AI only creates value when it is connected to a real business problem. The goal is not to "do AI". The goal is to identify where AI can improve decisions, reduce friction, increase speed, or unlock new commercial value.',
    points: [
      'AI opportunity mapping across business functions',
      'Use-case discovery linked to measurable outcomes',
      'Value case and ROI logic',
      'Strategic roadmap for pilots, production, governance, and scale',
      'Executive decision support for build, buy, or partner decisions'
    ],
    outcome: 'A practical AI transformation roadmap linked to business outcomes, operational feasibility, and measurable value.',
    solidBg: 'bg-[#103A2A]', // Very dark forest green
    borderColor: 'border-white/10',
    accentText: 'text-[#E2C08A]', // Warm gold accent
    isDark: true
  },
  {
    id: 'portfolio',
    num: '02',
    title: 'AI Use Case Portfolio & Prioritisation',
    description: 'Not every AI idea deserves investment. I help separate high-value use cases from noise. Most organisations are not short on AI ideas. They are short on disciplined selection. The focus is not more experimentation. The focus is better selection.',
    points: [
      'AI use-case inventory',
      'Impact vs feasibility scoring',
      'Risk and readiness assessment',
      'Data dependency mapping',
      'Pilot selection and sequencing',
      'Decision matrix for leadership prioritisation'
    ],
    outcome: 'A prioritised AI use-case portfolio that shows what to build first, why it matters, what it depends on, and what value it should create.',
    solidBg: 'bg-[#2F6B4B]', // Mid-tone emerald green
    borderColor: 'border-white/10',
    accentText: 'text-[#F6EFE1]', // Light cream accent
    isDark: true
  },
  {
    id: 'workflow',
    num: '03',
    title: 'Agentic Workflow & Operating Model Design',
    description: 'AI should not sit on top of broken workflows. It should reshape how work gets done. I design workflows where humans, AI agents, data sources, and business systems work together with clear roles, hand-offs, approvals, and escalation logic. This is where AI moves from tool usage into operating model change.',
    points: [
      'Agentic workflow design',
      'Human-in-the-loop decision models',
      'Role and responsibility mapping',
      'Workflow redesign for AI-enabled operations',
      'Agent ecosystem architecture',
      'Operating model recommendations'
    ],
    outcome: 'A redesigned operating model that shows where AI acts, where humans decide, and how work moves faster without losing control.',
    solidBg: 'bg-[#E2C08A]', // Warm tan/gold/sand
    borderColor: 'border-[#103A2A]/10',
    accentText: 'text-[#103A2A]', // Dark green accent
    isDark: false
  },
  {
    id: 'pilot',
    num: '04',
    title: 'Production-Grade AI Pilot Development',
    description: 'A demo is not transformation. A pilot only matters if it can survive real operational pressure. I help design and build AI pilots with production in mind from day one. That means clear architecture, data readiness, evaluation logic, integration planning, monitoring requirements, and a realistic scale path. The objective is simple: build something useful enough to prove value and structured enough to become real.',
    points: [
      'Rapid prototype design',
      'RAG and agent architecture',
      'Prompt and evaluation logic',
      'Integration with CRM, data, and workflow systems',
      'Testing, monitoring, and production-ready planning',
      'Clear scale pathway from pilot to live system'
    ],
    outcome: 'A production-ready AI pilot designed to prove value, reduce risk, and create a realistic path toward deployment.',
    solidBg: 'bg-[#F6EFE1]', // Light warm cream/off-white
    borderColor: 'border-[#103A2A]/10',
    accentText: 'text-[#B24A2E]', // Rust red accent
    isDark: false
  },
  {
    id: 'governance',
    num: '05',
    title: 'AI Governance, Risk & Responsible AI',
    description: 'AI systems need trust before they can scale. I help organisations define the rules, controls, and governance structures needed to use AI responsibly. This includes where AI is allowed to act, where humans must approve, how risks are classified, and how outputs are monitored over time. Governance is not bureaucracy. Good governance is what allows AI to move faster without creating unnecessary risk.',
    points: [
      'AI governance model',
      'Risk classification for AI use cases',
      'Responsible AI policy design',
      'Human approval and escalation rules',
      'Model monitoring and audit logic',
      'Privacy, security, fairness, transparency, and accountability controls'
    ],
    outcome: 'A governance layer that makes AI safer, explainable, auditable, and ready for enterprise use.',
    solidBg: 'bg-[#B24A2E]', // Rust red/terracotta
    borderColor: 'border-white/10',
    accentText: 'text-[#F6EFE1]', // Light cream accent
    isDark: true
  },
  {
    id: 'adoption',
    num: '06',
    title: 'AI Adoption & Capability Building',
    description: 'AI transformation is not only a technical shift. It is a people and operating model shift. I help teams build the capability to understand, use, and scale AI in daily work. This includes workshops, maturity assessments, adoption playbooks, enablement sessions, and change support for AI-enabled workflows. The goal is not just that people use AI tools. The goal is that they understand where AI fits, how to trust it, and how to turn it into better work.',
    points: [
      'Executive AI workshops',
      'Workforce enablement programmes',
      'AI maturity assessments',
      'Adoption playbooks',
      'Capability-building sessions for teams',
      'Change management support for AI-enabled workflows'
    ],
    outcome: 'An organisation that is not just experimenting with AI, but building the confidence, skills, and routines to turn AI into real performance.',
    solidBg: 'bg-[#103A2A]', // Repeat dark forest green to complete sequence cycle
    borderColor: 'border-white/10',
    accentText: 'text-[#E2C08A]', // Warm gold accent
    isDark: true
  }
];

export default function SubServicesShowcase() {
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
    <div className="w-full bg-[#FEF7FF] text-[#1D1B20] transition-colors duration-500">
      
      {/* Intro Block: Symmetrical and matched to M3 system spacing */}
      <section className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-4 text-left">
        <div className="w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#1d1b20] tracking-tight uppercase mb-10 leading-tight">
            Six ways I turn AI ambition into systems that scale.
          </h2>
          
          <div className="text-lg md:text-xl font-sans text-[#1d1b20]/70 font-light leading-relaxed space-y-8 max-w-5xl">
            <p>
              AI transformation does not fail because organisations lack tools. It fails because the work is not structured properly.
            </p>
            <p className="text-[#6750A4] font-mono text-sm tracking-widest uppercase font-semibold">
              The use cases are unclear. The data is fragmented. The workflows stay unchanged. Governance is added too late. And pilots are built without a path to production.
            </p>
            <p>
              This is where the service becomes practical. I help organisations move from isolated AI experiments to structured, production-grade systems that connect strategy, data, workflows, people, and measurable business outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Showcase Scroll Area */}
      {isMobile ? (
        /* Mobile/Tablet Stacked Layout: Clean, light-themed vertical card flow */
        <div className="px-6 md:px-12 pb-32 flex flex-col gap-12 max-w-[1750px] mx-auto">
          {subServices.map((service) => {
            const isDark = service.isDark;
            return (
              <div
                key={service.id}
                className={`relative p-8 md:p-12 rounded-[40px] ${service.solidBg} border ${service.borderColor} shadow-xl flex flex-col gap-8 text-left overflow-hidden ${
                  isDark ? 'text-white' : 'text-[#103A2A]'
                }`}
              >
                {/* Stylish Upper Right Number Label */}
                <div className={`absolute top-6 right-8 text-5xl font-display font-light select-none pointer-events-none ${
                  isDark ? 'text-white/5' : 'text-[#103A2A]/5'
                }`}>
                  {service.num}
                </div>

                <div>
                  <h3 className={`text-2xl md:text-3xl font-display font-medium pr-12 mb-4 leading-tight ${
                    isDark ? 'text-white' : 'text-[#103A2A]'
                  }`}>
                    {service.title}
                  </h3>
                  <p className={`text-base leading-relaxed font-sans font-light mb-6 ${
                    isDark ? 'text-white/80' : 'text-[#103A2A]/85'
                  }`}>
                    {service.description}
                  </p>
                  <div className="mt-4">
                    <Link to="/reach-me">
                      <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md ${
                        isDark 
                          ? 'bg-[#FEF7FF] text-[#1D1B20] hover:bg-[#FEF7FF]/90' 
                          : 'bg-[#103A2A] text-white hover:bg-[#103A2A]/90'
                      }`}>
                        Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What you get:</h4>
                    <ul className={`grid grid-cols-1 gap-3 text-sm font-sans ${
                      isDark ? 'text-white/70' : 'text-[#103A2A]/75'
                    }`}>
                      {service.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-4 h-4 ${service.accentText} mt-0.5 flex-shrink-0`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <p className={`text-sm md:text-base font-medium mt-6 leading-relaxed ${
                      isDark ? 'text-white' : 'text-[#103A2A]'
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
        <div ref={containerRef} className="relative w-full h-[600vh] bg-[#FEF7FF]">
          <div className="sticky top-0 h-[100svh] min-h-[100svh] md:h-screen w-full flex items-start pt-[12vh] justify-center overflow-hidden">
            
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
                        isDark ? 'text-white' : 'text-[#103A2A]'
                      }`}
                      style={{ zIndex: 10 + index }}
                    >
                      {/* Stylish Upper Right Number Label */}
                      <div className={`absolute top-10 right-14 text-6xl md:text-8xl font-display font-light select-none pointer-events-none ${
                        isDark ? 'text-white/5' : 'text-[#103A2A]/5'
                      }`}>
                        {service.num}
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left column: Title & description & CTA */}
                        <div className="flex flex-col gap-6">
                          <h3 className={`text-3xl lg:text-5xl font-display font-medium leading-tight ${
                            isDark ? 'text-white' : 'text-[#103A2A]'
                          }`}>
                            {service.title}
                          </h3>
                          <p className={`text-base md:text-lg leading-relaxed font-sans font-light ${
                            isDark ? 'text-white/80' : 'text-[#103A2A]/85'
                          }`}>
                            {service.description}
                          </p>
                          <div className="mt-4">
                            <Link to="/reach-me">
                              <button className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer ${
                                isDark 
                                  ? 'bg-[#FEF7FF] text-[#1D1B20] hover:bg-[#FEF7FF]/90' 
                                  : 'bg-[#103A2A] text-white hover:bg-[#103A2A]/90'
                              }`}>
                                Learn more about {service.title} <ArrowRight className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Right column: bullet points and outcome */}
                        <div className="flex flex-col gap-8">
                          <div>
                            <h4 className={`text-xs font-mono uppercase tracking-[0.2em] ${service.accentText} mb-4 font-semibold`}>What you get:</h4>
                            <ul className={`space-y-4 text-base font-sans ${
                              isDark ? 'text-white/70' : 'text-[#103A2A]/75'
                            }`}>
                              {service.points.map((pt, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <CheckCircle2 className={`w-5 h-5 ${service.accentText} mt-0.5 flex-shrink-0`} />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={`border-t pt-6 ${isDark ? 'border-white/10' : 'border-[#103A2A]/10'}`}>
                            <p className={`text-base md:text-lg font-medium font-sans leading-relaxed ${
                              isDark ? 'text-white' : 'text-[#103A2A]'
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
