import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { getRandomCaseStudies, CaseStudy } from '../data/caseStudies';
import { useNavigate } from 'react-router-dom';

export default function CaseWork() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [randomCases, setRandomCases] = useState<CaseStudy[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRandomCases(getRandomCaseStudies(5));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-32 bg-white overflow-hidden" id="case-work">
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
                        {work.tag}
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

function AnimatedBackground({ type }: { type: string }) {
  switch (type) {
    case 'blobs':
      return <BlobsAnimation />;
    case 'waves':
      return <WavesAnimation />;
    case 'particles':
      return <ParticlesAnimation />;
    case 'neon-lines':
      return (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-[2px] bg-[#00ffff] shadow-[0_0_20px_rgba(0,255,255,0.8)]"
              style={{ top: `${30 + i * 20}%`, left: 0, right: 0 }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: "linear" }}
            />
          ))}
        </div>
      );
    case 'radial-pulse':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-40 h-40 border-2 border-white/30 rounded-full"
          />
        </div>
      );
    case 'grid':
    default:
      return <GridAnimation />;
  }
}

// UNIQUE ANIMATION COMPONENTS

function BlobsAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, 40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-[0%] right-[0%] w-[350px] h-[350px] bg-white/40 rounded-full blur-[80px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.4, 1],
          x: [0, -40, 0],
          y: [0, -40, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[0%] left-[0%] w-[450px] h-[450px] bg-white/20 rounded-full blur-[100px]"
      />
    </div>
  );
}

function WavesAnimation() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 600" preserveAspectRatio="none">
      <motion.path
        animate={{ d: ["M0 200 Q100 150 200 200 T400 200 V600 H0 Z", "M0 220 Q100 270 200 220 T400 220 V600 H0 Z", "M0 200 Q100 150 200 200 T400 200 V600 H0 Z"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        fill="white"
      />
      <motion.path
        animate={{ d: ["M0 250 Q100 300 200 250 T400 250 V600 H0 Z", "M0 230 Q100 180 200 230 T400 230 V600 H0 Z", "M0 250 Q100 300 200 250 T400 250 V600 H0 Z"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
}

function ParticlesAnimation() {
  return (
    <div className="absolute inset-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/30 rounded-full blur-[1px]"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

function GridAnimation() {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-12">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-20 w-full"
        animate={{ y: [-100, 600] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
