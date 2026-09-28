import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Target, 
  Map, 
  Rocket, 
  Cpu, 
  Globe, 
  BarChart3, 
  Zap, 
  Database,
  Users,
  Settings,
  ShieldCheck,
  Layout,
  Lightbulb,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';

const faqs = [
  {
    question: "How do Agentic Ecosystems differ from standard AI chatbots?",
    answer: "Chatbots answer questions; Agentic Ecosystems execute tasks. They are autonomous \"digital coworkers\" that manage complex workflows across your marketing and data stacks."
  },
  {
    question: "What is \"Data Activation\" compared to traditional Data Analytics?",
    answer: "Analytics tells you what happened in the past. Activation uses that data in real-time to trigger personalized customer experiences and autonomous growth actions."
  },
  {
    question: "Can AI transformation be integrated into existing legacy MarTech?",
    answer: "Yes. I specialize in orchestrating AI layers—like Salesforce and custom CDPs—to sit atop your current infrastructure, modernizing your stack without requiring a total overhaul."
  },
  {
    question: "PoC vs. MVP: Which one do I need?",
    answer: "A PoC (Proof of Concept) proves technical feasibility internally. An MVP (Minimum Viable Product) is a functional, launchable version designed to deliver real-market feedback and measurable ROI."
  },
  {
    question: "What exactly is a \"Serious MVP\"?",
    answer: "It is a Production-Grade MVP. Unlike \"shaky demos,\" it is built with enterprise security, ethical guardrails, and scalable architecture from Day 1 to ensure immediate business reliability."
  },
  {
    question: "How do you ensure AI remains brand-aligned?",
    answer: "By anchoring systems in your proprietary Brand Identity and Deep Personas. The AI becomes an \"Agentic Twin\" trained specifically on your brand’s unique voice and values."
  },
  {
    question: "Who owns the IP and the custom models?",
    answer: "You do. I architect all systems within your private infrastructure, ensuring your organization owns 100% of the proprietary intelligence and the \"muscle\" to maintain it."
  },
  {
    question: "Why focus on the \"80% People\" aspect of AI transformation?",
    answer: "Technology is only an accelerator. Without cultural adoption, executive guidance, and team upskilling, even the most advanced AI fails to deliver a commercial ROI."
  }
];

