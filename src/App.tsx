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
import WorkedWithSection from './components/WorkedWithSection';
import ServicesTabs from './components/ServicesTabs';
import CaseWork from './components/CaseWork';
import LatestInsights from './components/LatestInsights';
import StaggerTestimonials from './components/StaggerTestimonials';
import Footer from './components/Footer';
import NewsletterSection from './components/NewsletterSection';
import CaseWorkPage from './pages/CaseWorkPage';
import WritingsPage from './pages/WritingsPage';
import BlogEditorPage from './pages/BlogEditorPage';
import CaseStudyPage from './pages/CaseStudyPage';
import AboutPage from './pages/AboutPage';
import AITransformationPage from './pages/AITransformationPage';
import DataActivationPage from './pages/DataActivationPage';
import ModernMarketingPage from './pages/ModernMarketingPage';
import AIMaturityPage from './pages/AIMaturityPage';
import MyLifeStoryPage from './pages/MyLifeStoryPage';
import BlogPostPage from './pages/BlogPostPage';
import ReachMePage from './pages/ReachMePage';
import TestimonialsPage from './pages/TestimonialsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './lib/firebase/AuthContext';
import { ThemeProvider } from './lib/ThemeProvider';
import { HelmetProvider } from 'react-helmet-async';
import SEORenderer from './components/seo/SEORenderer';


function HomePage() {
  return (
    <>
      <Hero />
      <ValueStatement />
      <WorkedWithSection />
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
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isCleanLayout = location.pathname.startsWith('/admin') || location.pathname === '/reach-me' || location.pathname === '/my-life-story' || location.pathname === '/my-life-playground';

  return (
    <main className="relative min-h-screen bg-m3-surface transition-colors duration-300">
      <SEORenderer />
      {!isCleanLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/case-work" element={<CaseWorkPage />} />
        <Route path="/my-writings" element={<WritingsPage />} />
        <Route path="/writings/:id" element={<BlogPostPage />} />
        <Route path="/my-life-story" element={<MyLifeStoryPage />} />
        <Route path="/my-life-playground" element={<MyLifeStoryPage />} />
        <Route path="/services/ai-transformation" element={<AITransformationPage />} />
        <Route path="/services/data-activation-intelligence" element={<DataActivationPage />} />
        <Route path="/services/modern-marketing-growth" element={<ModernMarketingPage />} />
        <Route path="/services/ai-maturity-capability-building" element={<AIMaturityPage />} />
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
        {/* Dynamic Case Study Route */}
        <Route path="/case-study/:slug" element={<CaseStudyPage />} />
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




