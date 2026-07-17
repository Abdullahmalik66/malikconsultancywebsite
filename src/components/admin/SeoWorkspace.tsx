import React, { useState, useEffect } from "react";
import { 
  Globe, Search, Sparkles, Code, FileText, AlertTriangle, 
  CheckCircle, RefreshCw, Plus, Trash2, Save, Eye, 
  AlertCircle, Info, ExternalLink, Settings, ShieldAlert,
  Server, Link as LinkIcon, Database, ArrowRight, Sliders,
  HelpCircle, Image as ImageIcon
} from "lucide-react";
import { ref as dbRef, set } from "firebase/database";
import { db } from "../../lib/firebase/db";
import { 
  getSEOConfig, savePageSEO, saveIntegrationsConfig, 
  saveOrganisationConfig, saveSiteControlsConfig, saveTemplateConfig,
  PageSEOConfig, PageSEOData, PageGEOData, PageSocialData, PageTechnicalData,
  IntegrationsConfig, OrganisationConfig, SiteControlsConfig, TemplateConfig,
  sanitizeKey, initializeSeoDefaults
} from "../../lib/firebase/seo";
import { getAllContent, ContentItem, uploadImage } from "../../lib/firebase/cms";

type WorkspaceTab = 'overview' | 'pages' | 'integrations' | 'controls' | 'templates' | 'issues';
type PageSubTab = 'seo' | 'geo' | 'social' | 'technical';

