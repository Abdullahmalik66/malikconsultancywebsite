import type { DecisionQuestionnaireConfig } from '@/components/service/DecisionQuestionnaire';

export const aiMaturityQuestionnaire: DecisionQuestionnaireConfig = {
  submissionType: 'ai-maturity-capability',
  sourcePage: '/services/ai-maturity-capability-building',
  sourcePageTitle: 'AI Maturity & Capability Building Service',
  introStyle: 'grid',
  palette: 'default',
  questions: [
    {
      id: 1,
      text: 'How mature is your AI capability today?',
      helperText: 'Evaluating your operational starting point helps determine the roadmap required.',
      options: [
        'Initial experiments & curiosity',
        'Isolated pilot projects running',
        'Structured enterprise strategy',
        'Not sure — need assessment'
      ]
    },
    {
      id: 2,
      text: 'What is the biggest challenge?',
      helperText: 'Pinpointing adoption bottlenecks ensures targeted capability building.',
      options: [
        'Team skills & workforce adoption',
        'Leadership alignment & strategy clarity',
        'Governance, trust & compliance',
        'Not sure — need diagnosis'
      ]
    },
    {
      id: 3,
      text: 'Where should AI create value first?',
      helperText: 'Focusing early capability sprints on high-impact areas delivers fast commercial wins.',
      options: [
        'Operational efficiency & workflows',
        'Executive decision-making',
        'Customer-facing digital products',
        'Not sure — help identify priority'
      ]
    },
    {
      id: 4,
      text: 'What support is needed?',
      helperText: 'Selecting your core requirement shapes the engagement model.',
      options: [
        'AI maturity audit & roadmap',
        'Executive & leadership workshops',
        'Workforce capability & enablement',
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
      helperText: 'Choose your preferred next step to transition from diagnostic to execution.',
      options: [
        'Book an AI maturity review',
        'Schedule executive workshop',
        'Review operating model setup',
        'Help me choose the next step'
      ]
    }
  ],
  leftColumn: {
    lead: 'Turn isolated AI experiments into structured, enterprise-wide capability.',
    description: 'If that is the shift you want to make, start with a few quick questions. This helps me understand your current maturity, team readiness, and governance needs so we can structure the right capability roadmap.',
    note: 'The better the context, the sharper the strategy.'
  },
  intro: {
    badgeLabel: 'Maturity Diagnostic',
    quote: '“Let’s evaluate your AI capability. Answer 6 quick questions so we can determine whether your priority is executive alignment, governance, workforce enablement, or operating model design.”',
    ctaLabel: 'Start capability diagnostic'
  },
  contact: {
    heading: 'Good. This gives clear context for our AI maturity discussion.',
    description: 'Leave your details and I’ll prepare tailored capability insights before we connect.',
    messagePlaceholder: 'Tell me briefly about your current AI goals...',
    submitLabel: 'Send AI maturity context'
  },
  success: {
    message: 'Thanks — your context is recorded. I’ll prepare for our conversation with your specific AI capability priorities in mind.'
  }
};
