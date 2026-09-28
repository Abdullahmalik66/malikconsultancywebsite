import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Send, Sparkles, AlertCircle } from 'lucide-react';
import { submitReachMeLead } from '@/services/leads/leadApi';

interface QuestionConfig {
  id: string;
  question: string;
  type: 'text' | 'select' | 'textarea' | 'email';
  hint: string;
  example: string;
  placeholder?: string;
  options?: string[];
}

const STATIC_STEPS: QuestionConfig[] = [
  {
    id: 'name',
    question: 'What is your name?',
    type: 'text',
    hint: 'Enter your full name so I know who I’m speaking with.',
    example: 'Sarah Ahmed',
    placeholder: 'Sarah Ahmed',
  },
  {
    id: 'role',
    question: 'What is your role?',
    type: 'text',
    hint: 'Share your current role so I can understand your perspective.',
    example: 'Head of Growth',
    placeholder: 'Head of Growth',
  },
  {
    id: 'company',
    question: 'What company are you with?',
    type: 'text',
    hint: 'Mention your company or organisation name.',
    example: 'Northern Scale Labs',
    placeholder: 'Northern Scale Labs',
  },
  {
    id: 'serviceArea',
    question: 'What would you like help with right now?',
    type: 'select',
    hint: 'Choose the area where you need the most support right now.',
    example: 'We want to improve our marketing performance with AI.',
    options: [
      'AI Transformation',
      'Data Activation & Intelligence',
      'Modern Marketing & Growth',
      'AI Maturity & Capability Building',
    ],
  },
];

