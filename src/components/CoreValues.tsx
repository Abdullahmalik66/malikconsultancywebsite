import { motion, TargetAndTransition } from 'motion/react';
import { Heart, Sparkles, Sprout, LucideIcon } from 'lucide-react';

interface Value {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  animation: TargetAndTransition;
}

const values: Value[] = [
  {
    title: "Kindness & trust",
    description: "Building relationships on a foundation of empathy and reliability, ensuring every collaboration is meaningful and secure.",
    icon: Heart,
    color: "#FF6B6B",
    animation: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  },
  {
    title: "Curiosity & courage",
    description: "Constantly questioning the status quo and having the bravery to explore uncharted territories in AI and strategy.",
    icon: Sparkles,
    color: "#4ECDC4",
    animation: {
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 4, repeat: Infinity, ease: "linear" }
    }
  },
  {
    title: "Responsible growth",
    description: "Prioritizing sustainable scaling and ethical AI practices that deliver long-term value without compromising integrity.",
    icon: Sprout,
    color: "#45B649",
    animation: {
      y: [0, -8, 0],
      rotate: [-5, 5, -5],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  }
];

export default function CoreValues() {
  return (
    <section className="py-32 bg-[#F8F7FA]" id="core-values">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 text-left"
        >
          <h2 className="text-5xl md:text-6xl lg:text-[72px] font-display font-bold text-[#1a1a1a] uppercase tracking-[-0.04em] mb-8">
            My core values
          </h2>
          <p className="text-xl md:text-2xl text-[#1a1a1a]/40 max-w-2xl font-sans leading-tight">
            The principles that guide my work and partnerships.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8, ease: [0.05, 0.7, 0.1, 1] }}
              className="bg-[#EFEFF2] rounded-[48px] p-12 flex flex-col items-start text-left transition-transform hover:-translate-y-2 duration-500 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#D1D1D6]/30 flex items-center justify-center mb-10 shadow-sm transition-shadow group-hover:shadow-md">
                <motion.div animate={value.animation}>
                  <value.icon className="w-8 h-8 text-[#1a1a1a]" />
                </motion.div>
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-medium text-[#1a1a1a] mb-6 leading-tight">
                {value.title}
              </h3>
              
              <p className="text-[#1a1a1a]/60 leading-relaxed text-lg">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
