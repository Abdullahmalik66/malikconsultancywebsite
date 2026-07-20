import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Terminal } from 'lucide-react';
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
      <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 md:px-8 pointer-events-none">
        <motion.nav 
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1360px] flex items-center justify-between gap-3 pointer-events-auto"
          id="main-nav"
        >

          {/* ==========================================================
              LEFT: BRAND LOGO (New Teal Ribbon AM Monogram Logo)
             ========================================================== */}
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#F4EFF7]/95 dark:bg-[#1D1B20]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <img 
              src="/new-am-logo-transparent.png" 
              alt="Abdullah Malik Logo" 
              className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs sm:text-sm tracking-wider text-[#1D1B20] dark:text-white uppercase leading-none">
                ABDULLAH MALIK
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[#009688] dark:text-[#00b2a1] uppercase font-semibold leading-tight mt-0.5">
                CONSULTANCY
              </span>
            </div>
          </Link>

          {/* ========================================================
              MIDDLE 1: MY LIFE PLAYGROUND PILL (Matching Picture 1 & 2)
             ======================================================== */}
          <div className="hidden lg:flex items-center">
            <Link to="/my-life-playground">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all duration-300 shadow-sm border ${
                  isPlaygroundActive
                    ? 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4A4458] dark:text-[#E8DEF8] border-[#6750A4]/20 shadow-md'
                    : 'bg-[#F4EFF7]/95 dark:bg-[#1D1B20]/95 text-[#1D1B20] dark:text-white border-black/5 dark:border-white/10 hover:bg-[#E8DEF8]/60 dark:hover:bg-[#4A4458]/50'
                } backdrop-blur-xl cursor-pointer`}
              >
                <div className={`p-1 rounded-md ${isPlaygroundActive ? 'bg-[#6750A4] text-white' : 'bg-[#6750A4]/10 text-[#6750A4] dark:bg-[#D0BCFF]/20 dark:text-[#D0BCFF]'}`}>
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <span>My Life Playground</span>
              </motion.button>
            </Link>
          </div>

          {/* ========================================================
              MIDDLE 2: MAIN NAVIGATION PILL WITH EMBEDDED CTA (Picture 1 & 2)
             ======================================================== */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#F4EFF7]/95 dark:bg-[#1D1B20]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm text-m3-on-surface">
              
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
                        flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative
                        ${isActive || activeDropdown === item.label
                          ? 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4A4458] dark:text-[#E8DEF8] shadow-xs' 
                          : 'text-[#1D1B20]/80 dark:text-white/80 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}
                      `}>
                        {item.label}
                      </Link>
                    ) : (
                      <button className={`
                        flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative cursor-pointer
                        ${isActive || activeDropdown === item.label 
                          ? 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4A4458] dark:text-[#E8DEF8] shadow-xs' 
                          : 'text-[#1D1B20]/80 dark:text-white/80 hover:text-[#1D1B20] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}
                      `}>
                        {item.label}
                        {item.children && (
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
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
                          className="absolute top-full left-0 mt-2 p-2 min-w-[240px] bg-m3-surface border border-m3-outline/20 rounded-2xl shadow-xl z-50 text-m3-on-surface"
                        >
                          {item.children.map((child) => (
                            <Link 
                              key={child.label} 
                              to={child.path}
                              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                location.pathname === child.path
                                  ? 'bg-[#E8DEF8] text-[#1D192B] font-semibold dark:bg-[#4A4458] dark:text-[#E8DEF8]'
                                  : 'hover:bg-m3-secondary-container/60'
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

              {/* Reach Me CTA embedded inside the Nav Capsule (Picture 1) */}
              <div className="ml-1 pl-1 border-l border-black/10 dark:border-white/15">
                <Link to="/reach-me">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 bg-[#1C0099] hover:bg-[#150075] dark:bg-[#D0BCFF] dark:text-[#381E72] text-white cursor-pointer ${
                      location.pathname === '/reach-me'
                        ? 'ring-2 ring-[#1C0099]/40 ring-offset-1 ring-offset-m3-surface scale-105 shadow-xl'
                        : ''
                    }`}
                    id="reach-me-btn"
                  >
                    Reach me
                  </motion.button>
                </Link>
              </div>

            </div>
          </div>

          {/* ========================================================
              MOBILE / TABLET TOP CONTROLS (< lg screens)
             ======================================================== */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Compact Playground button on mobile */}
            <Link to="/my-life-playground">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#E8DEF8] dark:bg-[#4A4458] text-[#1D192B] dark:text-[#E8DEF8] text-xs font-semibold shadow-xs">
                <Terminal className="w-3.5 h-3.5 text-[#6750A4] dark:text-[#D0BCFF]" />
                <span className="hidden sm:inline">Playground</span>
              </button>
            </Link>

            {/* Mobile Hamburger toggle */}
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F4EFF7]/95 dark:bg-[#1D1B20]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 text-[#1D1B20] dark:text-white hover:bg-black/5 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </motion.nav>
      </div>

      {/* ========================================================
          MOBILE FULL-SCREEN OVERLAY DRAWER (< lg screens)
         ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="fixed inset-0 z-40 lg:hidden bg-m3-surface/98 backdrop-blur-2xl overflow-y-auto"
            id="mobile-menu-overlay"
          >
            {/* Spacer for the top floating navbar */}
            <div className="h-24" />

            <nav className="px-6 pb-12 max-w-md mx-auto">
              
              {/* Highlight Card: My Life Playground */}
              <div className="mb-6">
                <Link
                  to="/my-life-playground"
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#E8DEF8] dark:bg-[#4A4458] text-[#1D192B] dark:text-[#E8DEF8] shadow-sm font-semibold text-base"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#6750A4] text-white">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div>My Life Playground</div>
                      <div className="text-xs font-normal opacity-75">Interactive terminal & portfolio</div>
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
                      className={`block py-4 text-lg font-semibold transition-colors ${
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
                        className="w-full flex items-center justify-between py-4 text-lg font-semibold text-m3-on-surface cursor-pointer"
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
                                      ? 'bg-[#E8DEF8] text-[#1D192B] font-semibold dark:bg-[#4A4458] dark:text-[#E8DEF8]'
                                      : 'text-m3-on-surface/70 hover:bg-m3-on-surface/5'
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
                  className="block w-full text-center py-4 bg-[#1C0099] text-white dark:bg-[#D0BCFF] dark:text-[#381E72] rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Reach me
                </Link>
              </div>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
