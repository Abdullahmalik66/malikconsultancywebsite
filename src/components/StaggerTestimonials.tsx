import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { STATIC_TESTIMONIALS, Testimonial, shuffleArray } from '../data/testimonials';

export default function StaggerTestimonials() {
  const [cardSize, setCardSize] = useState(520);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 1024px)");
      const { matches: isMd } = window.matchMedia("(min-width: 768px)");
      setCardSize(matches ? 520 : isMd ? 420 : 320);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Fetch approved testimonials from server, shuffle on refresh so they vary elegantly!
  useEffect(() => {
    async function fetchApprovedTestimonials() {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data: Testimonial[] = await res.json();
          // Filter to show only approved items on homepage
          const approved = data.filter(t => t.approved);
          const finalData = approved.length > 0 ? approved : STATIC_TESTIMONIALS.filter(t => t.approved);
          
          // Randomize initial ordering on page load so it feels dynamic and alive on refresh!
          const randomized = shuffleArray(finalData);
          setList(randomized.map(t => ({ ...t, tempId: Math.random() })));
        } else {
          const randomized = shuffleArray(STATIC_TESTIMONIALS.filter(t => t.approved));
          setList(randomized.map(t => ({ ...t, tempId: Math.random() })));
        }
      } catch (err) {
        console.error('Failed to load testimonials for home carousel:', err);
        const randomized = shuffleArray(STATIC_TESTIMONIALS.filter(t => t.approved));
        setList(randomized.map(t => ({ ...t, tempId: Math.random() })));
      }
    }
    fetchApprovedTestimonials();
  }, []);

  const handleMove = (steps: number) => {
    if (list.length === 0) return;
    const newList = [...list];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (item) newList.push({ ...item, tempId: Math.random() });
      }
    } else if (steps < 0) {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (item) newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setList(newList);
  };

  if (list.length === 0) {
    return (
      <section className="py-32 bg-[#F8F7FA] overflow-hidden flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#6d55a7]/30 border-t-[#6d55a7] animate-spin" />
      </section>
    );
  }

  return (
    <section className="py-32 bg-[#F8F7FA] overflow-hidden relative" id="testimonials">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 mb-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#EAFF00] mb-4 bg-[#6d55a7] px-4 py-1 rounded-full">Success Stories</span>
          <h2 className="text-4xl md:text-5xl font-display font-medium text-[#6d55a7] mb-6">
            Trusted by the leaders of <br /> industry transformation.
          </h2>
        </div>
      </div>

      <div className="relative w-full h-[700px] flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((item, index) => {
            const position = index - Math.floor(list.length / 2);
            return (
              <TestimonialCard
                key={item.tempId}
                testimonial={item}
                position={position}
                cardSize={cardSize}
                handleMove={handleMove}
              />
            );
          })}
        </AnimatePresence>

        {/* Controls & Nav link */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-40">
          <div className="flex gap-4">
            <button
              onClick={() => handleMove(-1)}
              className="w-16 h-16 flex items-center justify-center rounded-full border border-[#6d55a7]/10 bg-white hover:bg-[#6d55a7]/5 transition-all group shadow-sm cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-[#6d55a7] transition-transform group-active:-translate-x-1" />
            </button>
            <button
              onClick={() => handleMove(1)}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-[#6d55a7] text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#6d55a7]/20 group cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 transition-transform group-active:translate-x-1" />
            </button>
          </div>

          <Link 
            to="/testimonials" 
            className="text-sm font-bold text-[#6d55a7] hover:text-[#523f80] hover:underline transition-all flex items-center gap-1.5 mt-2"
          >
            Explore our full trust gallery &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

interface CardProps {
  testimonial: any;
  position: number;
  cardSize: number;
  handleMove: (steps: number) => void;
  key?: string | number;
}

function TestimonialCard({ testimonial, position, cardSize, handleMove }: CardProps) {
  const isCenter = position === 0;
  const isVisible = Math.abs(position) <= 2; // Only show 5 cards for clean look

  // Parse structured or legacy 'by' fields cleanly
  const authorName = testimonial.name || (testimonial.by ? testimonial.by.split(',')[0] : 'Collaborator');
  const authorDetails = testimonial.role 
    ? `${testimonial.role} at ${testimonial.company}` 
    : testimonial.company || (testimonial.by ? testimonial.by.split(',')[1] : 'Partner');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: position * 100, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        x: (cardSize / 1.6) * position,
        y: isCenter ? -40 : position % 2 === 0 ? 20 : -20,
        scale: isCenter ? 1 : 0.85,
        rotate: isCenter ? 0 : position * 2.5,
        zIndex: 20 - Math.abs(position),
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        opacity: { duration: 0.2 } 
      }}
      onClick={() => isCenter ? null : handleMove(position)}
      style={{
        width: cardSize,
        translate: "-50% -50%"
      }}
      className={`
        absolute left-1/2 top-1/2 p-10 flex flex-col transition-shadow duration-500 rounded-[48px] h-auto min-h-[480px]
        ${isCenter 
          ? 'bg-[#6d55a7] text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] shadow-[#6d55a7]/40' 
          : 'bg-white text-[#6d55a7] border border-gray-200 cursor-pointer hover:border-[#6d55a7]/50 hover:shadow-xl'}
      `}
    >
      {/* Small corner detail */}
      <div className={`absolute top-0 right-0 w-16 h-16 pointer-events-none ${isCenter ? 'bg-white/5' : 'bg-[#6d55a7]/5'}`} 
           style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

      <div className="flex-1 overflow-hidden">
        <blockquote className={`text-lg md:text-xl font-display font-medium leading-relaxed italic ${isCenter ? 'text-white/90' : 'text-[#6d55a7]/80'}`}>
          "{testimonial.testimonial}"
        </blockquote>
      </div>

      <div className="pt-6 border-t border-current/10">
        <p className={`text-sm tracking-tight ${isCenter ? 'text-[#EAFF00]' : 'text-[#6d55a7]'} font-bold uppercase`}>
          {authorName}
        </p>
        <p className={`text-[10px] uppercase tracking-widest ${isCenter ? 'text-white/40' : 'text-[#6d55a7]/50'} line-clamp-1`}>
          {authorDetails}
        </p>
      </div>
    </motion.div>
  );
}
