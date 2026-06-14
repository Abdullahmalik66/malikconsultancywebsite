/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ValueStatement from './components/ValueStatement';
import ServicesTabs from './components/ServicesTabs';
import CaseWork from './components/CaseWork';
import LatestInsights from './components/LatestInsights';
import StaggerTestimonials from './components/StaggerTestimonials';
import Footer from './components/Footer';
import NewsletterSection from './components/NewsletterSection';
import CaseWorkPage from './pages/CaseWorkPage';
import WritingsPage from './pages/WritingsPage';
import BlogEditorPage from './pages/BlogEditorPage';
import BygghemmaJourney from './pages/BygghemmaJourney';
import IPAMCaseStudy from './pages/IPAMCaseStudy';
import RAGEngineCaseStudy from './pages/RAGEngineCaseStudy';
import UniversityOuluCaseStudy from './pages/UniversityOuluCaseStudy';
import AgenticJourneyCaseStudy from './pages/AgenticJourneyCaseStudy';
import GlobalDemandCaseStudy from './pages/GlobalDemandCaseStudy';
import DeutscheGiganetzCaseStudy from './pages/DeutscheGiganetzCaseStudy';
import GrowthHackingCaseStudy from './pages/GrowthHackingCaseStudy';
import ExitStrategyCaseStudy from './pages/ExitStrategyCaseStudy';
import EmailAutomationCaseStudy from './pages/EmailAutomationCaseStudy';
import HOPEEngineCaseStudy from './pages/HOPEEngineCaseStudy';
import AboutPage from './pages/AboutPage';
import BlogPostPage from './pages/BlogPostPage';
import ReachMePage from './pages/ReachMePage';
import TestimonialsPage from './pages/TestimonialsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './lib/firebase/AuthContext';
import { ThemeProvider } from './lib/ThemeProvider';
import { HelmetProvider } from 'react-helmet-async';

function HomePage() {
  return (
    <>
      <Hero />
      <ValueStatement />
      <ServicesTabs />
      <CaseWork />
      <LatestInsights />
      <StaggerTestimonials />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isCleanLayout = location.pathname.startsWith('/admin') || location.pathname === '/reach-me';

  return (
    <main className="relative min-h-screen bg-m3-surface transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/case-work" element={<CaseWorkPage />} />
        <Route path="/my-writings" element={<WritingsPage />} />
        <Route path="/writings/:id" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/create-insight" element={<BlogEditorPage />} />
        <Route path="/reach-me" element={<ReachMePage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        {/* ... case studies ... */}
        <Route path="/case-study/bygghemma" element={<BygghemmaJourney />} />
        <Route path="/case-study/ipam-brand-dominance" element={<IPAMCaseStudy />} />
        <Route path="/case-study/rag-engine-technical-support" element={<RAGEngineCaseStudy />} />
        <Route path="/case-study/oulu-university-data-design" element={<UniversityOuluCaseStudy />} />
        <Route path="/case-study/agentic-customer-journey" element={<AgenticJourneyCaseStudy />} />
        <Route path="/case-study/global-demand-persona-architecture" element={<GlobalDemandCaseStudy />} />
        <Route path="/case-study/deutsche-giganetz-market-entry" element={<DeutscheGiganetzCaseStudy />} />
        <Route path="/case-study/growth-hacking-retail-environment" element={<GrowthHackingCaseStudy />} />
        <Route path="/case-study/preparing-for-exit-revenue-engines" element={<ExitStrategyCaseStudy />} />
        <Route path="/case-study/preparing-for-exit-revenue-engines-v2" element={<ExitStrategyCaseStudy />} />
        <Route path="/case-study/commercial-velocity-email-automation" element={<EmailAutomationCaseStudy />} />
        <Route path="/case-study/agentic-engine-autonomous-growth" element={<HOPEEngineCaseStudy />} />
      </Routes>
      {!isCleanLayout && <NewsletterSection />}
      {!isCleanLayout && <Footer />}
    </main>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
}




