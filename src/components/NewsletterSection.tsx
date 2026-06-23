import React from 'react';
import { Send } from 'lucide-react';

export default function NewsletterSection() {
  return (
    <section className="bg-[#EAFF00] py-32 px-6 relative overflow-hidden">
      {/* Wavy Background Pattern - Animated & Seamless */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' preserveAspectRatio='none'%3E%3Cpath fill='%235d5177' d='M0,160 C180,160 180,200 360,200 C540,200 540,160 720,160 C900,160 900,120 1080,120 C1260,120 1260,160 1440,160 V320 H0 Z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '1440px 100%',
          animation: 'scrollWave 35s linear infinite',
        }}
      />
      
      <style>{`
        @keyframes scrollWave {
          0% {
            background-position-x: 0px;
          }
          100% {
            background-position-x: -1440px;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-display font-medium text-[#1a1a1a] mb-8 tracking-tight">
          Stay ahead of the <span className="text-[#6d55a7]">curve.</span>
        </h2>
        <p className="text-xl text-[#1a1a1a]/60 mb-12 font-medium">
          Weekly insights on the ideas, lessons, and working perspectives shaping marketing, AI, data, and strategy.
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