const services = [
  {
    id: 'ai-transformation',
    label: 'AI Transformation',
    title: 'TRANSFORMING AI AMBITION INTO SCALABLE ROI.',
    description: 'I guide leadership teams to move beyond theoretical blueprints and "shiny projects." By architecting production-grade AI systems and durable operating models, I ensure your organization achieves a future of automated, data-driven growth and commercial excellence.',
    features: [
      { 
        label: 'AI Transformation Advisory & Strategy', 
        tooltip: 'High-level strategic partnership to align AI initiatives with your core business objectives.',
        icon: <Target className="w-4 h-4 text-[#6d55a7]" />
      },
      { 
        label: 'Strategic Roadmapping & Execution', 
        tooltip: 'Architecting the phase-by-phase journey from initial adoption to enterprise-wide scale.',
        icon: <Map className="w-4 h-4 text-[#6d55a7]" />
      },
      { 
        label: 'Production-Grade Pilot Development', 
        tooltip: 'Designing functional, high-integrity solutions that are built for production from day one.',
        icon: <Rocket className="w-4 h-4 text-[#6d55a7]" />
      },
      { 
        label: 'Agentic Ecosystem Architecture', 
        tooltip: 'Designing the logic and workflows for proprietary AI agents that automate complex commercial tasks.',
        icon: <Cpu className="w-4 h-4 text-[#6d55a7]" />
      },
      { 
        label: 'Commercial Excellence Operating Models', 
        tooltip: 'Re-engineering organizational structures and KPIs to turn AI into a unified, high-velocity growth engine.',
        icon: <Layout className="w-4 h-4 text-[#6d55a7]" />
      },
      { 
        label: 'AI Governance & Ethics Frameworks', 
        tooltip: 'Providing the risk-mitigation and security frameworks required to deploy AI with total regulatory confidence.',
        icon: <ShieldCheck className="w-4 h-4 text-[#6d55a7]" />
      }
    ],
    image: '/images/service-1.webp',
    color: '#1a3c1a'
  },
  {
    id: 'data-activation',
    label: 'Data Activation & Intelligence',
    title: 'Stop Collecting Data. Start Activating It.',
    description: 'Data is a liability until it drives a decision. I bridge the "last mile" between your data infrastructure and real-time commercial execution to architecting the intelligence required to turn raw information into a high-performance engine for 360° growth and retention.',
    features: [
      { 
        label: 'Cross-Channel Performance Marketing', 
        tooltip: 'Strategic oversight and yield-optimization of customer acquisition capital across global digital ecosystems to drive measurable growth.', 
        icon: <Zap className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Activation Planning & Strategy', 
        tooltip: 'Designing high-fidelity roadmaps to transition data from static storage into real-time, high-impact commercial execution.', 
        icon: <Database className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'CRM Ecosystem & MarTech Orchestration', 
        tooltip: 'Unifying and optimizing the commercial tech stack to ensure seamless data flow between Sales, Marketing, and Customer Success.', 
        icon: <Settings className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Agentic Data Integration', 
        tooltip: 'Engineering high-integrity data pipelines that empower autonomous agents to execute complex business logic and real-time decisioning.', 
        icon: <Cpu className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Predictive Customer Intelligence', 
        tooltip: 'Utilizing advanced analytics to anticipate behavioral trends and optimize the customer lifecycle before friction or churn occurs.', 
        icon: <Target className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Commercial Performance Dashboards', 
        tooltip: 'Delivering executive-level visibility into growth metrics, operational efficiency, and the direct ROI of AI-driven initiatives.', 
        icon: <BarChart3 className="w-4 h-4 text-[#6d55a7]" /> 
      }
    ],
    image: '/images/service-4.webp',
    color: '#1a3c1a'
  },
  {
    id: 'modern-marketing',
    label: 'Modern Marketing & Growth',
    title: 'Precision Marketing for the Digital Age.',
    description: 'I bridge the gap between foundational marketing principles like deep persona development and the next era of automation. By combining 360° growth methodologies with proprietary agentic intelligence, I engineer high-conversion funnels that are strategically grounded in human psychology and technologically optimized for real-time scale.',
    features: [
      { 
        label: 'Deep Persona & Behavioral Research', 
        tooltip: 'Grounding every campaign in the fundamentals of human psychology, customer intent, and research-led persona development.', 
        icon: <Users className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Full-Funnel Conversion Orchestration', 
        tooltip: 'Aligning traditional awareness and conversion stages with modern, high-speed digital execution to maximize ROI.', 
        icon: <Layout className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Multi-Market Global Scaling', 
        tooltip: 'Utilizing global growth frameworks to facilitate rapid, localized expansion into international markets.', 
        icon: <Globe className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Agentic Campaign Personalization', 
        tooltip: 'Supercharging traditional messaging by utilizing AI agents to deliver hyper-relevant, 1:1 experiences at a massive scale.', 
        icon: <Zap className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Strategic Account-Based Marketing (ABM)', 
        tooltip: 'Combining high-touch relationship building with intelligence-led precision to capture high-value enterprise accounts.', 
        icon: <Target className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Strategic Brand Positioning & Identity', 
        tooltip: 'Architecting a distinct, intelligence-led brand identity that maintains coherence and trust across global, automated ecosystems.', 
        icon: <Users className="w-4 h-4 text-[#6d55a7]" /> 
      }
    ],
    image: '/images/service-6.webp',
    color: '#1a3c1a'
  },
  {
    id: 'ai-maturity',
    label: 'AI Maturity & Capability Building',
    title: 'BUILD THE CULTURE. OPERATIONALIZE THE FUTURE.',
    description: 'AI success is 20% technology and 80% people. I bridge the "adoption gap" by providing the strategic guidance and hands-on enablement necessary to ensure your organization doesn\'t just deploy AI, it integrates it as a core, durable competitive advantage.',
    features: [
      { 
        label: 'Strategic AI Workshops', 
        tooltip: 'Facilitating high-impact sessions to identify high-value use cases and develop actionable AI roadmaps.', 
        icon: <Users className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Executive Advisory & Guidance', 
        tooltip: 'Providing leadership teams with the strategic clarity and frameworks needed to steer enterprise-wide AI transformation.', 
        icon: <ShieldCheck className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Custom Workforce Enablement', 
        tooltip: 'Designing tailored training and 1:1 enablement sessions to empower teams to work effectively alongside agentic ecosystems.', 
        icon: <Lightbulb className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Center of Excellence (CoE) Design', 
        tooltip: 'Architecting internal hubs to centralize AI knowledge, best practices, and governance for long-term scalability.', 
        icon: <Target className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'Operational Readiness Audits', 
        tooltip: 'Evaluating current infrastructure and talent maturity to identify gaps before large-scale AI deployment begins.', 
        icon: <Search className="w-4 h-4 text-[#6d55a7]" /> 
      },
      { 
        label: 'AI Change Management Strategy', 
        tooltip: 'Navigating the cultural and operational shifts required to transition from legacy workflows to AI-augmented models.', 
        icon: <Map className="w-4 h-4 text-[#6d55a7]" /> 
      }
    ],
    image: '/images/service-3.webp',
    color: '#1a3c1a'
  }
];

