import React from 'react';
import { motion } from 'motion/react';
import { Linkedin, Instagram, Github, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../brand/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#6d55a7] text-white pt-20 relative overflow-hidden" id="main-footer">
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-32 mb-32">
        {/* Left Side: Branding & Info */}
        <div className="space-y-8">
          <div className="space-y-2">
            {/* Brand mark ("The Bracket Mark") — same lockup as the navbar, in a
                fixed neon-on-brand-purple pairing since this section's
                background never scrolls/changes, plus a white bracket accent
                for stronger contrast against the purple footer. */}
            <span className="inline-flex text-[#EAFF00]">
              <Wordmark tagline="// CONSULTANCY" accentColor="#ffffff" className="text-3xl sm:text-4xl" />
            </span>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              Helping high-growth brands and startups engineer performance engines that scale through data-driven precision and AI-powered automation.
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:abdullahmalik66@gmail.com"
              className="block text-xl font-display font-medium text-[#EAFF00] hover:underline transition-all"
            >
              abdullahmalik66@gmail.com
            </a>
            <p className="text-white/60 text-sm">+46 76 000 0000</p>
          </div>

          <div className="flex gap-4">
            {[
              { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
              { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              { icon: Github, href: "https://github.com", label: "GitHub" }
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-[#EAFF00] text-[#1a1a1a] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/20"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Middle: Quick Links (Empty or Placeholder for balance) */}
        <div className="hidden lg:block" />

        {/* Right Side: Services */}
        <div className="space-y-8 md:text-right">
          <h3 className="text-xl font-display font-medium text-white mb-6 uppercase tracking-wider">Services</h3>
          <ul className="space-y-4">
            {[
              "Digital Strategy",
              "Growth Architecture",
              "AI Automation",
              "Performance Marketing",
              "Data Engineering",
              "CRO & Optimization"
            ].map((service) => (
              <li key={service}>
                <Link
                  to="/services"
                  className="text-white/70 hover:text-[#EAFF00] text-sm uppercase font-black tracking-widest transition-colors flex md:justify-end items-center gap-2 group"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform">→</span>
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 mb-12 text-xs font-black uppercase tracking-[0.2em] text-white/40">
        <p>© {currentYear} Abdullah Malik / Independent Expert</p>
        <div className="flex flex-wrap items-center gap-8">
          <Link to="/intelligence-layer" className="hover:text-[#EAFF00] text-white/80 transition-colors flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
            The Intelligence Layer
          </Link>
          <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
        </div>
      </div>

      {/* Sustainable Earth Section */}
      <div className="relative overflow-hidden group">

        <div className="max-w-4xl mx-auto px-6 text-center relative z-20 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-3xl md:text-5xl font-display font-medium text-white max-w-3xl mx-auto leading-tight italic">
              "Stay sustainable and take care of <span className="text-[#EAFF00] font-bold">our home earth.</span>"
            </h3>
            <p className="text-[#EAFF00] text-xs font-black uppercase tracking-[0.4em] opacity-80">
              BUILDING DIGITAL SYSTEMS FOR A GREENER FUTURE
            </p>
          </motion.div>
        </div>

        {/* Realistic Rotating Earth Visual - Focus on Greenery & Water */}
        <div className="relative w-full h-[500px] flex justify-center items-end overflow-hidden pointer-events-none">
          {/* The Earth Container */}
          <div className="relative w-[85vw] md:w-[600px] lg:w-[900px] h-[85vw] md:h-[600px] lg:h-[900px] rounded-full bottom-[-42vw] md:bottom-[-300px] lg:bottom-[-450px]">
            {/* The Earth - Day Mode */}
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 180,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "url('https://images.unsplash.com/photo-1614726339050-62214e9a96f8?auto=format&fit=crop&q=80&w=1200')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Natural Day Light Overlay - Reduced */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-black/10" />
            </motion.div>

            {/* Clouds Layer */}
            <motion.div
              animate={{
                rotate: -360
              }}
              transition={{
                duration: 240,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 rounded-full opacity-60 mix-blend-screen scale-105"
              style={{
                background: "url('https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=1200')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(1.5) contrast(1.2)'
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
