import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import NewsletterSection from '@/components/layout/NewsletterSection';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthProvider } from '@/providers/AuthContext';
import { ThemeProvider } from '@/providers/ThemeProvider';
import SEORenderer from '@/features/seo/SEORenderer';
import HomePage from '@/pages/HomePage';

// Route-level code splitting: only the home page ships in the entry chunk.
const CaseWorkPage = lazy(() => import('@/pages/CaseWorkPage'));
const WritingsPage = lazy(() => import('@/pages/WritingsPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const BlogEditorPage = lazy(() => import('@/pages/BlogEditorPage'));
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const MyLifeStoryPage = lazy(() => import('@/pages/MyLifeStoryPage'));
const ReachMePage = lazy(() => import('@/pages/ReachMePage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const AITransformationPage = lazy(() => import('@/pages/services/AITransformationPage'));
const DataActivationPage = lazy(() => import('@/pages/services/DataActivationPage'));
const ModernMarketingPage = lazy(() => import('@/pages/services/ModernMarketingPage'));
const AIMaturityPage = lazy(() => import('@/pages/services/AIMaturityPage'));
const IntelligenceLayerPage = lazy(() => import('@/pages/IntelligenceLayerPage'));

/** Routes that render their own full-screen chrome (no Navbar / Newsletter / Footer). */
const CLEAN_LAYOUT_PATHS = new Set(['/reach-me', '/my-life-story', '/my-life-playground', '/intelligence-layer']);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const isCleanLayout = pathname.startsWith('/admin') || CLEAN_LAYOUT_PATHS.has(pathname);

  return (
    <main className="relative min-h-screen bg-m3-surface transition-colors duration-300">
      <SEORenderer />
      {!isCleanLayout && <Navbar />}
      <Suspense fallback={null}>
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
          <Route path="/intelligence-layer" element={<IntelligenceLayerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/create-insight" element={<BlogEditorPage />} />
          <Route path="/reach-me" element={<ReachMePage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/case-study/:slug" element={<CaseStudyPage />} />
        </Routes>
      </Suspense>
      {!isCleanLayout && pathname !== '/intelligence-layer' && <NewsletterSection />}
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
