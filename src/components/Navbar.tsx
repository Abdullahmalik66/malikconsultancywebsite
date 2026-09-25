import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Terminal, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const mainNavItems = [
  {
    label: 'Services',
    children: [
      { label: 'AI Transformation', path: '/services/ai-transformation' },
      { label: 'Data Activation & Intelligence', path: '/services/data-activation-intelligence' },
      { label: 'Modern Marketing & Growth', path: '/services/modern-marketing-growth' },
      { label: 'AI Maturity & Capability Building', path: '/services/ai-maturity-capability-building' }
    ]
  },
  { label: 'Case Work', path: '/case-work' },
  { label: 'Testimonials', path: '/testimonials' },
  {
    label: 'Resources',
    children: [
      { label: 'My writings', path: '/my-writings' },
      { label: 'Agents', path: '#' }
    ]
  }
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isPlaygroundActive = location.pathname === '/my-life-playground' || location.pathname === '/my-life-story';

  return (
    <>
      <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 md:px-6 pointer-events-none">
        <motion.nav 
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1440px] flex items-center justify-between gap-2 sm:gap-2.5 pointer-events-auto"
          id="main-nav"
        >

          {/* ==========================================================
              1. LEFT: BRAND LOGO (Stacked Serif Logo Image)
             ========================================================== */}
          <Link 
            to="/" 
            className="flex items-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-md transition-all group cursor-pointer z-50"
          >
            <img 
              src="/am-serif-logo-transparent.png" 
              alt="Abdullah Malik Consultancy Logo" 
              className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain mix-blend-multiply transition-transform group-hover:scale-105"
            />
          </Link>

          {/* ==========================================================
              2. RIGHT NAVIGATION GROUP (Playground + Main Nav Capsule tightly linked)
             ========================================================== */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* My Life Playground Tab */}
            <Link to="/my-life-story">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-sans font-bold text-sm sm:text-base transition-all duration-300 shadow-sm cursor-pointer border ${
                  isPlaygroundActive
                    ? 'bg-[#C6B3D1] text-[#1A102E] border-[#C6B3D1] shadow-md font-extrabold'
                    : 'bg-[#E9FF32] text-[#1A102E] border-[#E9FF32]/50 hover:bg-[#C6B3D1] hover:text-[#1A102E] hover:border-[#C6B3D1]'
                }`}
              >
                <Terminal className="w-4 h-4 text-[#1A102E]" />
                <span>My Life Playground</span>
              </motion.button>
            </Link>

            {/* Main Navigation Capsule */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#F6F2F9]/95 dark:bg-[#1D1B20]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-m3-on-surface">
              
              {mainNavItems.map((item) => {
                const isItemActive = item.path ? location.pathname === item.path : false;
                const isChildActive = item.children?.some(c => location.pathname === c.path);
                const isActive = isItemActive || isChildActive;

                return (
                  <div 
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {item.path ? (
                      <Link to={item.path} className={`
                        flex items-center gap-1 px-5 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-300 relative
                        ${isActive || activeDropdown === item.label
                          ? 'bg-[#C6B3D1] text-[#1A102E] shadow-sm' 
                          : 'text-[#1D1B20]/85 dark:text-white/85 hover:text-[#1A102E] hover:bg-[#C6B3D1]'}
                      `}>
                        {item.label}
                      </Link>
                    ) : (
                      <button className={`
                        flex items-center gap-1 px-5 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-300 relative cursor-pointer
                        ${isActive || activeDropdown === item.label 
                          ? 'bg-[#C6B3D1] text-[#1A102E] shadow-sm' 
                          : 'text-[#1D1B20]/85 dark:text-white/85 hover:text-[#1A102E] hover:bg-[#C6B3D1]'}
                      `}>
                        {item.label}
                        {item.children && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    )}

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {item.children && activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 p-2 min-w-[260px] bg-[#F6F2F9] dark:bg-[#1D1B20] border border-black/10 dark:border-white/20 rounded-2xl shadow-2xl z-50 text-m3-on-surface"
                        >
                          {item.children.map((child) => (
                            <Link 
                              key={child.label} 
                              to={child.path}
                              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                                location.pathname === child.path
                                  ? 'bg-[#C6B3D1] text-[#1A102E]'
                                  : 'hover:bg-[#C6B3D1]/60 hover:text-[#1A102E]'
                              }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* ==========================================================
                  4. REACH ME BUTTON (#1A102E -> Simple Hover #E9FF32)
                 ========================================================== */}
              <div className="ml-1 pl-1 border-l border-black/10 dark:border-white/15">
                <Link to="/reach-me">
                  <button
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-300 bg-[#1A102E] text-white hover:bg-[#E9FF32] hover:text-[#1A102E] shadow-md cursor-pointer ${
                      location.pathname === '/reach-me'
                        ? 'bg-[#E9FF32] text-[#1A102E] font-extrabold'
                        : ''
                    }`}
                    id="reach-me-btn"
                  >
                    <span>Reach me</span>
                    <Send className="w-4 h-4" />
                  </button>
                </Link>
              </div>

            </div>
          </div>

          {/* ==========================================================
              MOBILE / TABLET CONTROLS (< lg screens)
             ========================================================== */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Compact Playground button on mobile */}
            <Link to="/my-life-story">
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#E9FF32] text-[#1A102E] hover:bg-[#C6B3D1] text-xs sm:text-sm font-bold shadow-xs transition-colors">
                <Terminal className="w-4 h-4 text-[#1A102E]" />
                <span className="hidden sm:inline">Playground</span>
              </button>
            </Link>

            {/* Mobile Hamburger toggle */}
            <button
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#F6F2F9]/95 dark:bg-[#1D1B20]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 text-[#1D1B20] dark:text-white hover:bg-black/5 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </motion.nav>
      </div>

      {/* ==========================================================
          MOBILE FULL-SCREEN OVERLAY DRAWER (< lg screens)
         ========================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-40 lg:hidden bg-[#F6F2F9]/98 dark:bg-[#1D1B20]/98 backdrop-blur-2xl overflow-y-auto"
            id="mobile-menu-overlay"
          >
            {/* Spacer for top navbar */}
            <div className="h-28" />

            <nav className="px-6 pb-12 max-w-md mx-auto">
              
              {/* Highlight Card: My Life Playground */}
              <div className="mb-6">
                <Link
                  to="/my-life-story"
                  className="flex items-center justify-between p-4.5 rounded-2xl bg-[#E9FF32] text-[#1A102E] shadow-md font-bold text-base hover:bg-[#C6B3D1] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#1A102E] text-white">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div>My Life Playground</div>
                      <div className="text-xs font-normal opacity-90">Interactive terminal & portfolio</div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Main Nav Items */}
              {mainNavItems.map((item) => (
                <div key={item.label} className="border-b border-m3-outline/10">
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`block py-4 text-lg font-bold transition-colors ${
                        location.pathname === item.path
                          ? 'text-[#6750A4] dark:text-[#D0BCFF]'
                          : 'text-m3-on-surface'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        className="w-full flex items-center justify-between py-4 text-lg font-bold text-m3-on-surface cursor-pointer"
                        onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                      >
                        {item.label}
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.label && item.children && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-3 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.label}
                                  to={child.path}
                                  className={`block py-3 px-4 text-base rounded-xl transition-colors ${
                                    location.pathname === child.path
                                      ? 'bg-[#C6B3D1] text-[#1A102E] font-bold'
                                      : 'text-m3-on-surface/70 hover:bg-[#C6B3D1]/50'
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}

              {/* Mobile Reach Me CTA */}
              <div className="mt-8">
                <Link
                  to="/reach-me"
                  className="flex items-center justify-center gap-2.5 w-full text-center py-4 bg-[#1A102E] text-white hover:bg-[#E9FF32] hover:text-[#1A102E] font-extrabold text-lg rounded-full shadow-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Reach me</span>
                  <Send className="w-5 h-5" />
                </Link>
              </div>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
