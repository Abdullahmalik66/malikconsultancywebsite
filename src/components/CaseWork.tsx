import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublishedContent, ContentItem } from '../lib/firebase/cms';
import { getDeterministicFormatting } from '../lib/caseStudyHelpers';
import { AnimatedBackground } from './cms/AnimatedBackground';

const fallbackCaseStudies: ContentItem[] = [
  {
    id: 'cs-1',
    contentType: 'case_study',
    status: 'published',
    title: 'How I helped the University of Oulu turn AI curiosity into practical capability building',
    slug: 'university-of-oulu-ai-capability-building',
    content: 'Comprehensive AI workshop and capability roadmap for 200+ researchers and faculty members.',
    badgeText: 'AI MATURITY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-2',
    contentType: 'case_study',
    status: 'published',
    title: 'Bygghemma paid media & predictable growth engine',
    slug: 'bygghemma-paid-media-growth-engine',
    content: 'Scaled multi-channel performance media across Nordic markets with automated bidding and dynamic creative.',
    badgeText: 'MODERN MARKETING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-3',
    contentType: 'case_study',
    status: 'published',
    title: 'Enterprise Data Activation & Real-Time Intelligence Pipeline',
    slug: 'enterprise-data-activation-intelligence',
    content: 'Unified fragmented customer data touchpoints into a real-time data warehouse driving hyper-personalized customer journeys.',
    badgeText: 'DATA ACTIVATION',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-4',
    contentType: 'case_study',
    status: 'published',
    title: 'Autonomous Generative AI Agents for Automated Customer Operations',
    slug: 'autonomous-genai-customer-operations',
    content: 'Deployed customized LLM agents reducing support ticket resolution times by 74% while maintaining high satisfaction.',
    badgeText: 'AI TRANSFORMATION',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-5',
    contentType: 'case_study',
    status: 'published',
    title: 'Global E-Commerce Omnichannel Growth Strategy & Attribution Engine',
    slug: 'ecommerce-omnichannel-growth-attribution',
    content: 'Engineered custom multi-touch attribution models driving 42% revenue lift across international markets.',
    badgeText: 'GROWTH STRATEGY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-6',
    contentType: 'case_study',
    status: 'published',
    title: 'Executive AI Literacy & Organizational Change Management',
    slug: 'executive-ai-literacy-change-management',
    content: 'Upskilled C-suite executives and senior leaders to evaluate, procure, and govern enterprise AI tools.',
    badgeText: 'AI GOVERNANCE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-7',
    contentType: 'case_study',
    status: 'published',
    title: 'Predictive Churn Prevention Model for SaaS Platforms',
    slug: 'predictive-churn-prevention-saas',
    content: 'Built machine learning models forecasting customer churn 60 days in advance with targeted retention triggers.',
    badgeText: 'DATA SCIENCE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cs-8',
    contentType: 'case_study',
    status: 'published',
    title: 'Full-Funnel Content Engine Powered by Proprietary AI Workflows',
    slug: 'full-funnel-ai-content-engine',
    content: 'Architected automated SEO & social media content engines scaling organic reach by 320% in 6 months.',
    badgeText: 'CONTENT ENGINE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function CaseWork() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [casesList, setCasesList] = useState<(ContentItem & { color: string; animationType: string })[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const published = await getPublishedContent();
        const cmsCases = published.filter(item => item.contentType === 'case_study');
        
        // Merge CMS cases with fallback cases to ensure a rich multi-card carousel
        const combined = [...cmsCases];
        fallbackCaseStudies.forEach(fallback => {
          if (!combined.some(c => c.slug === fallback.slug || c.id === fallback.id)) {
            combined.push(fallback);
          }
        });

        const withFormatting = combined.map(item => {
          const fmt = getDeterministicFormatting(item.id);
          return {
            ...item,
            color: fmt.color,
            animationType: fmt.animationType
          };
        });

        setCasesList(withFormatting);
      } catch (err) {
        console.error("Error loading case studies:", err);
        // Fallback gracefully to default items
        const withFormatting = fallbackCaseStudies.map(item => {
          const fmt = getDeterministicFormatting(item.id);
          return {
            ...item,
            color: fmt.color,
            animationType: fmt.animationType
          };
        });
        setCasesList(withFormatting);
      }
    };
    fetchCases();
  }, []);

  // Guarantee carousel ALWAYS starts at Card #1 (leftmost position)
  useEffect(() => {
    if (scrollRef.current && casesList.length > 0) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [casesList]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - (clientWidth * 0.7) : scrollLeft + (clientWidth * 0.7);
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-16 bg-white overflow-hidden" id="case-work">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Static Left Side */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 z-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d55a7]/40">Case Studies</span>
                <div className="h-px w-10 bg-[#6d55a7]/20" />
              </div>
              
              <h2 className="text-5xl md:text-6xl lg:text-[72px] font-display font-medium text-[#1a1a1a] leading-[0.9] mb-12 tracking-[-0.04em]">
                REAL <br />
                PROJECTS. <br />
                REAL <br />
                IMPACT.
              </h2>

              <div className="flex flex-col gap-8">
                <div className="flex gap-4">
                  <button 
                    onClick={() => scroll('left')}
                    className="w-16 h-16 flex items-center justify-center rounded-full border border-[#1a1a1a]/10 bg-white hover:bg-[#1a1a1a]/5 transition-all group shadow-sm cursor-pointer"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#1a1a1a] group-active:-translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => scroll('right')}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-[#6d55a7] text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#6d55a7]/20 group cursor-pointer"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6 transition-transform group-active:translate-x-1" />
                  </button>
                </div>

                <button 
                  onClick={() => navigate('/case-work')}
                  className="text-sm font-bold uppercase tracking-[0.2em] text-[#6d55a7] hover:opacity-70 transition-opacity flex items-center gap-2 cursor-pointer"
                >
                  View All Work <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Scrollable Right Side */}
          <div className="lg:col-span-8 lg:-mr-[100vw]">
            <div 
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto no-scrollbar pb-12 snap-x snap-mandatory pr-6 lg:pr-[100vw]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {casesList.map((work) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.8, ease: [0.05, 0.7, 0.1, 1] }}
                  className="flex-shrink-0 w-[85vw] md:w-[480px] h-[640px] rounded-[56px] overflow-hidden relative group snap-start shadow-2xl shadow-black/5"
                >
                  {/* Background Color */}
                  <div 
                    className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-110" 
                    style={{ backgroundColor: work.color }}
                  />

                  {/* ANIMATIONS BASED ON TYPE */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                    <AnimatedBackground type={work.animationType} />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    <div className="absolute top-12 left-12">
                      <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10">
                        {work.badgeText || (work.tags && work.tags[0]) || 'Case Study'}
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-3xl lg:text-[40px] font-display font-medium text-white mb-12 leading-[1.0] tracking-tight">
                      {work.title}
                    </h3>

                    <motion.div
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (work.slug) {
                          navigate('/case-study/' + work.slug);
                        } else {
                          navigate('/case-work');
                        }
                      }}
                      className="group relative bg-[#fbe1ff] text-[#1a1a1a] px-10 py-5 rounded-full font-bold text-sm w-fit transition-all cursor-pointer overflow-hidden flex items-center gap-3 shadow-xl shadow-black/10"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span>Read more</span>
                        <div className="w-6 h-6 bg-[#1a1a1a]/10 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#1a1a1a]/20">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </span>
                      <motion.div 
                        variants={{
                          hover: { x: 0 }
                        }}
                        initial={{ x: "-101%" }}
                        className="absolute inset-0 bg-[#EAFF00]"
                        transition={{ duration: 0.4, ease: "circOut" }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
