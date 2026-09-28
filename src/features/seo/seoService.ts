import { ref as dbRef, get, set, update } from "firebase/database";
import { db } from "@/services/firebase/db";
import { getPublishedContent, ContentItem } from "@/services/firebase/cms";

// --- TYPES & INTERFACES ---

export interface PageSEOData {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: { index: boolean; follow: boolean };
  primaryKeyword?: string;
  h1?: string;
  breadcrumbLabel?: string;
  pageLanguage?: string;
  hreflang?: Array<{ lang: string; url: string }>;
  image?: string;
  imageAlt?: string;
  schemaType?: string;
}

export interface PageGEOData {
  aiSummary?: string;
  pagePurpose?: string;
  keyEntities?: string[];
  primaryAnswerIntent?: string;
  authoritativeSourceNote?: string;
  aiVisiblePriority?: number; // 0.0 to 1.0
  includeInLlms?: boolean;
  llmsTitle?: string;
  llmsDescription?: string;
  curatedExplanation?: string;
  // Markdown for Agents layer fields
  markdownEnabled?: boolean;
  markdownTitleOverride?: string;
  markdownSummary?: string;
  markdownCapabilities?: string[]; // AI-generated: key capabilities/content areas for rich markdown
  markdownOutcomes?: string[];     // AI-generated: value/outcomes for rich markdown
  markdownIncludeFaq?: boolean;
  markdownIncludeEntities?: boolean;
  markdownLlmsLinkBehaviour?: 'md_link' | 'html_link';
}

