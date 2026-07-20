import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Check, MessageSquare, Quote, Sparkles } from 'lucide-react';
import { STATIC_TESTIMONIALS, Testimonial, shuffleArray } from '../data/testimonials';
import { getPublishedTestimonials, submitPublicTestimonial } from '../lib/firebase/cms';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [shuffled, setShuffled] = useState<Testimonial[]>([]);
  const [localPending, setLocalPending] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Form values
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [touched, setTouched] = useState({ name: false, company: false, text: false });

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Load from server and local storage
  useEffect(() => {
    // 1. Load local pending submissions from localStorage
    const saved = localStorage.getItem('local_pending_testimonials');
    const localSaved: Testimonial[] = saved ? JSON.parse(saved) : [];
    setLocalPending(localSaved);

    // 2. Fetch from Firebase
    async function fetchTestimonials() {
      try {
        const data = await getPublishedTestimonials();
        const approvedOnly: Testimonial[] = data.map(item => ({
          id: item.id,
          name: item.name,
          company: item.company,
          role: item.role,
          testimonial: item.testimonial,
          approved: item.status === 'published',
          featured: item.featured || false,
          createdAt: item.createdAt,
          imgSrc: item.avatarUrl || undefined
        }));
        setTestimonials(approvedOnly.length > 0 ? approvedOnly : STATIC_TESTIMONIALS.filter(t => t.approved));
      } catch (err) {
        console.error('Failed to fetch testimonials from Firebase:', err);
        setTestimonials(STATIC_TESTIMONIALS.filter(t => t.approved));
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  // Update shuffled list once testimonials are loaded
  useEffect(() => {
    if (testimonials.length > 0) {
      // Set randomized order to make it feel fresh on load
      setShuffled(shuffleArray(testimonials));
    }
  }, [testimonials]);

  // Combined shown list: Local Pending ones first (to wow the user when they submit) + Shuffled approved ones
  const combinedTestimonials = [...localPending, ...shuffled];

  // Validation rules
  const isNameValid = name.trim().length > 0;
  const isCompanyValid = company.trim().length > 0;
  const isTextValid = testimonialText.trim().length >= 120 && testimonialText.trim().length <= 350;
  const isFormValid = isNameValid && isCompanyValid && isTextValid;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        company: company.trim(),
        role: role.trim() || undefined,
        testimonial: testimonialText.trim(),
        consentGiven: true
      };

      await submitPublicTestimonial(payload);

      const created: Testimonial = {
        id: 'temp_' + Date.now(),
        name: payload.name,
        company: payload.company,
        role: payload.role,
        testimonial: payload.testimonial,
        approved: false,
        featured: false,
        createdAt: new Date().toISOString()
      };

      // Save to local state and localStorage so the user gets instant visual confirmation in their browser
      const updatedLocal = [created, ...localPending];
      setLocalPending(updatedLocal);
      localStorage.setItem('local_pending_testimonials', JSON.stringify(updatedLocal));

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting testimonial to Firebase:', err);
      // Fallback
      const fallbackCreated: Testimonial = {
        id: 'temp_' + Date.now(),
        name: name,
        company: company,
        role: role || undefined,
        testimonial: testimonialText,
        approved: false,
        featured: false,
        createdAt: new Date().toISOString()
      };
      const updatedLocal = [fallbackCreated, ...localPending];
      setLocalPending(updatedLocal);
      localStorage.setItem('local_pending_testimonials', JSON.stringify(updatedLocal));
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };


  // Reset form
  const handleCloseSuccess = () => {
    setShowModal(false);
    // Reset fields
    setName('');
    setCompany('');
    setRole('');
    setTestimonialText('');
    setTouched({ name: false, company: false, text: false });
    setSuccess(false);
  };

  return (
    <div className="relative min-h-[100svh] bg-m3-surface overflow-hidden pt-32 pb-24 font-sans selection:bg-m3-primary selection:text-m3-on-primary">

      {/* =========================================================================
          SHAPE-LED EXPRESSIVE BACKDROP SYSTEM
          Large Rounded Blobs, Drift Fields, and 2.5D Middle-layer assets
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep soft purple gradient orb top-left */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-m3-primary/5 rounded-[120px] filter blur-3xl opacity-70"
        />

        {/* Ambient lavender soft-drifting clover shape right side */}
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            rotate: [0, 90, 180, 365],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[35%] -right-48 w-[700px] h-[700px] bg-m3-secondary-container/10 rounded-[180px] filter blur-[100px] opacity-60"
          style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
        />

        {/* Dynamic lower color field in warm tint */}
        <motion.div
          animate={{
            x: [-20, 30, 0, -20],
            y: [10, -20, 15, 10],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 left-[15%] w-[500px] h-[500px] bg-m3-primary/3 rounded-full filter blur-[120px] opacity-80"
        />

        {/* Foreground 2.5D abstract geometry - slightly rotating rings or curves */}
        <svg className="absolute top-[20%] left-[8%] w-56 h-56 text-m3-primary/10 select-none opacity-40 animate-pulse" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" fill="none" />
          <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>

        <svg className="absolute bottom-[15%] right-[10%] w-72 h-72 text-m3-outline/10 select-none opacity-30" viewBox="0 0 100 100" style={{ transform: 'rotate(25deg)' }}>
          <rect x="20" y="20" width="60" height="60" rx="20" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M10,50 Q50,90 90,50" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 z-10 relative">

        {/* =========================================================================
            1. HERO / HEADER SECTION
            Eyebrow, Syne Headline, and soft description matching site theme
            ========================================================================= */}
        <section className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-5"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white bg-m3-primary px-5 py-1.5 rounded-full shadow-sm select-none flex items-center gap-1.5 align-middle">
              <Sparkles className="w-3.5 h-3.5" />
              Success stories
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-medium text-m3-on-surface leading-[1.1] tracking-tight mb-6"
          >
            Trusted by people building <br /> real transformation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-m3-on-surface/70 leading-relaxed font-sans"
          >
            A curated selection of perspectives from business leaders, technology directors, and trusted clients who have collaborated to drive genuine growth.
          </motion.p>
        </section>

        {/* =========================================================================
            2. TESTIMONIAL GRID GALLERY
            Includes staggers, slight rotation, M3 styling and the CTA card
            ========================================================================= */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-m3-primary/30 border-t-m3-primary animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start align-top"
          >

            {/* INLINE CONTRIBUTOR CTA CARD - Render first inside gallery to encourage user participation */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="lg:col-span-1 h-full min-h-[380px] rounded-[36px] bg-transparent border-2 border-dashed border-m3-primary/30 hover:border-m3-primary transition-all duration-300 p-8 md:p-10 flex flex-col justify-between items-center text-center cursor-pointer group shadow-sm hover:shadow-lg"
              onClick={() => setShowModal(true)}
            >
              <div className="w-full flex justify-end">
                <span className="text-[10px] font-bold text-m3-primary/40 uppercase tracking-widest bg-m3-secondary-container/30 px-3 py-1 rounded-full group-hover:bg-m3-secondary-container transition-colors">
                  Join in
                </span>
              </div>

              <div className="my-auto py-8">
                <div className="w-16 h-16 rounded-full bg-m3-secondary-container flex items-center justify-center text-m3-primary mx-auto mb-6 transform scale-100 group-hover:scale-110 group-active:scale-95 transition-all duration-300 shadow-md">
                  <Plus className="w-8 h-8 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-m3-on-surface mb-3">
                  Share your perspective
                </h3>
                <p className="text-sm text-m3-on-surface/60 max-w-xs mx-auto leading-relaxed">
                  Offer a few honest words about our work, collaboration structure, or organizational impact.
                </p>
              </div>

              <div className="w-full text-xs font-semibold text-m3-primary group-hover:underline">
                Write a testimonial &rarr;
              </div>
            </motion.div>

            {/* RENDER DYNAMIC CARDS LIST */}
            {combinedTestimonials.map((item, index) => {
              const isLocalPending = item.id.startsWith('temp_') || !item.approved;
              // Add a slight custom orientation tilt to mimic true editorial depth
              const tilts = ['rotate-1', '-rotate-1', 'rotate-0', 'rotate-2', '-rotate-2'];
              const rotation = tilts[index % tilts.length];

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.8) }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`
                    p-8 md:p-10 flex flex-col justify-between rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500 border relative overflow-hidden
                    ${rotation}
                    ${isLocalPending
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/40 text-m3-on-surface'
                      : index % 2 === 0
                        ? 'bg-[#6d55a7] text-white border-[#6d55a7]/20 shadow-[0_15px_30px_-5px_rgba(109,85,167,0.15)] shadow-m3-primary/10'
                        : 'bg-white text-m3-on-surface border-m3-outline/10'
                    }
                  `}
                >
                  {/* Decorative modern quotes watermark */}
                  <Quote className={`absolute -right-4 -bottom-4 w-32 h-32 pointer-events-none opacity-[0.04] ${index % 2 === 0 ? 'text-white' : 'text-m3-primary'}`} />

                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full ${isLocalPending
                          ? 'bg-amber-200 text-amber-800 font-semibold'
                          : index % 2 === 0
                            ? 'bg-white/10 text-white'
                            : 'bg-m3-secondary-container/40 text-m3-primary'
                        }`}>
                        {isLocalPending ? 'Pending Moderation' : 'Client Review'}
                      </span>
                      <MessageSquare className={`w-5 h-5 ${index % 2 === 0 ? 'text-white/45' : 'text-m3-primary/30'}`} strokeWidth={1.5} />
                    </div>

                    <blockquote className={`text-base md:text-lg font-medium leading-relaxed italic mb-8 ${index % 2 === 0 ? 'text-white/95' : 'text-m3-on-surface/85'}`}>
                      "{item.testimonial}"
                    </blockquote>
                  </div>

                  <div className={`mt-auto pt-6 border-t ${index % 2 === 0 ? 'border-white/10' : 'border-m3-outline/10'}`}>
                    <p className={`text-sm font-bold uppercase tracking-tight ${index % 2 === 0 ? 'text-white' : 'text-m3-primary'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs mt-1 tracking-wide ${index % 2 === 0 ? 'text-white/60' : 'text-m3-on-surface/50'}`}>
                      {item.role ? `${item.role} at ` : ''}{item.company}
                    </p>
                  </div>
                </motion.div>
              );
            })}

          </motion.div>
        )}

      </div>

      {/* =========================================================================
          3. TESTIMONIAL CONTRIBUTION POPUP MODAL
          Beautifully responsive, custom M3 details, character counters & validation
          ========================================================================= */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-m3-on-surface/55 backdrop-blur-sm"
              onClick={handleCloseSuccess}
            />

            {/* Modal Box Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl bg-[#fef7ff] dark:bg-[#141218] border border-m3-outline/20 rounded-[40px] shadow-2xl p-8 md:p-10 z-10 overflow-hidden text-m3-on-surface max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={handleCloseSuccess}
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-m3-on-surface/5 hover:bg-m3-on-surface/15 flex items-center justify-center transition-colors cursor-pointer text-m3-on-surface"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                {!success ? (
                  <motion.div
                    key="form-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div className="mb-8 pr-12">
                      <span className="text-xs font-bold text-m3-primary uppercase tracking-[0.2em] mb-2 block">Contribution</span>
                      <h2 className="text-3xl font-display font-bold text-m3-on-surface leading-tight">
                        Share your perspective
                      </h2>
                      <p className="text-sm text-m3-on-surface/60 mt-2">
                        A short, honest testimonial adds deep context and credibility to our collaborative journey.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-m3-on-surface/70 mb-2">
                          Your Name <span className="text-m3-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                          placeholder="Sarah Ahmed"
                          className={`
                            w-full px-5 py-3.5 rounded-2xl bg-m3-on-surface/5 border focus:outline-none transition-colors
                            ${touched.name && !isNameValid
                              ? 'border-red-500/50 focus:border-red-500 bg-red-500/[0.02]'
                              : 'border-m3-outline/20 focus:border-m3-primary'
                            }
                          `}
                          required
                        />
                        {touched.name && !isNameValid && (
                          <p className="text-[11px] text-red-500 mt-1 font-semibold">Your name is required to publish this.</p>
                        )}
                      </div>

                      {/* Company input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-m3-on-surface/70 mb-2">
                            Company <span className="text-m3-primary">*</span>
                          </label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            onBlur={() => setTouched(prev => ({ ...prev, company: true }))}
                            placeholder="Nordic Growth Studio"
                            className={`
                              w-full px-5 py-3.5 rounded-2xl bg-m3-on-surface/5 border focus:outline-none transition-colors
                              ${touched.company && !isCompanyValid
                                ? 'border-red-500/50 focus:border-red-500 bg-red-500/[0.02]'
                                : 'border-m3-outline/20 focus:border-m3-primary'
                              }
                            `}
                            required
                          />
                          {touched.company && !isCompanyValid && (
                            <p className="text-[11px] text-red-500 mt-1 font-semibold">Company is required.</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-m3-on-surface/70 mb-2">
                            Your Role <span className="text-m3-on-surface/30 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Managing Director"
                            className="w-full px-5 py-3.5 rounded-2xl bg-m3-on-surface/5 border border-m3-outline/20 focus:border-m3-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Testimonial Text Area */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-m3-on-surface/70">
                            Testimonial <span className="text-m3-primary">*</span>
                          </label>
                          <span className={`text-xs font-mono font-semibold ${testimonialText.length >= 120 && testimonialText.length <= 350
                              ? 'text-m3-primary'
                              : 'text-m3-on-surface/40'
                            }`}>
                            {testimonialText.length} / 350 chars
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={testimonialText}
                          onChange={(e) => setTestimonialText(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, text: true }))}
                          placeholder="Abdullah brought clarity, structure, and momentum to a complex transformation initiative..."
                          className={`
                            w-full px-5 py-4 rounded-2xl bg-m3-on-surface/5 border focus:outline-none transition-colors resize-none
                            ${touched.text && !isTextValid
                              ? 'border-red-500/50 focus:border-red-500 bg-red-500/[0.02]'
                              : 'border-m3-outline/20 focus:border-m3-primary'
                            }
                          `}
                          required
                        />
                        <div className="flex justify-between items-start mt-1">
                          <p className="text-[10.5px] text-m3-on-surface/50 leading-tight">
                            Please keep your testimonial between 120 and 350 characters.
                          </p>
                          {touched.text && testimonialText.length < 120 && (
                            <p className="text-[11px] text-red-500 font-semibold text-right max-w-[50%]">Min 120 characters required (currently {testimonialText.length}).</p>
                          )}
                          {touched.text && testimonialText.length > 350 && (
                            <p className="text-[11px] text-red-500 font-semibold text-right max-w-[50%]">Max 350 characters exceeded.</p>
                          )}
                        </div>
                      </div>

                      {/* Submit action */}
                      <div className="pt-4">
                        <motion.button
                          whileTap={isFormValid ? { scale: 0.98 } : {}}
                          type="submit"
                          disabled={!isFormValid || submitting}
                          className={`
                            w-full py-4 rounded-full font-bold shadow-md hover:shadow-lg transition-all text-center select-none flex items-center justify-center gap-2
                            ${isFormValid
                              ? 'bg-m3-primary text-m3-on-primary cursor-pointer'
                              : 'bg-m3-on-surface/10 text-m3-on-surface/45 cursor-not-allowed'
                            }
                          `}
                        >
                          {submitting ? (
                            <div className="w-5 h-5 rounded-full border-2 border-m3-on-primary/30 border-t-m3-on-primary animate-spin" />
                          ) : (
                            <>
                              <span>Submit Perspective</span>
                              <Check className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>
                      </div>

                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-md">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>

                    <h3 className="text-3xl font-display font-bold text-m3-on-surface mb-3">
                      Thank you. Your perspective has been received.
                    </h3>
                    <p className="text-sm text-m3-on-surface/65 max-w-sm mx-auto leading-relaxed mb-8">
                      It will be reviewed before appearing publicly in the shared testimonial gallery.
                    </p>

                    <button
                      onClick={handleCloseSuccess}
                      className="px-8 py-3.5 bg-m3-primary text-m3-on-primary rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      Return to Gallery
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
