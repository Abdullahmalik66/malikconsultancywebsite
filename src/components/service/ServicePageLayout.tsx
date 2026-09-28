import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, type Variants } from 'motion/react';
import { Link } from 'react-router-dom';
import CinematicStory, { type CinematicStoryConfig } from '@/components/service/CinematicStory';
import SubServicesShowcase, { type SubServicesShowcaseConfig } from '@/components/service/SubServicesShowcase';
import DecisionQuestionnaire, { type DecisionQuestionnaireConfig } from '@/components/service/DecisionQuestionnaire';
import CaseWork from '@/components/sections/CaseWork';
import LatestInsights from '@/components/sections/LatestInsights';
import WorkedWithSection from '@/components/sections/WorkedWithSection';

export interface ServicePageConfig {
  seo: { title: string; description: string };
  theme: {
    /** Tailwind bg class for the page wrapper, e.g. 'bg-[#08070a]' */
    pageBg: string;
    /** Tailwind bg class for the hero <section> */
    heroBg: string;
    /** Solid + gradient applied as inline style on the hero */
    heroColor: string;
    heroGradient: string;
    /** Tailwind bg classes for the two blurred light washes */
    glowTop: string;
    glowBottom: string;
    /** Tailwind bg + text classes for the primary CTA pill */
    cta: string;
  };
  hero: {
    ariaLabel: string;
    eyebrow: string;
    /** Headline JSX (line breaks + accent spans are part of the design) */
    headline: ReactNode;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  story: { ariaLabel: string; config: CinematicStoryConfig };
  showcase: SubServicesShowcaseConfig;
  questionnaire: DecisionQuestionnaireConfig;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.012, delayChildren: 0.3 },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(3px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.8, ease: 'easeOut' },
  },
};

export default function ServicePageLayout({ config }: { config: ServicePageConfig }) {
  const { seo, theme, hero, story, showcase, questionnaire } = config;
  const words = hero.description.split(' ');

  return (
    <div className={`${theme.pageBg} text-white`}>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <section
        className={`relative min-h-[100svh] md:min-h-[120vh] ${theme.heroBg} flex items-start overflow-hidden pt-36 md:pt-[55vh] pb-16 md:pb-32`}
        style={{ backgroundColor: theme.heroColor, backgroundImage: theme.heroGradient }}
        aria-label={hero.ariaLabel}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className={`absolute top-[20%] left-[10%] w-[50%] h-[50%] ${theme.glowTop} rounded-full blur-[120px]`} />
          <div className={`absolute bottom-[10%] right-[10%] w-[60%] h-[60%] ${theme.glowBottom} rounded-full blur-[140px]`} />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24">
          <div className="max-w-[1750px] mx-auto w-full flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xs font-mono uppercase tracking-[0.35em] text-[#EAFF00] font-bold">{hero.eyebrow}</span>
              <div className="h-px w-8 bg-[#EAFF00]/40" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mb-12 lg:mb-16"
            >
              <h1 className="text-[7vw] sm:text-[6vw] md:text-[5vw] lg:text-[4.5vw] font-display font-medium leading-[0.95] tracking-[-0.04em] uppercase text-white">
                {hero.headline}
              </h1>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-[1100px] z-20 text-left"
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-sans font-normal leading-relaxed text-white/90 tracking-tight flex flex-wrap justify-start">
                {words.map((word, i) => (
                  <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.25em] mb-[0.1em]">
                    {word}
                  </motion.span>
                ))}
              </p>

              <motion.div
                variants={itemVariants}
                className="h-1.5 w-28 bg-[#EAFF00] mt-12 rounded-full shadow-[0_0_15px_rgba(234,255,0,0.3)]"
              />

              <motion.div variants={itemVariants} className="mt-12 md:mt-16">
                <Link to={hero.ctaHref}>
                  <motion.div
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden px-10 py-6 rounded-full ${theme.cta} font-bold text-lg md:text-xl uppercase tracking-[0.2em] cursor-pointer group w-fit shadow-2xl`}
                  >
                    <span className="relative z-10 flex items-center gap-4">{hero.ctaLabel}</span>
                    <motion.div
                      variants={{ hover: { x: 0 } }}
                      initial={{ x: '-101%' }}
                      className="absolute inset-0 bg-[#EAFF00]"
                      transition={{ duration: 0.4, ease: 'circOut' }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section aria-label={story.ariaLabel}>
        <CinematicStory config={story.config} />
      </section>

      <SubServicesShowcase config={showcase} />
      <WorkedWithSection />
      <DecisionQuestionnaire config={questionnaire} />
      <CaseWork />
      <LatestInsights />
    </div>
  );
}
