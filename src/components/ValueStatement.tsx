import { motion } from 'motion/react';
import { 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  Layout, 
  Globe2,
  Heart,
  Sparkles,
  Leaf,
  MessageSquare
} from 'lucide-react';

export default function ValueStatement() {
  const tags = [
    { label: "Commercial Excellence", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { label: "Agentic AI / Agentic Ecosystems", icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: "360° Marketing", icon: <RefreshCw className="w-3.5 h-3.5" /> },
    { label: "AI & Growth Architect", icon: <Layout className="w-3.5 h-3.5" /> },
    { label: "Global Growth Executive", icon: <Globe2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-m3-surface overflow-hidden" id="value-statement">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Content Column (Wise Style) */}
          <div className="order-2 lg:order-1 flex flex-col items-start text-left">
            {/* Tags Container */}
            <div className="flex flex-wrap gap-3 mb-10">
              {tags.map((tag, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-m3-secondary-container text-m3-on-secondary-container rounded-full text-sm font-medium shadow-sm border border-m3-outline/10 hover:bg-m3-primary/10 transition-colors cursor-default"
                >
                  <div className="text-m3-primary">
                    {tag.icon}
                  </div>
                  <span className="tracking-tight">{tag.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Heading - Syne Display */}
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.05, 0.7, 0.1, 1] }}
              className="text-[35px] md:text-[47px] lg:text-[71px] font-display font-medium text-m3-on-surface leading-[1.05] mb-8 tracking-[-0.03em]"
            >
              Catalyzing growth <br />
              at the intersection of <br />
              marketing and AI.
            </motion.h2>

            {/* Body Text - Nunito Sans */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg md:text-xl text-m3-on-surface/60 font-sans leading-relaxed mb-12 max-w-[700px] font-normal"
            >
              <strong className="text-m3-on-surface">Performance marketer turned technical architect</strong><br />
              I bridge the gap between 360° marketing and agentic AI to orchestrate systems that drive measurable ROI. Partnering with leadership teams to embed proprietary customer data models, I move organizations from isolated pilots to durable, enterprise-wide impact.
            </motion.p>

            {/* Core Values Section */}
            <div className="flex flex-col items-start gap-6 mt-4">
              <h3 className="text-sm uppercase tracking-widest font-black text-[#1A102E]">My Core Values</h3>
              <div className="flex flex-wrap gap-4">
                {[
                  { 
                    label: "Kindness & trust", 
                    icon: <Heart className="w-5 h-5 text-red-300" />, 
                    description: "Building relationships on a foundation of empathy and reliability, ensuring every collaboration is meaningful and secure.",
                    animOffset: 0
                  },
                  { 
                    label: "Curiosity & courage", 
                    icon: <Sparkles className="w-5 h-5 text-yellow-300" />, 
                    description: "Constantly questioning the status quo and having the bravery to explore uncharted territories in AI and strategy.",
                    animOffset: 0.5
                  },
                  { 
                    label: "Responsible growth", 
                    icon: <Leaf className="w-5 h-5 text-green-300" />, 
                    description: "Prioritizing sustainable scaling and ethical AI practices that deliver long-term value without compromising integrity.",
                    animOffset: 1
                  },
                  { 
                    label: "Authentic Candor", 
                    icon: <MessageSquare className="w-5 h-5 text-blue-300" />, 
                    description: "Prioritizing honest, direct dialogue over \"consultant-speak\" to build genuine partnerships and real results.",
                    animOffset: 1.5
                  }
                ].map((val, i) => (
                  <div key={i} className="group relative">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-3 px-5 py-3 bg-[#6a52a5] hover:bg-[#5a4295] rounded-2xl transition-colors cursor-help shadow-lg"
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -3, 0],
                          rotate: i % 2 === 0 ? [0, 5, -5, 0] : [0, -5, 5, 0]
                        }}
                        transition={{
                          duration: 3 + val.animOffset,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: val.animOffset
                        }}
                      >
                        {val.icon}
                      </motion.div>
                      <span className="font-bold text-[#EAFF00] text-sm whitespace-nowrap">{val.label}</span>
                    </motion.div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-4 w-64 p-4 bg-[#1A102E] text-[#fdfaff] rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 shadow-2xl translate-y-2 group-hover:translate-y-0">
                      <p className="text-xs leading-relaxed font-sans font-medium">
                        {val.description}
                      </p>
                      <div className="absolute top-full left-6 -mt-2 border-8 border-transparent border-t-[#1A102E]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Media Column (Portrait) */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.05, 0.7, 0.1, 1] }}
              className="relative group w-full max-w-[540px] aspect-[4/5]"
            >
              {/* Background Blob Accents */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-m3-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-m3-tertiary/10 rounded-full blur-[120px] pointer-events-none" />
              
              {/* Outer Glow / Border */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-m3-primary/20 to-m3-tertiary/20 rounded-[58px] blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image Container with M3 Extra-Large corners */}
              <div className="relative h-full w-full overflow-hidden rounded-[56px] bg-m3-surface-variant border border-m3-outline/10 shadow-2xl">
                <img 
                  src="/images/472164386_10170748401095387_7067836675242530090_n.jpg" 
                  alt="Abdullah Malik" 
                  className="w-full h-full object-cover brightness-95 contrast-105 group-hover:scale-[1.03] transition-all duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1200";
                  }}
                />
                
                {/* Subtle Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>
            </motion.div>

            {/* CTA Button centered under image */}
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, backgroundColor: "var(--m3-primary)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 bg-m3-primary text-m3-on-primary rounded-full font-semibold text-lg shadow-xl shadow-m3-primary/15 transition-all flex items-center gap-3 overflow-hidden self-center"
            >
              <span className="relative z-10">Meet Me "Abdullah Malik" 👆</span>
            </motion.button>
          </div>

        </div>
      </div>
    </section>
  );
}
