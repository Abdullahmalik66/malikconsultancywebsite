import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, CheckCircle2, Loader2, MessageSquare, RotateCcw, Send, AlertCircle } from 'lucide-react';
import { submitQuestionnaireLead } from '@/services/leads/leadApi';
import type { LeadAnswer, LeadSourceType } from '@/features/leads/leadTypes';

export interface DecisionQuestionnaireQuestion {
  id: number;
  text: string;
  helperText?: string;
  options: string[];
}

export interface DecisionQuestionnaireConfig {
  submissionType?: LeadSourceType;
  sourcePage?: string;
  sourcePageTitle?: string;
  introStyle: 'classic' | 'grid';
  palette: 'default' | 'marketing';
  questions: DecisionQuestionnaireQuestion[];
  leftColumn: {
    lead: string;
    description: string;
    note: string;
  };
  intro: {
    badgeLabel: string;
    quote: string;
    ctaLabel: string;
  };
  contact: {
    heading: string;
    description: string;
    messagePlaceholder: string;
    submitLabel: string;
  };
  success: {
    message: string;
  };
}

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  message: string;
  _hp?: string;
}

const contactFormInitialState: ContactFormState = {
  name: '',
  email: '',
  company: '',
  message: '',
  _hp: ''
};

const introTransition = { duration: 0.35 } as const;
const questionTransition = { duration: 0.35, ease: 'easeOut' } as const;

const sectionStyle = { background: 'linear-gradient(135deg, #FAF8F3 0%, #F5F1FF 48%, #EEF8F5 100%)' } as const;
const dotGridStyle = {
  backgroundImage: 'radial-gradient(#1A102E 1.2px, transparent 0)',
  backgroundSize: '24px 24px'
} as const;

const cardStyles = {
  default: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(88, 69, 122, 0.12)',
    boxShadow: '0 24px 80px rgba(49, 31, 84, 0.10)'
  },
  marketing: {
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(122, 78, 45, 0.15)',
    boxShadow: '0 24px 80px rgba(36, 23, 15, 0.08)'
  }
} as const satisfies Record<DecisionQuestionnaireConfig['palette'], React.CSSProperties>;

const paletteClasses = {
  default: {
    progressOuter: 'absolute top-0 left-0 right-0 h-1.5 bg-[#1A102E]/10 overflow-hidden z-20',
    progressInner: 'h-full bg-[#EAFF00] transition-all duration-500 ease-out',
    successIconWrapper: 'w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#2F6B4B] shadow-inner',
    successHeading: 'text-2xl font-display font-medium text-[#1A102E] mb-2 uppercase',
    successMessage: 'text-base text-[#1A102E]/70 leading-relaxed font-sans max-w-md',
    resetButton: 'inline-flex items-center gap-2 text-xs text-[#1A102E]/60 hover:text-[#1A102E] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border border-[#1A102E]/10 rounded-full px-5 py-2.5 hover:bg-black/5'
  },
  marketing: {
    progressOuter: 'absolute top-0 left-0 right-0 h-1.5 bg-[#24170F]/10 overflow-hidden z-20',
    progressInner: 'h-full bg-[#7A4E2D] transition-all duration-500 ease-out',
    successIconWrapper: 'w-16 h-16 rounded-full bg-[#E8EFE6] flex items-center justify-center text-[#3B5A38] shadow-inner',
    successHeading: 'text-2xl font-display font-medium text-[#24170F] mb-2 uppercase',
    successMessage: 'text-base text-[#24170F]/70 leading-relaxed font-sans max-w-md',
    resetButton: 'inline-flex items-center gap-2 text-xs text-[#7A4E2D] hover:text-[#24170F] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border border-[#7A4E2D]/20 rounded-full px-5 py-2.5 hover:bg-black/5'
  }
} as const;

