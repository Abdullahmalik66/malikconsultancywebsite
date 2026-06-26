import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getAllClientShowcase2Logos, getClientShowcase2Settings, ClientShowcase2LogoItem } from "../lib/firebase/cms";

interface StaticLogo {
  name: string;
  src: string;
  padding: string;
  rowIndex: number;
  sortOrder: number;
}

// Mockup static fallback logos matching image layout structure
const fallbackLogos: StaticLogo[] = [
  // Row 1 (Index 0)
  { name: "Google", src: "/images/logos/vtt.png", padding: "p-3", rowIndex: 0, sortOrder: 0 },
  { name: "Prismic", src: "/images/logos/adpro.svg", padding: "p-2", rowIndex: 0, sortOrder: 1 },
  { name: "Netlify", src: "/images/logos/quieton.jpeg", padding: "p-3", rowIndex: 0, sortOrder: 2 },
  { name: "Lattice", src: "/images/logos/mercedes-benz-logo-png_seeklogo-190348.png", padding: "p-3.5", rowIndex: 0, sortOrder: 3 },
  // Row 2 (Index 1)
  { name: "Attio", src: "/images/logos/hd-vodafone-logo-transparent-background-701751694713984m4g61ghlmo.png", padding: "p-3.5", rowIndex: 1, sortOrder: 0 },
  { name: "Clearbit", src: "/images/logos/Nissan.png", padding: "p-3", rowIndex: 1, sortOrder: 1 },
  { name: "Hotjar", src: "/images/logos/pirelli-logo.png", padding: "p-3.5", rowIndex: 1, sortOrder: 2 },
  { name: "Draftbit", src: "/images/logos/Deutsche_Giganetz_logo.svg.png", padding: 'p-3', rowIndex: 1, sortOrder: 3 },
  // Row 3 (Index 2)
  { name: "Gem", src: "/images/logos/Neste_logo.png", padding: "p-3", rowIndex: 2, sortOrder: 0 },
  { name: "Hopin", src: "/images/logos/swarovski-logo.png", padding: "p-3", rowIndex: 2, sortOrder: 1 },
  { name: "Outline", src: "/images/logos/iloq.png", padding: "p-3", rowIndex: 2, sortOrder: 2 },
  { name: "Help Scout", src: "/images/logos/Vaisala_logo.svg.png", padding: "p-4", rowIndex: 2, sortOrder: 3 }
];

export default function ClientShowcase2() {
  const [dbLogos, setDbLogos] = useState<ClientShowcase2LogoItem[]>([]);
  const [title, setTitle] = useState("Trusted by our customers & partners");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [logosData, settingsData] = await Promise.all([
          getAllClientShowcase2Logos(),
          getClientShowcase2Settings()
        ]);

        if (active) {
          setDbLogos(logosData.filter(l => l.active));
          setTitle(settingsData.title);
          setDescription(settingsData.description || "");
        }
      } catch (err) {
        console.error("Failed to load Showcase 2 data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Filter & group logos by row index (supporting rows 0, 1, 2, 3)
  const getRowLogos = (rowIndex: number) => {
    const list = dbLogos.filter(l => l.rowIndex === rowIndex);
    if (list.length > 0) {
      return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    // Fallback to static mock database
    return fallbackLogos.filter(l => l.rowIndex === rowIndex).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const rows = [0, 1, 2, 3].map(rIdx => getRowLogos(rIdx)).filter(r => r.length > 0);

  return (
    <section className="bg-[#F8F7FA] dark:bg-[#16151A] py-24 px-6 md:px-12 lg:px-24 border-t border-m3-outline/5 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-[1440px] mx-auto bg-white dark:bg-[#1d1b20] border border-m3-outline/10 dark:border-m3-outline/20 rounded-[48px] p-8 md:p-12 lg:p-16 shadow-2xl shadow-black/5 relative overflow-hidden transition-colors duration-500">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          
          {/* Left Column: Heading & Text */}
          <div className="lg:col-span-4 flex flex-col justify-center pr-0 lg:pr-8 relative gap-4">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-display font-medium text-m3-on-surface leading-tight tracking-tight dark:text-white"
            >
              {title}
            </motion.h2>

            {description && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-sm md:text-base text-m3-on-surface/60 font-sans leading-relaxed dark:text-white/60"
              >
                {description}
              </motion.p>
            )}

            {/* Vertical Line on Desktop */}
            <div className="hidden lg:block absolute right-0 top-4 bottom-4 w-px bg-m3-outline/15 dark:bg-white/10" />
          </div>

          {/* Right Column: Grid Rows with Dividers */}
          <div className="lg:col-span-8 flex flex-col justify-center divide-y divide-m3-outline/10 dark:divide-white/10 select-none">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-m3-on-surface/50 text-sm">
                <span className="w-6 h-6 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mb-3" />
                <span>Loading grid showcase...</span>
              </div>
            ) : (
              rows.map((rowLogos, rowIndex) => (
                <div 
                  key={`row-${rowIndex}`}
                  className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-8 first:pt-2 last:pb-2"
                >
                  {rowLogos.map((logo, logoIdx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: logoIdx * 0.08 }}
                      key={logo.id || `static-${rowIndex}-${logoIdx}`}
                      className="group flex items-center justify-center h-20 relative cursor-pointer"
                    >
                      <div className="w-full h-full flex items-center justify-center hover:scale-105 transition-all duration-300 relative z-10">
                        <img 
                          src={logo.src || (logo as any).logoUrl} 
                          alt={logo.name} 
                          className={`max-w-[140px] max-h-full object-contain ${logo.padding} grayscale opacity-75 dark:brightness-0 dark:invert group-hover:grayscale-0 group-hover:opacity-100 group-hover:dark:brightness-100 group-hover:dark:invert-0 transition-all duration-500`}
                          loading="lazy"
                        />
                      </div>

                      {/* Client Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1A102E] dark:bg-[#d0bcff] text-white dark:text-[#1A102E] text-[10px] font-bold uppercase tracking-wider rounded-md opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md whitespace-nowrap z-50">
                        {logo.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