const BRANCHED_QUESTIONS: Record<string, QuestionConfig[]> = {
  'AI Transformation': [
    {
      id: 'transformPart',
      question: 'What part of the business are you trying to transform with AI?',
      type: 'select',
      hint: 'Think about where AI could create the biggest operational or commercial impact first.',
      example: 'Optimizing internal customer support operations or customer experiences.',
      options: [
        'Customer experience',
        'Sales and commercial operations',
        'Marketing and campaign execution',
        'Internal processes and workflows',
        'Product or service delivery',
        'Enterprise-wide transformation',
      ],
    },
    {
      id: 'aiCapability',
      question: 'What kind of AI capability are you looking to build?',
      type: 'select',
      hint: 'This is about the type of AI solution you want to introduce or scale.',
      example: 'Workflow automation patterns or custom predictive intelligence pipelines.',
      options: [
        'AI assistants or copilots',
        'Workflow automation',
        'Predictive intelligence',
        'Personalisation engines',
        'Agent-based systems',
        'Not fully sure yet',
      ],
    },
    {
      id: 'aiChallenge',
      question: 'What is the biggest challenge slowing this down today?',
      type: 'select',
      hint: 'Choose the main reason why progress has been slow or unclear.',
      example: 'A critical gap in internally available developer technical capacity.',
      options: [
        'No clear strategy',
        'Limited internal capability',
        'Poor data readiness',
        'Too many disconnected systems',
        'Unclear business case',
        'Leadership alignment is missing',
      ],
    },
    {
      id: 'aiOutcome',
      question: 'What outcome would make this successful for you?',
      type: 'select',
      hint: 'Think about the result that would make this effort clearly worthwhile.',
      example: 'Developing a reproducible, team-wide operational layout Model.',
      options: [
        'Faster execution',
        'Lower operational cost',
        'Better decision-making',
        'Higher revenue impact',
        'Better customer experience',
        'A clear AI operating model',
      ],
    },
  ],
  'Data Activation & Intelligence': [
    {
      id: 'dataChallenge',
      question: 'What data challenge are you trying to solve first?',
      type: 'select',
      hint: 'Choose the main issue stopping your data from being useful in practice.',
      example: 'Our critical growth statistics are siloed across disconnected platforms.',
      options: [
        'Data is spread across too many systems',
        'We struggle to get a clear customer view',
        'Reporting is slow or unreliable',
        'Teams are not using data consistently',
        'Data is collected but not activated',
        'We lack the right data foundations',
      ],
    },
    {
      id: 'intelligenceGap',
      question: 'Where is the intelligence gap hurting performance the most?',
      type: 'select',
      hint: 'Think about where the lack of usable intelligence is costing you the most.',
      example: 'CRM optimization or cross-channel executive visibility.',
      options: [
        'Marketing performance',
        'Customer retention',
        'Sales effectiveness',
        'CRM and lifecycle journeys',
        'Executive decision-making',
        'Cross-channel visibility',
      ],
    },
    {
      id: 'dataActivationBarrier',
      question: 'What is preventing your data from being activated effectively today?',
      type: 'select',
      hint: 'This is about the root cause, not just the symptom.',
      example: 'We struggle to unify our schemas into a standard operational framework.',
      options: [
        'Poor integration between tools',
        'Weak data quality',
        'No common measurement model',
        'Limited internal ownership',
        'Too much manual work',
        'No activation strategy',
      ],
    },
    {
      id: 'dataActivationOutcome',
      question: 'What business result are you expecting from better data activation?',
      type: 'select',
      hint: 'Think about what better data use should unlock for the business.',
      example: 'Smarter customer targeting and a clearly predictable commercial funnel.',
      options: [
        'Better visibility and reporting',
        'Smarter targeting and segmentation',
        'Faster and better decisions',
        'Improved customer journeys',
        'Higher marketing efficiency',
        'Stronger commercial performance',
      ],
    },
  ],
  'Modern Marketing & Growth': [
    {
      id: 'marketingFocus',
      question: 'What part of your marketing or growth engine needs the most attention?',
      type: 'select',
      hint: 'Choose the part of the growth engine that needs the biggest improvement first.',
      example: 'Rethinking lead generation pipelines or CRM communication setups.',
      options: [
        'Paid media',
        'Lead generation',
        'Funnel conversion',
        'CRM and lifecycle marketing',
        'Positioning and messaging',
        'Full growth system',
      ],
    },
    {
      id: 'growthChallenge',
      question: 'What kind of growth challenge are you trying to solve?',
      type: 'select',
      hint: 'Describe the commercial growth problem in simple business terms.',
      example: 'CAC is consistently rising, while landing page conversions are static.',
      options: [
        'We need more qualified demand',
        'Our conversion rates are too low',
        'Customer acquisition costs are too high',
        'Our growth is not predictable',
        'We are not scaling effectively',
        'Our channels are underperforming',
      ],
    },
    {
      id: 'growthLimit',
      question: 'What is currently limiting performance or scale?',
      type: 'select',
      hint: 'Choose what is most likely holding results back right now.',
      example: 'Siloed growth teams and lack of cross-platform campaign automation.',
      options: [
        'Weak strategy',
        'Poor campaign execution',
        'Limited creative performance',
        'Low funnel efficiency',
        'Weak data and attribution',
        'Lack of systems and automation',
      ],
    },
    {
      id: 'growthOutcome',
      question: 'What result would make this engagement valuable for you?',
      type: 'select',
      hint: 'Think about the result that would make this commercially meaningful.',
      example: 'Building systematic, high-converting customer acquisition workflows.',
      options: [
        'More qualified leads',
        'Better conversion rates',
        'Lower cost per acquisition',
        'Stronger revenue contribution',
        'More scalable growth systems',
        'Clearer marketing direction',
      ],
    },
  ],
  'AI Maturity & Capability Building': [
    {
      id: 'aiMaturityReadiness',
      question: 'What part of AI readiness does your organisation need most right now?',
      type: 'select',
      hint: 'Choose the area that needs the most work before AI can scale properly.',
      example: 'Facilitating cohesive alignment across cross-functional commercial teams.',
      options: [
        'Leadership understanding',
        'Team capability building',
        'Use-case identification',
        'Governance and risk readiness',
        'Operating model design',
        'Cross-functional alignment',
      ],
    },
    {
      id: 'aiMaturityGap',
      question: 'Where do you see the biggest capability gap today?',
      type: 'select',
      hint: 'Think about the gap between AI ambition and what the organisation can actually execute.',
      example: 'Fostering practical hands-on application skills over high-level theory.',
      options: [
        'Strategy and prioritisation',
        'Technical understanding',
        'Practical implementation skills',
        'Data maturity',
        'Internal ownership',
        'Change management',
      ],
    },
    {
      id: 'aiMaturityChallenge',
      question: 'What is making adoption or execution difficult?',
      type: 'select',
      hint: 'This question is about the barrier that keeps AI from moving beyond discussion.',
      example: 'Unclear business case or risk barriers stalling progress in pilot phases.',
      options: [
        'Unclear business priorities',
        'Lack of skills',
        'Resistance to change',
        'Siloed teams',
        'Governance concerns',
        'No structured adoption plan',
      ],
    },
    {
      id: 'aiMaturityProgress',
      question: 'What would meaningful progress look like for your organisation?',
      type: 'select',
      hint: 'Think about what progress should look like over the next phase, not just in theory.',
      example: 'Deploying concrete, business-aligned live pilots that realize clear returns.',
      options: [
        'Better leadership alignment',
        'Clear AI roadmap',
        'More capable teams',
        'Live pilots with real value',
        'Stronger governance and confidence',
        'A scalable AI foundation',
      ],
    },
  ],
};

