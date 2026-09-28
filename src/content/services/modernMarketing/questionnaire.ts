import type { DecisionQuestionnaireConfig } from '@/components/service/DecisionQuestionnaire';

export const modernMarketingQuestionnaire: DecisionQuestionnaireConfig = {
  submissionType: 'modern-marketing-growth',
  sourcePage: '/services/modern-marketing-growth',
  sourcePageTitle: 'Modern Marketing & Growth Service',
  introStyle: 'grid',
  palette: 'marketing',
  questions: [
    {
      id: 1,
      text: 'How structured is your growth approach?',
      helperText: 'Evaluating your current growth setup is the first step to building a scalable engine.',
      options: [
        'Disconnected channel campaigns',
        'Basic conversion tracking in place',
        'Full-funnel growth system architecture',
        'Not sure — need assessment'
      ]
    },
    {
      id: 2,
      text: 'What is limiting growth right now?',
      helperText: 'Identifying execution friction points helps focus our strategic roadmap.',
      options: [
        'Conversion leaks & landing page drop-off',
        'High CAC & channel attribution gaps',
        'Lack of ABM / enterprise B2B precision',
        'Not sure — need diagnosis'
      ]
    },
    {
      id: 3,
      text: 'Where should growth improve first?',
      helperText: 'We focus early phases on initiatives delivering immediate commercial uplift.',
      options: [
        'Conversion rate & CRO optimization',
        'Paid performance & multi-touch attribution',
        'Personalisation & lifecycle retention',
        'Not sure — help identify priority'
      ]
    },
    {
      id: 4,
      text: 'What support do you need?',
      helperText: 'Selecting your core requirement ensures targeted strategy execution.',
      options: [
        'Full-funnel growth strategy',
        'Growth experimentation & CRO engine',
        'Account-Based Growth (ABM) framework',
        'Not sure — recommend the right path'
      ]
    },
    {
      id: 5,
      text: 'How urgent is this?',
      options: [
        'Exploring for later',
        'Need clarity soon',
        'Planning active work',
        'Ready to start now'
      ]
    },
    {
      id: 6,
      text: 'What should happen next?',
      helperText: 'Select how you would prefer to transition from diagnostic to active roadmap discussion.',
      options: [
        'Book a growth strategy review',
        'Discuss a CRO & funnel audit',
        'Review current channel setup',
        'Help me choose the next step'
      ]
    }
  ],
  leftColumn: {
    lead: 'Turn marketing into a system that actually drives scalable, predictable growth.',
    description: 'If that is the kind of system you want to build, start with a few quick questions. This helps me understand where your campaigns are disconnected, what is limiting conversion, and what growth strategy will unlock maximum velocity.',
    note: 'The sharper the context, the more effective the strategy.'
  },
  intro: {
    badgeLabel: 'Growth Diagnostic',
    quote: '“Let’s focus your growth roadmap. Answer 6 quick questions so we can diagnose your current funnel and design a system built to scale.”',
    ctaLabel: 'Start growth diagnostic'
  },
  contact: {
    heading: 'Good. This gives enough context to make the next conversation sharper.',
    description: 'Leave your details and I’ll prepare tailored growth insights before we connect.',
    messagePlaceholder: 'Tell me briefly about your primary growth goal...',
    submitLabel: 'Send growth context'
  },
  success: {
    message: 'Thanks — your context is recorded. I’ll prepare for our conversation with your specific growth priorities in mind.'
  }
};
