import type { SubServicesShowcaseConfig } from '@/components/service/SubServicesShowcase';

export const dataActivationShowcase: SubServicesShowcaseConfig = {
  theme: {
    rootClassName: 'w-full bg-[#FAF8F3] text-[#2A1008] transition-colors duration-500',
    desktopScrollAreaClassName: 'relative w-full h-[600vh] bg-[#FAF8F3]',
    introHeadingClassName: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#2A1008] tracking-tight uppercase mb-10 leading-tight',
    introBodyClassName: 'text-lg md:text-xl font-sans text-[#2A1008]/70 font-light leading-relaxed space-y-8 max-w-5xl',
    introEmphasisClassName: 'text-[#7C2D12] font-mono text-sm tracking-widest uppercase font-semibold',
    cards: {
      kind: 'contrast',
      dark: {
        cardTextClassName: 'text-white',
        numberTextClassName: 'text-white/5',
        headingTextClassName: 'text-white',
        descriptionTextClassName: 'text-white/80',
        ctaButtonClassName: 'bg-[#FAF8F3] text-[#2A1008] hover:bg-[#FAF8F3]/90',
        listTextClassName: 'text-white/70',
        outcomeTextClassName: 'text-white',
        outcomeBorderClassName: 'border-white/10'
      },
      light: {
        cardTextClassName: 'text-[#2A1008]',
        numberTextClassName: 'text-[#2A1008]/5',
        headingTextClassName: 'text-[#2A1008]',
        descriptionTextClassName: 'text-[#2A1008]/85',
        ctaButtonClassName: 'bg-[#2A1008] text-white hover:bg-[#2A1008]/90',
        listTextClassName: 'text-[#2A1008]/75',
        outcomeTextClassName: 'text-[#2A1008]',
        outcomeBorderClassName: 'border-[#2A1008]/10'
      }
    }
  },
  intro: {
    eyebrow: {
      text: 'Our Sub-Services',
      className: 'text-xs font-bold uppercase tracking-[0.25em] text-[#7C2D12] block mb-4'
    },
    heading: 'Six ways I turn customer data into active commercial value.',
    paragraphs: [
      {
        text: 'Data is a liability until it changes a decision.'
      },
      {
        text: 'Most organisations have more than enough customer signals. The problem is that those signals live in disconnected systems, slow reports, static dashboards, and campaigns that cannot react fast enough.',
        emphasized: true
      },
      {
        text: 'This service connects the data layer to the commercial layer — turning raw customer signals into acquisition, retention, personalisation, and measurable growth.'
      }
    ]
  },
  mobileCtaCursorPointer: true,
  listHeading: 'What we provide:',
  services: [
    {
      id: 'marketing',
      num: '01',
      title: 'Cross-Channel Performance Intelligence',
      description: 'I help growth teams understand which channels, audiences, campaigns, and journeys are actually creating commercial movement — not just clicks, impressions, or isolated platform results.',
      points: [
        'Cross-channel acquisition performance model',
        'CAC, ROAS, pipeline, and conversion signal mapping',
        'Attribution gap analysis across paid, owned, CRM, and sales touchpoints',
        'Budget allocation logic based on commercial return',
        'Live performance indicator framework'
      ],
      outcome: 'A clearer view of where growth is coming from, where spend is leaking, and which channels deserve more investment.',
      solidBg: 'bg-[#2A1008]',
      borderColor: 'border-white/10',
      accentText: 'text-[#E2C08A]',
      isDark: true
    },
    {
      id: 'strategy',
      num: '02',
      title: 'Customer Data Activation Strategy',
      description: 'I help organisations move customer data from passive storage into active journeys, triggers, segments, and decision flows that can be used by marketing, sales, and customer teams.',
      points: [
        'Customer data activation roadmap',
        'Audience and lifecycle segmentation logic',
        'Trigger-based campaign architecture',
        'First-party data activation planning',
        'Channel and journey dependency mapping'
      ],
      outcome: 'A practical activation blueprint that turns customer signals into personalised journeys, faster campaign execution, and measurable commercial action.',
      solidBg: 'bg-[#7C2D12]',
      borderColor: 'border-white/10',
      accentText: 'text-[#FAF8F3]',
      isDark: true
    },
    {
      id: 'crm',
      num: '03',
      title: 'CRM & MarTech Orchestration',
      description: 'I help align CRM, marketing automation, analytics, and customer data systems so teams can work from cleaner signals and coordinated customer journeys.',
      points: [
        'CRM and MarTech stack audit',
        'Customer journey data flow mapping',
        'Lead, lifecycle, and conversion event alignment',
        'Marketing automation logic',
        'Data quality and sync issue diagnosis'
      ],
      outcome: 'A more connected commercial stack where marketing, sales, and customer teams can act on shared customer signals with less friction.',
      solidBg: 'bg-[#E2C08A]',
      borderColor: 'border-[#2A1008]/10',
      accentText: 'text-[#2A1008]',
      isDark: false
    },
    {
      id: 'integration',
      num: '04',
      title: 'AI-Ready Data Integration',
      description: 'AI agents and automation systems need reliable customer context. I help design the data layer that gives AI systems the right signals, rules, and context to support better decisions.',
      points: [
        'AI-ready data source mapping',
        'Context pipeline design',
        'Event and behaviour stream planning',
        'Data quality checks for AI workflows',
        'Guardrail and context logic for agentic systems'
      ],
      outcome: 'A trusted context layer that allows AI systems to act on relevant, timely, and commercially useful customer data.',
      solidBg: 'bg-[#FAF8F3]',
      borderColor: 'border-[#2A1008]/10',
      accentText: 'text-[#7C2D12]',
      isDark: false
    },
    {
      id: 'predictive',
      num: '05',
      title: 'Predictive Customer Intelligence',
      description: 'I help teams anticipate customer intent before friction, churn, or missed opportunity appears in the numbers.',
      points: [
        'Churn and retention signal mapping',
        'Purchase propensity logic',
        'Customer lifetime value modelling',
        'Behavioural segmentation',
        'Reactivation and next-best-action trigger design'
      ],
      outcome: 'A customer intelligence layer that helps teams identify who is likely to convert, churn, grow, or need action next.',
      solidBg: 'bg-[#3B160C]',
      borderColor: 'border-white/10',
      accentText: 'text-[#E2C08A]',
      isDark: true
    },
    {
      id: 'dashboards',
      num: '06',
      title: 'Commercial Intelligence Dashboards',
      description: 'I build executive-ready performance views that connect marketing activity, customer behaviour, pipeline movement, and revenue outcomes into one decision layer.',
      points: [
        'Executive KPI framework',
        'Acquisition, retention, and pipeline dashboard logic',
        'Multi-touch attribution view',
        'Lifecycle performance tracking',
        'Real-time ROI and commercial signal reporting'
      ],
      outcome: 'A decision interface that shows what is driving growth, what is slowing it down, and where action should happen next.',
      solidBg: 'bg-[#7C2D12]',
      borderColor: 'border-white/10',
      accentText: 'text-[#FAF8F3]',
      isDark: true
    }
  ]
};
