import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    label: 'Services',
    children: [
      { label: 'AI Transformation', path: '/services/ai-transformation' },
      { label: 'Data Activation & Intelligence', path: '/services/data-activation-intelligence' },
      { label: 'Modern Marketing & Growth', path: '/services/modern-marketing-growth' },
      { label: 'AI Maturity & Capability Building', path: '/services/ai-maturity-capability-building' }
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
  { label: 'My life story', path: '/my-life-story' }
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

  const navBgClass = 'bg-m3-surface/95 backdrop-blur-xl border-m3-outline/20 shadow-lg text-m3-on-surface';
  const logoBgClass = 'bg-m3-primary text-m3-on-primary';

  return (
    <>
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

          {/* Desktop Nav — UNTOUCHED */}
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
                className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all duration-500 bg-m3-primary text-m3-on-primary cursor-pointer ${location.pathname === '/reach-me'
                    ? 'ring-4 ring-m3-primary/35 ring-offset-2 ring-offset-m3-surface scale-105 shadow-xl'
                    : ''
                  }`}
                id="reach-me-btn"
              >
                Reach me
              </motion.button>
            </Link>

            {/* Mobile Hamburger — visible only below lg */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-m3-on-surface/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Full-Screen Menu Overlay — only renders below lg */}
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
            {/* Spacer for the navbar */}
            <div className="h-24" />

            <nav className="px-6 pb-12">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-m3-outline/10">
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`block py-4 text-lg font-medium transition-colors ${location.pathname === item.path
                          ? 'text-m3-primary'
                          : 'text-m3-on-surface'
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        className="w-full flex items-center justify-between py-4 text-lg font-medium text-m3-on-surface"
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
                                  className={`block py-3 px-4 text-base rounded-xl transition-colors ${location.pathname === child.path
                                      ? 'bg-m3-primary/10 text-m3-primary font-semibold'
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

              {/* Mobile CTA */}
              <div className="mt-8">
                <Link
                  to="/reach-me"
                  className="block w-full text-center py-4 bg-m3-primary text-m3-on-primary rounded-full text-lg font-bold shadow-lg"
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
