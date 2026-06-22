import { motion } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Plus } from 'lucide-react';
import { getPublishedContent } from '../lib/firebase/cms';

interface Insight {
  id: string;
  slug?: string;
  date: string;
  category: string;
  author?: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  badgeText?: string;
}

export default function LatestInsights() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const [allInsights, setAllInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const published = await getPublishedContent();
        const blogs = published.filter(item => item.contentType === 'blog');
        
        // Shuffle randomly using Fisher-Yates algorithm on every refresh
        const shuffled = [...blogs];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const mapped: Insight[] = shuffled.map(item => ({
          id: item.id,
          slug: item.slug,
          date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          category: (item.category as 'Blog' | 'News' | 'Strategy') || 'Blog',
          author: item.authorName || 'Anonymous',
          title: item.title,
          excerpt: item.excerpt || '',
          imageUrl: item.headerImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
          badgeText: item.badgeText || '',
        }));
        
        setAllInsights(mapped);
      } catch (error) {
        console.error("Latest insights fetch error:", error);
      }
    };
    fetchLatest();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cards = container.children;
      if (cards.length === 0) return;

      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
      
      const { scrollLeft } = container;
      // Get the width of the first card element dynamically (supports 580px or 90vw)
      const cardWidth = (cards[0] as HTMLElement).offsetWidth || 580;
      const gap = 40; // gap-10 is 40px
      const step = cardWidth + gap;
      
      // Calculate target snapped scroll position
      let targetScrollLeft = scrollLeft;
      if (direction === 'left') {
        targetScrollLeft = Math.round((scrollLeft - step) / step) * step;
      } else {
        targetScrollLeft = Math.round((scrollLeft + step) / step) * step;
      }
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetScrollLeft = Math.max(0, Math.min(maxScroll, targetScrollLeft));
      
      const start = container.scrollLeft;
      const change = targetScrollLeft - start;
      const startTime = performance.now();
      const duration = 600; // Easing animation duration

      // Disable scroll snapping during scroll animation to avoid fighting snapping engine
      container.style.scrollSnapType = 'none';

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // EaseInOutCubic curve: smooth and premium
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        container.scrollLeft = start + change * ease;

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll);
        } else {
          container.style.scrollSnapType = 'x mandatory';
          scrollAnimationRef.current = null;
        }
      };

      scrollAnimationRef.current = requestAnimationFrame(animateScroll);
    }
  };

  // Performance-optimized 3D Scroll Rotation and Trackpad/Scrollwheel listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || allInsights.length === 0) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const cards = container.children;
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const cardRect = card.getBoundingClientRect();
        
        // Calculate center of the scroll container
        const containerCenter = rect.left + rect.width / 2;
        const cardCenter = cardRect.left + cardRect.width / 2;
        
        // Distance from center relative to container half-width
        const distance = cardCenter - containerCenter;
        const maxDistance = rect.width / 1.5; // range at which rotation reaches max
        
        const fraction = Math.max(-1, Math.min(1, distance / maxDistance));
        
        // Cylinder tilt on Y axis (left tilts positive, right tilts negative)
        const rotationY = -fraction * 15; 
        
        // Gentle tilt on Z axis for organic dynamic feel
        const rotationZ = -fraction * 1.5;

        // Scale down cards slightly further from center
        const scale = 1 - Math.abs(fraction) * 0.08;
        
        // Fade out slightly at the edges
        const opacity = 1 - Math.abs(fraction) * 0.25;
        
        card.style.transform = `perspective(1000px) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) scale(${scale})`;
        card.style.opacity = `${opacity}`;
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    let lastScrollTime = 0;
    // Convert vertical mouse scroll into horizontal scroll for the carousel,
    // while preserving native horizontal trackpad scrolling
    const handleWheel = (e: WheelEvent) => {
      // If the scroll is mostly horizontal (e.g. left/right trackpad swipe),
      // let the browser handle it natively.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      if (e.deltaY !== 0) {
        e.preventDefault();
        
        const now = Date.now();
        // Debounce to prevent scrolling multiple cards in a single flick
        if (now - lastScrollTime < 250) {
          return;
        }
        
        const direction = e.deltaY > 0 ? 'right' : 'left';
        scroll(direction);
        lastScrollTime = now;
      }
    };

    container.addEventListener('scroll', onScroll);
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Initial run
    handleScroll();
    
    // Trigger on resize
    window.addEventListener('resize', handleScroll);

    // Initial timeout to ensure children are rendered and laid out correctly
    const timeoutId = setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timeoutId);
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, [allInsights]);

  return (
    <section className="pt-32 pb-0 bg-white overflow-hidden" id="latest-insights">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 mb-20">
          
          {/* Header Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-display font-medium text-[#1a1a1a] mb-8"
              >
                Writings. Insights. Systems.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-[#1a1a1a]/60 max-w-[56ch] font-sans leading-relaxed"
              >
                A personal archive of ideas, lessons, and working perspectives on AI, strategy, customer data, marketing, growth, and enterprise transformation.
              </motion.p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <motion.a 
                href="/my-writings"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-[#1a1a1a] hover:opacity-60 transition-opacity"
              >
                Explore more
                <div className="flex gap-0.5">
                  <ArrowRight className="w-3 h-3 text-orange-500" />
                  <ArrowRight className="w-3 h-3 text-orange-500 opacity-60" />
                  <ArrowRight className="w-3 h-3 text-orange-500 opacity-30" />
                </div>
              </motion.a>
            </div>
          </div>
        </div>

        {/* Carousel Container - Bleeds to edges */}
        <div className="pl-6 md:pl-12 lg:pl-[calc(max(0px,(100vw-1440px)/2)+96px)]" style={{ perspective: '1200px' }}>
          <div 
            ref={scrollRef}
            className="flex gap-10 overflow-x-auto no-scrollbar pb-20 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch', transformStyle: 'preserve-3d' }}
          >
            {allInsights.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex-shrink-0 w-[90vw] md:w-[580px] snap-start group cursor-pointer"
                style={{ 
                  transformStyle: 'preserve-3d'
                }}
                onClick={() => navigate(`/writings/${item.slug || item.id}`)}
              >
                {/* Image Container */}
                <div className="relative aspect-[16/11] overflow-hidden rounded-[64px] mb-8 bg-[#f0f0f0] shadow-sm">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Primary Badge (Category) */}
                  {item.badgeText && (
                    <div className="absolute top-8 right-8">
                       <span className="bg-m3-primary text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                         {item.badgeText}
                       </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-6 px-4 md:px-0 pr-12">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a1a1a]/40 uppercase tracking-widest">
                    <span>{item.date}</span>
                    <span className="w-2 h-2 rounded-full bg-[#EAFF00]" />
                    <span>{item.category}</span>
                    {item.author && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#EAFF00]" />
                        <span>{item.author}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-3xl md:text-4xl font-display font-medium text-[#1a1a1a] leading-tight group-hover:text-[#6d55a7] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xl text-[#1a1a1a]/60 font-sans line-clamp-3 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 mt-4 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => scroll('left')}
                className="w-16 h-16 flex items-center justify-center rounded-full border border-[#1a1a1a]/10 bg-white hover:bg-[#1a1a1a]/5 transition-all group shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-[#1a1a1a] transition-transform group-active:-translate-x-1" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-[#6d55a7] text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#6d55a7]/20"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 transition-transform group-active:translate-x-1" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-insight')}
              className="flex items-center gap-3 px-8 py-5 rounded-full bg-[#EAFF00] text-[#1a1a1a] font-bold uppercase tracking-widest text-sm shadow-xl shadow-[#EAFF00]/20 hover:shadow-[#EAFF00]/40 transition-all border border-[#1a1a1a]/5"
            >
              <Plus className="w-5 h-5" />
              Write a Blog
            </motion.button>
          </div>
        </div>
    </section>
  );
}
