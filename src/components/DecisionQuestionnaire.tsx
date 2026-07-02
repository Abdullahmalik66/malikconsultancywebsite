import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, RotateCcw, Send, Loader2, MessageSquare, Check } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  helperText?: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "Where are you right now with AI?",
    helperText: "Understanding your current state aligns our roadmap with organizational reality.",
    options: [
      "Exploring possibilities",
      "Running pilots, but not scaling",
      "Using tools, but adoption is weak",
      "Need a full transformation roadmap"
    ]
  },
  {
    id: 2,
    text: "What is blocking progress?",
    helperText: "Pinpointing constraints helps us design the correct target operating model.",
    options: [
      "Unclear use cases",
      "Fragmented data",
      "Workflow complexity",
      "Governance and risk"
    ]
  },
  {
    id: 3,
    text: "Where should AI create value first?",
    helperText: "Transformation succeeds when we secure early, high-impact wins for the team.",
    options: [
      "Sales and growth",
      "Customer operations",
      "Knowledge and research",
      "Internal productivity"
    ]
  },
  {
    id: 4,
    text: "What support would help most?",
    helperText: "Tailoring our engagement ensures support lands where you need it most.",
    options: [
      "Strategy and roadmap",
      "Use-case prioritisation",
      "Pilot design and build",
      "Governance and capability building"
    ]
  },
  {
    id: 5,
    text: "How urgent is this?",
    options: [
      "Exploring for later",
      "Need clarity soon",
      "Planning active work",
      "Ready to start now"
    ]
  },
  {
    id: 6,
    text: "What should happen next?",
    helperText: "Select how you would prefer to transition from diagnostic to execution planning.",
    options: [
      "Book a strategy session",
      "Send a short context note",
      "Review my AI opportunity",
      "Discuss a specific pilot"
    ]
  }
];

