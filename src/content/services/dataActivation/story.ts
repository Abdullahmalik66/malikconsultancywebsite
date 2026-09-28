import type { CinematicStoryConfig } from '@/components/service/CinematicStory';

export const dataActivationStory: CinematicStoryConfig = {
  containerClassName: 'relative w-full bg-[#1e0a05] py-24 md:py-32 overflow-hidden border-t border-white/5',
  highlights: [
    {
      target: 'active commercial intelligence',
      className: 'text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold'
    },
    {
      target: 'step in',
      className: 'text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold'
    }
  ],
  phases: [
    {
      lines: [
        'Most organisations think they need more data.',
        "They don't.",
        'They have an activation problem.'
      ],
      startWhenInView: true,
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Raw signals are everywhere.',
        'Siloed across campaign channels, web visits, CRM events, and sales systems.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Dashboards report what happened.',
        'But they rarely change what happens next.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'This is where I step in.',
        'Turning raw data into active commercial intelligence.'
      ],
      pauseDuration: 1000
    }
  ]
};
