import type { CinematicStoryConfig } from '@/components/service/CinematicStory';

export const aiTransformationStory: CinematicStoryConfig = {
  containerClassName: 'relative w-full bg-[#00022b] py-24 md:py-32 overflow-hidden border-t border-white/5',
  highlights: [
    {
      target: 'systems that actually work',
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
        'Most companies think they have an AI problem.',
        "They don't.",
        'They have a scaling problem.'
      ],
      startWhenInView: true,
      advanceDelayMs: 1000
    },
    {
      lines: [
        '88% of organisations are already using AI.',
        'Only a third have scaled it.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Data is everywhere.',
        'Decisions are still slow.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'Marketing is running.',
        'Growth is not predictable.'
      ],
      advanceDelayMs: 1000
    },
    {
      lines: [
        'This is where I step in.',
        'Turning AI ambition into systems that actually work.'
      ],
      pauseDuration: 1000
    }
  ]
};
