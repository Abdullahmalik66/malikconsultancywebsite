import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getPublishedContent, ContentItem } from '../lib/firebase/cms';
import { getDeterministicFormatting } from '../lib/caseStudyHelpers';
import ClientShowcase2 from '../components/ClientShowcase2';

export default function CaseWorkPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [caseStudies, setCaseStudies] = useState<(ContentItem & { color: string; animationType: string; tag: string })[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      // Trigger sidebar state only after approximately 3 screen heights of scrolling
      setIsScrolled(window.scrollY > window.innerHeight * 3);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchCases = async () => {
      const published = await getPublishedContent();
      const cases = published.filter(item => item.contentType === 'case_study');
      const withFormatting = cases.map(item => {
        const fmt = getDeterministicFormatting(item.id);
        return {
          ...item,
          color: fmt.color,
          animationType: fmt.animationType,
          tag: item.badgeText || (item.tags && item.tags[0]) || 'Case Study'
        };
      });
      setCaseStudies(withFormatting);
    };
    fetchCases();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = useMemo(() => {
    const tags = caseStudies.map(study => study.tag);
    return ['All', ...Array.from(new Set(tags))];
  }, [caseStudies]);

  const filteredStudies = useMemo(() => {
    if (activeFilter === 'All') return caseStudies;
    return caseStudies.filter(study => study.tag === activeFilter);
  }, [activeFilter, caseStudies]);

  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const titleY = useTransform(heroScrollY, [0, 0.4], [0, -350]);
  const titleOpacity = useTransform(heroScrollY, [0, 0.3], [1, 0.1]);
  const descOpacity = useTransform(heroScrollY, [0.05, 0.3], [0, 1]);
  const descY = useTransform(heroScrollY, [0.05, 0.4], [150, 0]);

  // Dynamic background color shift starting from Green
  const bgColor = useTransform(
    heroScrollY,
    [0, 0.5, 1],
    ["#1a3c1a", "#1a2c1a", "#121212"]
  );

  return (
    <div className="min-h-screen bg-[#F8F7FA]">
      {/* Hero Section - Matching Main Page Styling */}
      <div ref={containerRef} className="relative h-[300vh]">
        <motion.div
          style={{ backgroundColor: bgColor }}
          className="sticky top-0 h-screen w-full flex overflow-hidden transition-colors duration-700"
        >
          {/* Subtle texture/mesh for depth */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[10%] left-[20%] w-[80%] h-[80%] bg-white/20 rounded-full blur-[160px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[60%] bg-black/10 rounded-full blur-[140px]" />
          </div>

          <div className="relative z-10 w-full h-full px-6 md:px-12 lg:px-24 flex flex-col justify-end pb-0">
            <div className="max-w-[1750px] mx-auto w-full">
              <motion.div
                style={{ y: titleY }}
                className="flex flex-col items-start origin-bottom-left translate-y-[12vw]"
              >
                <h1 className="text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[7.5vw] font-display font-medium leading-[0.8] tracking-[-0.04em] text-white uppercase break-words w-full">
                  Real <br />
                  Projects. <br />
                  Real Impact.
                </h1>
              </motion.div>

              <motion.div
                style={{ opacity: descOpacity, y: descY }}
                className="max-w-[750px] mt-12 mb-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                  </button>
                </div>

                <p className="text-xl md:text-2xl lg:text-3xl font-sans font-normal leading-tight text-white/90 tracking-tight">
                  We partner with forward-thinking organizations to navigate the complexities of AI adoption.
                  Our work bridges the gap between ambition and reality, delivering measurable impact
                  through strategic innovation and technical excellence.
                </p>

                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "80px" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-1 bg-white/40 mt-10 rounded-full"
                />
              </motion.div>
            </div>
          </div>

          {/* Minimalist Scroll Hint */}
          <motion.div
            style={{ opacity: useTransform(heroScrollY, [0, 0.05], [1, 0]) }}
            className="absolute bottom-12 right-12 flex items-center gap-4 text-white/50"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-mono">Scroll</span>
            <div className="w-16 h-px bg-white/20" />
          </motion.div>
        </motion.div>
      </div>

      {/* Filter Bar Space (White) */}
      <section className="bg-[#F8F7FA] pt-32 pb-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto h-20 relative flex justify-start">
          <div className={`transition-all duration-1000 ease-[0.22,1,0.36,1] ${isScrolled
              ? 'fixed right-8 top-1/2 -translate-y-1/2 z-50 w-64'
              : 'relative w-full md:w-fit'
            }`}>
            <motion.div
              layout
              className={`
                inline-flex items-center p-2 backdrop-blur-[32px] border transition-all duration-700
                ${isScrolled
                  ? 'flex-col gap-2 rounded-[32px] bg-[#1a1a1a]/80 py-6 border-white/20'
                  : 'rounded-[100px] bg-[#1a1a1a]/70 border-white/10 p-3'}
              `}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`
                    rounded-full text-sm font-bold transition-all relative overflow-hidden flex items-center
                    ${isScrolled
                      ? 'w-full px-6 py-4 justify-center text-center'
                      : 'px-10 py-5 whitespace-nowrap'}
                    ${activeFilter === category ? 'text-white' : 'text-white/40 hover:text-white/80'}
                  `}
                >
                  <span className={`relative z-10 ${isScrolled ? 'leading-tight' : ''}`}>
                    {category}
                  </span>
                  {activeFilter === category && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#6d55a7] rounded-full"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto pt-12">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredStudies.map((work, index) => (
                <motion.div
                  layout
                  key={work.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className={`flex-shrink-0 w-full rounded-[48px] overflow-hidden relative group shadow-2xl shadow-black/5 h-[580px]`}
                >
                  {/* Background Color */}
                  <div
                    className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-110"
                    style={{ backgroundColor: work.color }}
                  />

                  {/* NEON ANIMATIONS */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-700">
                    <NeonAnimation type={work.animationType} />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="absolute top-10 left-10">
                      <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10">
                        {work.tag}
                      </span>
                    </div>

                    <h3 className="text-3xl font-display font-medium text-white mb-10 leading-[1.1] tracking-tight">
                      {work.title}
                    </h3>

                    <motion.div
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        navigate('/case-study/' + (work.slug || work.id));
                      }}
                      className="group relative bg-[#fbe1ff] text-[#1a1a1a] px-8 py-4 rounded-full font-bold text-sm w-fit transition-all cursor-pointer overflow-hidden flex items-center gap-3 shadow-xl shadow-black/10"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span>Read more</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Grid Client Showcase */}
      <ClientShowcase2 />
    </div>
  );
}

function NeonAnimation({ type }: { type: string }) {
  switch (type) {
    case 'blobs':
      return (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-0 w-64 h-64 bg-[#00ffcc] rounded-full blur-[80px] opacity-40"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-0 w-80 h-80 bg-[#ff00ff] rounded-full blur-[100px] opacity-30"
          />
        </>
      );
    case 'waves':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="none">
          <motion.path
            animate={{ d: ["M0 300 Q100 250 200 300 T400 300 V600 H0 Z", "M0 310 Q100 360 200 310 T400 310 V600 H0 Z", "M0 300 Q100 250 200 300 V600 H0 Z"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            fill="#33ff00"
            className="opacity-40"
          />
        </svg>
      );
    case 'particles':
      return (
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-[#ff9900] rounded-full blur-[2px]"
              style={{
                width: 4, height: 4,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -100], opacity: [0, 1, 0] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      );
    case 'neon-lines':
      return (
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-[#00ffff] shadow-[0_0_15px_#00ffff]"
              style={{ top: `${20 + i * 20}%`, left: 0, right: 0 }}
              animate={{ scaleX: [0, 1, 0], x: ['-100%', '100%'] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>
      );
    case 'radial-pulse':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-64 h-64 border-2 border-[#ffff00] rounded-full shadow-[0_0_20px_#ffff00]"
          />
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="w-64 h-64 border border-[#ffff00] rounded-full"
          />
        </div>
      );
    case 'grid':
    default:
      return (
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 opacity-20">
          {[...Array(48)].map((_, i) => (
            <motion.div
              key={i}
              className="border border-[#00ffcc]/30"
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      );
  }
}