export default function SeoWorkspace() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Data State
  const [seoConfig, setSeoConfig] = useState<any>({});
  const [cmsContent, setCmsContent] = useState<ContentItem[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('homepage');
  const [pageSubTab, setPageSubTab] = useState<PageSubTab>('seo');
  const [selectedPreviewPage, setSelectedPreviewPage] = useState<string>('homepage');
  
  // Local Editor States (copies to edit safely before saving)
  const [editingPage, setEditingPage] = useState<PageSEOConfig | null>(null);
  const [editingIntegrations, setEditingIntegrations] = useState<IntegrationsConfig | null>(null);
  const [editingOrganisation, setEditingOrganisation] = useState<OrganisationConfig | null>(null);
  const [editingControls, setEditingControls] = useState<SiteControlsConfig | null>(null);
  const [editingTemplates, setEditingTemplates] = useState<Record<string, TemplateConfig>>({});

  // Local Upload & UI filter states
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingAppleIcon, setUploadingAppleIcon] = useState(false);
  const [flushingCache, setFlushingCache] = useState(false);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showHealthScoreDetails, setShowHealthScoreDetails] = useState(false);

  // Issue Monitoring cockpit state
  const [issuesList, setIssuesList] = useState<Array<{ pageId: string; pageTitle: string; severity: 'critical' | 'important' | 'recommended'; message: string; category: string }>>([]);

  // AI content generation state
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiToast, setAiToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [generatingField, setGeneratingField] = useState<string | null>(null);


  // Load all configurations
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Initialise defaults if database node is blank
      await initializeSeoDefaults();
      
      // 2. Fetch SEO configurations
      const config = await getSEOConfig();
      setSeoConfig(config);

      // 3. Fetch all dynamic writings & case studies
      const cmsItems = await getAllContent();
      const publishedCms = cmsItems.filter(item => item.status === 'published');
      setCmsContent(publishedCms);

      // 4. Initialize Local Editor States & perform client-side legacy domain check
      let dirtyOnLoad = false;
      let loadedControls = config.controls;
      let loadedOrganisation = config.organisation;

      if (loadedControls?.robotsTxt?.content?.includes("artery---animated-experience")) {
        loadedControls = {
          ...loadedControls,
          robotsTxt: {
            ...loadedControls.robotsTxt,
            content: loadedControls.robotsTxt.content.replace(/artery---animated-experience/g, "abdullahmalikconsultancy")
          }
        };
        dirtyOnLoad = true;
      }

      if (loadedOrganisation?.baseOriginUrl?.includes("artery---animated-experience")) {
        loadedOrganisation = {
          ...loadedOrganisation,
          baseOriginUrl: loadedOrganisation.baseOriginUrl.replace(/artery---animated-experience/g, "abdullahmalikconsultancy")
        };
        dirtyOnLoad = true;
      }

      if (config.integrations) setEditingIntegrations(config.integrations);
      if (loadedOrganisation) setEditingOrganisation(loadedOrganisation);
      if (loadedControls) setEditingControls(loadedControls);
      if (config.templates) setEditingTemplates(config.templates);

      // Initialize Page Editor
      const activePageKey = sanitizeKey(selectedPageId);
      const activePage = config.pages?.[activePageKey];
      if (activePage) {
        setEditingPage(activePage);
      } else {
        // Fallback placeholder
        setEditingPage(createNewPageConfig(selectedPageId));
      }

      // 5. Generate QA Issues Report
      analyzeIssues(config, publishedCms);

      if (dirtyOnLoad) {
        console.log("Legacy domain detected on load. Form marked dirty to facilitate automatic update on save.");
      }

      setLoading(false);
      setIsDirty(dirtyOnLoad);
    } catch (e) {
      console.error("Failed to load SEO control center configurations:", e);
      setLoading(false);
      setIsDirty(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync selected page
  useEffect(() => {
    if (!seoConfig) return;
    const activePageKey = sanitizeKey(selectedPageId);
    const activePage = seoConfig.pages ? seoConfig.pages[activePageKey] : null;
    if (activePage) {
      setEditingPage(activePage);
    } else {
      setEditingPage(createNewPageConfig(selectedPageId));
    }
  }, [selectedPageId, seoConfig]);

  // Create empty configuration for page
  const createNewPageConfig = (pageId: string): PageSEOConfig => {
    let pType: PageSEOConfig['pageType'] = 'custom';
    let path = `/${pageId.replace(/_/g, '-')}`;
    
    if (pageId === 'homepage') {
      pType = 'homepage';
      path = '/';
    } else if (['about', 'case_work', 'my_writings', 'reach_me', 'testimonials', 'my_life_story'].includes(pageId)) {
      pType = pageId as PageSEOConfig['pageType'];
      path = `/${pageId.replace(/_/g, '-')}`;
    } else if (pageId.startsWith('services_')) {
      pType = 'service';
      path = `/services/${pageId.replace('services_', '')}`;
    } else if (pageId.startsWith('blog_')) {
      pType = 'blog_post';
      path = `/writings/${pageId.replace('blog_', '')}`;
    } else if (pageId.startsWith('case_study_')) {
      pType = 'case_study';
      path = `/case-study/${pageId.replace('case_study_', '')}`;
    }

    return {
      slug: pageId,
      path,
      pageType: pType,
      seo: {
        title: "",
        description: "",
        canonical: "",
        robots: { index: true, follow: true },
        pageLanguage: "en"
      },
      geo: {
        aiSummary: "",
        includeInLlms: true,
        aiVisiblePriority: 0.8
      },
      social: {
        twitterCard: "summary_large_image"
      },
      technical: {
        includeInSitemap: true,
        isCrawlable: true
      },
      updatedAt: new Date().toISOString(),
      published: true
    };
  };

  // Run QA validation engine
  const analyzeIssues = (config: any, cmsItems: ContentItem[]) => {
    const issues: typeof issuesList = [];
    const pages = config.pages || {};
    const org = config.organisation || {};
    const tracking = config.integrations?.tracking || {};
    const verification = config.integrations?.verification || {};
    const controls = config.controls || {};

    // 1. Global / Organisation & Integration Issues
    if (!org.faviconUrl && !org.faviconMasterUrl) {
      issues.push({ pageId: 'global', pageTitle: 'Organisation Identity', severity: 'critical', message: 'Favicon is missing. High-resolution upload required for brand identity.', category: 'Favicon' });
    }
    if (!verification.google) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'recommended', message: 'Google Site Verification token is missing.', category: 'Verification' });
    }
    if (!verification.bing) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'recommended', message: 'Bing Webmaster verification token is missing.', category: 'Verification' });
    }
    if (!tracking.googleAnalytics?.id) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'important', message: 'Google Analytics (GA4) ID is not configured.', category: 'Tracking' });
    } else if (tracking.googleAnalytics.enabled && !/^G-[A-Z0-9]+$/i.test(tracking.googleAnalytics.id)) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'important', message: `Google Analytics ID format '${tracking.googleAnalytics.id}' is invalid. Should match 'G-XXXXXX'.`, category: 'Tracking' });
    }
    if (!tracking.googleTagManager?.id) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'important', message: 'Google Tag Manager ID is not configured.', category: 'Tracking' });
    } else if (tracking.googleTagManager.enabled && !/^GTM-[A-Z0-9]+$/i.test(tracking.googleTagManager.id)) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'important', message: `Google Tag Manager ID format '${tracking.googleTagManager.id}' is invalid. Should match 'GTM-XXXXXX'.`, category: 'Tracking' });
    }
    if (tracking.metaPixel?.enabled && tracking.metaPixel?.id && !/^\d+$/.test(tracking.metaPixel.id)) {
      issues.push({ pageId: 'global', pageTitle: 'Integrations', severity: 'important', message: `Meta Pixel ID '${tracking.metaPixel.id}' should be numeric only.`, category: 'Tracking' });
    }

    // 2. Static pages issues check
    const staticRoutes = [
      'homepage', 'about', 'case_work', 'my_writings', 'reach_me', 'testimonials', 'my_life_story',
      'services_ai-transformation', 'services_data-activation-intelligence', 'services_modern-marketing-growth', 'services_ai-maturity-capability-building'
    ];
    staticRoutes.forEach(route => {
      const page = pages[route];
      const pageTitle = route.replace(/_/g, '/');
      
      if (!page) {
        issues.push({ pageId: route, pageTitle, severity: 'important', message: 'SEO settings are using defaults. No custom overrides saved.', category: 'Missing Overrides' });
        return;
      }

      const title = page.seo?.title;
      const desc = page.seo?.description;

      if (!title || title.trim() === '') {
        issues.push({ pageId: route, pageTitle, severity: 'important', message: 'SEO Title is empty (using template instead).', category: 'Missing Metadata' });
      } else {
        if (title.length > 60) {
          issues.push({ pageId: route, pageTitle, severity: 'recommended', message: `Title is too long (${title.length} characters). Target is under 60.`, category: 'Title Length' });
        }
        if (title.length < 20) {
          issues.push({ pageId: route, pageTitle, severity: 'recommended', message: `Title is too short (${title.length} characters). Target is above 20.`, category: 'Title Length' });
        }
      }

      if (!desc || desc.trim() === '') {
        issues.push({ pageId: route, pageTitle, severity: 'important', message: 'Meta Description is empty (using template instead).', category: 'Missing Metadata' });
      } else {
        if (desc.length > 160) {
          issues.push({ pageId: route, pageTitle, severity: 'recommended', message: `Meta Description is too long (${desc.length} characters). Target is under 160.`, category: 'Description Length' });
        }
        if (desc.length < 50) {
          issues.push({ pageId: route, pageTitle, severity: 'recommended', message: `Meta Description is too short (${desc.length} characters). Target is above 50.`, category: 'Description Length' });
        }
      }

      // Canonical mismatch check
      const baseOrigin = org.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
      const expectedCanonical = `${baseOrigin}/${route.replace(/_/g, '/')}`;
      if (page.seo?.canonical && page.seo.canonical !== expectedCanonical) {
        issues.push({ pageId: route, pageTitle, severity: 'recommended', message: `Canonical URL override ('${page.seo.canonical}') does not match default base origin pattern ('${expectedCanonical}').`, category: 'Canonical URL' });
      }

      // Index vs Sitemap conflict
      const isIndex = page.seo?.robots ? page.seo.robots.index : true;
      const inSitemap = page.technical?.includeInSitemap !== false;
      if (!isIndex && inSitemap) {
        issues.push({ pageId: route, pageTitle, severity: 'critical', message: 'Page is set to noindex but is still included in sitemap.xml. This blocks crawlers and causes sitemap errors.', category: 'Indexing Conflict' });
      }

      // Robots block check
      const robotsTxt = controls.robotsTxt?.content || "";
      const pathToCheck = `Disallow: /${route.replace(/_/g, '/')}`;
      if (robotsTxt.includes(pathToCheck) && isIndex) {
        issues.push({ pageId: route, pageTitle, severity: 'critical', message: `Page is marked indexable but is blocked by Disallow rule in robots.txt: '${pathToCheck}'.`, category: 'Crawl Block' });
      }

      // GEO / llms check
      const includeInLlms = page.geo?.includeInLlms !== false;
      if (includeInLlms && (!page.geo?.llmsDescription || !page.geo?.aiSummary)) {
        issues.push({ pageId: route, pageTitle, severity: 'recommended', message: 'Page included in AI directory (llms.txt) but lacks an AI summary or llms description.', category: 'GEO / LLM' });
      }
    });

    // 3. Dynamic items checks
    cmsItems.forEach(item => {
      const pageId = item.contentType === 'blog' ? `blog_${item.id}` : `case_study_${item.id}`;
      const page = pages[pageId];
      const pageTitle = item.title;
      
      if (page) {
        const title = page.seo?.title;
        const desc = page.seo?.description;
        if (!title) {
          issues.push({ pageId, pageTitle, severity: 'recommended', message: 'Page-specific SEO title is empty (falling back to dynamic template).', category: 'Missing Overrides' });
        }
        if (!desc) {
          issues.push({ pageId, pageTitle, severity: 'recommended', message: 'Page-specific meta description is empty (falling back to dynamic template).', category: 'Missing Overrides' });
        }
        const includeInLlms = page.geo?.includeInLlms !== false;
        if (includeInLlms && !page.geo?.llmsDescription) {
          issues.push({ pageId, pageTitle, severity: 'recommended', message: 'Dynamic item is visible in AI catalog but is missing a structured AI description.', category: 'GEO / LLM' });
        }
      } else {
        issues.push({ pageId, pageTitle, severity: 'important', message: 'No page-level overrides configured (using templates).', category: 'Missing Overrides' });
      }
    });

    setIssuesList(issues);
  };

  // Invalidate Server route caches on Express
  const invalidateServerCache = async () => {
    try {
      await fetch("/api/seo/invalidate-cache", { method: "POST" });
    } catch (e) {
      console.error("Failed to invalidate Express server cache:", e);
    }
  };

  // Resolves input defaults dynamically
  const getResolvedValue = (field: 'title' | 'description' | 'canonical', page: PageSEOConfig | null) => {
    if (!page) return { value: '', isOverride: false, origin: 'None' };
    const val = page.seo?.[field];
    if (val && val.trim() !== '') {
      return { value: val, isOverride: true, origin: 'Direct Override' };
    }
    
    // Fallback to Template
    const template = editingTemplates[page.pageType];
    const baseTitle = editingOrganisation?.websiteName || "Abdullah Malik Portfolio";
    const baseDesc = editingOrganisation?.description || "";
    const siteName = editingOrganisation?.websiteName || "Abdullah Malik Portfolio";
    const orgName = editingOrganisation?.name || "Abdullah Malik";
    const pageTitleClean = page.pageType === 'homepage' ? 'Home' : page.path.replace(/^\//, '').replace(/\//g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    const applyPatterns = (pattern: string) => {
      return pattern
        .replace(/\{\{title\}\}/g, pageTitleClean)
        .replace(/\{\{siteName\}\}/g, siteName)
        .replace(/\{\{organisationName\}\}/g, orgName)
        .replace(/\{\{description\}\}/g, baseDesc);
    };

    if (field === 'title') {
      if (template?.titlePattern) {
        return { value: applyPatterns(template.titlePattern), isOverride: false, origin: `Template: ${template.titlePattern}` };
      }
      return { value: `${pageTitleClean} | ${siteName}`, isOverride: false, origin: 'System Default' };
    }
    if (field === 'description') {
      if (template?.metaDescriptionPattern) {
        return { value: applyPatterns(template.metaDescriptionPattern), isOverride: false, origin: `Template: ${template.metaDescriptionPattern}` };
      }
      return { value: baseDesc, isOverride: false, origin: 'Global Org Default' };
    }
    if (field === 'canonical') {
      const baseOrigin = editingOrganisation?.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
      return { value: `${baseOrigin}${page.path}`, isOverride: false, origin: 'Dynamic Origin Fallback' };
    }
    
    return { value: '', isOverride: false, origin: 'None' };
  };

  // Compile JSON-LD schema dynamically for the editor preview
  const getJsonLdPreview = () => {
    if (!editingPage) return "";
    const baseOrigin = editingOrganisation?.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
    const canonical = editingPage.seo?.canonical || `${baseOrigin}${editingPage.path}`;
    const title = getResolvedPreviewTitle();
    const type = editingPage.seo?.schemaType || "WebPage";
    const orgName = editingOrganisation?.name || "Abdullah Malik";
    
    const obj = {
      "@context": "https://schema.org",
      "@type": type,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonical
      },
      "headline": title,
      "url": canonical,
      "publisher": {
        "@type": "Organization",
        "name": orgName
      }
    };
    return JSON.stringify(obj, null, 2);
  };

  // Compile Dynamic robots.txt preview showing base + sitemap line
  const getDynamicRobotsPreview = () => {
    const sitemapUrl = `${editingOrganisation?.baseOriginUrl || 'https://abdullahmalikconsultancy.web.app'}/sitemap.xml`;
    const base = editingControls?.robotsTxt?.content || "User-agent: *\nAllow: /";
    return `${base}\n\nSitemap: ${sitemapUrl}`;
  };

  // Compile Dynamic Sitemap path mapping showing inclusion reasons
  const getDynamicSitemapPreviewList = () => {
    const baseOrigin = editingOrganisation?.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
    const staticRoutes = [
      { path: '/', priority: '1.0' },
      { path: '/about', priority: '0.8' },
      { path: '/case-work', priority: '0.8' },
      { path: '/my-writings', priority: '0.8' },
      { path: '/reach-me', priority: '0.7' },
      { path: '/testimonials', priority: '0.7' },
      { path: '/my-life-story', priority: '0.6' },
      { path: '/services/ai-transformation', priority: '0.9' },
      { path: '/services/data-activation-intelligence', priority: '0.9' },
      { path: '/services/modern-marketing-growth', priority: '0.9' },
      { path: '/services/ai-maturity-capability-building', priority: '0.9' }
    ];
    
    let list: Array<{ loc: string; reason: string; included: boolean }> = [];
    const sitemapControls = editingControls?.sitemap?.excludePageTypes || { blog: false, case_study: false, legal: true };

    staticRoutes.forEach(r => {
      const pageKey = r.path === '/' ? 'homepage' : r.path.replace(/^\//, '').replace(/\//g, '_');
      const pageSEO = seoConfig.pages?.[pageKey];
      const explicitInSitemap = pageSEO?.technical?.includeInSitemap !== false;
      const isIndex = pageSEO?.seo?.robots ? pageSEO.seo.robots.index : true;

      let included = true;
      let reason = "Standard indexable route";

      if (!isIndex) {
        included = false;
        reason = "Excluded: Marked 'noindex'";
      } else if (!explicitInSitemap) {
        included = false;
        reason = "Excluded: Sitemap exclusion switch set to true";
      }

      list.push({ loc: `${baseOrigin}${r.path}`, reason, included });
    });

    cmsContent.forEach(item => {
      const pageId = item.contentType === 'blog' ? `blog_${item.id}` : `case_study_${item.id}`;
      const pageSEO = seoConfig.pages?.[pageId];
      const isBlog = item.contentType === 'blog';
      const excludeGroup = isBlog ? sitemapControls.blog : sitemapControls.case_study;

      let included = true;
      let reason = isBlog ? "Dynamic blog post" : "Dynamic case study";

      if (excludeGroup) {
        included = false;
        reason = `Excluded: Group '${isBlog ? 'Blog' : 'Case Studies'}' excluded in Controls`;
      } else if (pageSEO?.seo?.robots?.index === false) {
        included = false;
        reason = "Excluded: Marked 'noindex'";
      } else if (pageSEO?.technical?.includeInSitemap === false) {
        included = false;
        reason = "Excluded: Sitemap exclusion switch set to true";
      }

      list.push({ loc: `${baseOrigin}/${isBlog ? 'writings' : 'case-study'}/${item.slug || item.id}`, reason, included });
    });

    return list;
  };

  // Compile Dynamic llms.txt Markdown text for local preview
  const getDynamicLlmsPreviewText = () => {
    const baseOrigin = editingOrganisation?.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
    const intro = editingControls?.llms?.intro || "Malik Consultancy services information hub.";
    const orgName = editingOrganisation?.name || "Abdullah Malik";
    
    let output = `# ${orgName} AI Directory\n\n`;
    output += `> ${intro}\n\n`;

    const allPages: Array<{ loc: string; title: string; desc: string; priority: number; category: string }> = [];

    // 1. Core pages
    const staticPages = [
      { path: '/', pageId: 'homepage', category: 'Core pages', defaultTitle: 'Main Hub' },
      { path: '/about', pageId: 'about', category: 'Core pages', defaultTitle: 'About' },
      { path: '/case-work', pageId: 'case_work', category: 'Core pages', defaultTitle: 'Case Work Hub' },
      { path: '/my-writings', pageId: 'my_writings', category: 'Core pages', defaultTitle: 'Writings Hub' },
      { path: '/reach-me', pageId: 'reach_me', category: 'Core pages', defaultTitle: 'Contact' },
      { path: '/testimonials', pageId: 'testimonials', category: 'Core pages', defaultTitle: 'Testimonials' },
      { path: '/my-life-story', pageId: 'my_life_story', category: 'Core pages', defaultTitle: 'My Story' }
    ];

    staticPages.forEach(page => {
      const pageSEO = seoConfig.pages?.[page.pageId];
      if (pageSEO?.geo?.includeInLlms !== false) {
        const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
        const linkPath = isMdLink ? `${page.path === '/' ? '' : page.path}.md` : page.path;
        allPages.push({
          loc: `${baseOrigin}${linkPath}`,
          title: pageSEO?.geo?.llmsTitle || pageSEO?.seo?.title || page.defaultTitle,
          desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || orgName,
          priority: pageSEO?.geo?.aiVisiblePriority ?? 0.8,
          category: page.category
        });
      }
    });

    // 2. Service pages
    const servicePages = [
      { path: '/services/ai-transformation', pageId: 'services_ai-transformation', defaultTitle: 'AI Transformation' },
      { path: '/services/data-activation-intelligence', pageId: 'services_data-activation-intelligence', defaultTitle: 'Data Activation & Intelligence' },
      { path: '/services/modern-marketing-growth', pageId: 'services_modern-marketing-growth', defaultTitle: 'Modern Marketing & Growth' },
      { path: '/services/ai-maturity-capability-building', pageId: 'services_ai-maturity-capability-building', defaultTitle: 'AI Maturity & Capability Building' }
    ];
    servicePages.forEach(page => {
      const pageSEO = seoConfig.pages?.[page.pageId];
      if (pageSEO?.geo?.includeInLlms !== false) {
        const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
        const linkPath = isMdLink ? `${page.path}.md` : page.path;
        allPages.push({
          loc: `${baseOrigin}${linkPath}`,
          title: pageSEO?.geo?.llmsTitle || pageSEO?.seo?.title || page.defaultTitle,
          desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || "Service page",
          priority: pageSEO?.geo?.aiVisiblePriority ?? 0.9,
          category: "Service pages"
        });
      }
    });

    // 3. Blog pages
    cmsContent.forEach(item => {
      if (item.contentType === 'blog') {
        const pageId = `blog_${item.id}`;
        const pageSEO = seoConfig.pages?.[pageId];
        if (pageSEO?.geo?.includeInLlms === true) {
          const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
          const linkPath = isMdLink ? `/writings/${item.slug || item.id}.md` : `/writings/${item.slug || item.id}`;
          allPages.push({
            loc: `${baseOrigin}${linkPath}`,
            title: pageSEO?.geo?.llmsTitle || item.title || "Insight Article",
            desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || item.excerpt || "Insight details",
            priority: pageSEO?.geo?.aiVisiblePriority ?? 0.7,
            category: "Blog / Insights"
          });
        }
      }
    });

    // 4. Case studies
    cmsContent.forEach(item => {
      if (item.contentType === 'case_study') {
        const pageId = `case_study_${item.id}`;
        const pageSEO = seoConfig.pages?.[pageId];
        if (pageSEO?.geo?.includeInLlms === true) {
          const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
          const linkPath = isMdLink ? `/case-study/${item.slug || item.id}.md` : `/case-study/${item.slug || item.id}`;
          allPages.push({
            loc: `${baseOrigin}${linkPath}`,
            title: pageSEO?.geo?.llmsTitle || item.title || "Case Study",
            desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || item.excerpt || "Case study overview",
            priority: pageSEO?.geo?.aiVisiblePriority ?? 0.8,
            category: "Case studies"
          });
        }
      }
    });

    // Sort descending by priority
    allPages.sort((a, b) => b.priority - a.priority);

    // Group & format to markdown list
    const categories = ["Core pages", "Service pages", "Blog / Insights", "Case studies"];
    categories.forEach(cat => {
      const catPages = allPages.filter(p => p.category === cat);
      if (catPages.length > 0) {
        output += `## ${cat}\n\n`;
        catPages.forEach(p => {
          output += `- [${p.title}](${p.loc}): ${p.desc}\n`;
        });
        output += `\n`;
      }
    });

    return output;
  };

  // Generate a live preview of the markdown format for a given page key
  const getPageMarkdownText = (pageKey: string) => {
    const page = seoConfig.pages?.[pageKey];
    if (!page) return "*No page configuration found*";

    const baseOrigin = editingOrganisation?.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
    const orgName = editingOrganisation?.name || "Abdullah Malik";

    const title = page.geo?.markdownTitleOverride || page.seo?.title || page.slug;
    const summary = page.geo?.markdownSummary || page.geo?.aiSummary || page.seo?.description || "";
    const purpose = page.geo?.pagePurpose || "";
    const isEntitiesEnabled = page.geo?.markdownIncludeEntities !== false;
    const isFaqEnabled = page.geo?.markdownIncludeFaq !== false;

    let md = `# ${title}\n\n`;
    if (summary) {
      md += `> ${summary}\n\n`;
    }
    md += `## Purpose\n\n${purpose || "General information and resources."}\n\n`;

    if (page.geo?.primaryAnswerIntent) {
      md += `## Intended Answer Intent\n\n${page.geo.primaryAnswerIntent}\n\n`;
    }

    if (page.geo?.authoritativeSourceNote) {
      md += `## Key Authority Reference\n\n${page.geo.authoritativeSourceNote}\n\n`;
    }

    if (isEntitiesEnabled && page.geo?.keyEntities && page.geo.keyEntities.length > 0) {
      md += `## Core Entities & Concepts\n\n`;
      page.geo.keyEntities.forEach((ent: string) => {
        md += `- **${ent}**\n`;
      });
      md += `\n`;
    }

    if (isFaqEnabled && page.geo?.curatedExplanation) {
      md += `## Frequently Answered Questions\n\n${page.geo.curatedExplanation}\n\n`;
    }

    md += `## Verification & Origin References\n\n`;
    md += `- Canonical HTML: [${baseOrigin}${page.path || ""}](${baseOrigin}${page.path || ""})\n`;
    md += `- Publisher: [${orgName}](${baseOrigin})\n`;

    return md;
  };

  // Upload Favicon Master file to Firebase Storage
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const url = await uploadImage(file, 'seo/favicons');
      setIsDirty(true);
      setEditingOrganisation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          faviconMasterUrl: url,
          faviconUrl: url,
          favicon16Url: url,
          favicon32Url: url,
          icon192Url: url,
          icon512Url: url
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload master favicon image.");
    } finally {
      setUploadingFavicon(false);
    }
  };

  // Upload Apple Touch Icon file to Firebase Storage
  const handleAppleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAppleIcon(true);
    try {
      const url = await uploadImage(file, 'seo/favicons');
      setIsDirty(true);
      setEditingOrganisation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          appleTouchIconUrl: url
        };
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload Apple Touch Icon.");
    } finally {
      setUploadingAppleIcon(false);
    }
  };

  // Flush Server Cache dynamically from the Overview UI
  const handleFlushCache = async () => {
    setFlushingCache(true);
    try {
      const response = await fetch('/api/seo/invalidate-cache', { method: 'POST' });
      if (response.ok) {
        alert("Express SSR cache cleared successfully!");
      } else {
        alert("Failed to clear Express cache.");
      }
    } catch (err) {
      console.error(err);
      alert("Error invalidating server route caches.");
    } finally {
      setFlushingCache(false);
    }
  };

  // Save specific workspace settings
  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'pages' && editingPage) {
        const key = sanitizeKey(selectedPageId);
        await savePageSEO(key, editingPage);
      } else if (activeTab === 'integrations') {
        if (editingIntegrations) await saveIntegrationsConfig(editingIntegrations);
        if (editingOrganisation) await saveOrganisationConfig(editingOrganisation);
      } else if (activeTab === 'controls') {
        if (editingControls) await saveSiteControlsConfig(editingControls);
      } else if (activeTab === 'templates') {
        for (const type of Object.keys(editingTemplates)) {
          await saveTemplateConfig(type, editingTemplates[type]);
        }
      }

      // Clear route caches on server
      await invalidateServerCache();

      // Reload config & clear dirty status
      await loadAllData();
      setIsDirty(false);
      alert("SEO Workspace changes saved successfully!");
    } catch (e) {
      console.error("Save failure:", e);
      alert("Failed to save changes. Check database rules or network.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Gemini AI Content Auto-Generation ──────────────────────────────────────────────
  const handleAutoGenerate = async () => {
    if (!selectedPageId || !editingPage) return;
    setGeneratingAI(true);
    setAiToast(null);
    try {
      const pageTitle = editingPage.seo?.title || editingPage.geo?.markdownTitleOverride || selectedPageId.replace(/[_-]/g, ' ');
      const existingContent = editingPage.seo?.description || editingPage.geo?.aiSummary || '';
      const response = await fetch('/api/seo/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPageId,
          pageType: editingPage.pageType,
          pageTitle,
          existingContent
        })
      });
      const data = await response.json();
      if (!response.ok || !data.generated) {
        throw new Error(data.error || 'Generation failed');
      }
      const g = data.generated;
      // Non-destructive merge: only fill fields that are currently empty
      setEditingPage(prev => {
        if (!prev) return null;
        return {
          ...prev,
          seo: {
            ...prev.seo,
            title: prev.seo?.title || g.seoTitle || '',
            description: prev.seo?.description || g.metaDescription || '',
            primaryKeyword: (prev.seo as any)?.primaryKeyword || g.primaryKeyword || '',
            schemaType: prev.seo?.schemaType || g.schemaType || 'WebPage',
          },
          geo: {
            ...prev.geo,
            aiSummary: prev.geo?.aiSummary || g.aiSummary || '',
            pagePurpose: prev.geo?.pagePurpose || g.pagePurpose || '',
            keyEntities: (prev.geo?.keyEntities?.length ?? 0) > 0 ? prev.geo!.keyEntities : (g.keyEntities || []),
            curatedExplanation: prev.geo?.curatedExplanation || g.curatedExplanation || '',
            llmsDescription: prev.geo?.llmsDescription || g.llmsDescription || '',
            markdownTitleOverride: prev.geo?.markdownTitleOverride || g.markdownTitle || '',
            markdownSummary: prev.geo?.markdownSummary || g.markdownSummary || '',
            markdownCapabilities: (prev.geo?.markdownCapabilities?.length ?? 0) > 0 ? prev.geo!.markdownCapabilities : (g.markdownCapabilities || []),
            markdownOutcomes: (prev.geo?.markdownOutcomes?.length ?? 0) > 0 ? prev.geo!.markdownOutcomes : (g.markdownOutcomes || []),
          }
        };
      });
      setIsDirty(true);
      setAiToast({ type: 'success', message: `✓ AI content generated for "${pageTitle}" — review and save` });
      setTimeout(() => setAiToast(null), 6000);
    } catch (err: any) {
      console.error('Auto-generate error:', err);
      setAiToast({ type: 'error', message: `✗ Generation failed: ${err.message || 'Unknown error'}` });
      setTimeout(() => setAiToast(null), 8000);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAutoGenerateField = async (section: 'seo' | 'geo', field: string, apiFieldName: string) => {
    if (!selectedPageId || !editingPage) return;
    setGeneratingField(field);
    setAiToast(null);
    try {
      const pageTitle = editingPage.seo?.title || editingPage.geo?.markdownTitleOverride || selectedPageId.replace(/[_-]/g, ' ');
      const existingContent = editingPage.seo?.description || editingPage.geo?.aiSummary || '';
      
      const response = await fetch('/api/seo/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPageId,
          pageType: editingPage.pageType,
          pageTitle,
          existingContent,
          targetField: apiFieldName
        })
      });
      const data = await response.json();
      if (!response.ok || !data.generated) {
        throw new Error(data.error || 'Field generation failed');
      }
      
      const generatedVal = data.generated[apiFieldName];
      if (generatedVal !== undefined) {
        setEditingPage(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [section]: {
              ...((prev[section] || {}) as any),
              [field]: generatedVal
            }
          };
        });
        setIsDirty(true);
        setAiToast({ type: 'success', message: `✓ AI successfully generated "${field}"` });
        setTimeout(() => setAiToast(null), 4000);
      }
    } catch (err: any) {
      console.error('Auto-generate field error:', err);
      setAiToast({ type: 'error', message: `✗ Field generation failed: ${err.message || 'Unknown error'}` });
      setTimeout(() => setAiToast(null), 6000);
    } finally {
      setGeneratingField(null);
    }
  };
  // ────────────────────────────────────────────────────────────────────────


  const handlePageFieldChange = (section: keyof PageSEOConfig, field: string, value: any) => {
    if (!editingPage) return;
    setIsDirty(true);
    
    setEditingPage(prev => {
      if (!prev) return null;
      if (section === 'seo' || section === 'geo' || section === 'social' || section === 'technical') {
        return {
          ...prev,
          [section]: {
            ...((prev[section] || {}) as any),
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [section]: value
      };
    });
  };

  const handleIntegrationsChange = (section: keyof IntegrationsConfig, field: string, value: any) => {
    setIsDirty(true);
    setEditingIntegrations(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...((prev[section] || {}) as any),
          [field]: value
        }
      };
    });
  };

  const handleOrgChange = (field: keyof OrganisationConfig, value: any) => {
    setIsDirty(true);
    setEditingOrganisation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleControlsChange = (file: keyof SiteControlsConfig, field: string, value: any) => {
    setIsDirty(true);
    setEditingControls(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [file]: {
          ...((prev[file] || {}) as any),
          [field]: value
        }
      };
    });
  };

  // Fallback pattern previews
  const getResolvedPreviewTitle = () => {
    if (!editingPage) return "";
    const siteName = editingOrganisation?.websiteName || editingOrganisation?.name || "Malik Consultancy";
    const titleVal = editingPage.seo?.title || editingPage.slug.replace(/_/g, ' ');

    const pageType = editingPage.pageType;
    const template = editingTemplates?.[pageType];

    if (editingPage.seo?.title) {
      return editingPage.seo.title;
    }
    if (template?.titlePattern) {
      return template.titlePattern
        .replace(/\{\{title\}\}/g, titleVal)
        .replace(/\{\{siteName\}\}/g, siteName)
        .replace(/\{\{organisationName\}\}/g, siteName);
    }
    return `${titleVal} | ${siteName}`;
  };

  const getResolvedPreviewDesc = () => {
    if (!editingPage) return "";
    const descVal = editingPage.seo?.description || "A professional strategic portfolio page.";
    const pageType = editingPage.pageType;
    const template = editingTemplates?.[pageType];

    if (editingPage.seo?.description) {
      return editingPage.seo.description;
    }
    if (template?.metaDescriptionPattern) {
      return template.metaDescriptionPattern
        .replace(/\{\{title\}\}/g, editingPage.slug)
        .replace(/\{\{excerpt\}\}/g, descVal);
    }
    return descVal;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-12 h-12 text-m3-primary animate-spin" />
        <p className="text-sm font-medium text-m3-on-surface/60">Loading Enterprise SEO Config...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-5 rounded-[28px] h-fit space-y-4">
        <div className="flex items-center gap-2 mb-4 border-b border-m3-outline/10 pb-3">
          <Globe className="w-5 h-5 text-m3-primary" />
          <h3 className="font-display font-semibold text-lg">SEO workspace</h3>
        </div>
        
        <div className="flex flex-col gap-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'pages', label: 'Pages & Content', icon: FileText },
            { id: 'integrations', label: 'Integrations & Org', icon: LinkIcon },
            { id: 'controls', label: 'Site Controls', icon: Sliders },
            { id: 'templates', label: 'Templates', icon: Code },
            { id: 'issues', label: 'Validation Cockpit', icon: AlertTriangle, badge: issuesList.length }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as WorkspaceTab); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-m3-secondary-container text-m3-on-secondary-container shadow-sm' 
                    : 'text-m3-on-surface/70 hover:bg-m3-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${tab.id === 'issues' ? 'bg-m3-error text-white' : 'bg-m3-primary text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Change Indicators / Status */}
        <div className="pt-4 border-t border-m3-outline/10 space-y-3">
          {isDirty && (
            <div className="bg-amber-500/10 text-amber-500 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Unsaved changes on active tab</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || (!isDirty && activeTab !== 'pages')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-m3-primary hover:bg-m3-primary/95 disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md transition-all"
          >
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save changes</>}
          </button>
        </div>
      </div>

      {/* Main Workspace Workspace */}
      <div className="lg:col-span-3 bg-white dark:bg-[#1d1b20] border border-m3-outline/10 p-6 md:p-8 rounded-[32px] min-h-[500px] relative overflow-hidden">
        
        {/* Dynamic header banner inside panel */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-m3-primary to-m3-tertiary" />

        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-display font-semibold mb-1">SEO Executive Overview</h2>
              <p className="text-sm text-m3-on-surface/60">Core metrics, indexation audits, and health score indicators.</p>
            </div>

            {/* Health Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-m3-surface dark:bg-m3-surface/5 p-5 rounded-2xl border border-m3-outline/10 flex flex-col justify-between relative overflow-hidden">
                <span className="text-xs font-black uppercase tracking-wider text-m3-on-surface/50">Health Score</span>
                <div className="my-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-display font-black text-green-500">
                      {Math.max(10, 100 
                        - (issuesList.filter(i => i.severity === 'critical').length * 15) 
                        - (issuesList.filter(i => i.severity === 'important').length * 5)
                        - (issuesList.filter(i => i.severity === 'recommended').length * 2))}%
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowHealthScoreDetails(!showHealthScoreDetails)}
                    className="text-[10px] text-m3-primary hover:underline mt-1 font-bold block"
                  >
                    {showHealthScoreDetails ? "Hide breakdown" : "View breakdown"}
                  </button>
                </div>
                <p className="text-[10px] text-m3-on-surface/60">Based on QA audits</p>
              </div>

              <div className="bg-m3-surface dark:bg-m3-surface/5 p-5 rounded-2xl border border-m3-outline/10 flex flex-col justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-m3-on-surface/50">Total Pages</span>
                <span className="text-3xl font-display font-bold my-2 text-m3-on-surface">{7 + cmsContent.length}</span>
                <p className="text-[10px] text-m3-on-surface/60">7 static + {cmsContent.length} dynamic</p>
              </div>

              <div className="bg-m3-surface dark:bg-m3-surface/5 p-5 rounded-2xl border border-m3-outline/10 flex flex-col justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-m3-on-surface/50">Live Integrations</span>
                <span className="text-3xl font-display font-bold my-2 text-m3-primary">
                  {Object.values(editingIntegrations?.tracking || {}).filter(item => item?.enabled).length}
                </span>
                <p className="text-[10px] text-m3-on-surface/60">Tracking systems active</p>
              </div>

              <div className="bg-m3-surface dark:bg-m3-surface/5 p-5 rounded-2xl border border-m3-outline/10 flex flex-col justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-m3-on-surface/50">QA Alerts</span>
                <span className={`text-3xl font-display font-bold my-2 ${issuesList.length > 0 ? 'text-m3-error' : 'text-green-500'}`}>
                  {issuesList.length}
                </span>
                <p className="text-[10px] text-m3-on-surface/60">Checks requiring attention</p>
              </div>
            </div>

            {/* Health Score Breakdown Card list */}
            {showHealthScoreDetails && (
              <div className="bg-m3-surface/50 dark:bg-m3-surface/5 p-5 rounded-2xl border border-m3-outline/10 space-y-3 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/80 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-m3-primary" /> Health Score Deduction Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                    <span className="font-bold text-red-500 block">Critical Issues (-15 pts)</span>
                    <span className="text-m3-on-surface/70 mt-1 block">Crawling blocks, sitemap mismatches.</span>
                    <span className="text-[10px] font-mono text-red-400 block mt-2">Active counts: {issuesList.filter(i => i.severity === 'critical').length}</span>
                  </div>
                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                    <span className="font-bold text-amber-500 block">Important Issues (-5 pts)</span>
                    <span className="text-m3-on-surface/70 mt-1 block">Missing key titles, invalid tracking IDs.</span>
                    <span className="text-[10px] font-mono text-amber-400 block mt-2">Active counts: {issuesList.filter(i => i.severity === 'important').length}</span>
                  </div>
                  <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                    <span className="font-bold text-blue-500 block">Recommended (-2 pts)</span>
                    <span className="text-m3-on-surface/70 mt-1 block">Missing verification tokens or OG images.</span>
                    <span className="text-[10px] font-mono text-blue-400 block mt-2">Active counts: {issuesList.filter(i => i.severity === 'recommended').length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification & Live Servings Monitor */}
            <div className="bg-m3-surface/30 dark:bg-m3-surface/5 p-6 rounded-2xl border border-m3-outline/10 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-sm">Search Engine Servings Status</h3>
                <button
                  onClick={handleFlushCache}
                  disabled={flushingCache}
                  className="px-3 py-1 bg-m3-primary/10 hover:bg-m3-primary/15 text-m3-primary text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${flushingCache ? 'animate-spin' : ''}`} /> 
                  {flushingCache ? 'Clearing cache...' : 'Flush Server Cache'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'robots.txt', route: '/robots.txt', valid: !editingControls?.robotsTxt?.content.includes("Disallow: /") },
                  { name: 'sitemap.xml', route: '/sitemap.xml', valid: issuesList.filter(i => i.category === 'Indexing Conflict').length === 0 },
                  { name: 'llms.txt', route: '/llms.txt', valid: issuesList.filter(i => i.category === 'GEO / LLM').length === 0 }
                ].map(file => (
                  <div key={file.name} className="flex items-center justify-between bg-white dark:bg-m3-surface/5 px-4 py-3 rounded-xl border border-m3-outline/10 text-left">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-m3-on-surface">{file.name}</h4>
                      <span className={`text-[10px] flex items-center gap-1 font-semibold ${file.valid ? 'text-green-500' : 'text-amber-500'}`}>
                        <CheckCircle className="w-3 h-3" /> {file.valid ? 'Active (Valid)' : 'Needs attention'}
                      </span>
                    </div>
                    <a
                      href={file.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-m3-surface-container rounded-lg text-m3-on-surface/60"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-sm">Common Operations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setActiveTab('pages'); setSelectedPageId('homepage'); }} 
                  className="flex items-center justify-between p-4 bg-m3-primary/5 hover:bg-m3-primary/10 border border-m3-primary/15 rounded-2xl text-left"
                >
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary">Home Metadata</h4>
                    <p className="text-xs text-m3-on-surface/60 mt-1">Configure home search title and index options.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-m3-primary" />
                </button>

                <button 
                  onClick={() => { setActiveTab('integrations'); }} 
                  className="flex items-center justify-between p-4 bg-m3-primary/5 hover:bg-m3-primary/10 border border-m3-primary/15 rounded-2xl text-left"
                >
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary">Configure Analytics</h4>
                    <p className="text-xs text-m3-on-surface/60 mt-1">Update Google Tag Manager IDs and web verification.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-m3-primary" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PAGES --- */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-semibold mb-1">Page SEO/GEO Manager</h2>
                <p className="text-sm text-m3-on-surface/60">Fine-tune discoverability parameters per specific landing and content pages.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {editingPage && (
                  <button
                    onClick={handleAutoGenerate}
                    disabled={generatingAI}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer flex items-center gap-1.5 shadow-md transition-all"
                  >
                    {generatingAI ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /> Generate with AI</>
                    )}
                  </button>
                )}
                {isDirty && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Unsaved overrides</span>
                    <button onClick={handleSave} className="px-4 py-2 bg-m3-primary text-white text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer hover:bg-m3-primary/95 flex items-center gap-1.5 shadow-sm">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* AI Toast Notification */}
            {aiToast && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                aiToast.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {aiToast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {aiToast.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-m3-outline/10 pt-6">
              {/* Pages Tree / List (Left Panel) */}
              <div className="md:col-span-1 bg-m3-surface/30 dark:bg-m3-surface/5 rounded-2xl p-4 border border-m3-outline/10 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-m3-on-surface/40">Select Site Route</span>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                  {/* Static Page List */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-m3-primary mb-1">Static Navigation</h4>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: 'homepage', path: '/', label: 'Home Page' },
                        { id: 'about', path: '/about', label: 'About' },
                        { id: 'case_work', path: '/case-work', label: 'Case Work Hub' },
                        { id: 'my_writings', path: '/my-writings', label: 'Writings Hub' },
                        { id: 'reach_me', path: '/reach-me', label: 'Contact/Reach Me' },
                        { id: 'testimonials', path: '/testimonials', label: 'Testimonials' },
                        { id: 'my_life_story', path: '/my-life-story', label: 'My Story' }
                      ].map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedPageId(p.id); }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors ${
                            selectedPageId === p.id 
                              ? 'bg-m3-primary/10 text-m3-primary font-bold border border-m3-primary/20' 
                              : 'text-m3-on-surface/75 hover:bg-m3-surface-container'
                          }`}
                        >
                          <span>{p.label}</span>
                          <span className="text-[9px] font-mono opacity-50">{p.path}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Blog Posts list */}
                  {cmsContent.filter(item => item.contentType === 'blog').length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-m3-primary mb-1">Insights / Blog Posts</h4>
                      <div className="flex flex-col gap-1">
                        {cmsContent.filter(item => item.contentType === 'blog').map(item => (
                          <button
                            key={item.id}
                            onClick={() => { setSelectedPageId(`blog_${item.id}`); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors ${
                              selectedPageId === `blog_${item.id}` 
                                ? 'bg-m3-primary/10 text-m3-primary font-bold border border-m3-primary/20' 
                                : 'text-m3-on-surface/75 hover:bg-m3-surface-container'
                            }`}
                          >
                            <span className="truncate pr-2">{item.title}</span>
                            <span className="text-[9px] font-mono opacity-50 shrink-0">blog</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Case Studies list */}
                  {cmsContent.filter(item => item.contentType === 'case_study').length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-m3-primary mb-1">Case Studies</h4>
                      <div className="flex flex-col gap-1">
                        {cmsContent.filter(item => item.contentType === 'case_study').map(item => (
                          <button
                            key={item.id}
                            onClick={() => { setSelectedPageId(`case_study_${item.id}`); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-colors ${
                              selectedPageId === `case_study_${item.id}` 
                                ? 'bg-m3-primary/10 text-m3-primary font-bold border border-m3-primary/20' 
                                : 'text-m3-on-surface/75 hover:bg-m3-surface-container'
                            }`}
                          >
                            <span className="truncate pr-2">{item.title}</span>
                            <span className="text-[9px] font-mono opacity-50 shrink-0">case</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Editor Workspace (Right Panel) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Route Header Info */}
                <div className="bg-m3-surface dark:bg-m3-surface/5 p-4 rounded-2xl border border-m3-outline/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-m3-primary">SELECTED ROUTE: {editingPage?.path}</h3>
                    <p className="text-[10px] text-m3-on-surface/50 mt-1">Key: {selectedPageId} | Type: {editingPage?.pageType}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${editingPage?.published ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {editingPage?.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Sub-tabs for page properties */}
                <div className="flex border-b border-m3-outline/10 pb-2 gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'seo', label: 'SEO Metadata' },
                    { id: 'geo', label: 'GEO / AI Engine' },
                    { id: 'social', label: 'Previews & Schema' },
                    { id: 'technical', label: 'Technical Directives' }
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setPageSubTab(sub.id as PageSubTab); }}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 shrink-0 ${
                        pageSubTab === sub.id 
                          ? 'border-m3-primary text-m3-primary' 
                          : 'border-transparent text-m3-on-surface/50 hover:text-m3-on-surface'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* --- PAGE SUB-TAB: SEO --- */}
                {pageSubTab === 'seo' && editingPage && (
                  <div className="space-y-6 text-left">
                    {/* Page Title Override */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/75 flex items-center gap-1.5">
                            SEO Page Title
                            <button
                              type="button"
                              disabled={generatingField === 'title' || generatingAI}
                              onClick={() => handleAutoGenerateField('seo', 'title', 'seoTitle')}
                              title="Regenerate Title with AI"
                              className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <Sparkles className={`w-3 h-3 ${generatingField === 'title' ? 'animate-spin text-purple-500' : ''}`} />
                            </button>
                          </label>
                          {getResolvedValue('title', editingPage).isOverride ? (
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-green-500/10">Override</span>
                          ) : (
                            <span className="text-[9px] bg-m3-on-surface/5 text-m3-on-surface/50 px-1.5 py-0.5 rounded font-mono">
                              Inherited ({getResolvedValue('title', editingPage).origin})
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono ${ (editingPage.seo?.title?.length || 0) > 60 ? 'text-m3-error font-bold' : 'text-m3-on-surface/40' }`}>
                          {editingPage.seo?.title?.length || 0} / 60 characters
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={getResolvedValue('title', editingPage).value}
                        value={editingPage.seo?.title || ""}
                        onChange={e => handlePageFieldChange('seo', 'title', e.target.value)}
                        className={`w-full text-sm px-4 py-2.5 border rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-none focus:ring-1 ${
                          getResolvedValue('title', editingPage).isOverride 
                            ? 'border-green-500/30 focus:border-green-500 focus:ring-green-500/20' 
                            : 'border-m3-outline/20 focus:border-m3-primary focus:ring-m3-primary/20'
                        }`}
                      />
                    </div>

                    {/* Meta Description Override */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/75 flex items-center gap-1.5">
                            Meta Description
                            <button
                              type="button"
                              disabled={generatingField === 'description' || generatingAI}
                              onClick={() => handleAutoGenerateField('seo', 'description', 'metaDescription')}
                              title="Regenerate Meta Description with AI"
                              className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <Sparkles className={`w-3 h-3 ${generatingField === 'description' ? 'animate-spin text-purple-500' : ''}`} />
                            </button>
                          </label>
                          {getResolvedValue('description', editingPage).isOverride ? (
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-green-500/10">Override</span>
                          ) : (
                            <span className="text-[9px] bg-m3-on-surface/5 text-m3-on-surface/50 px-1.5 py-0.5 rounded font-mono">
                              Inherited ({getResolvedValue('description', editingPage).origin})
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] font-mono ${ (editingPage.seo?.description?.length || 0) > 160 ? 'text-m3-error font-bold' : 'text-m3-on-surface/40' }`}>
                          {editingPage.seo?.description?.length || 0} / 160 characters
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        placeholder={getResolvedValue('description', editingPage).value}
                        value={editingPage.seo?.description || ""}
                        onChange={e => handlePageFieldChange('seo', 'description', e.target.value)}
                        className={`w-full text-sm px-4 py-2.5 border rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-none focus:ring-1 ${
                          getResolvedValue('description', editingPage).isOverride 
                            ? 'border-green-500/30 focus:border-green-500 focus:ring-green-500/20' 
                            : 'border-m3-outline/20 focus:border-m3-primary focus:ring-m3-primary/20'
                        }`}
                      />
                    </div>

                    {/* Canonical URL */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/75">Canonical URL Override</label>
                          {getResolvedValue('canonical', editingPage).isOverride ? (
                            <span className="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-green-500/10">Override</span>
                          ) : (
                            <span className="text-[9px] bg-m3-on-surface/5 text-m3-on-surface/50 px-1.5 py-0.5 rounded font-mono">
                              Inherited ({getResolvedValue('canonical', editingPage).origin})
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        type="url"
                        placeholder={getResolvedValue('canonical', editingPage).value}
                        value={editingPage.seo?.canonical || ""}
                        onChange={e => handlePageFieldChange('seo', 'canonical', e.target.value)}
                        className={`w-full text-sm px-4 py-2.5 border rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-none focus:ring-1 ${
                          getResolvedValue('canonical', editingPage).isOverride 
                            ? 'border-green-500/30 focus:border-green-500 focus:ring-green-500/20' 
                            : 'border-m3-outline/20 focus:border-m3-primary focus:ring-m3-primary/20'
                        }`}
                      />
                    </div>

                    {/* Primary Keyword / H1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                          Primary Target Keyword
                          <button
                            type="button"
                            disabled={generatingField === 'primaryKeyword' || generatingAI}
                            onClick={() => handleAutoGenerateField('seo', 'primaryKeyword', 'primaryKeyword')}
                            title="Regenerate Primary Keyword with AI"
                            className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Sparkles className={`w-3 h-3 ${generatingField === 'primaryKeyword' ? 'animate-spin text-purple-500' : ''}`} />
                          </button>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ai bid automation"
                          value={editingPage.seo?.primaryKeyword || ""}
                          onChange={e => handlePageFieldChange('seo', 'primaryKeyword', e.target.value)}
                          className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Primary H1 Tag Override</label>
                        <input
                          type="text"
                          placeholder="Overrides visible H1 context where configured"
                          value={editingPage.seo?.h1 || ""}
                          onChange={e => handlePageFieldChange('seo', 'h1', e.target.value)}
                          className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- PAGE SUB-TAB: GEO (AI / Discoverability) --- */}
                {pageSubTab === 'geo' && editingPage && (
                  <div className="space-y-5">
                    
                    {/* Include in llms.txt toggle */}
                    <div className="flex items-center justify-between p-4 bg-m3-primary/5 rounded-2xl border border-m3-primary/10">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> Include in llms.txt directory
                        </h4>
                        <p className="text-[10px] text-m3-on-surface/60">Tells semantic crawlers and AI bidding directories that this page contains structured guidance.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPage.geo?.includeInLlms !== false}
                          onChange={e => handlePageFieldChange('geo', 'includeInLlms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-m3-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                      </label>
                    </div>

                    {/* GEO Priority Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">AI Visible Priority / Significance Weight</label>
                        <span className="text-xs font-mono font-bold text-m3-primary">{editingPage.geo?.aiVisiblePriority ?? 0.8}</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.1"
                        value={editingPage.geo?.aiVisiblePriority ?? 0.8}
                        onChange={e => handlePageFieldChange('geo', 'aiVisiblePriority', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-m3-outline/20 rounded-lg appearance-none cursor-pointer accent-m3-primary"
                      />
                      <p className="text-[9px] text-m3-on-surface/40 leading-relaxed">Higher weight maps the item higher in sorting logic inside the dynamically compiled `/llms.txt` directory.</p>
                    </div>

                    {/* GEO Titles overrides */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                          GEO llms.txt Specific Title
                          <button
                            type="button"
                            disabled={generatingField === 'llmsTitle' || generatingAI}
                            onClick={() => handleAutoGenerateField('geo', 'llmsTitle', 'llmsTitle')}
                            title="Regenerate Specific Title with AI"
                            className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Sparkles className={`w-3 h-3 ${generatingField === 'llmsTitle' ? 'animate-spin text-purple-500' : ''}`} />
                          </button>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AI Transforming Bidding Systems"
                          value={editingPage.geo?.llmsTitle || ""}
                          onChange={e => handlePageFieldChange('geo', 'llmsTitle', e.target.value)}
                          className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                          llms.txt Brief description
                          <button
                            type="button"
                            disabled={generatingField === 'llmsDescription' || generatingAI}
                            onClick={() => handleAutoGenerateField('geo', 'llmsDescription', 'llmsDescription')}
                            title="Regenerate Description with AI"
                            className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Sparkles className={`w-3 h-3 ${generatingField === 'llmsDescription' ? 'animate-spin text-purple-500' : ''}`} />
                          </button>
                        </label>
                        <input
                          type="text"
                          placeholder="Single line overview for index files"
                          value={editingPage.geo?.llmsDescription || ""}
                          onChange={e => handlePageFieldChange('geo', 'llmsDescription', e.target.value)}
                          className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                      </div>
                    </div>

                    {/* AI / Machine Readable Summary */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                        Machine-Readable Content Summary
                        <button
                          type="button"
                          disabled={generatingField === 'aiSummary' || generatingAI}
                          onClick={() => handleAutoGenerateField('geo', 'aiSummary', 'aiSummary')}
                          title="Regenerate Summary with AI"
                          className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Sparkles className={`w-3 h-3 ${generatingField === 'aiSummary' ? 'animate-spin text-purple-500' : ''}`} />
                        </button>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide a highly structured, dense semantic summary detailing factual context, main outputs, and numerical outcomes."
                        value={editingPage.geo?.aiSummary || ""}
                        onChange={e => handlePageFieldChange('geo', 'aiSummary', e.target.value)}
                        className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                    </div>

                    {/* Page Purpose */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                        Page Core Purpose
                        <button
                          type="button"
                          disabled={generatingField === 'pagePurpose' || generatingAI}
                          onClick={() => handleAutoGenerateField('geo', 'pagePurpose', 'pagePurpose')}
                          title="Regenerate Page Purpose with AI"
                          className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Sparkles className={`w-3 h-3 ${generatingField === 'pagePurpose' ? 'animate-spin text-purple-500' : ''}`} />
                        </button>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="What is the primary role / goal of this page?"
                        value={editingPage.geo?.pagePurpose || ""}
                        onChange={e => handlePageFieldChange('geo', 'pagePurpose', e.target.value)}
                        className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                    </div>

                    {/* Key Entities */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Key Entities (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. AI automation, digital transformation, cloud strategy"
                        value={(editingPage.geo?.keyEntities || []).join(', ')}
                        onChange={e => {
                          const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          handlePageFieldChange('geo', 'keyEntities', list);
                        }}
                        className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                    </div>

                    {/* FAQ / Curated Explanations */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                        FAQ / Curated Q&As (Markdown format)
                        <button
                          type="button"
                          disabled={generatingField === 'curatedExplanation' || generatingAI}
                          onClick={() => handleAutoGenerateField('geo', 'curatedExplanation', 'curatedExplanation')}
                          title="Regenerate FAQs with AI"
                          className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Sparkles className={`w-3 h-3 ${generatingField === 'curatedExplanation' ? 'animate-spin text-purple-500' : ''}`} />
                        </button>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="### Q: Question?&#10;A: Answer details."
                        value={editingPage.geo?.curatedExplanation || ""}
                        onChange={e => handlePageFieldChange('geo', 'curatedExplanation', e.target.value)}
                        className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                    </div>

                    <div className="border-t border-m3-outline/10 pt-4 mt-6">
                      <h3 className="font-display font-semibold text-sm text-m3-primary mb-3 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> Agent-Readable Markdown Layer (.md)
                      </h3>

                      <div className="space-y-4">
                        {/* Enable Markdown Version Toggle */}
                        <div className="flex items-center justify-between p-4 bg-m3-primary/5 rounded-2xl border border-m3-primary/10">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary">
                              Enable Markdown Representation
                            </h4>
                            <p className="text-[10px] text-m3-on-surface/60">Generate and serve a clean Markdown file of this page at `{editingPage.path || '/'}.md` for AI scrapers.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingPage.geo?.markdownEnabled !== false}
                              onChange={e => handlePageFieldChange('geo', 'markdownEnabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-m3-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                          </label>
                        </div>

                        {editingPage.geo?.markdownEnabled !== false && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Custom Markdown Title */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                                  Markdown Title Override
                                  <button
                                    type="button"
                                    disabled={generatingField === 'markdownTitleOverride' || generatingAI}
                                    onClick={() => handleAutoGenerateField('geo', 'markdownTitleOverride', 'markdownTitleOverride')}
                                    title="Regenerate Title Override with AI"
                                    className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                                  >
                                    <Sparkles className={`w-3 h-3 ${generatingField === 'markdownTitleOverride' ? 'animate-spin text-purple-500' : ''}`} />
                                  </button>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Defaults to SEO Title"
                                  value={editingPage.geo?.markdownTitleOverride || ""}
                                  onChange={e => handlePageFieldChange('geo', 'markdownTitleOverride', e.target.value)}
                                  className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                                />
                              </div>

                              {/* LLMs Link Behaviour */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">llms.txt Link Target</label>
                                <select
                                  value={editingPage.geo?.markdownLlmsLinkBehaviour || "html_link"}
                                  onChange={e => handlePageFieldChange('geo', 'markdownLlmsLinkBehaviour', e.target.value)}
                                  className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                                >
                                  <option value="html_link">HTML Canonical Link ({editingPage.path})</option>
                                  <option value="md_link">Markdown Link ({editingPage.path === '/' ? '' : editingPage.path}.md)</option>
                                </select>
                              </div>
                            </div>

                            {/* Custom Markdown Summary */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 flex items-center gap-1.5">
                                Markdown Summary Override
                                <button
                                  type="button"
                                  disabled={generatingField === 'markdownSummary' || generatingAI}
                                  onClick={() => handleAutoGenerateField('geo', 'markdownSummary', 'markdownSummary')}
                                  title="Regenerate Summary Override with AI"
                                  className="p-1 hover:bg-m3-primary/10 rounded-full text-m3-primary/60 hover:text-m3-primary disabled:opacity-50 transition-colors cursor-pointer"
                                >
                                  <Sparkles className={`w-3 h-3 ${generatingField === 'markdownSummary' ? 'animate-spin text-purple-500' : ''}`} />
                                </button>
                              </label>
                              <textarea
                                rows={3}
                                placeholder="Defaults to AI Summary or Meta Description"
                                value={editingPage.geo?.markdownSummary || ""}
                                onChange={e => handlePageFieldChange('geo', 'markdownSummary', e.target.value)}
                                className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                              />
                            </div>

                            {/* Section Inclusions */}
                            <div className="flex gap-6">
                              <label className="flex items-center gap-2 text-xs text-m3-on-surface/85 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingPage.geo?.markdownIncludeEntities !== false}
                                  onChange={e => handlePageFieldChange('geo', 'markdownIncludeEntities', e.target.checked)}
                                  className="rounded border-m3-outline/20 text-m3-primary focus:ring-m3-primary"
                                />
                                Include Key Entities
                              </label>

                              <label className="flex items-center gap-2 text-xs text-m3-on-surface/85 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingPage.geo?.markdownIncludeFaq !== false}
                                  onChange={e => handlePageFieldChange('geo', 'markdownIncludeFaq', e.target.checked)}
                                  className="rounded border-m3-outline/20 text-m3-primary focus:ring-m3-primary"
                                />
                                Include FAQs
                              </label>
                            </div>

                            {/* Live Preview */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50">Live Agent-Readable Markdown Preview</span>
                              <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-[10px] rounded-lg overflow-x-auto whitespace-pre-wrap select-all">
{`# ${editingPage.geo?.markdownTitleOverride || editingPage.seo?.title || editingPage.slug || ''}

> ${editingPage.geo?.markdownSummary || editingPage.geo?.aiSummary || editingPage.seo?.description || ''}

## Purpose
${editingPage.geo?.pagePurpose || 'General info page.'}

${editingPage.geo?.markdownIncludeEntities !== false && editingPage.geo?.keyEntities && editingPage.geo.keyEntities.length > 0 ? `## Key Entities & Concepts\n${editingPage.geo.keyEntities.map(e => `- **${e}**`).join('\n')}\n\n` : ''}${editingPage.geo?.markdownIncludeFaq !== false && editingPage.geo?.curatedExplanation ? `## Frequently Answered Questions\n${editingPage.geo.curatedExplanation}\n\n` : ''}## References & Canonical Link
- Canonical URL: [${editingOrganisation?.baseOriginUrl || 'https://abdullahmalikconsultancy.web.app'}${editingPage.path || ''}](${editingOrganisation?.baseOriginUrl || 'https://abdullahmalikconsultancy.web.app'}${editingPage.path || ''})
- Publisher: [${editingOrganisation?.name || 'Abdullah Malik'}](${editingOrganisation?.baseOriginUrl || 'https://abdullahmalikconsultancy.web.app'})`}
                              </pre>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- PAGE SUB-TAB: SOCIAL & PREVIEWS --- */}
                {pageSubTab === 'social' && editingPage && (
                  <div className="space-y-6">
                    
                    {/* Visual Google Search Preview */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5" /> Google Search (SERP) Preview
                      </h4>
                      <div className="bg-white dark:bg-[#121016] border border-m3-outline/10 p-5 rounded-2xl space-y-1 text-left font-sans">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">https://abdullahmalikconsultancy.web.app{editingPage.path}</span>
                        <h4 className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium leading-tight line-clamp-1">
                          {getResolvedPreviewTitle()}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal line-clamp-2">
                          {getResolvedPreviewDesc()}
                        </p>
                      </div>
                    </div>

                    {/* Visual Card preview */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" /> Social Meta (Facebook / LinkedIn) Preview Card
                      </h4>
                      <div className="bg-[#fcfbfd] dark:bg-[#151319] border border-m3-outline/10 rounded-2xl overflow-hidden text-left max-w-sm">
                        <div className="h-40 bg-[#dfdbeb] dark:bg-m3-surface/20 flex items-center justify-center text-m3-on-surface/40">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                        <div className="p-4 border-t border-m3-outline/10 space-y-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider opacity-50">ARTERYANIMATED.COM</span>
                          <h5 className="font-bold text-xs line-clamp-1">{getResolvedPreviewTitle()}</h5>
                          <p className="text-[11px] text-m3-on-surface/60 line-clamp-2 leading-relaxed">{getResolvedPreviewDesc()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Schema Type */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Structured JSON-LD Schema Type</label>
                      <select
                        value={editingPage.seo?.schemaType || "WebPage"}
                        onChange={e => handlePageFieldChange('seo', 'schemaType', e.target.value)}
                        className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      >
                        <option value="WebPage">WebPage</option>
                        <option value="Article">Article</option>
                        <option value="Service">Service</option>
                        <option value="FAQ">FAQ Page</option>
                        <option value="Organization">Organization</option>
                      </select>
                    </div>

                    {/* Raw JSON-LD Schema Preview */}
                    <div className="space-y-2 text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" /> Generated JSON-LD Code Block
                      </h4>
                      <pre className="p-4 rounded-xl border border-m3-outline/10 bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {getJsonLdPreview()}
                      </pre>
                    </div>
                  </div>
                )}

                {/* --- PAGE SUB-TAB: TECHNICAL --- */}
                {pageSubTab === 'technical' && editingPage && (
                  <div className="space-y-5">
                    
                    {/* Indexability Directives */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-m3-surface dark:bg-m3-surface/5 p-4 rounded-2xl border border-m3-outline/10 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/85">Crawl Indexability</h4>
                          <p className="text-[9px] text-m3-on-surface/50 mt-0.5">Toggle index / noindex tags</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPage.seo?.robots ? editingPage.seo.robots.index : true}
                            onChange={e => handlePageFieldChange('seo', 'robots', {
                              index: e.target.checked,
                              follow: editingPage.seo?.robots ? editingPage.seo.robots.follow : true
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-m3-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                        </label>
                      </div>

                      <div className="bg-m3-surface dark:bg-m3-surface/5 p-4 rounded-2xl border border-m3-outline/10 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-m3-on-surface/85">Sitemap Inclusion</h4>
                          <p className="text-[9px] text-m3-on-surface/50 mt-0.5">Include in dynamically served list</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPage.technical?.includeInSitemap !== false}
                            onChange={e => handlePageFieldChange('technical', 'includeInSitemap', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-m3-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                        </label>
                      </div>
                    </div>

                    {/* Status Code Override & Redirect mapping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">HTTP Status Code Override</label>
                        <select
                          value={editingPage.technical?.statusCodeOverride || 200}
                          onChange={e => handlePageFieldChange('technical', 'statusCodeOverride', parseInt(e.target.value))}
                          className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        >
                          <option value="200">200 OK (Standard serving)</option>
                          <option value="301">301 Moved Permanently (Redirect)</option>
                          <option value="302">302 Found (Temporary Redirect)</option>
                          <option value="404">404 Not Found (Index block)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Redirect Destination URL / Path</label>
                        <input
                          type="text"
                          placeholder="e.g. /new-destination-path"
                          disabled={![301, 302].includes(editingPage.technical?.statusCodeOverride || 200)}
                          value={editingPage.technical?.redirectDestination || ""}
                          onChange={e => handlePageFieldChange('technical', 'redirectDestination', e.target.value)}
                          className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: INTEGRATIONS --- */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display font-semibold mb-1">Integrations & Organisation Profile</h2>
                <p className="text-sm text-m3-on-surface/60">Configure analytics keys, verification parameters, and brand identity fallbacks.</p>
              </div>
              {isDirty && (
                <button onClick={handleSave} className="px-5 py-2 bg-m3-primary hover:bg-m3-primary/95 text-white text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <Save className="w-4 h-4" /> Save
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-m3-outline/10 pt-6">
              
              {/* Analytics & Search Verification */}
              <div className="space-y-6 text-left">
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-sm border-b border-m3-outline/10 pb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-m3-primary" /> Analytics & Pixel IDs
                  </h3>
                  
                  <div className="space-y-4">
                    {/* GTM */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Google Tag Manager ID</label>
                        {editingIntegrations?.tracking?.googleTagManager?.id && !/^GTM-[A-Z0-9]+$/i.test(editingIntegrations.tracking.googleTagManager.id) && (
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Invalid GTM format</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="GTM-XXXXXX"
                          value={editingIntegrations?.tracking?.googleTagManager?.id || ""}
                          onChange={e => handleIntegrationsChange('tracking', 'googleTagManager', {
                            id: e.target.value,
                            enabled: editingIntegrations?.tracking?.googleTagManager?.enabled ?? true
                          })}
                          className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingIntegrations?.tracking?.googleTagManager) return;
                            handleIntegrationsChange('tracking', 'googleTagManager', {
                              ...editingIntegrations.tracking.googleTagManager,
                              enabled: !editingIntegrations.tracking.googleTagManager.enabled
                            });
                          }}
                          className={`px-3 text-xs font-bold rounded-xl border transition-colors ${editingIntegrations?.tracking?.googleTagManager?.enabled ? 'bg-green-500/10 text-green-500 border-green-500/25' : 'bg-red-500/10 text-red-500 border-red-500/25'}`}
                        >
                          {editingIntegrations?.tracking?.googleTagManager?.enabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                      <span className="text-[9px] text-m3-on-surface/40 block">Injected in &lt;head&gt; and fallback in &lt;body&gt;.</span>
                    </div>

                    {/* GA4 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Google Analytics (GA4) ID</label>
                        {editingIntegrations?.tracking?.googleAnalytics?.id && !/^G-[A-Z0-9]+$/i.test(editingIntegrations.tracking.googleAnalytics.id) && (
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Invalid GA4 format</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="G-XXXXXX"
                          value={editingIntegrations?.tracking?.googleAnalytics?.id || ""}
                          onChange={e => handleIntegrationsChange('tracking', 'googleAnalytics', {
                            id: e.target.value,
                            enabled: editingIntegrations?.tracking?.googleAnalytics?.enabled ?? true
                          })}
                          className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingIntegrations?.tracking?.googleAnalytics) return;
                            handleIntegrationsChange('tracking', 'googleAnalytics', {
                              ...editingIntegrations.tracking.googleAnalytics,
                              enabled: !editingIntegrations.tracking.googleAnalytics.enabled
                            });
                          }}
                          className={`px-3 text-xs font-bold rounded-xl border transition-colors ${editingIntegrations?.tracking?.googleAnalytics?.enabled ? 'bg-green-500/10 text-green-500 border-green-500/25' : 'bg-red-500/10 text-red-500 border-red-500/25'}`}
                        >
                          {editingIntegrations?.tracking?.googleAnalytics?.enabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                      <span className="text-[9px] text-m3-on-surface/40 block">Injected in &lt;head&gt; header wrapper.</span>
                    </div>

                    {/* Facebook Pixel */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Meta (Facebook) Pixel ID</label>
                        {editingIntegrations?.tracking?.metaPixel?.id && !/^\d+$/.test(editingIntegrations.tracking.metaPixel.id) && (
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Must be digits only</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Numeric ID"
                          value={editingIntegrations?.tracking?.metaPixel?.id || ""}
                          onChange={e => handleIntegrationsChange('tracking', 'metaPixel', {
                            id: e.target.value,
                            enabled: editingIntegrations?.tracking?.metaPixel?.enabled ?? true
                          })}
                          className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingIntegrations?.tracking?.metaPixel) return;
                            handleIntegrationsChange('tracking', 'metaPixel', {
                              ...editingIntegrations.tracking.metaPixel,
                              enabled: !editingIntegrations.tracking.metaPixel.enabled
                            });
                          }}
                          className={`px-3 text-xs font-bold rounded-xl border transition-colors ${editingIntegrations?.tracking?.metaPixel?.enabled ? 'bg-green-500/10 text-green-500 border-green-500/25' : 'bg-red-500/10 text-red-500 border-red-500/25'}`}
                        >
                          {editingIntegrations?.tracking?.metaPixel?.enabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                      <span className="text-[9px] text-m3-on-surface/40 block">Injected in &lt;head&gt; script triggers.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="font-display font-semibold text-sm border-b border-m3-outline/10 pb-2 flex items-center gap-2">
                    <Database className="w-4 h-4 text-m3-primary" /> Search Console Verification
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Google Site Verification Token</label>
                      <input
                        type="text"
                        placeholder="Google-provided validation string"
                        value={editingIntegrations?.verification?.google || ""}
                        onChange={e => handleIntegrationsChange('verification', 'google', e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                      {editingIntegrations?.verification?.google && (
                        <code className="text-[9px] text-m3-primary font-mono block mt-1">&lt;meta name="google-site-verification" content="{editingIntegrations.verification.google}" /&gt;</code>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Bing Webmaster Token</label>
                      <input
                        type="text"
                        placeholder="Bing verification token"
                        value={editingIntegrations?.verification?.bing || ""}
                        onChange={e => handleIntegrationsChange('verification', 'bing', e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                      {editingIntegrations?.verification?.bing && (
                        <code className="text-[9px] text-m3-primary font-mono block mt-1">&lt;meta name="msvalidate.01" content="{editingIntegrations.verification.bing}" /&gt;</code>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organisation Profile & Favicon */}
              <div className="space-y-6 text-left">
                <h3 className="font-display font-semibold text-sm border-b border-m3-outline/10 pb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-m3-primary" /> Organisation & Identity Profile
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Organisation Name</label>
                    <input
                      type="text"
                      value={editingOrganisation?.name || ""}
                      onChange={e => handleOrgChange('name', e.target.value)}
                      className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Website Display Name (SiteName)</label>
                      <input
                        type="text"
                        placeholder="Resolved title token fallback"
                        value={editingOrganisation?.websiteName || ""}
                        onChange={e => handleOrgChange('websiteName', e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Base Origin URL (Live Domain)</label>
                      <input
                        type="url"
                        placeholder="https://malikconsultancy.se"
                        value={editingOrganisation?.baseOriginUrl || ""}
                        onChange={e => handleOrgChange('baseOriginUrl', e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                      />
                    </div>
                  </div>

                  {/* Favicon Asset Uploader */}
                  <div className="bg-m3-surface/50 dark:bg-m3-surface/5 p-4 rounded-2xl border border-m3-outline/10 space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50">Favicon Asset Manager</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Master Favicon */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 block">Favicon Master (PNG/SVG)</label>
                        <div className="flex items-center gap-3">
                          {editingOrganisation?.faviconMasterUrl ? (
                            <img src={editingOrganisation.faviconMasterUrl} alt="Favicon Master" className="w-10 h-10 object-contain rounded border border-m3-outline/10 bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded border border-m3-outline/10 bg-m3-on-surface/5 flex items-center justify-center text-[10px] text-m3-on-surface/40">ICO</div>
                          )}
                          <label className="px-3 py-1.5 bg-m3-primary/10 hover:bg-m3-primary/15 text-m3-primary text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors">
                            {uploadingFavicon ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" onChange={handleFaviconUpload} disabled={uploadingFavicon} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {/* Apple Touch Icon */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70 block">Apple Touch Icon (180x180)</label>
                        <div className="flex items-center gap-3">
                          {editingOrganisation?.appleTouchIconUrl ? (
                            <img src={editingOrganisation.appleTouchIconUrl} alt="Apple Icon" className="w-10 h-10 object-contain rounded border border-m3-outline/10 bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded border border-m3-outline/10 bg-m3-on-surface/5 flex items-center justify-center text-[10px] text-m3-on-surface/40">PNG</div>
                          )}
                          <label className="px-3 py-1.5 bg-m3-primary/10 hover:bg-m3-primary/15 text-m3-primary text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors">
                            {uploadingAppleIcon ? 'Uploading...' : 'Upload Image'}
                            <input type="file" accept="image/*" onChange={handleAppleIconUpload} disabled={uploadingAppleIcon} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Default Brand Logo URL</label>
                    <input
                      type="text"
                      value={editingOrganisation?.logoUrl || ""}
                      onChange={e => handleOrgChange('logoUrl', e.target.value)}
                      className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Default Social Share Image (OG Image) URL</label>
                    <input
                      type="text"
                      value={editingOrganisation?.socialShareImage || ""}
                      onChange={e => handleOrgChange('socialShareImage', e.target.value)}
                      className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: SITE CONTROLS --- */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display font-semibold mb-1">Dynamic Site Controls</h2>
                <p className="text-sm text-m3-on-surface/60">Configure served robots.txt instructions, dynamic sitemaps, and machine directories.</p>
              </div>
              {isDirty && (
                <button onClick={handleSave} className="px-5 py-2 bg-m3-primary hover:bg-m3-primary/95 text-white text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <Save className="w-4 h-4" /> Save
                </button>
              )}
            </div>

            <div className="space-y-8 border-t border-m3-outline/10 pt-6 text-left">
              
              {/* robots.txt editor */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-m3-primary" /> Robots.txt Content Directives
                </h3>
                
                <textarea
                  rows={4}
                  value={editingControls?.robotsTxt?.content || ""}
                  onChange={e => handleControlsChange('robotsTxt', 'content', e.target.value)}
                  className="w-full text-xs font-mono p-4 border border-m3-outline/20 rounded-2xl bg-slate-900 text-slate-100 focus:outline-m3-primary leading-relaxed"
                />
                
                {/* Warnings check */}
                {editingControls?.robotsTxt?.content.includes("Disallow: /") && (
                  <div className="bg-amber-500/10 text-amber-500 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium border border-amber-500/20">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Warning: 'Disallow: /' block rule restricts all crawlers from parsing the site entirely.</span>
                  </div>
                )}

                {/* Served robots.txt Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50">Currently Served Output Preview</span>
                  <pre className="p-4 rounded-xl border border-m3-outline/10 bg-slate-950 text-slate-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {getDynamicRobotsPreview()}
                  </pre>
                </div>
              </div>

              {/* Sitemap configurations */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-m3-primary" /> Dynamic Sitemap Exclusions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'blog', label: 'Exclude Blog Pages' },
                    { key: 'case_study', label: 'Exclude Case Studies' },
                    { key: 'legal', label: 'Exclude Legal Pages' }
                  ].map(rule => (
                    <div key={rule.key} className="flex items-center justify-between p-4 bg-m3-surface dark:bg-m3-surface/5 border border-m3-outline/10 rounded-2xl">
                      <span className="text-xs font-bold text-m3-on-surface/85">{rule.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingControls?.sitemap?.excludePageTypes?.[rule.key as 'blog' | 'case_study' | 'legal'] === true}
                          onChange={e => {
                            const excludes = editingControls?.sitemap?.excludePageTypes || { blog: false, case_study: false, services: false, legal: true };
                            handleControlsChange('sitemap', 'excludePageTypes', {
                              ...excludes,
                              [rule.key]: e.target.checked
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-m3-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Sitemap inclusions lists preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50">Dynamic Sitemap Paths Mapping ({getDynamicSitemapPreviewList().filter(x => x.included).length} Included)</span>
                  <div className="max-h-60 overflow-y-auto border border-m3-outline/10 rounded-xl divide-y divide-m3-outline/10 text-xs font-mono">
                    {getDynamicSitemapPreviewList().map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center bg-m3-surface/30">
                        <span className="truncate pr-4 text-m3-on-surface/80">{item.loc}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-bold uppercase tracking-wider shrink-0 ${
                          item.included ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* llms.txt settings */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-m3-primary" /> Dynamic llms.txt Directory Preface
                </h3>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Site Intro (Served as LLM index header)</label>
                  <textarea
                    rows={3}
                    value={editingControls?.llms?.intro || ""}
                    onChange={e => handleControlsChange('llms', 'intro', e.target.value)}
                    className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                  />
                </div>

                {/* Served llms.txt Markdown Preview */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50">AI directory (llms.txt) catalog preview</span>
                  <pre className="p-4 rounded-xl border border-m3-outline/10 bg-slate-950 text-slate-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {getDynamicLlmsPreviewText()}
                  </pre>
                </div>
              </div>

              {/* Markdown for Agents global settings */}
              <div className="space-y-4 border-t border-m3-outline/10 pt-4 mt-6">
                <h3 className="font-display font-semibold text-sm flex items-center gap-2 text-m3-primary">
                  <FileText className="w-4 h-4" /> Markdown for Agents (AI-Readable Layer)
                </h3>

                <div className="bg-m3-primary/5 p-4 rounded-2xl border border-m3-primary/10 mb-4">
                  <p className="text-xs text-m3-on-surface/80 leading-relaxed">
                    <strong>Note:</strong> Enabling this creates a clean, semantic, token-efficient Markdown view of your pages at <code>/path.md</code>, designed specifically for AI crawlers, answer engines, and LLM search agents. It is not a ranking hack, but an accessibility standard for AI agents.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 bg-m3-surface dark:bg-m3-surface/5 border border-m3-outline/10 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-m3-on-surface/85">Enable Markdown Layer</span>
                      <p className="text-[9px] text-m3-on-surface/50">Toggle the entire agent-readable layer on/off.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingControls?.markdownAgents?.enabled !== false}
                        onChange={e => {
                          const config = editingControls?.markdownAgents || { enabled: true, behaviour: 'md_routes_accept_header', supportedContentTypes: { pages: true, services: true, blog: true, case_study: true } };
                          handleControlsChange('markdownAgents', 'enabled', e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-m3-outline/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                    </label>
                  </div>

                  {/* Behaviour selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Crawl access mode</label>
                    <select
                      value={editingControls?.markdownAgents?.behaviour || 'md_routes_accept_header'}
                      onChange={e => handleControlsChange('markdownAgents', 'behaviour', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 border border-m3-outline/20 rounded-xl bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface focus:outline-m3-primary"
                    >
                      <option value="md_routes_only">Strict .md file path routes only</option>
                      <option value="md_routes_accept_header">.md routes + Accept: text/markdown header negotiation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Supported Content Types</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'pages', label: 'Static Pages' },
                      { key: 'services', label: 'Service Pages' },
                      { key: 'blog', label: 'Blog Posts' },
                      { key: 'case_study', label: 'Case Studies' }
                    ].map(type => (
                      <label key={type.key} className="flex items-center gap-2 text-xs text-m3-on-surface/85 cursor-pointer bg-m3-surface dark:bg-m3-surface/5 p-3 rounded-xl border border-m3-outline/10">
                        <input
                          type="checkbox"
                          checked={editingControls?.markdownAgents?.supportedContentTypes?.[type.key as 'pages' | 'services' | 'blog' | 'case_study'] !== false}
                          onChange={e => {
                            const config = editingControls?.markdownAgents || { enabled: true, behaviour: 'md_routes_accept_header', supportedContentTypes: { pages: true, services: true, blog: true, case_study: true } };
                            const currentTypes = config.supportedContentTypes || { pages: true, services: true, blog: true, case_study: true };
                            handleControlsChange('markdownAgents', 'supportedContentTypes', {
                              ...currentTypes,
                              [type.key]: e.target.checked
                            });
                          }}
                          className="rounded border-m3-outline/20 text-m3-primary focus:ring-m3-primary"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interactive Page Selector & Live Markdown Preview */}
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Select Page for Live Markdown Preview</label>
                    <select
                      value={selectedPreviewPage}
                      onChange={e => setSelectedPreviewPage(e.target.value)}
                      className="text-xs px-3 py-1.5 border border-m3-outline/20 rounded-lg bg-m3-surface dark:bg-m3-surface/10 text-m3-on-surface"
                    >
                      {Object.keys(seoConfig?.pages || {}).map(pageKey => (
                        <option key={pageKey} value={pageKey}>
                          {seoConfig.pages[pageKey]?.path || pageKey}
                        </option>
                      ))}
                    </select>
                  </div>
                  <pre className="p-4 rounded-xl border border-m3-outline/10 bg-slate-950 text-slate-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto select-all">
                    {getPageMarkdownText(selectedPreviewPage)}
                  </pre>
                </div>

                {/* Info status */}
                <div className="flex items-center justify-between text-xs p-3 bg-m3-surface dark:bg-m3-surface/5 border border-m3-outline/10 rounded-xl">
                  <span className="text-m3-on-surface/80">Active AI-Readable routes count:</span>
                  <span className="font-bold text-m3-primary">
                    {(() => {
                      const totalPages = Object.keys(seoConfig?.pages || {}).length;
                      if (totalPages === 0) return 'No pages configured yet';
                      const enabled = Object.values(seoConfig?.pages || {}).filter((p: any) => p.geo?.markdownEnabled !== false).length;
                      return `${enabled} of ${totalPages} pages AI-readable`;
                    })()}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- TAB 5: TEMPLATES --- */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-display font-semibold mb-1">Content Templates Patterns</h2>
                <p className="text-sm text-m3-on-surface/60">Configure baseline schemas and metadata pattern fallbacks by route page type.</p>
              </div>
              {isDirty && (
                <button onClick={handleSave} className="px-5 py-2 bg-m3-primary hover:bg-m3-primary/95 text-white text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer flex items-center gap-1.5 shadow-sm">
                  <Save className="w-4 h-4" /> Save
                </button>
              )}
            </div>

            <div className="space-y-6 border-t border-m3-outline/10 pt-6">
              {['blog_post', 'case_study', 'service'].map(type => {
                const template = editingTemplates[type] || {
                  titlePattern: "{{title}} | {{siteName}}",
                  metaDescriptionPattern: "{{excerpt}}",
                  schemaType: "WebPage"
                };

                return (
                  <div key={type} className="bg-m3-surface/30 dark:bg-m3-surface/5 p-5 rounded-2xl border border-m3-outline/10 space-y-4">
                    <h3 className="font-mono text-xs font-bold uppercase text-m3-primary">PAGE TYPE: {type.replace('_', ' ').toUpperCase()}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Title Format Pattern</label>
                        <input
                          type="text"
                          value={template.titlePattern}
                          onChange={e => {
                            setIsDirty(true);
                            setEditingTemplates(prev => ({
                              ...prev,
                              [type]: { ...template, titlePattern: e.target.value }
                            }));
                          }}
                          className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-white dark:bg-[#1a1820] text-m3-on-surface focus:outline-m3-primary"
                        />
                        <p className="text-[9px] text-m3-on-surface/40 leading-none">Variables supported: `{"{{title}}"}` `{"{{siteName}}"}` `{"{{organisationName}}"}`</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-m3-on-surface/70">Meta Description Pattern</label>
                        <input
                          type="text"
                          value={template.metaDescriptionPattern}
                          onChange={e => {
                            setIsDirty(true);
                            setEditingTemplates(prev => ({
                              ...prev,
                              [type]: { ...template, metaDescriptionPattern: e.target.value }
                            }));
                          }}
                          className="w-full text-sm px-4 py-2 border border-m3-outline/20 rounded-xl bg-white dark:bg-[#1a1820] text-m3-on-surface focus:outline-m3-primary"
                        />
                        <p className="text-[9px] text-m3-on-surface/40 leading-none">Variables supported: `{"{{excerpt}}"}` `{"{{title}}"}`</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 6: QA COCKPIT (ISSUES & VALIDATION) --- */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold mb-1">SEO Validation Cockpit</h2>
              <p className="text-sm text-m3-on-surface/60">Live system checks, crawl conflicts, and diagnostic alerts across route setups.</p>
            </div>

            <div className="border-t border-m3-outline/10 pt-6 space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap gap-4 text-xs bg-m3-surface/30 dark:bg-m3-surface/5 p-4 rounded-2xl border border-m3-outline/10 text-left">
                <div className="space-y-1.5 mr-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50 block">Filter Severity</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'critical', label: 'Critical' },
                      { id: 'important', label: 'Important' },
                      { id: 'recommended', label: 'Recommended' }
                    ].map(sev => (
                      <button
                        key={sev.id}
                        onClick={() => setSelectedSeverityFilter(sev.id)}
                        className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors border ${
                          selectedSeverityFilter === sev.id
                            ? 'bg-m3-primary text-white border-m3-primary'
                            : 'bg-white dark:bg-m3-surface/10 text-m3-on-surface/70 border-m3-outline/20 hover:bg-m3-surface-container'
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-m3-on-surface/50 block">Filter Category</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'SEO Basics', label: 'SEO Basics' },
                      { id: 'GEO / LLM', label: 'GEO / LLM' },
                      { id: 'Indexing Conflict', label: 'Indexing' },
                      { id: 'Tracking', label: 'Tracking' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors border ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-m3-primary text-white border-m3-primary'
                            : 'bg-white dark:bg-m3-surface/10 text-m3-on-surface/70 border-m3-outline/20 hover:bg-m3-surface-container'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {issuesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 border border-green-500/20 bg-green-500/5 rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <h3 className="font-display font-semibold text-sm">Perfect Audit State!</h3>
                  <p className="text-xs text-m3-on-surface/60">All navigation pages met standard length, indexation, and verification criteria.</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-m3-on-surface/40">
                    Audit Alerts List ({issuesList.filter(issue => {
                      if (selectedSeverityFilter !== 'all' && issue.severity !== selectedSeverityFilter) return false;
                      if (selectedCategoryFilter !== 'all' && issue.category !== selectedCategoryFilter) return false;
                      return true;
                    }).length} shown)
                  </span>
                  
                  <div className="flex flex-col gap-2">
                    {issuesList
                      .filter(issue => {
                        if (selectedSeverityFilter !== 'all' && issue.severity !== selectedSeverityFilter) return false;
                        if (selectedCategoryFilter !== 'all' && issue.category !== selectedCategoryFilter) return false;
                        return true;
                      })
                      .map((issue, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-start justify-between p-4 rounded-xl border leading-relaxed text-left ${
                            issue.severity === 'critical' 
                              ? 'bg-red-500/5 border-red-500/10 text-red-500' 
                              : issue.severity === 'important'
                                ? 'bg-amber-500/5 border-amber-500/10 text-amber-500'
                                : 'bg-blue-500/5 border-blue-500/10 text-blue-500'
                          }`}
                        >
                          <div className="flex gap-3">
                            {issue.severity === 'critical' ? (
                              <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                            ) : issue.severity === 'important' ? (
                              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                            ) : (
                              <Info className="w-5 h-5 shrink-0 text-blue-500" />
                            )}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-m3-on-surface">
                                {issue.pageTitle} 
                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  issue.severity === 'critical' 
                                    ? 'bg-red-500/10 text-red-500' 
                                    : issue.severity === 'important'
                                      ? 'bg-amber-500/10 text-amber-500'
                                      : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                  {issue.severity}
                                </span>
                                <span className="text-[9px] font-mono opacity-50">({issue.category})</span>
                              </h4>
                              <p className="text-xs text-m3-on-surface/80 mt-1">{issue.message}</p>
                            </div>
                          </div>

                          {/* Quick link action to page tab */}
                          {issue.pageId !== 'global' && (
                            <button
                              onClick={() => {
                                setSelectedPageId(issue.pageId);
                                setActiveTab('pages');
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer ${
                                issue.severity === 'critical' 
                                  ? 'bg-red-500/10 hover:bg-red-500/15 text-red-500' 
                                  : issue.severity === 'important'
                                    ? 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-500'
                                    : 'bg-blue-500/10 hover:bg-blue-500/15 text-blue-500'
                              }`}
                            >
                              FIX PAGE
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