const introStyleClasses = {
  classic: {
    heading: 'text-4xl sm:text-5xl lg:text-[56px] font-display font-medium text-[#1A102E] tracking-tight uppercase leading-[1.1]',
    divider: 'h-[2px] w-20 bg-[#1A102E]/15 rounded-full mt-2',
    lead: 'font-sans font-medium text-[#1A102E] text-lg md:text-xl lg:text-[22px] leading-relaxed tracking-tight',
    note: 'text-sm font-sans italic text-[#1A102E]/60 flex items-center gap-2 mt-4',
    quote: 'text-lg md:text-xl lg:text-[22px] font-sans italic font-normal leading-relaxed text-[#1A102E]/90 border-l-4 border-[#E8DEF8] pl-6 py-0.5',
    card: 'w-full rounded-[40px] overflow-hidden relative transition-all duration-500 min-h-[420px] flex flex-col justify-center'
  },
  grid: {
    heading: 'text-4xl sm:text-5xl lg:text-[56px] font-display font-medium text-[#1A102E] tracking-tight uppercase leading-[1.08]',
    divider: 'h-0.5 w-16 bg-gradient-to-r from-[#1A102E]/25 to-transparent mt-2',
    lead: 'font-sans font-normal text-[#1A102E] text-xl md:text-2xl lg:text-[25px] leading-snug tracking-tight',
    note: 'flex items-center gap-3 mt-6 border-t border-[#1A102E]/10 pt-6',
    noteText: 'text-xs font-mono uppercase tracking-[0.2em] text-[#1A102E]/50 font-bold',
    quote: 'text-lg md:text-xl lg:text-[22px] font-sans italic font-light leading-relaxed text-[#1A102E]/85 border-l-4 border-[#E8DEF8] pl-6 py-0.5',
    card: 'w-full rounded-[40px] overflow-hidden relative transition-all duration-500 min-h-[420px] flex flex-col justify-center animate-fade-in'
  }
} as const;

