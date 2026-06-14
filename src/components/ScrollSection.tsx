import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function ScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const x = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section 
      ref={containerRef} 
      className="relative h-[200vh] py-20 flex flex-col items-center justify-center overflow-hidden bg-m3-surface" 
      id="scroll-showcase"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center w-full">
        <motion.div 
          style={{ scale, rotate, opacity }}
          className="relative z-10 text-center"
        >
          <h2 className="text-8xl md:text-[14rem] font-display font-black uppercase leading-none mb-4 text-m3-primary/10 stroke-m3-outline">
            SCROLL
          </h2>
          <motion.div 
            style={{ x }}
            className="flex gap-4 whitespace-nowrap"
          >
             {Array.from({ length: 6 }).map((_, i) => (
               <span key={i} className="text-4xl md:text-6xl font-mono text-m3-outline/30 uppercase italic">
                 Interactive Experience •
               </span>
             ))}
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ 
            rotateY: useTransform(scrollYProgress, [0, 1], [45, -45]),
            rotateX: useTransform(scrollYProgress, [0, 1], [-10, 10]),
          }}
          className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none perspective-1000"
        >
          <div className="grid grid-cols-4 gap-4 w-[120vw] -rotate-12">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-m3-secondary-container border border-m3-outline/20 rounded-2xl flex items-center justify-center text-m3-on-secondary-container font-display text-4xl"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
