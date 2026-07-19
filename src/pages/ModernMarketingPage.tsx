import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import MarketingCinematicStory from '../components/MarketingCinematicStory';
import MarketingSubServicesShowcase from '../components/MarketingSubServicesShowcase';
import MarketingDecisionQuestionnaire from '../components/MarketingDecisionQuestionnaire';
import CaseWork from '../components/CaseWork';
import LatestInsights from '../components/LatestInsights';
import WorkedWithSection from '../components/WorkedWithSection';

export default function ModernMarketingPage() {
  const descriptionText = "I help organisations move beyond disconnected campaigns and build full-funnel growth systems that align strategy, execution, and measurement into one continuous engine.";
  const words = descriptionText.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.012,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      filter: "blur(3px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.8,
        ease: "easeOut" as const,
      }
    }
  };

  const scrollToContent = () => {
    const el = document.getElementById('sub-services-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#120a06] text-white">
      {/* SEO Best Practices - Metadata & Title */}
      <Helmet>
        <title>Modern Marketing & Growth - Malik Consultancy</title>
        <meta 
          name="description" 
          content="Turning marketing into a scalable growth system. I help organisations align full-funnel strategy, execution, CRO, and performance marketing into one continuous revenue engine." 
        />
      </Helmet>

      {/* Hero Section - Deep warm bronze/brown layered gradient */}
      <section 
        className="relative min-h-[100svh] md:min-h-[120vh] flex items-start overflow-hidden pt-36 md:pt-[55vh] pb-16 md:pb-32"
        style={{ background: 'linear-gradient(135deg, #24170F 0%, #7A4E2D 45%, #3B2416 100%)' }}
        aria-label="Modern Marketing & Growth Introduction"
      >
        {/* Soft background light wash overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-[#F5E8D0]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-[#EEDDD2]/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24">
          <div className="max-w-[1750px] mx-auto w-full flex flex-col items-start">

            {/* Accent tag line */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xs font-mono uppercase tracking-[0.35em] text-[#EAFF00] font-bold">Modern Marketing & Growth</span>
              <div className="h-px w-8 bg-[#EAFF00]/40" />
            </motion.div>

            {/* Neon Yellow / White Heading */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mb-12 lg:mb-16"
            >
              <h1 className="text-[7vw] sm:text-[6vw] md:text-[5vw] lg:text-[4.5vw] font-display font-medium leading-[0.95] tracking-[-0.04em] uppercase text-white">
                TURNING MARKETING <br />
                INTO A <span className="text-[#EAFF00]">SCALABLE</span> <br />
                <span className="text-[#EAFF00]">GROWTH SYSTEM.</span>
              </h1>
            </motion.div>
            
            {/* Word-by-Word Description */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-[1100px] z-20 text-left"
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-sans font-normal leading-relaxed text-white/90 tracking-tight flex flex-wrap justify-start">
                {words.map((word, i) => (
                  <motion.span 
                    key={i} 
                    variants={wordVariants}
                    className="inline-block mr-[0.25em] mb-[0.1em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </p>
              
              {/* Neon accent shadow line */}
              <motion.div 
                variants={itemVariants}
                className="h-1.5 w-28 bg-[#EAFF00] mt-12 rounded-full shadow-[0_0_15px_rgba(234,255,0,0.3)]" 
              />

              {/* CTAs */}
              <motion.div 
                variants={itemVariants}
                className="mt-12 md:mt-16"
              >
                <Link to="/reach-me">
                  <motion.div
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden px-10 py-6 rounded-full bg-[#FBF7F2] text-[#24170F] font-bold text-lg md:text-xl uppercase tracking-[0.2em] cursor-pointer group w-fit shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      Book Growth Strategy Session
                    </span>
                    <motion.div 
                      variants={{
                        hover: { x: 0 }
                      }}
                      initial={{ x: "-101%" }}
                      className="absolute inset-0 bg-[#EAFF00]"
                      transition={{ duration: 0.4, ease: "circOut" }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cinematic Story Section */}
      <section aria-label="Interactive Growth Narrative">
        <MarketingCinematicStory />
      </section>

      {/* Sub-services Showcase */}
      <div id="sub-services-section">
        <MarketingSubServicesShowcase />
      </div>

      {/* Client Showcase Orbit Grid */}
      <WorkedWithSection />

      {/* Conversational Decision Questionnaire Section */}
      <MarketingDecisionQuestionnaire />

      {/* Case Studies Section */}
      <CaseWork />

      {/* Blog Section */}
      <LatestInsights />
    </div>
  );
}
