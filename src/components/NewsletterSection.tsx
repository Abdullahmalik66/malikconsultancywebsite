import React from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function NewsletterSection() {
  return (
    <section className="bg-[#EAFF00] py-32 px-6 relative overflow-hidden">
      {/* Wavy Background Pattern - Animated & Seamless */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, -1440],
          }}
          transition={{ 
            duration: 35, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex w-[2880px] h-full"
        >
          <svg className="w-[1440px] h-full shrink-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="#5d5177" 
              d="M0,160 C320,300,420,0,720,160 C1020,320,1120,20,1440,160 V320 H0 Z"
            />
          </svg>
          <svg className="w-[1440px] h-full shrink-0" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="#5d5177" 
              d="M0,160 C320,300,420,0,720,160 C1020,320,1120,20,1440,160 V320 H0 Z"
            />
          </svg>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-display font-medium text-[#1a1a1a] mb-8 tracking-tight">
          Stay ahead of the <span className="text-[#6d55a7]">curve.</span>
        </h2>
        <p className="text-xl text-[#1a1a1a]/60 mb-12 font-medium">
          Weekly insights on growth architecture, AI automation, and performance marketing.
        </p>
        <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Your professional email"
            className="flex-1 px-8 py-6 bg-white/50 border border-black/5 rounded-full text-lg text-[#1a1a1a] placeholder:text-black/30 outline-none focus:bg-white transition-all shadow-xl shadow-black/5"
          />
          <button className="px-12 py-6 bg-[#6d55a7] text-white rounded-full font-bold text-lg hover:bg-[#7e67b9] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10">
            <span>Join Newsletter</span>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </section>
  );
}