export default function ServicesTabs() {
  const [activeTab, setActiveTab] = useState(services[0]);

  // Preload all service images on mount for instant switching
  useEffect(() => {
    services.forEach((service) => {
      const img = new Image();
      img.src = service.image;
    });
  }, []);

  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#6d55a7]" id="services-tabs">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section - Full Width Editorial Alignment */}
        <div className="text-left mb-24 animate-in fade-in slide-in-from-left-4 duration-700">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-7xl font-display font-medium text-[#e8dff8] mb-10 leading-[1.1] tracking-tight max-w-5xl uppercase"
          >
            HOW I ARCHITECT YOUR GROWTH: AI-DRIVEN COMMERCIAL EXCELLENCE.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-[#e8dff8]/80 font-sans leading-relaxed max-w-5xl"
          >
            I partner with your leadership team to lead a comprehensive AI transformation that modernizes your entire customer lifecycle. By orchestrating 360° growth engines and aligning your broader digital transformation goals with production-grade intelligence, I ensure your technology investment translates into a material, measurable impact on your bottom line.
          </motion.p>
        </div>

        {/* Custom Tab Bar - Unified Pill Style like Wise */}
        <div className="flex justify-start mb-4 overflow-x-auto no-scrollbar max-w-full">
          <div className="p-1 bg-black/10 backdrop-blur-sm rounded-full flex gap-1 whitespace-nowrap min-w-max">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveTab(service)}
                className={`px-6 py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-300 relative ${
                  activeTab.id === service.id 
                    ? 'text-white' 
                    : 'text-[#e8dff8]/60 hover:text-[#e8dff8] hover:bg-white/5'
                }`}
              >
                {activeTab.id === service.id && (
                  <motion.div 
                    layoutId="activeTabPalette"
                    className="absolute inset-0 bg-[#6d55a7] shadow-md rounded-full"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{service.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Card - Editorial Palette */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-[#fdfaff] rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-white/10"
            >
              {/* Image Side */}
              <div className="lg:w-1/2 relative min-h-[380px] bg-[#6d55a7] overflow-hidden">
                <img 
                  src={activeTab.image} 
                  alt={activeTab.label}
                  loading="eager"
                  fetchPriority="high"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                    activeTab.id === 'data-activation' ? 'rotate-[4deg] scale-110 object-right' : ''
                  }`}
                />
              </div>

              {/* Text Side - High Contrast */}
              <div className="lg:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-display font-medium text-[#6d55a7] mb-6 leading-tight">
                  {activeTab.title}
                </h3>
                <p className="text-base md:text-lg text-[#78737a] mb-8 leading-relaxed font-sans">
                  {activeTab.description}
                </p>

                {/* Sub-services List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-10">
                  {activeTab.features.map((feature, idx) => (
                    <div key={idx} className="group/item relative flex items-start gap-3 cursor-help">
                      <div className="bg-[#6d55a7]/10 rounded-full p-1 mt-0.5 group-hover/item:bg-[#6d55a7]/20 transition-colors">
                        {feature.icon}
                      </div>
                      <span className="text-[#78737a] font-medium text-sm md:text-base leading-snug border-b border-dotted border-[#78737a]/30">
                        {feature.label}
                      </span>

                      {/* Custom Tooltip */}
                      <div className="absolute bottom-full left-0 mb-3 w-64 p-4 bg-[#1A102E] text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 z-50 pointer-events-none">
                        <div className="relative">
                          {feature.tooltip}
                          {/* Triangle pointer */}
                          <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1A102E]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                 {/* Action Button - Darker styling */}
                 <Link to={activeTab.id === 'ai-transformation' ? '/services/ai-transformation' : activeTab.id === 'data-activation' ? '/services/data-activation-intelligence' : activeTab.id === 'modern-marketing' ? '/services/modern-marketing-growth' : activeTab.id === 'ai-maturity' ? '/services/ai-maturity-capability-building' : '#'}>
                   <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#6d55a7] text-[#e8dff8] rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 w-fit cursor-pointer">
                     <span>Explore {activeTab.label}</span>
                   </button>
                 </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Integrated FAQ Accordion */}
        <div className="mt-20 w-full">
          <FAQAccordion />
        </div>

      </div>
    </section>
  );
}

function FAQAccordion() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="border border-[#e8dff8]/20 rounded-[24px] overflow-hidden bg-black/5 backdrop-blur-sm shadow-xl">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 md:px-8 py-4 md:py-6 text-left hover:bg-white/5 transition-colors group"
      >
        <span className="text-lg md:text-xl font-bold text-[#e8dff8] uppercase tracking-tight">
          FREQUENTLY ADDRESSED QUESTIONS.
        </span>
        <div className={`p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-[#e8dff8] text-[#6d55a7] rotate-180' : 'bg-[#e8dff8]/10 text-[#e8dff8]'}`}>
          <ChevronDown className="w-4 h-4 md:w-5 h-5" />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 md:px-8 pb-8 space-y-1">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-[#e8dff8]/10 last:border-0" id={`faq-${idx}`}>
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full py-4 flex items-center justify-between text-left group"
                  >
                    <span className={`text-sm md:text-base font-bold transition-colors ${activeFaq === idx ? 'text-[#e8dff8]' : 'text-[#e8dff8]/70 group-hover:text-[#e8dff8]'}`}>
                      {faq.question}
                    </span>
                    {activeFaq === idx ? <Minus className="w-4 h-4 text-[#e8dff8]" /> : <Plus className="w-4 h-4 text-[#e8dff8]/40" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-4 text-[#e8dff8]/80 text-xs md:text-sm leading-relaxed font-sans">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
