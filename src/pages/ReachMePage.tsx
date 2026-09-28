import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Send,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Home
} from 'lucide-react';
import { submitReachMeLead } from '@/services/leads/leadApi';
import CloudscapeBackground from '@/components/reachme/CloudscapeBackground';

interface QuestionConfig {
  id: string;
  question: string;
  type: 'text' | 'select' | 'textarea' | 'email';
  hint: string;
  example: string;
  placeholder?: string;
  options?: string[];
  phase: string;
}

const STATIC_STEPS: QuestionConfig[] = [
  {
    id: 'name',
    question: 'What is your name?',
    type: 'text',
    hint: 'Enter your full name so I know who I’m speaking with.',
    example: 'Sarah Ahmed',
    placeholder: 'Sarah Ahmed',
    phase: 'About You',
  },
  {
    id: 'role',
    question: 'What is your role?',
    type: 'text',
    hint: 'Share your current role so I can understand your perspective.',
    example: 'Head of Growth',
    placeholder: 'Head of Growth',
    phase: 'About You',
  },
  {
    id: 'company',
    question: 'What company are you with?',
    type: 'text',
    hint: 'Mention your company or organisation name.',
    example: 'Northern Scale Labs',
    placeholder: 'Northern Scale Labs',
    phase: 'About You',
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
    phase: 'Advisory Focus',
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
      phase: 'Transformation Scope',
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
      phase: 'AI Architecture',
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
      phase: 'Current Blockers',
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
      phase: 'Target Outcome',
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
      phase: 'Data Foundation',
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
      phase: 'Intelligence Gap',
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
      phase: 'System Barriers',
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
      phase: 'Target Outcome',
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
      phase: 'Growth Architecture',
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
      phase: 'Commercial Challenge',
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
      phase: 'Execution Limit',
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
      phase: 'Target Outcome',
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
      phase: 'Readiness & Culture',
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
      phase: 'Capability Gap',
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
      phase: 'Adoption Barriers',
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
      phase: 'Target Outcome',
    },
  ],
};

const FINAL_STEPS: QuestionConfig[] = [
  {
    id: 'email',
    question: 'What is the best email to reach you on?',
    type: 'email',
    hint: 'Use your work email so I can reply properly with relevant briefing notes.',
    example: 'sarah@company.com',
    placeholder: 'sarah@company.com',
    phase: 'Direct Contact',
  },
  {
    id: 'additionalNote',
    question: 'Is there anything else I should know before replying?',
    type: 'textarea',
    hint: 'Optional context: timing, current tooling, or specific questions you want covered.',
    example: 'We are exploring AI across CRM and paid media and want clarity on where to start.',
    placeholder: 'Add any specific notes or questions you want me to review before reaching out (or send immediately below)...',
    phase: 'Final Briefing',
  },
];

const SERVICE_SLUG_MAP: Record<string, string> = {
  'ai-transformation': 'AI Transformation',
  'data-activation': 'Data Activation & Intelligence',
  'data-activation-intelligence': 'Data Activation & Intelligence',
  'modern-marketing-growth': 'Modern Marketing & Growth',
  'modern-marketing': 'Modern Marketing & Growth',
  'ai-maturity': 'AI Maturity & Capability Building',
  'ai-maturity-capability-building': 'AI Maturity & Capability Building',
};