export default function DecisionQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0); // Step 0 = Intro Message, Steps 1 to 6 = Questions, Step 7 = Contact
  const [answers, setAnswers] = useState<string[]>([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call/Firestore storage
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setContactForm({
      name: '',
      email: '',
      company: '',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <section 
      className="relative w-full py-32 overflow-hidden text-left"
      style={{ background: 'linear-gradient(135deg, #FAF8F3 0%, #F5F1FF 48%, #EEF8F5 100%)' }}
    >
      {/* Subtle organic light accent blurs */}
      <div className="absolute top-[10%] left-[-15%] w-[60%] h-[60%] bg-[#F5F1FF] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[55%] h-[55%] bg-[#EEF8F5]/80 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[1750px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Symmetrical Strategic Message (approx. 40% width) */}
          <div className="lg:col-span-5 flex flex-col gap-8 pr-0 lg:pr-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-medium text-[#1A102E] tracking-tight uppercase leading-[1.1]">
                The objective <br className="hidden md:inline" />
                is simple.
              </h2>
              {/* Refined Accent Line */}
              <div className="h-[2px] w-20 bg-[#1A102E]/15 rounded-full mt-2" />
            </div>

            <div className="flex flex-col gap-6 text-[#1A102E]/80 font-sans">
              <p className="font-sans font-medium text-[#1A102E] text-lg md:text-xl lg:text-[22px] leading-relaxed tracking-tight">
                Move AI from scattered experiments into structured systems that create measurable business value.
              </p>
              <p className="text-base md:text-lg text-[#1A102E]/70 font-sans font-light leading-relaxed">
                If that is the kind of shift you are trying to make, start with a few questions. This helps me understand where you are now, what is blocking progress, and what kind of AI transformation support would create the most value.
              </p>
              <p className="text-sm font-sans italic text-[#1A102E]/60 flex items-center gap-2 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAFF00] shadow-[0_0_8px_rgba(234,255,0,0.8)]" />
                <span>The better the context, the sharper the conversation.</span>
              </p>
            </div>
          </div>

          {/* Right Column: Premium Conversational Intake Card (approx. 60% width) */}
          <div className="lg:col-span-7 w-full flex flex-col gap-6">
            
            {/* Context Thread / Conversation History bubbles */}
            {answers.length > 0 && (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {answers.map((answer, index) => {
                    // Only show bubbles if they are answered and below the current active step
                    if (index >= currentStep - 1 && currentStep !== 7) return null;
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
                            Q{index + 1}: {questions[index].text}
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

            {/* Active State Viewport (Glassmorphic Container) */}
            <div 
              className="w-full rounded-[40px] overflow-hidden relative transition-all duration-500 min-h-[420px] flex flex-col justify-center"
              style={{ 
                background: 'rgba(255, 255, 255, 0.82)', 
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(88, 69, 122, 0.12)',
                boxShadow: '0 24px 80px rgba(49, 31, 84, 0.10)'
              }}
            >
              
              {/* Smooth Progress line spanning the top edge of active questionnaire */}
              {currentStep > 0 && currentStep <= 6 && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1A102E]/10 overflow-hidden z-20">
                  <div
                    className="h-full bg-[#EAFF00] transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 6) * 100}%` }}
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
                      transition={{ duration: 0.35 }}
                      className="flex flex-col gap-8 py-4 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8DEF8]/60 flex items-center justify-center text-[#1A102E] shadow-sm">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#1A102E]/50 font-bold">Diagnostic Intake</span>
                      </div>

                      <p className="text-lg md:text-xl lg:text-[22px] font-sans italic font-normal leading-relaxed text-[#1A102E]/90 border-l-4 border-[#E8DEF8] pl-6 py-0.5">
                        “Let’s make this useful. I’ll ask a few short questions so we can understand whether this is a strategy, prioritisation, pilot, governance, or adoption conversation.”
                      </p>

                      <div className="mt-2">
                        <button
                          onClick={handleStart}
                          className="inline-flex items-center gap-3 px-8 py-4.5 rounded-full bg-[#1A102E] text-white hover:bg-[#281B43] hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg text-xs font-sans font-bold uppercase tracking-wider cursor-pointer active:scale-[0.99]"
                        >
                          <span>Start the AI diagnostic</span>
                          <ArrowRight className="w-4 h-4 text-[#EAFF00]" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {currentStep > 0 && currentStep <= 6 && (
                    /* Active Question Screen */
                    <motion.div
                      key={`question-${currentStep}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-[#1A102E]/5">
                        <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#1A102E]/50 font-bold">
                          Question 0{currentStep} / 06
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h4 className="text-xl md:text-3xl font-display font-medium text-[#1A102E] leading-tight">
                          {questions[currentStep - 1].text}
                        </h4>
                        {questions[currentStep - 1].helperText && (
                          <p className="text-sm text-[#1A102E]/60 font-sans font-light">
                            {questions[currentStep - 1].helperText}
                          </p>
                        )}
                      </div>

                      {/* Diagnostic Option Cards */}
                      <div className="grid grid-cols-1 gap-3.5 mt-2">
                        {questions[currentStep - 1].options.map((option, idx) => {
                          const isSelected = answers[currentStep - 1] === option;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(option)}
                              className={`w-full text-left p-5 rounded-2xl border text-base font-sans font-medium transition-all flex items-center justify-between group active:scale-[0.995] cursor-pointer ${
                                isSelected
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

                  {currentStep === 7 && !isSubmitted && (
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
                        <h4 className="text-xl md:text-2xl font-display font-medium text-[#1A102E] leading-tight">
                          Good. This gives enough context to make the next conversation sharper.
                        </h4>
                        <p className="text-sm md:text-base text-[#1A102E]/75 leading-relaxed font-sans font-light">
                          Leave your details and I’ll know whether this is a strategy, prioritisation, pilot, governance, or adoption discussion.
                        </p>
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
                            placeholder="Tell me a bit about your current goals..."
                            className="w-full p-4 rounded-xl border border-[#1A102E]/15 bg-white text-[#1A102E] font-sans text-sm focus:outline-none focus:border-[#1A102E] transition-all resize-none"
                          />
                        </div>

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
                              <span>Send my AI transformation context</span>
                            </>
                          )}
                        </button>
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
                      <div className="w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#2F6B4B] shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-display font-medium text-[#1A102E] mb-2 uppercase">
                          Context captured.
                        </h4>
                        <p className="text-base text-[#1A102E]/70 leading-relaxed font-sans max-w-md">
                          Thanks — your context is captured. The next conversation will not start from zero.
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 text-xs text-[#1A102E]/60 hover:text-[#1A102E] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border border-[#1A102E]/10 rounded-full px-5 py-2.5 hover:bg-black/5"
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
