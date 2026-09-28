import type { CinematicStoryConfig } from '@/components/service/CinematicStory';

export const aiMaturityStory: CinematicStoryConfig = {
  containerClassName: 'relative w-full bg-[#170a21] py-24 md:py-32 overflow-hidden border-t border-white/5',
  highlights: [
    {
      target: 'structured organisational capability.',
      className: 'text-[#EAFF00] drop-shadow-[0_0_15px_rgba(234,255,0,0.25)] font-semibold'
    },
    {
      target: 'capability problem.',
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
        'Most organisations are experimenting with AI.',
        'But very few are becoming AI-capable.'
      ],
      startWhenInView: true,
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Pilots are launched.',
        'Tools are tested.',
        'Use cases are explored.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'But adoption stalls.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Teams are unsure.',
        'Leadership is cautious.',
        'Execution is fragmented.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'This is not a technology problem.',
        'It is a capability problem.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'This is where I step in.',
        'Turning AI initiatives into structured organisational capability.'
      ],
      pauseDuration: 1000
    }
  ]
};
