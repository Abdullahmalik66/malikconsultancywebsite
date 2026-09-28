import type { SubServicesShowcaseConfig } from '@/components/service/SubServicesShowcase';

export const modernMarketingShowcase: SubServicesShowcaseConfig = {
  theme: {
    rootClassName: 'w-full bg-[#FAF7F2] text-[#24170F] transition-colors duration-500',
    desktopScrollAreaClassName: 'relative w-full h-[600vh] bg-[#FAF7F2]',
    introHeadingClassName: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#24170F] tracking-tight uppercase mb-10 leading-tight',
    introBodyClassName: 'text-lg md:text-xl font-sans text-[#24170F]/75 font-light leading-relaxed space-y-6 max-w-5xl',
    introEmphasisClassName: 'text-[#7A4E2D] font-mono text-sm tracking-widest uppercase font-semibold',
    cards: {
      kind: 'explicit',
      numberTextClassName: 'text-[#24170F]/10',
      mobileOutcomeWrapperClassName: 'border-t border-[#24170F]/10 pt-4 mt-6',
      desktopOutcomeWrapperClassName: 'border-t border-[#24170F]/10 pt-6'
    }
  },
  intro: {
    eyebrow: {
      text: 'Core Sub-Services',
      className: 'text-xs font-bold uppercase tracking-[0.25em] text-[#7A4E2D] block mb-4'
    },
    heading: 'Six engines that turn marketing into a scalable growth system.',
    paragraphs: [
      {
        text: 'Most marketing efforts fail to scale not because of poor creative, but because of fragmented execution and disconnected measurement.'
      },
      {
        text: 'I build growth systems that connect strategy → execution → measurement → optimisation into one continuous engine.',
        emphasized: true
      }
    ]
  },
  mobileCtaCursorPointer: true,
  listHeading: 'What we provide:',
  services: [
    {
      id: 'full-funnel-growth',
      num: '01',
      title: 'Full-Funnel Growth Strategy',
      description: 'I help organisations move from channel-level thinking to full-funnel growth architecture.',
      points: [
        'Funnel and journey mapping',
        'Channel role definition',
        'Acquisition and retention strategy',
        'KPI and growth model design',
        'Budget allocation logic'
      ],
      outcome: 'What you get: A clear growth system that aligns marketing, sales, and customer journeys into one measurable flow.',
      solidBg: 'bg-[#893F04]',
      borderColor: 'border-white/15',
      accentText: 'text-[#F5E8D0]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#F5E8D0]',
      badgeText: 'text-[#893F04]'
    },
    {
      id: 'conversion-cro',
      num: '02',
      title: 'Conversion & CRO Systems',
      description: 'Traffic without conversion is wasted budget. I design systems that continuously improve how users convert across web, campaigns, and journeys.',
      points: [
        'Conversion funnel analysis',
        'Landing page optimisation',
        'UX and behaviour tracking',
        'A/B testing frameworks',
        'Conversion psychology mapping'
      ],
      outcome: 'What you get: Higher conversion rates, lower acquisition cost, and more value from existing traffic.',
      solidBg: 'bg-[#1c2a26]',
      borderColor: 'border-white/15',
      accentText: 'text-[#a8e6cf]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#a8e6cf]',
      badgeText: 'text-[#1c2a26]'
    },
    {
      id: 'performance-attribution',
      num: '03',
      title: 'Performance Marketing & Attribution',
      description: 'I help teams understand what is actually driving growth — not just platform-level numbers.',
      points: [
        'Channel performance modelling',
        'Attribution logic design',
        'CAC and ROI tracking',
        'Budget optimisation frameworks',
        'Cross-channel performance analysis'
      ],
      outcome: 'What you get: A clear picture of where growth comes from and how to scale it efficiently.',
      solidBg: 'bg-[#2b261b]',
      borderColor: 'border-white/15',
      accentText: 'text-[#fff0b3]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#fff0b3]',
      badgeText: 'text-[#2b261b]'
    },
    {
      id: 'account-based-growth',
      num: '04',
      title: 'Account-Based Growth (ABM)',
      description: 'For B2B organisations, growth comes from precision, not volume.',
      points: [
        'Target account identification',
        'Persona and buying group mapping',
        'Personalised multi-touch campaigns',
        'Sales-marketing alignment frameworks',
        'Engagement tracking'
      ],
      outcome: 'What you get: More relevant outreach, stronger engagement, and higher-value pipeline.',
      solidBg: 'bg-[#352311]',
      borderColor: 'border-white/15',
      accentText: 'text-[#e6ddff]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-[#e6ddff]',
      badgeText: 'text-[#352311]'
    },
    {
      id: 'personalisation-lifecycle',
      num: '05',
      title: 'Personalisation & Lifecycle Marketing',
      description: 'Growth happens when experiences adapt to customer behaviour.',
      points: [
        'Lifecycle journey design',
        'Segmentation and trigger logic',
        'Campaign automation flows',
        'Personalisation strategy',
        'Retention and loyalty loops'
      ],
      outcome: 'What you get: More engaged customers, higher retention, and increased lifetime value.',
      solidBg: 'bg-[#8A6258]',
      borderColor: 'border-white/15',
      accentText: 'text-[#FAF7F2]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-white',
      badgeText: 'text-[#8A6258]'
    },
    {
      id: 'experimentation-engine',
      num: '06',
      title: 'Growth Experimentation Engine',
      description: 'The fastest-growing companies don’t guess — they test continuously.',
      points: [
        'Experimentation roadmap',
        'Hypothesis design',
        'Testing frameworks',
        'Data-driven decision model',
        'Learning system design'
      ],
      outcome: 'What you get: A structured way to improve performance continuously, not occasionally.',
      solidBg: 'bg-[#893F04]',
      borderColor: 'border-white/15',
      accentText: 'text-[#F5E8D0]',
      headingColor: 'text-white',
      textColor: 'text-white/95',
      badgeBg: 'bg-white',
      badgeText: 'text-[#893F04]'
    }
  ]
};
