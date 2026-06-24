import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublishedContent, ContentItem } from '../lib/firebase/cms';
import { getDeterministicFormatting } from '../lib/caseStudyHelpers';
import { AnimatedBackground } from './cms/AnimatedBackground';

export default function CaseWork() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [randomCases, setRandomCases] = useState<(ContentItem & { color: string; animationType: string })[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      const published = await getPublishedContent();
      const cases = published.filter(item => item.contentType === 'case_study');
      // shuffle and pick up to 5
      const shuffled = cases.sort(() => 0.5 - Math.random()).slice(0, 5);
      const withFormatting = shuffled.map(item => {
        const fmt = getDeterministicFormatting(item.id);
        return {
          ...item,
          color: fmt.color,
          animationType: fmt.animationType
        };
      });
      setRandomCases(withFormatting);
    };
    fetchCases();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-16 bg-white overflow-hidden" id="case-work">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Static Left Side - Wise inspired */}
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
                    className="w-16 h-16 flex items-center justify-center rounded-full border border-[#1a1a1a]/10 bg-white hover:bg-[#1a1a1a]/5 transition-all group shadow-sm"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#1a1a1a] group-active:-translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => scroll('right')}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-[#6d55a7] text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#6d55a7]/20 group"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-6 h-6 transition-transform group-active:translate-x-1" />
                  </button>
                </div>

                <button 
                  onClick={() => navigate('/case-work')}
                  className="text-sm font-bold uppercase tracking-[0.2em] text-[#6d55a7] hover:opacity-70 transition-opacity flex items-center gap-2"
                >
                  View All Work <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Scrollable Right Side - Using negative margin for edge-to-edge bleed */}
          <div className="lg:col-span-8 lg:-mr-[100vw]">
            <div 
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto no-scrollbar pb-12 snap-x snap-mandatory pr-[100vw]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {randomCases.map((work) => (
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
                        navigate('/case-study/' + work.slug);
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

