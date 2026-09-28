import React, { useState } from 'react';
import { Send, CheckCircle2, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitNewsletterLead } from '@/services/leads/leadApi';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (honeypot) {
      // Bot detected, silently show success
      setShowSuccessModal(true);
      setEmail('');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const sourcePage = typeof window !== 'undefined' ? window.location.pathname : '/';
      const sourceTitle = typeof document !== 'undefined' ? document.title : 'Malik Consultancy';

      const result = await submitNewsletterLead(trimmedEmail, sourcePage, sourceTitle);

      if (result.success) {
        setShowSuccessModal(true);
        setEmail('');
      } else {
        setErrorMessage(result.message || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <form className="flex flex-col md:flex-row gap-4 relative" onSubmit={handleSubmit}>
          {/* Honeypot field for bot deflection */}
          <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
            <input
              tabIndex={-1}
              type="text"
              name="_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Your professional email"
            className="flex-1 px-8 py-6 bg-white/50 border border-black/5 rounded-full text-lg text-[#1a1a1a] placeholder:text-black/30 outline-none focus:bg-white transition-all shadow-xl shadow-black/5"
          />
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-12 py-6 bg-[#6d55a7] text-white rounded-full font-bold text-lg hover:bg-[#7e67b9] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span>Subscribing...</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                <span>Join Newsletter</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100/90 border border-red-300 text-red-900 text-sm font-sans rounded-2xl inline-flex items-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Thank You Popup Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 text-center select-none"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-8 md:p-10 rounded-[36px] shadow-2xl max-w-md w-full relative overflow-hidden text-left"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#6d55a7]" />

              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-m3-on-surface/50 hover:text-m3-on-surface hover:bg-black/5 transition-all cursor-pointer"
                aria-label="Close thank you popup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-[#E8DEF8] text-[#6d55a7] flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-semibold text-m3-on-surface tracking-tight mb-3">
                Thank you for subscribing!
              </h3>

              <p className="text-sm md:text-base text-m3-on-surface/75 font-sans leading-relaxed mb-8">
                You’ve been added to the weekly insights list. You’ll receive fresh perspectives on marketing, AI, data activation, and strategy directly to your inbox.
              </p>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-[#6d55a7] hover:bg-[#7e67b9] text-white rounded-full font-sans font-bold text-sm uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Continue Exploring
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