export interface PageSocialData {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface PageTechnicalData {
  includeInSitemap?: boolean;
  isCrawlable?: boolean;
  redirectSource?: string;
  redirectDestination?: string;
  statusCodeOverride?: number;
}

export interface PageSEOConfig {
  slug: string;
  path: string;
  pageType: 'homepage' | 'about' | 'case_work' | 'my_writings' | 'reach_me' | 'testimonials' | 'my_life_story' | 'service' | 'blog_post' | 'case_study' | 'custom';
  seo?: PageSEOData;
  geo?: PageGEOData;
  social?: PageSocialData;
  technical?: PageTechnicalData;
  updatedAt: string;
  published: boolean;
}

export interface VerificationConfig {
  google?: string;
  bing?: string;
  pinterest?: string;
  custom?: Array<{ name: string; value: string }>;
}

export interface GoogleAnalyticsConfig {
  id: string;
  enabled: boolean;
}

export interface GoogleTagManagerConfig {
  id: string;
  enabled: boolean;
}

export interface TrackingPixelConfig {
  id: string;
  enabled: boolean;
}

export interface CustomScript {
  id: string;
  name: string;
  code: string;
  placement: 'head' | 'body' | 'noscript';
  enabled: boolean;
}

export interface TrackingConfig {
  googleAnalytics?: GoogleAnalyticsConfig;
  googleTagManager?: GoogleTagManagerConfig;
  metaPixel?: TrackingPixelConfig;
  linkedinInsight?: TrackingPixelConfig;
  twitterPixel?: TrackingPixelConfig;
  tiktokPixel?: TrackingPixelConfig;
  customScripts?: CustomScript[];
}

export interface SocialProfilesConfig {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

export interface IntegrationsConfig {
  verification?: VerificationConfig;
  tracking?: TrackingConfig;
  socialProfiles?: SocialProfilesConfig;
}

export interface OrganisationConfig {
  name: string;
  websiteName: string;
  legalName: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  socialShareImage: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  description: string;
  sameAs?: string[];
  themeColor?: string;
  baseOriginUrl?: string;
  faviconMasterUrl?: string;
  favicon16Url?: string;
  favicon32Url?: string;
  icon192Url?: string;
  icon512Url?: string;
}

export interface RobotsTxtConfig {
  content: string;
  customOverride: boolean;
}

export interface SitemapConfig {
  autoGenerate: boolean;
  canonicalOnly: boolean;
  excludePageTypes?: {
    blog: boolean;
    case_study: boolean;
    services: boolean;
    legal: boolean;
  };
}

export interface LlmsConfig {
  intro: string;
  autoGenerate: boolean;
  customContent?: string;
}

export interface MarkdownAgentsConfig {
  enabled: boolean;
  behaviour: 'md_routes_only' | 'md_routes_accept_header';
  supportedContentTypes?: {
    pages: boolean;
    services: boolean;
    blog: boolean;
    case_study: boolean;
  };
}

export interface SiteControlsConfig {
  robotsTxt?: RobotsTxtConfig;
  sitemap?: SitemapConfig;
  llms?: LlmsConfig;
  markdownAgents?: MarkdownAgentsConfig;
}

export interface TemplateConfig {
  titlePattern: string; // e.g. "{{title}} | {{siteName}}"
  metaDescriptionPattern: string;
  schemaType: 'WebPage' | 'Article' | 'Service' | 'FAQ' | 'Organization' | 'BreadcrumbList' | 'Custom';
  defaultOgImage?: string;
  defaultRobots?: { index: boolean; follow: boolean };
  defaultSitemapInclusion?: boolean;
}

export interface GlobalSEOConfig {
  pages?: Record<string, PageSEOConfig>;
  integrations?: IntegrationsConfig;
  organisation?: OrganisationConfig;
  controls?: SiteControlsConfig;
  templates?: Record<string, TemplateConfig>;
}

// --- HELPER PATH SANITIZATION ---
// Realtime Database keys cannot contain forbidden characters (. $ # [ ] / )
export const sanitizeKey = (key: string): string => {
  if (key === '/') return 'homepage';
  return key
    .replace(/^\//, '') // strip leading slash
    .replace(/\/$/, '') // strip trailing slash
    .replace(/[\.\$#\[\]\/]/g, '_'); // replace forbidden chars
};

// --- DATA ACCESS OPERATIONS ---

export const getSEOConfig = async (): Promise<GlobalSEOConfig> => {
  const snapshot = await get(dbRef(db, 'seo'));
  if (snapshot.exists()) {
    return snapshot.val() as GlobalSEOConfig;
  }
  return {};
};

export const savePageSEO = async (pageId: string, pageData: PageSEOConfig): Promise<void> => {
  const cleanId = sanitizeKey(pageId);
  await set(dbRef(db, `seo/pages/${cleanId}`), {
    ...pageData,
    updatedAt: new Date().toISOString()
  });
};

export const saveIntegrationsConfig = async (config: IntegrationsConfig): Promise<void> => {
  await set(dbRef(db, 'seo/integrations'), config);
};

export const saveOrganisationConfig = async (config: OrganisationConfig): Promise<void> => {
  await set(dbRef(db, 'seo/organisation'), config);
};

export const saveSiteControlsConfig = async (config: SiteControlsConfig): Promise<void> => {
  await set(dbRef(db, 'seo/controls'), config);
};

export const saveTemplateConfig = async (pageType: string, config: TemplateConfig): Promise<void> => {
  await set(dbRef(db, `seo/templates/${pageType}`), config);
};

// --- ROUTE RESOLUTION LAYER ---

export interface ResolvedRoute {
  pageId: string;
  pageType: PageSEOConfig['pageType'];
  slug?: string;
  dbItem?: ContentItem | null;
}

export const resolveRoute = async (pathname: string): Promise<ResolvedRoute> => {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  // 1. Check static paths
  if (normalizedPath === '/') {
    return { pageId: 'homepage', pageType: 'homepage' };
  }
  if (normalizedPath === '/about') {
    return { pageId: 'about', pageType: 'about' };
  }
  if (normalizedPath === '/case-work') {
    return { pageId: 'case_work', pageType: 'case_work' };
  }
  if (normalizedPath === '/my-writings') {
    return { pageId: 'my_writings', pageType: 'my_writings' };
  }
  if (normalizedPath === '/reach-me') {
    return { pageId: 'reach_me', pageType: 'reach_me' };
  }
  if (normalizedPath === '/testimonials') {
    return { pageId: 'testimonials', pageType: 'testimonials' };
  }
  if (normalizedPath === '/my-life-story' || normalizedPath === '/my-life-playground') {
    return { pageId: 'my_life_story', pageType: 'my_life_story' };
  }

  // 2. Check service paths
  if (normalizedPath.startsWith('/services/')) {
    const slug = normalizedPath.substring('/services/'.length);
    return { pageId: `services_${slug}`, pageType: 'service', slug };
  }

  // 3. Resolve dynamic blog posts: `/writings/:id`
  if (normalizedPath.startsWith('/writings/')) {
    const idOrSlug = normalizedPath.substring('/writings/'.length);
    try {
      const published = await getPublishedContent();
      const blogItem = published.find(w => w.contentType === 'blog' && (w.slug === idOrSlug || w.id === idOrSlug));
      if (blogItem) {
        return {
          pageId: `blog_${blogItem.id}`,
          pageType: 'blog_post',
          slug: blogItem.slug || blogItem.id,
          dbItem: blogItem
        };
      }
    } catch (e) {
      console.error("Failed to resolve dynamic blog route:", e);
    }
  }

  // 4. Resolve dynamic case studies: `/case-study/:slug`
  if (normalizedPath.startsWith('/case-study/')) {
    const slugOrId = normalizedPath.substring('/case-study/'.length);
    try {
      const published = await getPublishedContent();
      const studyItem = published.find(w => w.contentType === 'case_study' && (w.slug === slugOrId || w.id === slugOrId));
      if (studyItem) {
        return {
          pageId: `case_study_${studyItem.id}`,
          pageType: 'case_study',
          slug: studyItem.slug || studyItem.id,
          dbItem: studyItem
        };
      }
    } catch (e) {
      console.error("Failed to resolve dynamic case study route:", e);
    }
  }

  // Custom fallback for any other paths
  return { pageId: sanitizeKey(normalizedPath), pageType: 'custom' };
};

// --- STRANGE-PROOF FALLBACK METADATA RESOLUTION ENGINE ---

export interface ResolvedMetadata {
  title: string;
  description: string;
  canonical: string;
  robots: { index: boolean; follow: boolean };
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemaType: string;
  schemaJsonLd: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  favicon16Url: string;
  favicon32Url: string;
  icon192Url: string;
  icon512Url: string;
  themeColor: string;
}

export const resolveMetadata = async (pathname: string): Promise<ResolvedMetadata> => {
  const route = await resolveRoute(pathname);
  const config = await getSEOConfig();
  
  const pageSEO = config.pages?.[sanitizeKey(route.pageId)];
  const pageType = route.pageType;
  const template = config.templates?.[pageType];
  const org = config.organisation || {
    name: "Abdullah Malik",
    websiteName: "Abdullah Malik Portfolio",
    legalName: "Abdullah Malik",
    contactEmail: "abdullahmalik66@gmail.com",
    contactPhone: "+46 76 000 0000",
    logoUrl: "",
    socialShareImage: "",
    faviconUrl: "",
    appleTouchIconUrl: "",
    description: "Independent Expert in growth and AI systems."
  };

  // Naming resolution variables
  const siteName = org.websiteName || org.name;
  const organisationName = org.name;

  // Resolve template variables
  const applyPatterns = (pattern: string, titleVal: string, descVal: string): string => {
    return pattern
      .replace(/\{\{title\}\}/g, titleVal || "")
      .replace(/\{\{excerpt\}\}/g, descVal || org.description || "")
      .replace(/\{\{siteName\}\}/g, siteName || "")
      .replace(/\{\{organisationName\}\}/g, organisationName || "")
      .replace(/\{\{[^}]+\}\}/g, "") // remove any unresolved placeholders
      .replace(/\s+/g, " ") // normalize spacing
      .trim();
  };

  // Determine core base inputs from dynamic db content or hardcoded path names
  let baseTitle = "";
  let baseDesc = "";
  if (route.dbItem) {
    baseTitle = route.dbItem.title || "";
    baseDesc = route.dbItem.excerpt || route.dbItem.content?.substring(0, 150) || "";
  } else {
    // Generate default titles based on pageId
    const formattedId = route.pageId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    baseTitle = formattedId === 'Homepage' ? siteName : `${formattedId} | ${siteName}`;
    baseDesc = org.description;
  }

  // --- HIERARCHY RESOLUTION ---

  // 1. Title
  let title = baseTitle;
  if (pageSEO?.seo?.title) {
    title = pageSEO.seo.title;
  } else if (template?.titlePattern) {
    title = applyPatterns(template.titlePattern, baseTitle, baseDesc);
  }

  // 2. Meta Description
  let description = baseDesc;
  if (pageSEO?.seo?.description) {
    description = pageSEO.seo.description;
  } else if (template?.metaDescriptionPattern) {
    description = applyPatterns(template.metaDescriptionPattern, baseTitle, baseDesc);
  }

  // 3. Robots
  let robots = { index: true, follow: true };
  if (pageSEO?.seo?.robots) {
    robots = pageSEO.seo.robots;
  } else if (template?.defaultRobots) {
    robots = template.defaultRobots;
  }

  // 4. Canonical
  const baseOrigin = org.baseOriginUrl || "https://abdullahmalikconsultancy.web.app";
  let canonical = `${baseOrigin}${pathname}`;
  if (pageSEO?.seo?.canonical) {
    canonical = pageSEO.seo.canonical;
  }

  // 5. Open Graph / Social Defaults
  let ogTitle = pageSEO?.social?.ogTitle || title;
  let ogDescription = pageSEO?.social?.ogDescription || description;
  let ogImage = pageSEO?.social?.ogImage || pageSEO?.seo?.image || template?.defaultOgImage || org.socialShareImage || "";
  let ogUrl = pageSEO?.social?.ogUrl || canonical;
  let ogType = pageSEO?.social?.ogType || (pageType === 'blog_post' ? 'article' : 'website');

  let twitterCard = pageSEO?.social?.twitterCard || "summary_large_image";
  let twitterTitle = pageSEO?.social?.twitterTitle || ogTitle;
  let twitterDescription = pageSEO?.social?.twitterDescription || ogDescription;
  let twitterImage = pageSEO?.social?.twitterImage || ogImage;

  // 6. Schema & Structured JSON-LD
  let schemaType = pageSEO?.seo?.schemaType || template?.schemaType || (pageType === 'blog_post' ? 'Article' : 'WebPage');
  let schemaJsonLd = "";

  // Generate dynamic JSON-LD based on schemaType
  if (schemaType === 'Article' && route.dbItem) {
    schemaJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": ogImage,
      "datePublished": route.dbItem.createdAt,
      "dateModified": route.dbItem.updatedAt || route.dbItem.createdAt,
      "author": {
        "@type": "Person",
        "name": route.dbItem.authorName || org.name
      },
      "publisher": {
        "@type": "Organization",
        "name": org.name,
        "logo": {
          "@type": "ImageObject",
          "url": org.logoUrl
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonical
      }
    });
  } else if (schemaType === 'Organization' || pageType === 'homepage') {
    schemaJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": org.name,
      "url": baseOrigin,
      "logo": org.logoUrl || ogImage,
      "email": org.contactEmail,
      "telephone": org.contactPhone,
      "description": org.description,
      "sameAs": org.sameAs || []
    });
  } else {
    // Default WebPage Schema
    schemaJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": canonical,
      "publisher": {
        "@type": "Organization",
        "name": org.name
      }
    });
  }

  // Favicons
  const faviconUrl = org.faviconUrl || "/favicon.ico";
  const appleTouchIconUrl = org.appleTouchIconUrl || "/apple-touch-icon.png";
  const themeColor = org.themeColor || "#6750a4";

  return {
    title,
    description,
    robots,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    schemaType,
    schemaJsonLd,
    faviconUrl,
    appleTouchIconUrl,
    favicon16Url: org.favicon16Url || faviconUrl,
    favicon32Url: org.favicon32Url || faviconUrl,
    icon192Url: org.icon192Url || faviconUrl,
    icon512Url: org.icon512Url || faviconUrl,
    themeColor
  };
};

