import type { ServicePageConfig } from '@/components/service/ServicePageLayout';
import { aiMaturityShowcase } from './showcase';
import { aiMaturityQuestionnaire } from './questionnaire';
import { aiMaturityStory } from './story';

export const aiMaturityService: ServicePageConfig = {
  seo: {
    title: 'AI Maturity & Capability Building - Malik Consultancy',
    description:
      'Move from isolated AI initiatives to structured enterprise capability. I help leadership teams align strategy, governance, workforce enablement, and operating models.',
  },
  theme: {
    pageBg: 'bg-[#0f0617]',
    heroBg: 'bg-[#1A0F03]',
    heroColor: '#1A0F03',
    heroGradient: 'linear-gradient(135deg, #1A0F03 0%, #2D1A05 45%, #422607 100%)',
    glowTop: 'bg-[#E8DEF8]/15',
    glowBottom: 'bg-[#F5F1FF]/10',
    cta: 'bg-[#E8DEF8] text-[#12081A]',
  },
  hero: {
    ariaLabel: 'AI Maturity & Capability Building Introduction',
    eyebrow: 'AI Maturity & Capability Building',
    headline: (
      <>
        BUILDING AI <br />
        CAPABILITY THAT <br />
        <span className="text-[#EAFF00]">ACTUALLY SCALES.</span>
      </>
    ),
    description:
      'I help organisations move from isolated AI initiatives to structured capability—aligning leadership, teams, processes, and systems to make AI work in practice.',
    ctaLabel: 'Book AI Maturity Assessment',
    ctaHref: '/reach-me',
  },
  story: { ariaLabel: 'Interactive AI Capability Narrative', config: aiMaturityStory },
  showcase: aiMaturityShowcase,
  questionnaire: aiMaturityQuestionnaire,
};