export default function ReachMePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && SERVICE_SLUG_MAP[serviceParam]) {
      return { serviceArea: SERVICE_SLUG_MAP[serviceParam] };
    }
    return {};
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Keyboard navigation & accessibility states
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Clear auto-advance timer on cleanup
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Generate dynamic array of questions based on chosen branch
  const questions = useMemo<QuestionConfig[]>(() => {
    const list = [...STATIC_STEPS];
    const selectedService = answers['serviceArea'];
    if (selectedService && BRANCHED_QUESTIONS[selectedService]) {
      list.push(...BRANCHED_QUESTIONS[selectedService]);
    }
    list.push(...FINAL_STEPS);
    return list;
  }, [answers['serviceArea']]);

  const currentQuestion = questions[currentStepIndex] || questions[0];
  const isQuestionRequired = currentQuestion?.id !== 'additionalNote';
  const currentValue = answers[currentQuestion?.id] || '';
  const isLastStep = currentStepIndex === questions.length - 1;

  // Ensure currentStepIndex stays within bounds if branch questions decrease
  useEffect(() => {
    if (currentStepIndex >= questions.length) {
      setCurrentStepIndex(Math.max(0, questions.length - 1));
    }
  }, [questions.length, currentStepIndex]);

  // Focus the input element on step transition
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setFocusedOptionIndex(-1);
    setErrorText(null);
  }, [currentStepIndex, currentQuestion?.id]);

  const validateValue = (id: string, val: string): boolean => {
    if (!val) return false;
    if (id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val.trim());
    }
    if (id === 'additionalNote') return true;
    return val.trim().length > 0;
  };

  const currentStepIsValid = (): boolean => {
    if (!currentQuestion) return false;
    if (!isQuestionRequired) return true;
    return validateValue(currentQuestion.id, currentValue);
  };

  const submitForm = async (overrideAnswers?: Record<string, string>) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const payloadAnswers = { ...answers, ...(overrideAnswers || {}) };

    // Validate minimum required fields before submitting
    if (!payloadAnswers['name'] || !payloadAnswers['email']) {
      setErrorText('Please ensure your name and email are provided before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    const activeService = payloadAnswers['serviceArea'] || 'AI Transformation';
    const selectedBranch = BRANCHED_QUESTIONS[activeService] || [];

    // Map custom branch responses cleanly
    const mappedBranchResponses = selectedBranch
      .map((q) => ({
        questionId: `reach_me_${q.id}`,
        question: q.question,
        answer: payloadAnswers[q.id] || '',
      }))
      .filter((a) => a.answer && a.answer.trim().length > 0);

    const result = await submitReachMeLead({
      name: payloadAnswers['name'] || '',
      email: payloadAnswers['email'] || '',
      company: payloadAnswers['company'] || '',
      jobTitle: payloadAnswers['role'] || '',
      primaryInterest: activeService,
      message: payloadAnswers['additionalNote'] || '',
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
      setErrorText(result.message || 'Failed to submit. Please check your connection and try again.');
    }
  };

  const handleNext = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (!currentStepIsValid()) {
      if (currentQuestion?.id === 'email') {
        setErrorText('Please enter a valid work email address (e.g. sarah@company.com).');
      } else {
        setErrorText('Please provide an answer to proceed.');
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
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (currentStepIndex > 0) {
      setDirection('backward');
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setErrorText(null);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: e.target.value,
    }));
  };

  const handleSelectValue = (val: string) => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: val,
    };

    setAnswers(nextAnswers);
    setErrorText(null);

    // Smooth tactile advance after 320ms so user sees their selection clearly
    autoAdvanceTimerRef.current = setTimeout(() => {
      setDirection('forward');
      if (currentStepIndex < questions.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        submitForm(nextAnswers);
      }
      autoAdvanceTimerRef.current = null;
    }, 320);
  };

  const handleJumpToStep = (targetIndex: number) => {
    if (targetIndex === currentStepIndex) return;
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setDirection(targetIndex > currentStepIndex ? 'forward' : 'backward');
    setCurrentStepIndex(targetIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || isSubmitting) return;

      // Escape key to navigate back to main site
      if (e.key === 'Escape') {
        navigate('/');
        return;
      }

      // Enter advances or submits
      if (e.key === 'Enter') {
        // For textarea: allow Shift+Enter for newline, or Cmd/Ctrl+Enter to submit immediately
        if (currentQuestion?.type === 'textarea') {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            submitForm();
            return;
          }
          // If empty and regular Enter is pressed, submit
          if (!currentValue.trim() && !e.shiftKey) {
            e.preventDefault();
            submitForm();
            return;
          }
          return;
        }

        // If a select option is focused via arrow keys
        if (currentQuestion?.type === 'select' && focusedOptionIndex !== -1 && currentQuestion.options) {
          e.preventDefault();
          const chosenOption = currentQuestion.options[focusedOptionIndex];
          handleSelectValue(chosenOption);
          return;
        }

        e.preventDefault();
        handleNext();
      }

      // Backspace navigation when input is empty
      if (e.key === 'Backspace' && currentValue === '' && currentStepIndex > 0) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleBack();
        }
      }

      // Option card arrow navigation and single key triggers
      if (currentQuestion?.type === 'select' && currentQuestion.options) {
        const optionCount = currentQuestion.options.length;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          setFocusedOptionIndex((prev) => (prev + 1 >= optionCount ? 0 : prev + 1));
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setFocusedOptionIndex((prev) => (prev - 1 < 0 ? optionCount - 1 : prev - 1));
        }

        // Direct letter input triggers (A, B, C, D, E, F)
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
  }, [currentStepIndex, currentValue, focusedOptionIndex, answers, currentQuestion, isSuccess, isSubmitting]);

  // Compute overall percentage
  const progressRatio = ((currentStepIndex + 1) / questions.length) * 100;

  // Silky smooth, reliable spring animations (no blocking filter hangs)
  const animationVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      y: dir === 'forward' ? 18 : -18,
      opacity: 0,
      transition: {
        y: { type: 'spring' as const, stiffness: 400, damping: 32 },
        opacity: { duration: 0.18 },
      },
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 400, damping: 32 },
        opacity: { duration: 0.18 },
      },
    },
    exit: (dir: 'forward' | 'backward') => ({
      y: dir === 'forward' ? -18 : 18,
      opacity: 0,
      transition: {
        y: { duration: 0.14, ease: 'easeOut' as const },
        opacity: { duration: 0.12 },
      },
    }),
  };

  // Submitting Loader View
  if (isSubmitting) {
    return (
      <div id="submitting-curtain" className="fixed inset-0 z-50 bg-[#F6FAFD] text-[#1A102E] flex flex-col items-center justify-center font-sans px-6">
        <CloudscapeBackground />

        <div className="text-center p-8 max-w-lg flex flex-col items-center gap-6 relative z-10 bg-white/70 backdrop-blur-2xl border border-black/5 rounded-[36px] shadow-2xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-[#1A102E]/10 border-t-[#1A102E] relative flex items-center justify-center shadow-inner"
          >
            <Sparkles className="w-7 h-7 text-[#1A102E] animate-pulse" />
          </motion.div>
          <div className="space-y-2">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-display font-bold text-[#1A102E]"
            >
              Synthesizing your briefing...
            </motion.h3>
            <p className="text-sm font-sans text-[#1A102E]/70 max-w-sm leading-relaxed">
              Structuring your technical and operational requirements for direct review by Abdullah Malik.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#1A102E]/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Connecting to executive inquiry intake
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (isSuccess) {
    return (
      <div id="success-viewport" className="fixed inset-0 z-50 overflow-y-auto bg-[#F6FAFD] text-[#1A102E] flex flex-col items-center justify-center font-sans px-6 py-12">
        <CloudscapeBackground />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="max-w-[620px] w-full text-center bg-white/90 backdrop-blur-2xl border border-black/10 p-8 sm:p-12 rounded-[36px] shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1A102E]" />

          {/* Success badge */}
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Briefing Delivered
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#1A102E] tracking-tight mb-4 leading-tight">
            Thank you, {answers['name'] || 'there'}.
          </h1>

          <p className="text-base sm:text-lg text-[#1A102E]/75 leading-relaxed mb-8 max-w-lg mx-auto font-sans">
            Your strategic inquiry has been recorded. I now have the full context needed to provide an actionable, high-signal response.
          </p>

          {/* Executive Receipt Summary */}
          <div className="text-left bg-[#F7F4FA] border border-black/5 rounded-2xl p-5 mb-8 space-y-3 font-sans text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-black/5 pb-2">
              <span className="text-[#1A102E]/50 font-medium">Recipient:</span>
              <span className="font-semibold text-[#1A102E] font-mono">Abdullah Malik / Advisory</span>
            </div>
            <div className="flex justify-between items-center border-b border-black/5 pb-2">
              <span className="text-[#1A102E]/50 font-medium">Sender:</span>
              <span className="font-semibold text-[#1A102E]">
                {answers['name']} {answers['role'] ? `(${answers['role']})` : ''} {answers['company'] ? `• ${answers['company']}` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-black/5 pb-2">
              <span className="text-[#1A102E]/50 font-medium">Focus Area:</span>
              <span className="font-semibold text-[#6750A4]">{answers['serviceArea'] || 'General Advisory'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#1A102E]/50 font-medium">Confirmation sent to:</span>
              <span className="font-mono text-[#1A102E]">{answers['email']}</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="success-home-btn"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#1A102E] text-white hover:bg-[#2F1D4F] font-sans font-bold text-sm sm:text-base rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Return to Main Site
            </button>
            <Link
              to="/case-work"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-black/5 text-[#1A102E] border border-black/10 font-sans font-semibold text-sm sm:text-base rounded-full transition-all cursor-pointer"
            >
              Explore Case Work
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-[#1A102E]/45 mt-6 font-sans">
            Need immediate contact? Reach me directly at{' '}
            <a href="mailto:abdullahmalik66@gmail.com" className="underline hover:text-[#1A102E] font-medium">
              abdullahmalik66@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      id="reach-me-viewport"
      className="fixed inset-0 z-30 overflow-hidden bg-gradient-to-b from-[#CFE3F6] via-[#E7F1FA] to-[#F0ECF7] text-[#1A102E] flex flex-col font-sans select-none"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {/* "Dreamscape Horizon" — parallax clouds, breathing sun, rising light motes */}
      <CloudscapeBackground />

      {/* =========================================================================
          1. TOP NAVIGATION HEADER (Only Logo, Progress, Exit to main site)
         ========================================================================= */}
      <header className="relative z-40 w-full h-[68px] sm:h-[76px] px-4 sm:px-8 md:px-12 bg-white/75 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex items-center justify-between flex-shrink-0">
        
        {/* Left: Only Logo (no text) & Step Back */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center group cursor-pointer"
            title="Return to Main Website"
          >
            <div className="p-1 rounded-xl bg-white/90 border border-black/10 shadow-xs group-hover:shadow transition-shadow">
              <img
                src="/am-serif-logo-transparent.png"
                alt="Abdullah Malik Logo"
                className="h-8 sm:h-9 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Quick Step Back if not on first step */}
          {currentStepIndex > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 ml-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#1A102E]/70 hover:text-[#1A102E] bg-black/[0.04] hover:bg-black/[0.08] transition-all cursor-pointer"
              title="Go to previous question (Backspace)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
        </div>

        {/* Center: Clean Progress Counter with Interactive Step Dots (No "About You" badge) */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-mono font-medium text-[#1A102E]/65 tracking-wider">
            Step {currentStepIndex + 1} of {questions.length}
          </span>

          {/* Mini Interactive Step Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {questions.map((q, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => isPast && handleJumpToStep(idx)}
                  disabled={!isPast}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'w-6 sm:w-8 bg-[#1A102E]'
                      : isPast
                      ? 'w-2 sm:w-2.5 bg-[#1A102E]/50 cursor-pointer hover:scale-125'
                      : 'w-2 sm:w-2.5 bg-black/15 cursor-not-allowed'
                  }`}
                  title={isPast ? `Jump back to: ${q.question}` : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Exit to main site button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="exit-intake-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-[#1A102E] bg-black/[0.04] hover:bg-black/[0.08] border border-black/10 transition-all cursor-pointer group shadow-2xs"
            title="Exit to main site (Esc)"
          >
            <span>Exit to main site</span>
            <span className="hidden sm:inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-white border border-black/15 text-[#1A102E]/70 font-semibold group-hover:bg-[#1A102E] group-hover:text-white transition-colors">
              Esc
            </span>
            <X className="w-3.5 h-3.5 text-[#1A102E]/60 group-hover:text-[#1A102E] transition-colors" />
          </button>
        </div>
      </header>

      {/* Navigator Bar with Ambient Moving Wave Effect (Subtle, calm, no harsh color) */}
      <div className="relative w-full h-[3px] bg-black/[0.05] z-40 overflow-hidden flex-shrink-0">
        <motion.div
          initial={false}
          animate={{ width: `${progressRatio}%` }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="h-full relative overflow-hidden bg-[#1A102E] rounded-r-full"
        >
          {/* Continuous gentle ambient light wave gliding through the progress line */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
          />
        </motion.div>
      </div>

      {/* =========================================================================
          2. MAIN QUESTIONNAIRE STAGE (Centered, Smooth Slide, Rich Visuals)
         ========================================================================= */}
      <main
        className="flex-1 flex flex-col justify-start md:justify-center items-center px-4 sm:px-8 overflow-y-auto relative z-10 pt-4 sm:pt-6 pb-6"
        style={{ minHeight: 0 }}
      >
        <div className="w-full max-w-3xl min-h-[380px] flex flex-col justify-start md:justify-center">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={animationVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col"
            >
              {/* Question Badge & Counter */}
              <div className="flex items-center gap-2 mb-3 select-none">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6750A4] bg-[#6750A4]/10 px-3 py-1 rounded-full border border-[#6750A4]/20 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#6750A4]" />
                  {`Question ${(currentStepIndex + 1).toString().padStart(2, '0')}`}
                </span>
                <span className="text-xs font-mono text-[#1A102E]/45">
                  — Step {currentStepIndex + 1} of {questions.length}
                </span>
              </div>

              {/* Main Question Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] font-display font-bold text-[#1A102E] leading-[1.14] tracking-tight mb-3">
                {(() => {
                  const words = currentQuestion.question.split(' ');
                  if (words.length > 1 && isQuestionRequired) {
                    const lastWord = words.pop();
                    return (
                      <>
                        {words.join(' ')}{' '}
                        <span className="whitespace-nowrap">
                          {lastWord}
                          <span className="text-[#6750A4] ml-1 select-none">*</span>
                        </span>
                      </>
                    );
                  }
                  return (
                    <>
                      {currentQuestion.question}
                      {isQuestionRequired && <span className="text-[#6750A4] ml-1 select-none">*</span>}
                    </>
                  );
                })()}
              </h1>

              {/* Hint Guidance */}
              <p className="text-base sm:text-lg text-[#1A102E]/75 font-sans font-normal leading-relaxed mb-1.5 max-w-2xl">
                {currentQuestion.hint}
              </p>

              {/* Example Quote */}
              <p className="text-xs sm:text-sm text-[#1A102E]/55 font-sans font-light italic mb-6 max-w-2xl">
                <span className="not-italic font-semibold text-[#6750A4] mr-1.5 font-sans select-none">
                  Example:
                </span>
                “{currentQuestion.example}”
              </p>

              {/* Input Control Area */}
              <div className="w-full mb-3">
                {/* 1. TEXT INPUT */}
                {currentQuestion.type === 'text' && (
                  <div className="relative group">
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="text"
                      value={currentValue}
                      onChange={handleTextChange}
                      placeholder={currentQuestion.placeholder}
                      className="w-full text-2xl sm:text-3xl md:text-4xl font-sans font-light bg-transparent border-b-2 border-black/15 focus:border-[#1A102E] text-[#1A102E] placeholder-[#1A102E]/25 py-4 outline-none transition-colors"
                      aria-label={currentQuestion.question}
                    />
                    <div className="mt-3 flex items-center justify-between text-xs text-[#1A102E]/40 font-mono">
                      <span>Press Enter ↵ to continue</span>
                    </div>
                  </div>
                )}

                {/* 2. EMAIL INPUT */}
                {currentQuestion.type === 'email' && (
                  <div className="relative group">
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type="email"
                      value={currentValue}
                      onChange={handleTextChange}
                      placeholder={currentQuestion.placeholder}
                      className="w-full text-2xl sm:text-3xl md:text-4xl font-sans font-light bg-transparent border-b-2 border-black/15 focus:border-[#1A102E] text-[#1A102E] placeholder-[#1A102E]/25 py-4 outline-none transition-colors"
                      aria-label={currentQuestion.question}
                    />
                    <div className="mt-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#1A102E]/40">Press Enter ↵ to advance</span>
                      {currentValue && validateValue('email', currentValue) && (
                        <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Email looks valid
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. TEXTAREA (FINAL NOTE) */}
                {currentQuestion.type === 'textarea' && (
                  <div className="w-full flex flex-col gap-4">
                    <div className="relative">
                      <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={currentValue}
                        onChange={handleTextChange}
                        placeholder={currentQuestion.placeholder}
                        rows={3}
                        className="w-full text-lg sm:text-2xl font-sans font-light bg-white/70 backdrop-blur-sm border-2 border-black/10 focus:border-[#1A102E] rounded-2xl p-4 sm:p-5 text-[#1A102E] placeholder-[#1A102E]/30 outline-none resize-none transition-all shadow-sm"
                        aria-label={currentQuestion.question}
                      />
                    </div>

                    {/* PROMINENT SEND ACTIONS RIGHT INSIDE THE CARD */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <button
                        id="card-send-inquiry-btn"
                        onClick={() => submitForm()}
                        className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#1A102E] text-white hover:bg-[#2F1D4F] rounded-full font-sans font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                      >
                        <Send className="w-4.5 h-4.5 text-[#EAFF00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Send Briefing to Abdullah Malik</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => submitForm()}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full text-xs font-semibold text-[#1A102E]/70 hover:text-[#1A102E] hover:bg-black/5 transition-all cursor-pointer"
                      >
                        <span>{currentValue ? 'Send now' : 'Skip note & send now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[#1A102E]/50 font-mono">
                      Tip: Press <kbd className="px-1.5 py-0.5 bg-black/5 rounded border border-black/10 font-bold">⌘ + Enter</kbd> (or <kbd className="px-1.5 py-0.5 bg-black/5 rounded border border-black/10 font-bold">Ctrl + Enter</kbd>) to dispatch immediately
                    </p>
                  </div>
                )}

                {/* 4. SELECT OPTIONS */}
                {currentQuestion.type === 'select' && currentQuestion.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = currentValue === option;
                      const isKeyboardFocused = focusedOptionIndex === idx;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectValue(option)}
                          className={`group w-full text-left p-4 sm:p-5 rounded-[22px] border-2 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs ${
                            isSelected
                              ? 'bg-[#1A102E]/5 border-[#1A102E] text-[#1A102E] shadow-sm scale-[1.01]'
                              : isKeyboardFocused
                              ? 'bg-[#6750A4]/10 border-[#6750A4] text-[#1A102E] shadow-sm'
                              : 'bg-white/80 hover:bg-white border-black/[0.08] text-[#1A102E] hover:border-black/20 hover:scale-[1.008]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span
                              className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                                isSelected
                                  ? 'bg-[#1A102E] border-[#1A102E] text-white'
                                  : 'bg-black/[0.03] border-black/10 text-[#1A102E]/65 group-hover:border-[#1A102E]/30 group-hover:text-[#1A102E]'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-sans font-medium text-sm sm:text-base leading-snug">
                              {option}
                            </span>
                          </div>

                          {isSelected && (
                            <motion.div
                              layoutId="selected-check-pill"
                              className="w-6 h-6 rounded-full bg-[#1A102E] text-white flex items-center justify-center shadow-xs"
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

              {/* Error Alert Display */}
              <div className="min-h-[26px] mt-1 select-none">
                {errorText && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full"
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

      {/* =========================================================================
          3. BOTTOM FLOATING CONTROLS DOCK (Back, Keyboard helper, Next/Send)
         ========================================================================= */}
      <footer className="w-full px-4 sm:px-8 md:px-12 py-3.5 sm:py-4 border-t border-black/[0.08] bg-white/85 backdrop-blur-xl flex items-center justify-between z-40 relative shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex-shrink-0">
        {/* Left: Previous step & Back to site */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="bottom-back-btn"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-black/10 text-[#1A102E] bg-white hover:bg-black/[0.04] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs text-xs sm:text-sm font-semibold"
            title="Go Back (Backspace)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-[#1A102E] bg-black/[0.04] hover:bg-black/[0.08] border border-black/10 transition-all cursor-pointer group shadow-2xs"
            title="Exit to main site (Esc)"
          >
            <span>Exit to main site</span>
            <span className="hidden sm:inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-white border border-black/15 text-[#1A102E]/70 font-semibold group-hover:bg-[#1A102E] group-hover:text-white transition-colors">
              Esc
            </span>
            <X className="w-3.5 h-3.5 text-[#1A102E]/60 group-hover:text-[#1A102E] transition-colors" />
          </button>
        </div>

        {/* Center: Keyboard hint */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-[#1A102E]/50 font-mono select-none">
          {currentQuestion.type === 'select' && (
            <span className="bg-black/[0.03] px-2.5 py-1 rounded-md border border-black/5">
              Press keys <kbd className="font-bold text-[#1A102E]">A</kbd>–<kbd className="font-bold text-[#1A102E]">F</kbd>
            </span>
          )}
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-black/5 rounded border border-black/10 font-bold text-[#1A102E]">Enter ↵</kbd> to proceed
          </span>
        </div>

        {/* Right: Next Step OR Standout Send Button */}
        <div className="flex items-center gap-3">
          {isLastStep ? (
            <button
              id="bottom-submit-btn"
              onClick={() => submitForm()}
              className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 bg-[#1A102E] text-white hover:bg-[#2F1D4F] rounded-full font-sans font-bold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span>Send Briefing</span>
              <Send className="w-4 h-4 text-[#EAFF00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          ) : (
            <button
              id="bottom-next-btn"
              onClick={handleNext}
              className={`inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 ${
                currentStepIsValid()
                  ? 'bg-[#1A102E] text-white hover:bg-[#2F1D4F]'
                  : 'bg-black/10 text-black/40 cursor-not-allowed'
              } rounded-full font-sans font-semibold text-sm sm:text-base shadow-md active:scale-[0.98] transition-all cursor-pointer`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