// --- INITIALIZE SEO DEFAULT RECORDS ---

export const initializeSeoDefaults = async (): Promise<void> => {
  const config = await getSEOConfig();
  const now = new Date().toISOString();

  // 1. Seed global templates if empty
  if (!config.templates) {
    const defaultTemplates: Record<string, TemplateConfig> = {
      homepage: {
        titlePattern: "{{siteName}}",
        metaDescriptionPattern: "{{excerpt}}",
        schemaType: "Organization"
      },
      about: {
        titlePattern: "About | {{siteName}}",
        metaDescriptionPattern: "{{excerpt}}",
        schemaType: "WebPage"
      },
      service: {
        titlePattern: "{{title}} | Services | {{siteName}}",
        metaDescriptionPattern: "Professional advisory on {{title}}.",
        schemaType: "Service"
      },
      blog_post: {
        titlePattern: "{{title}} | Insights | {{siteName}}",
        metaDescriptionPattern: "{{excerpt}}",
        schemaType: "Article"
      },
      case_study: {
        titlePattern: "Case Study: {{title}} | {{siteName}}",
        metaDescriptionPattern: "{{excerpt}}",
        schemaType: "Service"
      }
    };
    await set(dbRef(db, 'seo/templates'), defaultTemplates);
  }

  // 2. Seed site controls if empty or missing markdownAgents
  if (!config.controls || !config.controls.markdownAgents) {
    const existingControls = config.controls || {};
    const defaultControls: SiteControlsConfig = {
      robotsTxt: existingControls.robotsTxt || {
        content: "User-agent: *\nAllow: /\nSitemap: https://abdullahmalikconsultancy.web.app/sitemap.xml",
        customOverride: false
      },
      sitemap: existingControls.sitemap || {
        autoGenerate: true,
        canonicalOnly: true,
        excludePageTypes: {
          blog: false,
          case_study: false,
          services: false,
          legal: true
        }
      },
      llms: existingControls.llms || {
        intro: "This directory contains information about Malik Consultancy services, structured for artificial intelligence models, LLM agents, and semantic answer engines.",
        autoGenerate: true
      },
      markdownAgents: {
        enabled: true,
        behaviour: 'md_routes_accept_header',
        supportedContentTypes: {
          pages: true,
          services: true,
          blog: true,
          case_study: true
        }
      }
    };
    await set(dbRef(db, 'seo/controls'), defaultControls);
  }

  // 3. Seed organisation details if empty
  if (!config.organisation) {
    const defaultOrg: OrganisationConfig = {
      name: "Abdullah Malik",
      websiteName: "Abdullah Malik Portfolio",
      legalName: "Malik Consultancy Group",
      contactEmail: "abdullahmalik66@gmail.com",
      contactPhone: "+46 76 000 0000",
      logoUrl: "",
      socialShareImage: "",
      faviconUrl: "/favicon.ico",
      appleTouchIconUrl: "/apple-touch-icon.png",
      faviconMasterUrl: "",
      favicon16Url: "",
      favicon32Url: "",
      icon192Url: "",
      icon512Url: "",
      baseOriginUrl: "https://abdullahmalikconsultancy.web.app",
      themeColor: "#6750a4",
      description: "Helping brands engineer growth through performance architecture and dynamic AI capabilities.",
      sameAs: [
        "https://linkedin.com/in/abdullahmalik66",
        "https://github.com/Abdullahmalik66"
      ]
    };
    await set(dbRef(db, 'seo/organisation'), defaultOrg);
  }
};
