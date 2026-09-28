import type { SubServicesShowcaseConfig } from '@/components/service/SubServicesShowcase';

export const aiMaturityShowcase: SubServicesShowcaseConfig = {
  theme: {
    rootClassName: 'w-full bg-[#FAF7F2] text-[#12081A] transition-colors duration-500',
    desktopScrollAreaClassName: 'relative w-full h-[600vh] bg-[#FAF7F2]',
    introHeadingClassName: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#12081A] tracking-tight uppercase mb-10 leading-tight',
    introBodyClassName: 'text-lg md:text-xl font-sans text-[#12081A]/75 font-light leading-relaxed space-y-6 max-w-5xl',
    introEmphasisClassName: 'text-[#4B2A5A] font-mono text-sm tracking-widest uppercase font-semibold',
    cards: {
      kind: 'explicit',
      numberTextClassName: 'text-white/10',
      mobileOutcomeWrapperClassName: 'border-t border-white/10 pt-4 mt-6',
      desktopOutcomeWrapperClassName: 'border-t border-white/10 pt-6'
    }
  },
  intro: {
    eyebrow: {
      text: 'Core Capability Pillars',
      className: 'text-xs font-bold uppercase tracking-[0.25em] text-[#4B2A5A] block mb-4'
    },
    heading: 'Six pillars that move organisations from AI curiosity to enterprise capability.',
    paragraphs: [
      {
        text: 'Technology is only an accelerator. Without cultural adoption, executive guidance, and team capability, AI initiatives stall at the pilot phase.'
      },
      {
        text: 'I help leadership teams build the internal muscle, governance, and operating models required to make AI a durable competitive advantage.',
        emphasized: true
      }
    ]
  },
  mobileCtaCursorPointer: true,
  listHeading: 'What we provide:',
  services: [
    {
      id: 'ai-maturity-assessment',
      num: '01',
      title: 'AI Maturity Assessment',
      description: 'I assess where your organisation actually stands with AI — not in theory, but in practice.',
      points: [
        'AI maturity framework evaluation',
        'Use-case and capability audit',
        'Data, technology, and team readiness analysis',
        'Gap identification across organisation',
        'Benchmarking against leading practices'
      ],
      outcome: 'What you get: A clear picture of where you are, what is missing, and what must be built to move forward.',
      solidBg: 'bg-[#2F143F]',
      borderColor: 'border-white/15',
      accentText: 'text-[#E8DEF8]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#E8DEF8]',
      badgeText: 'text-[#2F143F]'
    },
    {
      id: 'ai-strategy-roadmapping',
      num: '02',
      title: 'AI Strategy & Roadmapping',
      description: 'AI without a structured roadmap leads to scattered experiments.',
      points: [
        'AI opportunity mapping',
        'prioritised use-case roadmap',
        'phased implementation approach',
        'value and impact alignment',
        'execution planning timeline'
      ],
      outcome: 'What you get: A practical roadmap that connects AI ambition to real execution and measurable outcomes.',
      solidBg: 'bg-[#4A2E26]',
      borderColor: 'border-white/15',
      accentText: 'text-[#F5E8D0]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#F5E8D0]',
      badgeText: 'text-[#4A2E26]'
    },
    {
      id: 'leadership-enablement',
      num: '03',
      title: 'Leadership Enablement & Alignment',
      description: 'AI transformation fails when leadership is not aligned.',
      points: [
        'executive AI workshops',
        'decision-making frameworks',
        'leadership alignment sessions',
        'AI strategy communication frameworks',
        'cross-functional alignment design'
      ],
      outcome: 'What you get: Leadership clarity and alignment required to make AI initiatives move forward.',
      solidBg: 'bg-[#6A3F2E]',
      borderColor: 'border-white/15',
      accentText: 'text-[#FAF7F2]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-white',
      badgeText: 'text-[#6A3F2E]'
    },
    {
      id: 'governance-responsible-adoption',
      num: '04',
      title: 'AI Governance & Responsible Adoption',
      description: 'Trust is the foundation of scalable AI.',
      points: [
        'governance model design',
        'risk classification frameworks',
        'data and AI policy definition',
        'responsible AI principles implementation',
        'monitoring and accountability structure'
      ],
      outcome: 'What you get: A structured foundation that allows AI to scale safely and responsibly.',
      solidBg: 'bg-[#2E1B16]',
      borderColor: 'border-white/15',
      accentText: 'text-[#F5E8D0]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#F5E8D0]',
      badgeText: 'text-[#2E1B16]'
    },
    {
      id: 'workforce-capability-building',
      num: '05',
      title: 'Workforce Capability Building',
      description: 'AI adoption is not just tools — it is people.',
      points: [
        'AI training programs',
        'skill development frameworks',
        'team enablement workshops',
        'adoption playbooks',
        'role-based capability building'
      ],
      outcome: 'What you get: Teams that understand, trust, and actively use AI in their daily work.',
      solidBg: 'bg-[#2C1037]',
      borderColor: 'border-white/15',
      accentText: 'text-[#E8DEF8]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#E8DEF8]',
      badgeText: 'text-[#2C1037]'
    },
    {
      id: 'ai-operating-model-design',
      num: '06',
      title: 'AI Operating Model Design',
      description: 'AI needs a new way of working, not just new tools.',
      points: [
        'operating model redesign',
        'role and responsibility mapping',
        'cross-team collaboration structures',
        'workflow transformation',
        'AI integration into daily processes'
      ],
      outcome: 'What you get: An organisation structured to use AI consistently, not occasionally.',
      solidBg: 'bg-[#2F143F]',
      borderColor: 'border-white/15',
      accentText: 'text-[#E8DEF8]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-white',
      badgeText: 'text-[#2F143F]'
    }
  ]
};
