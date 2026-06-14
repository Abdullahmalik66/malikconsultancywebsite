export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  color: string;
  tag: string;
  animationType: 'blobs' | 'waves' | 'particles' | 'grid' | 'neon-lines' | 'radial-pulse';
}

export const allCaseStudies: CaseStudy[] = [
  {
    id: 1,
    title: 'How an AI‑Powered RAG Engine Transformed Technical Support in the Environmental Measurement Sector',
    slug: 'rag-engine-technical-support',
    color: '#6d55a7',
    tag: 'AI Transformation',
    animationType: 'blobs'
  },
  {
    id: 2,
    title: 'Smart Bidding, Smart Results: Bygghemma’s Journey',
    slug: 'bygghemma',
    color: '#1a3c1a',
    tag: 'Modern Marketing',
    animationType: 'waves'
  },
  {
    id: 3,
    title: 'University of Oulu: Cultivating Agentic Thinking Through Data Design',
    slug: 'oulu-university-data-design',
    color: '#1a3c5a',
    tag: 'AI Maturity',
    animationType: 'particles'
  },
  {
    id: 4,
    title: 'A Digital Crossroads: IPAM Navigates a Crowded Landscape for Brand Dominance',
    slug: 'ipam-brand-dominance',
    color: '#2a1a3c',
    tag: 'Modern Marketing',
    animationType: 'grid'
  },
  {
    id: 5,
    title: 'Re-engineering the Customer Journey with Autonomous Agentic Assistance',
    slug: 'agentic-customer-journey',
    color: '#3c1a1a',
    tag: 'AI Transformation',
    animationType: 'neon-lines'
  },
  {
    id: 6,
    title: 'Scaling Global Demand with Precision Persona Architecture and Multichannel Execution',
    slug: 'global-demand-persona-architecture',
    color: '#1a3c3c',
    tag: 'Modern Marketing',
    animationType: 'radial-pulse'
  },
  {
    id: 7,
    title: 'Deutsche Giganetz: Bridging Brand Demand with Conversion Optimization for Rapid Market Entry',
    slug: 'deutsche-giganetz-market-entry',
    color: '#3c3c1a',
    tag: 'Data Activation',
    animationType: 'blobs'
  },
  {
    id: 8,
    title: 'Operationalizing Growth Hacking in a Multi-Billion Euro Retail Environment',
    slug: 'growth-hacking-retail-environment',
    color: '#1a1a3c',
    tag: 'AI Maturity & Capability Building',
    animationType: 'waves'
  },
  {
    id: 9,
    title: 'Preparing for Exit by Transforming Creative Capital into Scalable Revenue Engines',
    slug: 'preparing-for-exit-revenue-engines',
    color: '#3c1a3c',
    tag: 'AI Transformation',
    animationType: 'particles'
  },
  {
    id: 10,
    title: 'Preparing for Exit by Transforming Creative Capital into Scalable Revenue Engines',
    slug: 'preparing-for-exit-revenue-engines-v2',
    color: '#1a3a1a',
    tag: 'Data Activation',
    animationType: 'neon-lines'
  },
  {
    id: 11,
    title: 'Maximizing Commercial Velocity with Precision Email Automation Frameworks',
    slug: 'commercial-velocity-email-automation',
    color: '#2a2a0a',
    tag: 'Modern Marketing',
    animationType: 'radial-pulse'
  },
  {
    id: 12,
    title: 'Architecting a Proprietary Agentic Engine for Autonomous Growth - HOPE',
    slug: 'agentic-engine-autonomous-growth',
    color: '#0a2a2a',
    tag: 'AI Maturity',
    animationType: 'grid'
  }
];

export function getRandomCaseStudies(count: number): CaseStudy[] {
  const shuffled = [...allCaseStudies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
