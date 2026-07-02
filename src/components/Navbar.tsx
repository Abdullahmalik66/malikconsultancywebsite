import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Services',
    children: [
      { label: 'AI Transformation', path: '/services/ai-transformation' },
      { label: 'Data Activation & Intelligence', path: '#' },
      { label: 'Modern Marketing & Growth', path: '#' },
      { label: 'AI Maturity & Capability Building', path: '#' }
    ]
  },
  { label: 'Case work', path: '/case-work' },
  { label: 'Testimonials', path: '/testimonials' },
  {
    label: 'Resources',
    children: [
      { label: 'My writings', path: '/my-writings' },
      { label: 'Agents', path: '#' }
    ]
  },
  { label: 'My life story', path: '#' }
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBgClass = 'bg-m3-surface/95 backdrop-blur-xl border-m3-outline/20 shadow-lg text-m3-on-surface';
  const logoBgClass = 'bg-m3-primary text-m3-on-primary';

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex items-center gap-2 md:gap-4 px-4 py-2 rounded-full border transition-all duration-500 ${navBgClass}`}
        id="main-nav"
      >

        {/* Logo */}
        <Link to="/" className={`flex items-center justify-center w-10 h-10 rounded-full font-display font-bold text-sm tracking-tighter transition-colors duration-500 ${logoBgClass}`}>
          AM
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div 
              key={item.label}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {item.path ? (
                <Link to={item.path} className={`
                  flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeDropdown === item.label || location.pathname === item.path
                    ? 'bg-m3-secondary-container text-m3-on-secondary-container' 
                    : 'hover:bg-m3-on-surface/5'}
                `}>
                  {item.label}
                </Link>
              ) : (
                <button className={`
                  flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeDropdown === item.label 
                    ? 'bg-m3-secondary-container text-m3-on-secondary-container' 
                    : 'hover:bg-m3-on-surface/5'}
                `}>
                  {item.label}
                  {item.children && <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
                </button>
              )}

              <AnimatePresence>
                {item.children && activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 p-2 min-w-[200px] bg-m3-surface border border-m3-outline/20 rounded-2xl shadow-xl z-50 text-m3-on-surface"
                  >
                    {item.children.map((child) => (
                      <Link 
                        key={child.label} 
                        to={child.path}
                        className="block w-full text-left px-4 py-3 rounded-xl text-sm hover:bg-m3-secondary-container transition-colors whitespace-nowrap"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Theme Toggle & CTA */}
        <div className="flex items-center gap-2">
          <Link to="/reach-me">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all duration-500 bg-m3-primary text-m3-on-primary cursor-pointer ${
                location.pathname === '/reach-me'
                  ? 'ring-4 ring-m3-primary/35 ring-offset-2 ring-offset-m3-surface scale-105 shadow-xl'
                  : ''
              }`}
              id="reach-me-btn"
            >
              Reach me
            </motion.button>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}