const FINAL_STEPS: QuestionConfig[] = [
  {
    id: 'email',
    question: 'What is the best email to reach you on?',
    type: 'email',
    hint: 'Use your work email so I can reply properly.',
    example: 'sarah@company.com',
    placeholder: 'sarah@company.com',
  },
  {
    id: 'additionalNote',
    question: 'Is there anything else I should know before replying?',
    type: 'textarea',
    hint: 'Add anything that helps make the reply more relevant. (Shift + Enter for multi-line)',
    example: 'We are exploring AI across CRM and paid media and want clarity on where to start.',
    placeholder: 'We are exploring AI across CRM and paid media and want clarity on where to start.',
  },
];

export default function ReachMePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Form State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Accessibility keyboard states
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Generate dynamic array of questions based on chosen branch
  const getQuestionsList = (): QuestionConfig[] => {
    const list = [...STATIC_STEPS];
    const selectedService = answers['serviceArea'];
    if (selectedService && BRANCHED_QUESTIONS[selectedService]) {
      list.push(...BRANCHED_QUESTIONS[selectedService]);
    }
    list.push(...FINAL_STEPS);
    return list;
  };

  const questions = getQuestionsList();
  const currentQuestion = questions[currentStepIndex];
  const isQuestionRequired = currentQuestion?.id !== 'additionalNote';

  const currentValue = answers[currentQuestion?.id] || '';

  // Focus the input element on step transition
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Reset individual key options focus
    setFocusedOptionIndex(-1);
    setErrorText(null);
  }, [currentStepIndex, currentQuestion?.id]);

  // Key Event listeners for flow navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || isSubmitting) return;

      // Escape to close or dismiss
      if (e.key === 'Escape') {
        setErrorText(null);
      }

      // Enter advances (if not multiline textarea, or if with shift)
      if (e.key === 'Enter') {
        if (currentQuestion?.type === 'textarea' && !e.shiftKey) {
          // Allow normal enter in textarea to make newline unless user explicitly just wants to advance
          return;
        }

        // Selected options highlight
        if (currentQuestion?.type === 'select' && focusedOptionIndex !== -1 && currentQuestion.options) {
          e.preventDefault();
          const chosenOption = currentQuestion.options[focusedOptionIndex];
          handleSelectValue(chosenOption);
          return;
        }

        e.preventDefault();
        handleNext();
      }

      // Back navigation on Backspace if field is completely empty
      if (e.key === 'Backspace' && currentValue === '' && currentStepIndex > 0) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handleBack();
        }
      }

      // Arrow keys between select option cards
      if (currentQuestion?.type === 'select' && currentQuestion.options) {
        const optionCount = currentQuestion.options.length;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedOptionIndex((prev) => (prev + 1 >= optionCount ? 0 : prev + 1));
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedOptionIndex((prev) => (prev - 1 < 0 ? optionCount - 1 : prev - 1));
        }

        // Direct letter input triggers (A, B, C, D...)
        const keyUpper = e.key.toUpperCase();
        const charCode = keyUpper.charCodeAt(0);
        if (keyUpper.length === 1 && charCode >= 65 && charCode < 65 + optionCount) {
          e.preventDefault();
          const chosenOption = currentQuestion.options[charCode - 65];
          handleSelectValue(chosenOption);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [currentStepIndex, currentValue, focusedOptionIndex, answers]);

  const validateValue = (id: string, val: string): boolean => {
    if (id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val);
    }
    if (id === 'additionalNote') return true; // Optional
    return val.trim().length > 0;
  };

  const currentStepIsValid = (): boolean => {
    if (!currentQuestion) return false;
    if (!isQuestionRequired) return true;
    return validateValue(currentQuestion.id, currentValue);
  };

  const handleNext = () => {
    if (!currentStepIsValid()) {
      if (currentQuestion?.id === 'email' && currentValue) {
        setErrorText('Please enter a valid work email address.');
      } else {
        setErrorText('Answer is required to proceed.');
      }
      return;
    }

    if (currentStepIndex < questions.length - 1) {
      setDirection('forward');
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection('backward');
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setErrorText(null);
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value,
    });
  };

  const handleSelectValue = (val: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: val,
    });
    setErrorText(null);

    // Auto advancing on click for cards feels incredibly frictionless
    setTimeout(() => {
      setDirection('forward');
      if (currentStepIndex < questions.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        submitForm();
      }
    }, 250);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrorText(null);

    const activeService = answers['serviceArea'];
    const selectedBranch = BRANCHED_QUESTIONS[activeService] || [];
    
    // Map custom branch responses nicely
    const mappedBranchResponses = selectedBranch.map((q) => ({
      questionId: `reach_me_${q.id}`,
      question: q.question,
      answer: answers[q.id] || '',
    })).filter(a => a.answer.trim().length > 0);

    const result = await submitReachMeLead({
      name: answers['name'],
      email: answers['email'],
      company: answers['company'],
      jobTitle: answers['role'],
      primaryInterest: activeService,
      message: answers['additionalNote'] || '',
      answers: mappedBranchResponses,
      consent: {
        contactConsent: true,
        privacyAccepted: true,
      },
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      console.error('Error submitting Reach Me flow:', result.error);
      setErrorText(result.message || 'Failed to submit. Please check your network and try again.');
    }
  };

  // Compute overall percentage mathematically
  const progressRatio = ((currentStepIndex) / questions.length) * 100;

  // Custom motion layout settings for exquisite physical Typeform step transitions
  const animationVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      y: dir === 'forward' ? 30 : -30,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    },
    exit: (dir: 'forward' | 'backward') => ({
      y: dir === 'forward' ? -35 : 35,
      opacity: 0,
      scale: 0.98,
      transition: {
        y: { duration: 0.2 },
        opacity: { duration: 0.15 },
      },
    }),
  };

  // Submitting Spinner
  if (isSubmitting) {
    return (
      <div id="submitting-curtain" className="fixed inset-0 z-50 bg-[#f5f3fa] text-[#1d1b20] flex flex-col items-center justify-center font-sans">
        <div className="text-center p-8 max-w-md flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-m3-primary/10 border-t-m3-primary relative"
          >
            <Sparkles className="w-5 h-5 text-m3-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-display font-medium text-m3-primary"
          >
            Synthesizing responses...
          </motion.h3>
          <p className="text-sm font-sans text-m3-on-surface/60">
            Formulating your custom service path briefing for Abdullah Malik.
          </p>
        </div>
      </div>
    );
  }

  // Success screen (Keep standard viewport layout, fits elegantly)
  if (isSuccess) {
    return (
      <div id="success-viewport" className="fixed inset-0 z-40 overflow-y-auto bg-[#f5f3fa] text-[#1d1b20] flex flex-col items-center justify-center font-sans px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="max-w-[580px] text-center bg-white border border-m3-outline/5 p-8 md:p-12 rounded-[32px] shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-m3-primary" />
          
          <div className="w-16 h-16 bg-m3-secondary-container text-m3-on-secondary-container rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Check className="w-8 h-8 text-m3-primary stroke-[2.5]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-semibold text-m3-on-surface tracking-tight mb-4 leading-tight">
            Thanks — message received.
          </h1>

          <p className="text-lg text-m3-on-surface/70 leading-relaxed mb-8">
            I now have enough context to respond in a way that is actually useful, not generic.
          </p>

          <button 
            id="success-home-btn"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-m3-primary text-m3-on-primary hover:bg-m3-primary/95 font-sans font-medium rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Back to Home
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div id="reach-me-typeform-viewport" className="fixed inset-0 z-30 overflow-hidden bg-gradient-to-tr from-[#fbfafc] via-[#f5f3fa] to-[#efedf5] text-[#1d1b20] flex flex-col font-sans select-none pt-[112px]">
      
      {/* Dynamic Progress Line running perfectly right under the global floating Navbar */}
      <div className="fixed top-[92px] left-0 right-0 h-1 bg-m3-outline/5 z-30">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${progressRatio}%` }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="h-full bg-m3-primary rounded-r-full"
        />
      </div>

      {/* Main Questionnaire Stage - Vertically centered below the header space */}
      <main className="flex-1 flex flex-col justify-start md:justify-center items-center px-6 overflow-y-auto relative pb-24 md:pb-28">
        <div className="w-full max-w-3xl min-h-[380px] flex flex-col justify-start md:justify-center pt-6 md:pt-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={animationVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col"
            >
              {/* a) Step Number (small, refined, lightly tinted in brand purple) */}
              <div className="flex items-center gap-2 mb-2 select-none">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-m3-primary bg-m3-primary/10 px-3 py-1 rounded-full">
                  {`Question ${(currentStepIndex + 1).toString().padStart(2, '0')}`}
                </span>
                <span className="text-xs font-mono text-m3-on-surface/40">
                  — Step {currentStepIndex + 1} of {questions.length}
                </span>
              </div>

              {/* b) Main Question (large, premium, highly readable in Syne display font) */}
              <h1 className="text-3xl md:text-5xl lg:text-5.51xl font-display font-bold text-m3-on-surface leading-[1.12] tracking-tight mb-3">
                {(() => {
                  const words = currentQuestion.question.split(' ');
                  if (words.length > 1 && isQuestionRequired) {
                    const lastWord = words.pop();
                    return (
                      <>
                        {words.join(' ')}{' '}
                        <span className="whitespace-nowrap">
                          {lastWord}
                          <span className="text-m3-primary ml-1 font-sans select-none">*</span>
                        </span>
                      </>
                    );
                  }
                  return (
                    <>
                      {currentQuestion.question}
                      {isQuestionRequired && <span className="text-m3-primary ml-1 font-sans select-none">*</span>}
                    </>
                  );
                })()}
              </h1>

              {/* c) Hint Text (small but clear, directly below the question) */}
              <p className="text-base md:text-lg text-m3-on-surface/75 font-sans font-normal leading-relaxed mb-1.5 max-w-2xl">
                {currentQuestion.hint}
              </p>

              {/* d) Example Text (visually distinct from hint: lighter styling, italicized, with a clear prefix label) */}
              <p className="text-sm text-m3-on-surface/50 font-sans font-light italic mb-8 max-w-2xl">
                <span className="not-italic font-semibold text-m3-primary/70 mr-1.5 font-sans select-none">Example:</span>
                “{currentQuestion.example}”
              </p>

              {/* e) Input Field or Answer Options (Answer area comes AFTER the supporting guidance) */}
              <div className="w-full mb-4">
                {currentQuestion.type === 'text' && (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={currentValue}
                    onChange={handleTextChange}
                    placeholder={currentQuestion.placeholder}
                    className="w-full text-2xl md:text-4xl font-sans font-light bg-transparent border-b-2 border-m3-outline/20 focus:border-m3-primary text-m3-on-surface placeholder-m3-on-surface/20 py-4 outline-none transition-colors"
                    aria-label={currentQuestion.question}
                  />
                )}

                {currentQuestion.type === 'email' && (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    type="email"
                    value={currentValue}
                    onChange={handleTextChange}
                    placeholder={currentQuestion.placeholder}
                    className="w-full text-2xl md:text-4xl font-sans font-light bg-transparent border-b-2 border-m3-outline/20 focus:border-m3-primary text-m3-on-surface placeholder-m3-on-surface/20 py-4 outline-none transition-colors w-full"
                    aria-label={currentQuestion.question}
                  />
                )}

                {currentQuestion.type === 'textarea' && (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={currentValue}
                    onChange={handleTextChange}
                    placeholder={currentQuestion.placeholder}
                    rows={2}
                    className="w-full text-xl md:text-3xl font-sans font-light bg-transparent border-b-2 border-m3-outline/20 focus:border-m3-primary text-m3-on-surface placeholder-m3-on-surface/30 py-2 outline-none resize-none transition-colors"
                    aria-label={currentQuestion.question}
                  />
                )}

                {currentQuestion.type === 'select' && currentQuestion.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = currentValue === option;
                      const isKeyboardFocused = focusedOptionIndex === idx;
                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectValue(option)}
                          className={`group w-full text-left p-5 rounded-[22px] border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-m3-primary/10 border-m3-primary text-m3-primary shadow-sm'
                              : isKeyboardFocused
                              ? 'bg-m3-primary/5 border-m3-primary/60 text-m3-on-surface shadow-sm'
                              : 'bg-white/70 hover:bg-white border-m3-outline/10 text-m3-on-surface hover:scale-[1.01]'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold ${
                              isSelected
                                ? 'bg-m3-primary border-m3-primary text-m3-on-primary'
                                : 'bg-m3-outline/5 border-m3-outline/20 text-m3-on-surface/65 group-hover:border-m3-primary/30 group-hover:text-m3-primary'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-sans font-medium text-base md:text-[17px] leading-snug">
                              {option}
                            </span>
                          </div>
                          
                          {isSelected && (
                            <motion.div 
                              layoutId="selected-check"
                              className="w-6 h-6 rounded-full bg-m3-primary text-m3-on-primary flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error Alert Displaying under answer area */}
              <div className="min-h-[24px] mt-2 select-none">
                {errorText && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-m3-primary"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorText}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* f) Bottom Navigation Area / control bar */}
      <footer className="w-full px-6 py-5 md:px-12 border-t border-m3-outline/5 bg-white/40 backdrop-blur-md flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            id="back-btn"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-m3-outline/10 text-m3-on-surface hover:bg-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Go Back (Backspace)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs text-m3-on-surface/40 hidden md:inline select-none">
            Use <kbd className="px-1.5 py-0.5 bg-m3-outline/10 rounded font-mono text-[10px]">Backspace</kbd> to go back
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick tip on keyboard shortcut */}
          {currentQuestion.type === 'select' && (
            <span className="text-[11px] text-m3-primary/60 hidden lg:inline mr-3 select-none bg-m3-primary/5 px-3 py-1 rounded-md border border-m3-primary/10">
              Shortcut: Press keys <kbd className="font-mono bg-m3-primary/10 px-1 py-0.5 rounded font-semibold">A</kbd> - <kbd className="font-mono bg-m3-primary/10 px-1 py-0.5 rounded font-semibold">F</kbd> to select
            </span>
          )}

          <span className="text-xs text-m3-on-surface/40 hidden md:inline select-none">
            Press <kbd className="px-1.5 py-0.5 bg-m3-outline/10 rounded font-mono text-[10px]">Enter</kbd> to advance
          </span>

          <button
            id="next-btn"
            onClick={handleNext}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 ${
              currentStepIsValid() 
                ? 'bg-m3-primary text-m3-on-primary hover:bg-m3-primary/95 hover:scale-[1.02]' 
                : 'bg-m3-primary/10 text-m3-on-surface/40 cursor-not-allowed'
            } rounded-full font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer`}
          >
            {currentStepIndex === questions.length - 1 ? (
              <>
                Submit Responses
                <Send className="w-4.5 h-4.5 ml-1" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="w-4.5 h-4.5" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