export default function DecisionQuestionnaire({ config }: { config: DecisionQuestionnaireConfig }) {
  const [currentStep, setCurrentStep] = useState(0); // Step 0 = Intro, Steps 1 to 6 = Questions, Step 7 = Contact
  const [answers, setAnswers] = useState<string[]>([]);
  const [contactForm, setContactForm] = useState<ContactFormState>(contactFormInitialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const introClasses = introStyleClasses[config.introStyle];
  const palette = paletteClasses[config.palette];

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleSelectOption = (option: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentStep - 1] = option;
    setAnswers(updatedAnswers);

    // Smooth transition to next step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 400);
  };

  const handleGoBack = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
    setAnswers(answers.slice(0, stepIndex));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const mappedAnswers: LeadAnswer[] = config.questions
      .map((q, idx) => ({
        questionId: `q_${q.id}`,
        question: q.text,
        answer: answers[idx] || ''
      }))
      .filter(a => a.answer.trim().length > 0);

    const submissionType: LeadSourceType = config.submissionType || (
      typeof window !== 'undefined' && window.location.pathname.includes('data-activation')
        ? 'data-activation'
        : typeof window !== 'undefined' && window.location.pathname.includes('modern-marketing')
        ? 'modern-marketing-growth'
        : typeof window !== 'undefined' && window.location.pathname.includes('ai-maturity')
        ? 'ai-maturity-capability'
        : 'ai-transformation'
    );

    const result = await submitQuestionnaireLead({
      submissionType,
      sourcePage: config.sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/services'),
      sourcePageTitle: config.sourcePageTitle || 'Service Diagnostic Questionnaire',
      name: contactForm.name,
      email: contactForm.email,
      company: contactForm.company,
      primaryInterest: config.sourcePageTitle || 'Consulting',
      message: contactForm.message,
      answers: mappedAnswers,
      consent: {
        contactConsent: true,
        privacyAccepted: true
      },
      _hp: contactForm._hp
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setSubmitError(result.message || 'Submission failed. Please try again.');
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setContactForm(contactFormInitialState);
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <section
      className="relative w-full py-32 overflow-hidden text-left"
      style={sectionStyle}
    >
      {config.introStyle === 'grid' && (
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={dotGridStyle}
        />
      )}

      {/* Subtle organic light accent blurs */}
      <div className="absolute top-[10%] left-[-15%] w-[60%] h-[60%] bg-[#F5F1FF] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[55%] h-[55%] bg-[#EEF8F5]/80 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Column: Strategic Message */}
          <div className="lg:col-span-5 flex flex-col gap-8 pr-0 lg:pr-6">
            <div className="flex flex-col gap-4">
              <h2 className={introClasses.heading}>
                The objective <br className="hidden md:inline" />
                is simple.
              </h2>
              {/* Refined Accent Line */}
              <div className={introClasses.divider} />
            </div>

            <div className="flex flex-col gap-6 text-[#1A102E]/80 font-sans">
              <p className={introClasses.lead}>
                {config.leftColumn.lead}
              </p>
              <p className="text-base md:text-lg text-[#1A102E]/70 font-sans font-light leading-relaxed">
                {config.leftColumn.description}
              </p>
              {config.introStyle === 'classic' ? (
                <p className={introClasses.note}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAFF00] shadow-[0_0_8px_rgba(234,255,0,0.8)]" />
                  <span>{config.leftColumn.note}</span>
                </p>
              ) : (
                <div className={introClasses.note}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAFF00] shadow-[0_0_8px_rgba(234,255,0,0.8)]" />
                  <span className={introStyleClasses.grid.noteText}>
                    {config.leftColumn.note}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Premium Conversational Intake Card */}
          <div className="lg:col-span-7 w-full flex flex-col gap-6">

            {/* Context Thread / Conversation History bubbles */}
            {answers.length > 0 && (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {answers.map((answer, index) => {
                    // Only show bubbles if they are answered and below the current active step
                    if (index >= currentStep - 1 && currentStep !== config.questions.length + 1) return null;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-1.5 p-4 rounded-[22px] bg-white/45 border border-[#57457A]/12 shadow-sm group hover:border-[#1A102E]/30 transition-all duration-300 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#1A102E]/50">
                            Q{index + 1}: {config.questions[index].text}
                          </span>
                          <button
                            onClick={() => handleGoBack(index)}
                            className="text-[10px] text-[#1A102E]/50 hover:text-[#1A102E] hover:underline font-mono uppercase tracking-wider font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="text-sm font-semibold text-[#1A102E] bg-[#E8DEF8]/40 px-3.5 py-1.5 rounded-xl w-fit border border-[#57457A]/5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B4B]/80" />
                          <span>{answer}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Active State Viewport Container */}
            <div
              className={introClasses.card}
              style={cardStyles[config.palette]}
            >

              {/* Progress Bar */}
              {currentStep > 0 && currentStep <= config.questions.length && (
                <div className={palette.progressOuter}>
                  <div
                    className={palette.progressInner}
                    style={{ width: `${(currentStep / config.questions.length) * 100}%` }}
                  />
                </div>
              )}

              <div className="p-10 md:p-14 flex flex-col gap-6">
                <AnimatePresence mode="wait">

                  {currentStep === 0 && (
                    /* Step 0: Conversational Intro Screen */
                    <motion.div
                      key="intro-screen"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={introTransition}
                      className="flex flex-col gap-8 py-4 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8DEF8]/60 flex items-center justify-center text-[#1A102E] shadow-sm">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#1A102E]/50 font-bold">{config.intro.badgeLabel}</span>
                      </div>

                      <p className={introClasses.quote}>
                        {config.intro.quote}
                      </p>

                      <div className="mt-2">
                        <button
                          onClick={handleStart}
                          className="inline-flex items-center gap-3 px-8 py-4.5 rounded-full bg-[#1A102E] text-white hover:bg-[#281B43] hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-sans font-bold uppercase tracking-wider cursor-pointer active:scale-[0.99]"
                        >
                          <span>{config.intro.ctaLabel}</span>
                          <ArrowRight className="w-4 h-4 text-[#EAFF00]" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep > 0 && currentStep <= config.questions.length && (
                    /* Active Question Screen */
                    <motion.div
                      key={`question-${currentStep}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={questionTransition}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-[#1A102E]/5">
                        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#1A102E]/50 font-bold">
                          Question 0{currentStep} / {String(config.questions.length).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h4 className="text-xl md:text-3xl font-display font-medium text-[#1A102E] leading-tight">
                          {config.questions[currentStep - 1].text}
                        </h4>
                        {config.questions[currentStep - 1].helperText && (
                          <p className="text-sm text-[#1A102E]/60 font-sans font-light">
                            {config.questions[currentStep - 1].helperText}
                          </p>
                        )}
                      </div>

                      {/* Diagnostic Option Cards */}
                      <div className="grid grid-cols-1 gap-3.5 mt-2">
                        {config.questions[currentStep - 1].options.map((option, idx) => {
                          const isSelected = answers[currentStep - 1] === option;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(option)}
                              className={`w-full text-left p-5 rounded-2xl border text-base font-sans font-medium transition-all flex items-center justify-between group active:scale-[0.995] cursor-pointer ${isSelected
                                ? 'bg-gradient-to-r from-[#EAFF00]/10 to-[#E8DEF8]/40 border-[#1A102E] text-[#1A102E] shadow-sm'
                                : 'bg-white hover:bg-[#1A102E]/5 border-[#1A102E]/10 text-[#1A102E] hover:border-[#1A102E]/30 shadow-sm'
                                }`}
                            >
                              <span>{option}</span>
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-[#1A102E] flex items-center justify-center text-white">
                                  <Check className="w-3 h-3 text-[#EAFF00]" />
                                </div>
                              ) : (
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#1A102E]/60" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === config.questions.length + 1 && !isSubmitted && (
                    /* Step 7: Final Contact Capture Form */
                    <motion.div
                      key="contact-form"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex items-center gap-2 border-b border-[#1A102E]/5 pb-2">
                        <span className="w-2 h-2 rounded-full bg-[#2F6B4B] animate-pulse" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#2F6B4B] font-bold">Context Complete</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h4 className="text-xl md:text-2xl font-display font-medium text-[#1A102E] leading-tight">{config.contact.heading}</h4>
                        <p className="text-sm md:text-base text-[#1A102E]/75 leading-relaxed font-sans font-light">{config.contact.description}</p>
                      </div>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-[#1A102E]/60 font-bold pl-1">Name</label>
                            <input
                              required
                              type="text"
                              name="name"
                              value={contactForm.name}
                              onChange={handleInputChange}
                              placeholder="Your name"
                              className="w-full p-4 rounded-xl border border-[#1A102E]/15 bg-white text-[#1A102E] font-sans text-sm focus:outline-none focus:border-[#1A102E] transition-all"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-[#1A102E]/60 font-bold pl-1">Work Email</label>
                            <input
                              required
                              type="email"
                              name="email"
                              value={contactForm.email}
                              onChange={handleInputChange}
                              placeholder="you@company.com"
                              className="w-full p-4 rounded-xl border border-[#1A102E]/15 bg-white text-[#1A102E] font-sans text-sm focus:outline-none focus:border-[#1A102E] transition-all"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#1A102E]/60 font-bold pl-1">Company</label>
                          <input
                            required
                            type="text"
                            name="company"
                            value={contactForm.company}
                            onChange={handleInputChange}
                            placeholder="Your company name"
                            className="w-full p-4 rounded-xl border border-[#1A102E]/15 bg-white text-[#1A102E] font-sans text-sm focus:outline-none focus:border-[#1A102E] transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-[#1A102E]/60 font-bold pl-1">Short context</label>
                          <textarea
                            rows={3}
                            name="message"
                            value={contactForm.message}
                            onChange={handleInputChange}
                            placeholder={config.contact.messagePlaceholder}
                            className="w-full p-4 rounded-xl border border-[#1A102E]/15 bg-white text-[#1A102E] font-sans text-sm focus:outline-none focus:border-[#1A102E] transition-all resize-none"
                          />
                        </div>

                        {/* Hidden honeypot for bot detection */}
                        <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                          <input
                            tabIndex={-1}
                            type="text"
                            name="_hp"
                            value={contactForm._hp}
                            onChange={handleInputChange}
                            autoComplete="off"
                          />
                        </div>

                        {submitError && (
                          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{submitError}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSubmitError(null)}
                              className="text-red-700 underline font-bold cursor-pointer"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 mt-2 rounded-xl bg-[#1A102E] hover:bg-[#1A102E]/90 text-white text-sm font-sans font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#EAFF00]" />
                              <span>Sending context...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 text-[#EAFF00]" />
                              <span>{config.contact.submitLabel}</span>
                            </>
                          )}
                        </button>

                        <p className="text-[11px] text-[#1A102E]/60 text-center font-sans">
                          Your information is used to review and respond to this enquiry. It is not sold or used for unrelated marketing.
                        </p>
                      </form>
                    </motion.div>
                  )}

                  {isSubmitted && (
                    /* Final Success state */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="flex flex-col items-center text-center gap-6 py-6"
                    >
                      <div className={palette.successIconWrapper}>
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className={palette.successHeading}>
                          Context received.
                        </h4>
                        <p className={palette.successMessage}>
                          Thank you. Your context has been received. I will review the information and follow up if a conversation would be useful.
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className={palette.resetButton}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restart diagnostic
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
