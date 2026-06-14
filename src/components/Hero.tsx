import { motion, Variants } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const descriptionText = "I partner with leadership teams to architect 360-degree growth engines that bridge the gap between technical AI data and commercial excellence. By engineering proprietary agentic ecosystems, I transform the entire customer lifecycle from performance marketing and demand generation to CRM automation into a scalable, production-grade advantage.";
  const words = descriptionText.split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
        delayChildren: 0.4,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.0,
        ease: "easeOut",
      }
    }
  };

  return (
    <div className="relative min-h-[150vh] bg-[#1A102E] flex items-start overflow-hidden pt-96 md:pt-[55vh] pb-32">
      {/* Subtle mesh background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[60%] h-[60%] bg-black/20 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-24">
        <div className="max-w-[1750px] mx-auto w-full flex flex-col items-start">
          
          {/* Neon Yellow Heading */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mb-16 lg:mb-24"
          >
            <h1 className="text-[8vw] sm:text-[7vw] md:text-[6vw] lg:text-[5.5vw] font-display font-medium leading-[0.9] tracking-[-0.04em] text-white uppercase break-words">
              <span className="text-[#EAFF00]">WELCOME TO THE SPACE</span> <br />
              WHERE STRATEGIC MARKETING <br />
              MEETS AGENTIC AI <br />
              INTELLIGENCE.
            </h1>
          </motion.div>
          
          {/* High-visibility Description with Staggered Word Animation */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1100px] z-20"
          >
            <p className="text-2xl md:text-3xl lg:text-4xl font-sans font-normal leading-tight text-white tracking-tight drop-shadow-md flex flex-wrap">
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
            
            {/* Brand Accent */}
            <motion.div 
              variants={itemVariants}
              className="h-2 w-32 bg-[#EAFF00] mt-12 rounded-full shadow-[0_0_20px_rgba(234,255,0,0.4)]" 
            />

            {/* CTA Section */}
            <motion.div 
              variants={itemVariants}
              className="mt-16 md:mt-24"
            >
              <Link to="/reach-me">
                <motion.div
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden px-10 py-6 rounded-full bg-[#e8dff8] text-[#1A102E] font-bold text-lg md:text-xl uppercase tracking-[0.2em] cursor-pointer group w-fit shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    Start Your Transformation
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
    </div>
  );
}
