import type { SubServicesShowcaseConfig } from '@/components/service/SubServicesShowcase';

export const aiTransformationShowcase: SubServicesShowcaseConfig = {
  theme: {
    rootClassName: 'w-full bg-[#FEF7FF] text-[#1D1B20] transition-colors duration-500',
    desktopScrollAreaClassName: 'relative w-full h-[600vh] bg-[#FEF7FF]',
    introHeadingClassName: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#1d1b20] tracking-tight uppercase mb-10 leading-tight',
    introBodyClassName: 'text-lg md:text-xl font-sans text-[#1d1b20]/70 font-light leading-relaxed space-y-8 max-w-5xl',
    introEmphasisClassName: 'text-[#6750A4] font-mono text-sm tracking-widest uppercase font-semibold',
    cards: {
      kind: 'contrast',
      dark: {
        cardTextClassName: 'text-white',
        numberTextClassName: 'text-white/5',
        headingTextClassName: 'text-white',
        descriptionTextClassName: 'text-white/80',
        ctaButtonClassName: 'bg-[#FEF7FF] text-[#1D1B20] hover:bg-[#FEF7FF]/90',
        listTextClassName: 'text-white/70',
        outcomeTextClassName: 'text-white',
        outcomeBorderClassName: 'border-white/10'
      },
      light: {
        cardTextClassName: 'text-[#103A2A]',
        numberTextClassName: 'text-[#103A2A]/5',
        headingTextClassName: 'text-[#103A2A]',
        descriptionTextClassName: 'text-[#103A2A]/85',
        ctaButtonClassName: 'bg-[#103A2A] text-white hover:bg-[#103A2A]/90',
        listTextClassName: 'text-[#103A2A]/75',
        outcomeTextClassName: 'text-[#103A2A]',
        outcomeBorderClassName: 'border-[#103A2A]/10'
      }
    }
  },
  intro: {
    heading: 'Six ways I turn AI ambition into systems that scale.',
    paragraphs: [
      {
        text: 'AI transformation does not fail because organisations lack tools. It fails because the work is not structured properly.'
      },
      {
        text: 'The use cases are unclear. The data is fragmented. The workflows stay unchanged. Governance is added too late. And pilots are built without a path to production.',
        emphasized: true
      },
      {
        text: 'This is where the service becomes practical. I help organisations move from isolated AI experiments to structured, production-grade systems that connect strategy, data, workflows, people, and measurable business outcomes.'
      }
    ]
  },
  mobileCtaCursorPointer: false,
  listHeading: 'What you get:',
  services: [
    {
      id: 'strategy',
      num: '01',
      title: 'AI Strategy & Value Roadmap',
      description: 'I help leadership teams define where AI should create business value, what to prioritise, and how to move from ambition to execution. AI only creates value when it is connected to a real business problem. The goal is not to "do AI". The goal is to identify where AI can improve decisions, reduce friction, increase speed, or unlock new commercial value.',
      points: [
        'AI opportunity mapping across business functions',
        'Use-case discovery linked to measurable outcomes',
        'Value case and ROI logic',
        'Strategic roadmap for pilots, production, governance, and scale',
        'Executive decision support for build, buy, or partner decisions'
      ],
      outcome: 'A practical AI transformation roadmap linked to business outcomes, operational feasibility, and measurable value.',
      solidBg: 'bg-[#103A2A]',
      borderColor: 'border-white/10',
      accentText: 'text-[#E2C08A]',
      isDark: true
    },
    {
      id: 'portfolio',
      num: '02',
      title: 'AI Use Case Portfolio & Prioritisation',
      description: 'Not every AI idea deserves investment. I help separate high-value use cases from noise. Most organisations are not short on AI ideas. They are short on disciplined selection. The focus is not more experimentation. The focus is better selection.',
      points: [
        'AI use-case inventory',
        'Impact vs feasibility scoring',
        'Risk and readiness assessment',
        'Data dependency mapping',
        'Pilot selection and sequencing',
        'Decision matrix for leadership prioritisation'
      ],
      outcome: 'A prioritised AI use-case portfolio that shows what to build first, why it matters, what it depends on, and what value it should create.',
      solidBg: 'bg-[#2F6B4B]',
      borderColor: 'border-white/10',
      accentText: 'text-[#F6EFE1]',
      isDark: true
    },
    {
      id: 'workflow',
      num: '03',
      title: 'Agentic Workflow & Operating Model Design',
      description: 'AI should not sit on top of broken workflows. It should reshape how work gets done. I design workflows where humans, AI agents, data sources, and business systems work together with clear roles, hand-offs, approvals, and escalation logic. This is where AI moves from tool usage into operating model change.',
      points: [
        'Agentic workflow design',
        'Human-in-the-loop decision models',
        'Role and responsibility mapping',
        'Workflow redesign for AI-enabled operations',
        'Agent ecosystem architecture',
        'Operating model recommendations'
      ],
      outcome: 'A redesigned operating model that shows where AI acts, where humans decide, and how work moves faster without losing control.',
      solidBg: 'bg-[#E2C08A]',
      borderColor: 'border-[#103A2A]/10',
      accentText: 'text-[#103A2A]',
      isDark: false
    },
    {
      id: 'pilot',
      num: '04',
      title: 'Production-Grade AI Pilot Development',
      description: 'A demo is not transformation. A pilot only matters if it can survive real operational pressure. I help design and build AI pilots with production in mind from day one. That means clear architecture, data readiness, evaluation logic, integration planning, monitoring requirements, and a realistic scale path. The objective is simple: build something useful enough to prove value and structured enough to become real.',
      points: [
        'Rapid prototype design',
        'RAG and agent architecture',
        'Prompt and evaluation logic',
        'Integration with CRM, data, and workflow systems',
        'Testing, monitoring, and production-ready planning',
        'Clear scale pathway from pilot to live system'
      ],
      outcome: 'A production-ready AI pilot designed to prove value, reduce risk, and create a realistic path toward deployment.',
      solidBg: 'bg-[#F6EFE1]',
      borderColor: 'border-[#103A2A]/10',
      accentText: 'text-[#B24A2E]',
      isDark: false
    },
    {
      id: 'governance',
      num: '05',
      title: 'AI Governance, Risk & Responsible AI',
      description: 'AI systems need trust before they can scale. I help organisations define the rules, controls, and governance structures needed to use AI responsibly. This includes where AI is allowed to act, where humans must approve, how risks are classified, and how outputs are monitored over time. Governance is not bureaucracy. Good governance is what allows AI to move faster without creating unnecessary risk.',
      points: [
        'AI governance model',
        'Risk classification for AI use cases',
        'Responsible AI policy design',
        'Human approval and escalation rules',
        'Model monitoring and audit logic',
        'Privacy, security, fairness, transparency, and accountability controls'
      ],
      outcome: 'A governance layer that makes AI safer, explainable, auditable, and ready for enterprise use.',
      solidBg: 'bg-[#B24A2E]',
      borderColor: 'border-white/10',
      accentText: 'text-[#F6EFE1]',
      isDark: true
    },
    {
      id: 'adoption',
      num: '06',
      title: 'AI Adoption & Capability Building',
      description: 'AI transformation is not only a technical shift. It is a people and operating model shift. I help teams build the capability to understand, use, and scale AI in daily work. This includes workshops, maturity assessments, adoption playbooks, enablement sessions, and change support for AI-enabled workflows. The goal is not just that people use AI tools. The goal is that they understand where AI fits, how to trust it, and how to turn it into better work.',
      points: [
        'Executive AI workshops',
        'Workforce enablement programmes',
        'AI maturity assessments',
        'Adoption playbooks',
        'Capability-building sessions for teams',
        'Change management support for AI-enabled workflows'
      ],
      outcome: 'An organisation that is not just experimenting with AI, but building the confidence, skills, and routines to turn AI into real performance.',
      solidBg: 'bg-[#103A2A]',
      borderColor: 'border-white/10',
      accentText: 'text-[#E2C08A]',
      isDark: true
    }
  ]
};
