import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, Plus, Search, Tag as TagIcon, X, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CaseWork from '../components/CaseWork';
import { Writing } from '../types';
import { getPublishedContent } from '../lib/firebase/cms';

export default function WritingsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showExploreTags, setShowExploreTags] = useState(false);

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
        
        // Sort blogs so that the latest published ones are shown first
        const sortedBlogs = [...blogsOnly].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Map ContentItem to Writing interface
        const mappedWritings: Writing[] = sortedBlogs.map(item => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          excerpt: item.excerpt || '',
          content: item.content,
          date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          imageUrl: item.headerImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
          category: (item.category as 'Blog' | 'News' | 'Strategy') || 'Blog',
          author: item.authorName || 'Anonymous',
          badgeText: item.badgeText || '',
          tags: item.tags || []
        }));

        setAllWritings(mappedWritings);
      } catch (error) {
        console.error("Failed to fetch writings:", error);
      }
    };
    
    fetchWritings();
  }, []);

  // Dynamic tag extraction
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allWritings.forEach(w => {
      w.tags?.forEach(t => {
        if (t.trim()) tagSet.add(t.trim());
      });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [allWritings]);

  // Combined search and tag filter logic
  const filteredWritings = useMemo(() => {
    return allWritings.filter(w => {
      const matchesSearch = searchQuery.trim() === '' ||
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => w.tags?.some(t => t.trim() === tag));

      return matchesSearch && matchesTags;
    });
  }, [allWritings, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

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

      {/* Search & Dynamic Tag Filter Section */}
      <section className="pt-24 pb-8 px-6 md:px-12 lg:px-24 bg-[#F8F7FA] relative z-20">
        <div className="max-w-[1440px] mx-auto space-y-8">
          
          {/* Glassmorphic Search & Settings Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative w-full md:flex-1 md:max-w-5xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6d55a7]/50 group-focus-within:text-[#6d55a7] transition-colors" />
              <input
                type="text"
                placeholder='Search insights (e.g., "AI Transformation", "Leadership")...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-white dark:bg-[#1e1c24] border border-m3-outline/10 focus:border-[#6d55a7]/40 rounded-full text-sm font-sans font-medium text-m3-on-surface shadow-sm focus:ring-4 focus:ring-[#6d55a7]/5 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-m3-primary/10 rounded-full text-[#6d55a7]/50 hover:text-m3-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button 
              onClick={() => setShowExploreTags(!showExploreTags)}
              className={`flex items-center justify-center gap-2 px-5 py-3 md:py-2.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-all focus:outline-none cursor-pointer w-full md:w-auto ${
                showExploreTags 
                  ? 'bg-[#6d55a7] text-white border-[#6d55a7] shadow-md shadow-[#6d55a7]/20 scale-105' 
                  : 'border-[#6d55a7]/20 text-[#6d55a7]/70 hover:bg-[#6d55a7]/10'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Explore Topics</span>
            </button>
          </div>

          {/* Quick Suggestions Helper - Permanently visible outside the drawer */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-m3-on-surface/50 font-sans pt-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#6d55a7]">Suggested Topics:</span>
            {(availableTags.length > 0 ? availableTags.slice(0, 8) : ['Artificial Intelligence', 'Leadership', 'AI transformation', 'AI governance']).map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full transition-all font-semibold uppercase tracking-widest text-[9px] border cursor-pointer ${
                    isSelected
                      ? 'bg-[#6d55a7] text-white border-[#6d55a7] shadow-sm'
                      : 'bg-[#6d55a7]/5 hover:bg-[#6d55a7]/10 text-[#6d55a7] border-[#6d55a7]/10'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExploreTags && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden space-y-6 pt-2"
              >
                {/* Dynamic Tags Cloud (Capsules) */}
                {availableTags.length > 0 && (
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.03
                        }
                      }
                    }}
                    className="flex flex-wrap gap-2.5 items-center"
                  >
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, scale: 0.9, y: 5 },
                        visible: { opacity: 1, scale: 1, y: 0 }
                      }}
                      onClick={clearAllFilters}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                        selectedTags.length === 0 && searchQuery.trim() === ''
                          ? 'bg-[#6d55a7] text-white shadow-md shadow-[#6d55a7]/20 scale-105'
                          : 'bg-white dark:bg-[#1e1c24] border border-m3-outline/10 text-m3-on-surface/60 hover:border-[#6d55a7]/30 hover:text-[#6d55a7]'
                      }`}
                    >
                      All Topics
                    </motion.button>
                    {availableTags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <motion.button
                          key={tag}
                          variants={{
                            hidden: { opacity: 0, scale: 0.9, y: 5 },
                            visible: { opacity: 1, scale: 1, y: 0 }
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTag(tag)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-[#6d55a7] text-white shadow-md shadow-[#6d55a7]/20 scale-105'
                              : 'bg-white dark:bg-[#1e1c24] border border-m3-outline/10 text-m3-on-surface/60 hover:border-[#6d55a7]/30 hover:text-[#6d55a7]'
                          }`}
                        >
                          <TagIcon className="w-3.5 h-3.5 opacity-60" />
                          {tag}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filter indicator and summary */}
          {(selectedTags.length > 0 || searchQuery.trim() !== '') && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#6d55a7]/5 rounded-[20px] border border-[#6d55a7]/10 animate-fadeIn">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6d55a7]">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchQuery.trim() !== '' && (
                    <span className="bg-[#6d55a7]/10 text-[#6d55a7] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-[#6d55a7]/20">
                      Query: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedTags.map(tag => (
                    <span key={tag} className="bg-[#6d55a7]/10 text-[#6d55a7] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-[#6d55a7]/20">
                      {tag}
                      <button onClick={() => toggleTag(tag)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-m3-on-surface/60">
                  {filteredWritings.length} {filteredWritings.length === 1 ? 'insight' : 'insights'} found
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold uppercase tracking-widest text-m3-error hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

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
                  <h3 className="text-xl font-display font-medium text-[#6d55a7] mb-2">Write an insight worth reading</h3>
                  <p className="text-xs text-[#6d55a7]/60 max-w-xs mx-auto">Start a new article, perspective, or working idea.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6d55a7]/40">
                  <span>Draft</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6d55a7]/30" />
                  <span>Perspective</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6d55a7]/30" />
                  <span>Original thinking</span>
                </div>
                <h3 className="text-2xl font-display font-medium text-[#1a1a1a]/40 italic leading-tight">
                  “Clear thinking becomes useful when it is documented.”
                </h3>
              </div>
            </motion.div>

            <AnimatePresence mode="popLayout">
              {filteredWritings.map((writing) => (
                <WritingCard key={writing.id} writing={writing} />
              ))}
            </AnimatePresence>

            {filteredWritings.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="md:col-span-2 flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#1e1c24] border border-m3-outline/10 rounded-[48px] shadow-sm min-h-[300px]"
              >
                <div className="p-4 rounded-full bg-[#6d55a7]/5 text-[#6d55a7] mb-4 animate-bounce">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-semibold text-m3-on-surface mb-2">No matching insights found</h3>
                <p className="text-sm text-m3-on-surface/60 max-w-sm mb-6">
                  We couldn't find any articles matching your search query or selected tags. Try resetting your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-[#6d55a7] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6d55a7]/90 transition-all shadow-md cursor-pointer"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
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
      onClick={() => navigate(`/writings/${writing.slug || writing.id}`)}
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
