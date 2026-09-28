import type { ServicePageConfig } from '@/components/service/ServicePageLayout';
import { dataActivationShowcase } from './showcase';
import { dataActivationQuestionnaire } from './questionnaire';
import { dataActivationStory } from './story';

export const dataActivationService: ServicePageConfig = {
  seo: {
    title: 'Customer Data Activation & Intelligence - Malik Consultancy',
    description:
      'Turn customer data into commercial intelligence. I design unified pipelines, active MarTech integrations, and predictive scoring layers to drive acquisition and growth.',
  },
  theme: {
    pageBg: 'bg-[#0c0503]',
    heroBg: 'bg-[#03120E]',
    heroColor: '#03120E',
    heroGradient: 'linear-gradient(135deg, #03120E 0%, #06241D 45%, #0A362C 100%)',
    glowTop: 'bg-[#E8DEF8]/10',
    glowBottom: 'bg-[#EEF8F5]/10',
    cta: 'bg-[#FAF8F3] text-[#2A1008]',
  },
  hero: {
    ariaLabel: 'Data Activation Introduction',
    eyebrow: 'Data Activation & Intelligence',
    headline: (
      <>
        TURNING CUSTOMER DATA <br />
        INTO <span className="text-[#EAFF00]">COMMERCIAL</span> <br />
        <span className="text-[#EAFF00]">INTELLIGENCE.</span>
      </>
    ),
    description:
      'I help organisations turn fragmented customer, marketing, CRM, and behavioural data into activation systems that improve decisions, personalise journeys, and create measurable growth.',
    ctaLabel: 'Book Data Strategy Session',
    ctaHref: '/reach-me',
  },
  story: { ariaLabel: 'Interactive Customer Data Journey', config: dataActivationStory },
  showcase: dataActivationShowcase,
  questionnaire: dataActivationQuestionnaire,
};
