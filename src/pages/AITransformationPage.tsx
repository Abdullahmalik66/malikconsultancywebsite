import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import CinematicStory from '../components/CinematicStory';
import SubServicesShowcase from '../components/SubServicesShowcase';
import DecisionQuestionnaire from '../components/DecisionQuestionnaire';
import CaseWork from '../components/CaseWork';
import LatestInsights from '../components/LatestInsights';
import WorkedWithSection from '../components/WorkedWithSection';

export default function AITransformationPage() {
  const headingText = "Transforming AI ambition into scalable business systems.";
  const descriptionText = "I partner with enterprise leaders and growth teams to design, architect, and scale production-grade agentic AI ecosystems. By grounding AI models in proprietary organizational intelligence and connecting them to real-time data pipelines, we eliminate pilot-stage bottlenecks to drive measurable commercial velocity, predictable performance, and sustainable ROI.";
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
        ease: "easeOut",
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
        ease: "easeOut",
      }
    }
  };

  return (
    <div className="bg-[#08070a] text-white">
      {/* SEO Best Practices - Metadata & Title */}
      <Helmet>
        <title>AI Transformation Service - Malik Consultancy</title>
        <meta 
          name="description" 
          content="Transform AI ambition into scalable ROI. I architect production-grade pilot systems and agentic operating models built for sustainable business growth." 
        />
      </Helmet>

      {/* Hero Section - Matching homepage hero visual language */}
      <section 
        className="relative min-h-[120vh] bg-[#1A102E] flex items-start overflow-hidden pt-96 md:pt-[55vh] pb-32"
        aria-label="AI Transformation Introduction"
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-black/20 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24">
          <div className="max-w-[1750px] mx-auto w-full flex flex-col items-start">

            {/* Neon Yellow / White Heading */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mb-12 lg:mb-16"
            >
              <h1 className="text-[7vw] sm:text-[6vw] md:text-[5vw] lg:text-[4.5vw] font-display font-medium leading-[0.95] tracking-[-0.04em] uppercase text-white">
                <span className="text-[#EAFF00]">TRANSFORMING AI AMBITION</span> <br />
                INTO SCALABLE BUSINESS <br />
                SYSTEMS.
              </h1>
            </motion.div>
            
            {/* Word-by-Word Description */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-[1100px] z-20"
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-sans font-normal leading-relaxed text-white/90 tracking-tight flex flex-wrap">
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

              {/* Glowing Strategy CTA */}
              <motion.div 
                variants={itemVariants}
                className="mt-12 md:mt-16"
              >
                <Link to="/reach-me">
                  <motion.div
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden px-10 py-6 rounded-full bg-[#e8dff8] text-[#1A102E] font-bold text-lg md:text-xl uppercase tracking-[0.2em] cursor-pointer group w-fit shadow-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      Book AI Strategy Session
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

      {/* Cinematic Story Section (Core Experience) */}
      <section aria-label="Interactive AI Narrative Journey">
        <CinematicStory />
      </section>

      {/* Sub-services Showcase (Structured OS Section) */}
      <SubServicesShowcase />

      {/* Client Showcase 1 Orbit */}
      <WorkedWithSection />

      {/* Conversational Decision Questionnaire Section */}
      <DecisionQuestionnaire />

      {/* Case Studies Section */}
      <CaseWork />

      {/* Blog Section */}
      <LatestInsights />
    </div>
  );
}
