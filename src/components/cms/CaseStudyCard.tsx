import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface CaseStudyCardProps {
  title: string;
  tag?: string;
  summary: string;
  ctaLink?: string;
}

export const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ title, tag = 'Case Study', summary, ctaLink }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-m3-surface-container-high rounded-[32px] p-8 mt-6 shadow-sm border border-m3-outline/10 flex flex-col gap-4 relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-m3-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-m3-primary">
        {tag}
      </span>
      
      <h4 className="text-xl font-display font-medium text-m3-on-surface leading-tight">
        {title}
      </h4>
      
      <p className="text-sm text-m3-on-surface-variant leading-relaxed">
        {summary}
      </p>

      {ctaLink && (
         <a 
          href={ctaLink}
          className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-m3-primary group-hover:text-m3-primary/80 transition-colors w-fit"
         >
           Read more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </a>
      )}
    </motion.div>
  );
};
