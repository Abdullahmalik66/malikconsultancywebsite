import type { CinematicStoryConfig } from '@/components/service/CinematicStory';

export const modernMarketingStory: CinematicStoryConfig = {
  containerClassName: 'relative w-full bg-[#1e0f09] py-24 md:py-32 overflow-hidden border-t border-white/5',
  highlights: [
    {
      target: 'system that actually drives growth.',
      className: 'text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold'
    },
    {
      target: 'step in.',
      className: 'text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold'
    }
  ],
  phases: [
    {
      lines: [
        'Most companies are running marketing.',
        'But very few are running a growth system.'
      ],
      startWhenInView: true,
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Campaigns are launched.',
        'Channels are active.',
        'Budgets are spent.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'But growth is still hard to scale.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Performance looks good in dashboards.',
        'But decisions are still disconnected.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'This is where I step in.',
        'Turning marketing into a system that actually drives growth.'
      ],
      pauseDuration: 1000
    }
  ]
};
