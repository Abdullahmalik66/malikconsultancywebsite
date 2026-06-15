import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CaseWork from '../components/CaseWork';
import { Writing } from '../types';
import { getPublishedContent } from '../lib/firebase/cms';

const categories = ['All', 'Blog', 'News', 'Strategy'] as const;
type Category = typeof categories[number];

export default function WritingsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 3);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const [allWritings, setAllWritings] = useState<Writing[]>([]);

  useEffect(() => {
    const fetchWritings = async () => {
      try {
        const published = await getPublishedContent();
        const blogsOnly = published.filter(item => item.contentType === 'blog');
        
        // Map ContentItem to Writing interface
        const mappedWritings: Writing[] = blogsOnly.map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || '',
          content: item.content,
          date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          imageUrl: item.headerImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
          category: (item.category as 'Blog' | 'News' | 'Strategy') || 'Blog',
          author: item.authorName || 'Anonymous',
          badgeText: item.badgeText || ''
        }));

        setAllWritings(mappedWritings);
      } catch (error) {
        console.error("Failed to fetch writings:", error);
      }
    };
    
    fetchWritings();
  }, []);

  const filteredWritings = useMemo(() => {
    return activeCategory === 'All' 
    ? allWritings 
    : allWritings.filter(w => w.category === activeCategory);
  }, [activeCategory, allWritings]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const titleY = useTransform(heroScrollY, [0, 0.4], [0, -350]);
  const titleOpacity = useTransform(heroScrollY, [0, 0.3], [1, 0.1]);
  const descOpacity = useTransform(heroScrollY, [0.05, 0.3], [0, 1]);
  const descY = useTransform(heroScrollY, [0.05, 0.4], [150, 0]);

  const bgColor = useTransform(
    heroScrollY,
    [0, 0.5, 1],
    ["#EAFF00", "#d8f000", "#121212"] 
  );

  return (
    <div className="bg-[#F8F7FA] min-h-screen">
      {/* 300vh Parallax Hero Section */}
      <div ref={heroRef} className="relative h-[300vh]">
        <motion.div 
          style={{ backgroundColor: bgColor }}
          className="sticky top-0 h-screen w-full flex overflow-hidden transition-colors duration-700"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]" />
          </div>

          <div className="relative z-10 w-full h-full px-6 md:px-12 lg:px-24 flex flex-col justify-end pb-0">
            <div className="max-w-[1750px] mx-auto w-full">
              <motion.div 
                style={{ y: titleY }}
                className="flex flex-col items-start origin-bottom-left translate-y-[12vw]"
              >
                <h1 className="text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[7.5vw] font-display font-medium leading-[0.8] tracking-[-0.04em] text-[#6750a4] uppercase break-words w-full">
                  Writings. <br />
                  Insights. <br />
                  Systems.
                </h1>
              </motion.div>

              <motion.div 
                style={{ opacity: descOpacity, y: descY }}
                className="max-w-[750px] mt-12 mb-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[#6750a4]/60 hover:text-[#6750a4] transition-colors group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest leading-none">Back to Home</span>
                  </button>
                </div>

                <p className="text-xl md:text-2xl lg:text-3xl font-sans font-normal leading-tight text-[#6750a4]/90 tracking-tight">
                  Exploring the intersection of AI, strategy, and operational excellence. 
                  A curation of thoughts on structural change and enterprise evolution.
                </p>

                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "80px" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-1 bg-[#6750a4]/40 mt-10 rounded-full" 
                />
              </motion.div>
            </div>
          </div>

          {/* Minimalist Scroll Hint */}
          <motion.div 
            style={{ opacity: useTransform(heroScrollY, [0, 0.05], [1, 0]) }}
            className="absolute bottom-12 right-12 flex items-center gap-4 text-[#6750a4]/50"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-mono">Scroll</span>
            <div className="w-16 h-px bg-[#6750a4]/20" />
          </motion.div>
        </motion.div>
      </div>

      {/* Morphing Filter Section like Case Work */}
      <section className="pt-32 pb-8 px-6 md:px-12 lg:px-24 bg-[#F8F7FA]">
        <div className="max-w-[1440px] mx-auto h-20 relative flex justify-start">
          <div className={`transition-all duration-1000 ease-[0.22,1,0.36,1] ${
            isScrolled 
              ? 'fixed right-8 top-1/2 -translate-y-1/2 z-50 w-64' 
              : 'relative w-full md:w-fit'
          }`}>
            <motion.div 
              layout
              className={`
                inline-flex items-center p-2 backdrop-blur-[32px] border transition-all duration-700 shadow-2xl
                ${isScrolled 
                  ? 'flex-col gap-2 rounded-[32px] bg-[#1a1a1a]/80 py-6 border-white/20' 
                  : 'rounded-[100px] bg-[#1a1a1a]/70 border-white/10 p-3'}
              `}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`
                    rounded-full text-sm font-bold uppercase tracking-widest transition-all relative overflow-hidden flex items-center
                    ${isScrolled 
                      ? 'w-full px-6 py-4 justify-center text-center' 
                      : 'px-10 py-5 whitespace-nowrap'}
                    ${activeCategory === cat ? 'text-white' : 'text-white/40 hover:text-white/80'}
                  `}
                >
                  <span className={`relative z-10 ${isScrolled ? 'leading-tight' : ''}`}>
                    {cat}
                  </span>
                  {activeCategory === cat && (
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

      {/* Grid Section */}
      <section className="py-20 bg-[#F8F7FA]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
          >
            {/* Create New Block - At the beginning of My Writings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => navigate('/create-insight')}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[48px] mb-8 bg-[#6d55a7]/5 border-4 border-dashed border-[#6d55a7]/20 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-[#6d55a7]/10 group-hover:border-[#6d55a7]/40 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Plus className="w-8 h-8 text-[#6d55a7]" />
                </div>
                <div className="text-center px-6">
                  <h3 className="text-xl font-display font-medium text-[#6d55a7] mb-1">Write original view</h3>
                  <p className="text-[10px] font-bold text-[#6d55a7]/50 uppercase tracking-[0.2em]">Start a new insight</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6d55a7]/40">
                  <span>New Draft</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6d55a7]/30" />
                  <span>Perspective</span>
                </div>
                <h3 className="text-2xl font-display font-medium text-[#1a1a1a]/40 italic leading-tight">
                  "The best way to predict the future is to create it."
                </h3>
              </div>
            </motion.div>

            <AnimatePresence mode="popLayout">
              {filteredWritings.map((writing) => (
                <WritingCard key={writing.id} writing={writing} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Section at the bottom */}
      <div className="border-t border-gray-100">
        <CaseWork />
      </div>
    </div>
  );
}

function WritingCard({ writing }: { writing: Writing; key?: string | number }) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      ref={cardRef}
      onClick={() => navigate(`/writings/${writing.id}`)}
    >
      {/* Image Container - CURVY EDGES as requested */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[48px] mb-8 bg-gray-100">
        <img 
          src={writing.imageUrl} 
          alt={writing.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Floating Category Badge */}
        {writing.badgeText && (
          <div className="absolute top-6 left-6 pointer-events-none">
            <span className="bg-m3-primary/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl border border-white/20">
              {writing.badgeText}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Meta Row */}
        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/40">
          <span>{writing.date}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-m3-primary/30" />
          <span className="text-m3-primary">{writing.category}</span>
          {writing.author && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-m3-primary/30" />
              <span>{writing.author}</span>
            </>
          )}
        </div>

        {/* Title with potential underline effect */}
        <h3 className="text-3xl font-display font-medium text-[#1a1a1a] leading-[1.1] tracking-tight group-hover:text-m3-primary transition-colors flex flex-col items-start gap-1">
          {writing.title}
          <div className="h-0.5 w-0 bg-m3-primary transition-all duration-500 group-hover:w-full" />
        </h3>

        {/* Excerpt */}
        <p className="text-[#1a1a1a]/70 font-sans leading-relaxed text-base line-clamp-3">
          {writing.excerpt}
        </p>
      </div>
    </motion.div>
  );
}
