import type { DecisionQuestionnaireConfig } from '@/components/service/DecisionQuestionnaire';

export const aiTransformationQuestionnaire: DecisionQuestionnaireConfig = {
  submissionType: 'ai-transformation',
  sourcePage: '/services/ai-transformation',
  sourcePageTitle: 'AI Transformation Service',
  introStyle: 'classic',
  palette: 'default',
  questions: [
    {
      id: 1,
      text: 'Where are you right now with AI?',
      helperText: 'Understanding your current state aligns our roadmap with organizational reality.',
      options: [
        'Exploring possibilities',
        'Running pilots, but not scaling',
        'Using tools, but adoption is weak',
        'Need a full transformation roadmap'
      ]
    },
    {
      id: 2,
      text: 'What is blocking progress?',
      helperText: 'Pinpointing constraints helps us design the correct target operating model.',
      options: [
        'Unclear use cases',
        'Fragmented data',
        'Workflow complexity',
        'Governance and risk'
      ]
    },
    {
      id: 3,
      text: 'Where should AI create value first?',
      helperText: 'Transformation succeeds when we secure early, high-impact wins for the team.',
      options: [
        'Sales and growth',
        'Customer operations',
        'Knowledge and research',
        'Internal productivity'
      ]
    },
    {
      id: 4,
      text: 'What support would help most?',
      helperText: 'Tailoring our engagement ensures support lands where you need it most.',
      options: [
        'Strategy and roadmap',
        'Use-case prioritisation',
        'Pilot design and build',
        'Governance and capability building'
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
      helperText: 'Select how you would prefer to transition from diagnostic to execution planning.',
      options: [
        'Book a strategy session',
        'Send a short context note',
        'Review my AI opportunity',
        'Discuss a specific pilot'
      ]
    }
  ],
  leftColumn: {
    lead: 'Move AI from scattered experiments into structured systems that create measurable business value.',
    description: 'If that is the kind of shift you are trying to make, start with a few questions. This helps me understand where you are now, what is blocking progress, and what kind of AI transformation support would create the most value.',
    note: 'The better the context, the sharper the conversation.'
  },
  intro: {
    badgeLabel: 'Diagnostic Intake',
    quote: '“Let’s make this useful. I’ll ask a few short questions so we can understand whether this is a strategy, prioritisation, pilot, governance, or adoption conversation.”',
    ctaLabel: 'Start the AI diagnostic'
  },
  contact: {
    heading: 'Good. This gives enough context to make the next conversation sharper.',
    description: 'Leave your details and I’ll know whether this is a strategy, prioritisation, pilot, governance, or adoption discussion.',
    messagePlaceholder: 'Tell me a bit about your current goals...',
    submitLabel: 'Send my AI transformation context'
  },
  success: {
    message: 'Thanks — your context is captured. The next conversation will not start from zero.'
  }
};
