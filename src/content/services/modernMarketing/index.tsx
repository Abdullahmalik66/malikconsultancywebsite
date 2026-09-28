import type { ServicePageConfig } from '@/components/service/ServicePageLayout';
import { modernMarketingShowcase } from './showcase';
import { modernMarketingQuestionnaire } from './questionnaire';
import { modernMarketingStory } from './story';

export const modernMarketingService: ServicePageConfig = {
  seo: {
    title: 'Modern Marketing & Growth - Malik Consultancy',
    description:
      'Turning marketing into a scalable growth system. I help organisations align full-funnel strategy, execution, CRO, and performance marketing into one continuous revenue engine.',
  },
  theme: {
    pageBg: 'bg-[#120a06]',
    heroBg: 'bg-[#18051E]',
    heroColor: '#18051E',
    heroGradient: 'linear-gradient(135deg, #18051E 0%, #290833 45%, #3C0A4B 100%)',
    glowTop: 'bg-[#F5E8D0]/15',
    glowBottom: 'bg-[#EEDDD2]/10',
    cta: 'bg-[#FBF7F2] text-[#24170F]',
  },
  hero: {
    ariaLabel: 'Modern Marketing Introduction',
    eyebrow: 'Modern Marketing & Growth',
    headline: (
      <>
        TURNING MARKETING <br />
        INTO A <span className="text-[#EAFF00]">SCALABLE</span> <br />
        <span className="text-[#EAFF00]">GROWTH SYSTEM.</span>
      </>
    ),
    description:
      'I help organisations move beyond disconnected campaigns and build full-funnel growth systems that align strategy, execution, and measurement into one continuous engine.',
    ctaLabel: 'Book Growth Strategy Session',
    ctaHref: '/reach-me',
  },
  story: { ariaLabel: 'Interactive Growth Narrative', config: modernMarketingStory },
  showcase: modernMarketingShowcase,
  questionnaire: modernMarketingQuestionnaire,
};
