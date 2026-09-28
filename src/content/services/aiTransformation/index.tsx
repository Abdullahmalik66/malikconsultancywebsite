import type { ServicePageConfig } from '@/components/service/ServicePageLayout';
import { aiTransformationShowcase } from './showcase';
import { aiTransformationQuestionnaire } from './questionnaire';
import { aiTransformationStory } from './story';

export const aiTransformationService: ServicePageConfig = {
  seo: {
    title: 'AI Transformation Service - Malik Consultancy',
    description:
      'Transform AI ambition into scalable ROI. I architect production-grade pilot systems and agentic operating models built for sustainable business growth.',
  },
  theme: {
    pageBg: 'bg-[#08070a]',
    heroBg: 'bg-[#000114]',
    heroColor: '#000114',
    heroGradient: 'linear-gradient(135deg, #000114 0%, #00022b 45%, #050b42 100%)',
    glowTop: 'bg-[#3b82f6]/15',
    glowBottom: 'bg-[#1d4ed8]/10',
    cta: 'bg-white text-[#00022b]',
  },
  hero: {
    ariaLabel: 'AI Transformation Introduction',
    eyebrow: 'AI Transformation',
    headline: (
      <>
        <span className="text-[#EAFF00]">TRANSFORMING AI AMBITION</span> <br />
        INTO SCALABLE BUSINESS <br />
        SYSTEMS.
      </>
    ),
    description:
      'I partner with enterprise leaders and growth teams to design, architect, and scale production-grade agentic AI ecosystems. By grounding AI models in proprietary organizational intelligence and connecting them to real-time data pipelines, we eliminate pilot-stage bottlenecks to drive measurable commercial velocity, predictable performance, and sustainable ROI.',
    ctaLabel: 'Book AI Strategy Session',
    ctaHref: '/reach-me',
  },
  story: { ariaLabel: 'Interactive AI Narrative Journey', config: aiTransformationStory },
  showcase: aiTransformationShowcase,
  questionnaire: aiTransformationQuestionnaire,
};
