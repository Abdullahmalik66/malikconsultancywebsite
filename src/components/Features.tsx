import { motion } from 'motion/react';
import { Zap, Shield, Sparkles, Layers } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "AI Transformation",
    description: "Built for speed with zero bloat. We optimize every frame for 60fps interaction.",
    color: "bg-m3-primary text-m3-on-primary"
  },
  {
    icon: Layers,
    title: "Data Activation",
    description: "Leveraging the power of React 19 and Framer Motion for complex ui sequences.",
    color: "bg-m3-secondary-container text-m3-on-secondary-container"
  },
  {
    icon: Sparkles,
    title: "Modern Marketing",
    description: "Physics-based animations that feel natural to the touch. No robotic easing.",
    color: "bg-m3-tertiary text-m3-on-tertiary"
  },
  {
    icon: Shield,
    title: "AI Maturity",
    description: "Accessible and scalable components that look great on any device or viewport.",
    color: "bg-m3-outline text-m3-surface"
  }
];

export default function Features() {
  return (
    <section className="px-6 md:px-12 py-32 bg-m3-surface" id="features-section">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-medium mb-6 text-m3-on-surface tracking-tighter uppercase italic">Services</h2>
            <p className="text-m3-on-surface/60 text-lg font-sans">Strategic implementation of tomorrow's technology, shaped for human interaction today.</p>
          </div>
          <div className="font-mono text-m3-outline text-sm tracking-widest">
            SERVICES / 04
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 bg-m3-secondary-container/20 border border-m3-outline/10 hover:border-m3-primary/30 hover:bg-m3-secondary-container/40 transition-all rounded-[28px] group"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-md shadow-m3-primary/5`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-4 tracking-tight text-m3-on-surface italic uppercase">{feature.title}</h3>
              <p className="text-m3-on-surface/60 font-sans leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
