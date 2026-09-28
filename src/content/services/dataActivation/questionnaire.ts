import type { DecisionQuestionnaireConfig } from '@/components/service/DecisionQuestionnaire';

export const dataActivationQuestionnaire: DecisionQuestionnaireConfig = {
  submissionType: 'data-activation',
  sourcePage: '/services/data-activation-intelligence',
  sourcePageTitle: 'Data Activation & Intelligence Service',
  introStyle: 'grid',
  palette: 'default',
  questions: [
    {
      id: 1,
      text: 'How unified is your customer data today?',
      helperText: 'Mapping your data connectivity is the first step to unlocking active marketing loops.',
      options: [
        'Siloed across campaign tools',
        'Basic CRM sync exists',
        'Unified CDP / warehouse in place',
        'I’m not sure how unified it is'
      ]
    },
    {
      id: 2,
      text: 'What is your primary activation blocker?',
      helperText: 'Identifying execution friction helps us focus the diagnostic where it matters most.',
      options: [
        'Slow execution pipelines',
        'Messy / untrusted data quality',
        'Complex tech stack integration',
        'Not sure — need diagnosis'
      ]
    },
    {
      id: 3,
      text: 'Where should activated data drive growth first?',
      helperText: 'We focus early phases on use cases yielding immediate customer acquisition or retention returns.',
      options: [
        'Personalised marketing campaigns',
        'Customer churn prevention',
        'Multi-market global scaling',
        'Not sure — help identify priority'
      ]
    },
    {
      id: 4,
      text: 'What support would help most?',
      helperText: 'Choosing the focus of partnership ensures we deliver targeted data activation value.',
      options: [
        'Data activation strategy',
        'CRM & stack orchestration',
        'Real-time pipeline engineering',
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
      helperText: 'Select how you would prefer to move from diagnostic to active roadmap discussion.',
      options: [
        'Book an activation review',
        'Discuss a pipeline audit',
        'Review current stack layout',
        'Help me choose the next step'
      ]
    }
  ],
  leftColumn: {
    lead: 'Move customer data from passive collection into decisions, journeys, and measurable growth.',
    description: 'If that is the kind of shift you are trying to make, start with a few questions. This helps me understand where your data is siloed, what is blocking performance, and what data activation strategy would create the most value.',
    note: 'The better the context, the sharper the conversation.'
  },
  intro: {
    badgeLabel: 'Diagnostic Intake',
    quote: '“Let’s make this useful. I’ll ask a few short questions so we can understand whether this is a strategy, integration, predictive model, or dashboard conversation.”',
    ctaLabel: 'Start the data diagnostic'
  },
  contact: {
    heading: 'Good. This gives enough context to make the next conversation sharper.',
    description: 'Leave your details and I’ll know whether this is a strategy, activation, orchestration, pipeline, or intelligence conversation.',
    messagePlaceholder: 'Tell me a bit about your current customer data goals...',
    submitLabel: 'Send my data activation context'
  },
  success: {
    message: 'Thanks — your context is captured. The next conversation will not start from zero.'
  }
};
