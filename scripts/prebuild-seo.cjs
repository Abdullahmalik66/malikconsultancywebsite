const fs = require('fs');
const path = require('path');

const DB_URL = "https://malikconsultancy-3451f-default-rtdb.europe-west1.firebasedatabase.app/seo.json";

function getBaseHost(config) {
  const host = config.controls?.siteControls?.canonicalBaseUrl || "https://abdullahmalikconsultancy.web.app";
  return host.endsWith("/") ? host.slice(0, -1) : host;
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const CANONICAL_PAGE_FALLBACKS = {
  homepage: {
    summary: "Abdullah Malik is an independent AI strategy and growth consultant helping organisations engineer sustainable competitive advantage through AI systems, data activation, and performance architecture.",
    purpose: "Serve as the primary entry point to Abdullah Malik's consultancy, presenting core service areas and positioning for organisations exploring AI-driven growth.",
    capabilities: [
      "AI strategy and roadmap advisory",
      "Growth architecture and performance marketing",
      "Data activation and intelligence systems",
      "AI maturity and capability building"
    ],
    outcomes: [
      "Clear understanding of available consultancy services",
      "Direct path to relevant service or case study",
      "Confidence in the consultant's expertise and track record"
    ]
  },
  about: {
    summary: "Abdullah Malik is an independent consultant with experience bridging AI systems, digital growth, and performance marketing across European and global markets.",
    purpose: "Establish credibility and context for Abdullah Malik's professional background, methodologies, and consulting philosophy.",
    capabilities: [
      "AI transformation strategy",
      "Growth systems architecture",
      "Performance marketing leadership",
      "Cross-functional team enablement"
    ],
    outcomes: [
      "Clear picture of consultant expertise and industry focus",
      "Trust in the advisory relationship",
      "Alignment on consulting philosophy and approach"
    ]
  },
  case_work: {
    summary: "A portfolio of consulting engagements showcasing execution speed, methodology, and measurable business impact across different growth challenges.",
    purpose: "Provide concrete evidence of consulting capabilities through detailed case studies and performance outcomes.",
    capabilities: [
      "Real-world case documentation",
      "Performance metrics tracking",
      "Methodology breakdown"
    ],
    outcomes: [
      "Proof of delivery and validation of strategic approach",
      "Reference models for new client engagements",
      "Transparency on metrics and consulting ROI"
    ]
  },
  my_writings: {
    summary: "Thought leadership, frameworks, and practical guides on scaling digital businesses, adopting AI, and building performance growth models.",
    purpose: "Share practitioner insights and strategic commentary on industry trends and technical implementations.",
    capabilities: [
      "Strategic growth essays",
      "AI adoption frameworks",
      "Operational playbooks"
    ],
    outcomes: [
      "Educational resource for business leaders",
      "Continuous showcase of industry expertise",
      "Organic search footprint acquisition"
    ]
  },
  reach_me: {
    summary: "The direct engagement page for booking advisory calls, scoping AI transformation projects, or starting growth audits.",
    purpose: "Convert visitor interest into active consulting inquiries through a frictionless project-scoping intake process.",
    capabilities: [
      "Project scoping questionnaire",
      "Direct consultation booking integration",
      "Secure inquiry routing"
    ],
    outcomes: [
      "Qualified consulting leads with pre-defined requirements",
      "Seamless scheduling for initial scoping calls",
      "Structured data collection on client challenges"
    ]
  },
  testimonials: {
    summary: "Endorsements and professional feedback from executives, growth leaders, and collaborators who have executed projects with Abdullah Malik.",
    purpose: "Build trust and provide social proof of consulting effectiveness and professional collaboration quality.",
    capabilities: [
      "Verified client testimonials",
      "Recommendation highlight index",
      "Role and company attribution"
    ],
    outcomes: [
      "Independent validation of consulting outcomes",
      "Contextual proof of value across different project sizes",
      "Stronger professional credibility"
    ]
  },
  my_life_story: {
    summary: "Personal background, professional milestones, and the underlying philosophy driving Abdullah Malik's focus on growth engineering.",
    purpose: "Build a personal connection and explain the motivation and milestones that led to an independent advisory model.",
    capabilities: [
      "Timeline of career evolution",
      "Core operating principles overview",
      "Key lessons from corporate and startup building"
    ],
    outcomes: [
      "Enhanced relational trust with potential partners",
      "Clear context on the consultant's unique perspective",
      "Deeper personal brand alignment"
    ]
  },
  "services_ai-transformation": {
    summary: "Designing enterprise AI roadmaps, prototyping models, automating workflows, and establishing sustainable AI governance.",
    purpose: "Explain the AI Transformation service offering, showing how C-suite leaders can scale AI adoption safely.",
    capabilities: [
      "AI strategy design and opportunity mapping",
      "Workflow automation blueprinting",
      "AI pilot planning and model selection",
      "AI governance frameworks"
    ],
    outcomes: [
      "Clear path from manual workflows to AI enablement",
      "Mitigated risk in model adoption and data security",
      "30%+ productivity improvement in target workflows"
    ]
  },
  "services_data-activation-intelligence": {
    summary: "Building robust data pipelines, analytics infrastructure, and predictive modeling systems to turn raw events into growth levers.",
    purpose: "Explain the Data Activation service, helping companies establish a reliable data foundation for decisions.",
    capabilities: [
      "Analytics infrastructure auditing and setup",
      "Customer data platform integration",
      "Predictive model design (churn, LTV)",
      "Business intelligence dashboards"
    ],
    outcomes: [
      "Single source of truth for critical growth metrics",
      "Predictive triggers integrated into marketing channels",
      "Decisions driven by data rather than intuition"
    ]
  },
  "services_modern-marketing-growth": {
    summary: "Architecting high-performance acquisition models, funnel optimization, and attribution systems that scale efficiently.",
    purpose: "Detail the Growth Marketing service, showing how businesses can acquire customers profitably.",
    capabilities: [
      "Omnichannel media buying strategy",
      "Conversion rate optimization (CRO)",
      "Growth loop design and viral mechanism mapping",
      "Attribution modeling and tracking audit"
    ],
    outcomes: [
      "Optimized marketing budget allocation across channels",
      "Increased conversion rates at key funnel steps",
      "Predictable, measurable growth loops"
    ]
  },
  "services_ai-maturity-capability-building": {
    summary: "Assessing organizational AI readiness, training teams, and designing engineering standards for AI application building.",
    purpose: "Detail the AI Capability Building service, enabling companies to build in-house AI expertise.",
    capabilities: [
      "AI maturity diagnostic and scoring",
      "Custom training programs for executives and engineers",
      "AI engineering team structure design",
      "In-house center of excellence blueprints"
    ],
    outcomes: [
      "In-house capability to build and deploy AI features",
      "Accelerated AI team hiring and onboarding",
      "Clear blueprint for organization-wide AI literacy"
    ]
  }
};

const CANONICAL_DESCRIPTIONS = {
  homepage: "Abdullah Malik's consultancy hub covering AI strategy, growth architecture, and digital transformation advisory services.",
  about: "Background, professional expertise, and consulting philosophy of Abdullah Malik as an independent AI and growth strategist.",
  case_work: "Portfolio of executed client engagements with documented outcomes, pipeline metrics, and strategy execution results.",
  my_writings: "Expert articles and insights on AI strategy, growth systems, digital transformation, and modern marketing practices.",
  reach_me: "Project enquiry and contact page for Malik Consultancy strategic advisory and AI transformation engagements.",
  testimonials: "Professional endorsements and client testimonials from collaborators across growth, AI, and consulting projects.",
  my_life_story: "Personal background, career journey, and the philosophy driving Abdullah Malik's independent consultancy practice.",
  "services_ai-transformation": "Strategic advisory on AI roadmap design, model governance, workflow automation, and production AI system scaling.",
  "services_data-activation-intelligence": "End-to-end data structuring, predictive analytics pipeline design, and business intelligence capability building.",
  "services_modern-marketing-growth": "Omnichannel growth model design, conversion funnel optimisation, and performance marketing architecture.",
  "services_ai-maturity-capability-building": "AI maturity assessment, team upskilling programmes, and engineering standards for sustainable AI adoption."
};

async function generateMarkdownForRoute(pathname, config, published) {
  try {
    const host = getBaseHost(config);
    const orgName = config.organisation?.name || "Abdullah Malik";

    let pageId = "";
    let contentType = "pages";
    let cmsItem = null;
    const matchPath = pathname.replace(/\.md$/, "");

    const staticRoutes = {
      "/": { id: "homepage", title: "Abdullah Malik — AI Strategy & Growth Consultant", type: "pages" },
      "/about": { id: "about", title: "About Abdullah Malik", type: "pages" },
      "/case-work": { id: "case_work", title: "Case Work Portfolio", type: "pages" },
      "/my-writings": { id: "my_writings", title: "Writings & Insights", type: "pages" },
      "/reach-me": { id: "reach_me", title: "Contact Malik Consultancy", type: "pages" },
      "/testimonials": { id: "testimonials", title: "Client Testimonials", type: "pages" },
      "/my-life-story": { id: "my_life_story", title: "My Story", type: "pages" },
      "/services/ai-transformation": { id: "services_ai-transformation", title: "AI Transformation Strategy", type: "services" },
      "/services/data-activation-intelligence": { id: "services_data-activation-intelligence", title: "Data Activation & Intelligence", type: "services" },
      "/services/modern-marketing-growth": { id: "services_modern-marketing-growth", title: "Modern Marketing & Growth", type: "services" },
      "/services/ai-maturity-capability-building": { id: "services_ai-maturity-capability-building", title: "AI Maturity & Capability Building", type: "services" }
    };

    const matchedStatic = staticRoutes[matchPath];
    if (matchedStatic) {
      pageId = matchedStatic.id;
      contentType = matchedStatic.type;
    } else if (matchPath.startsWith("/writings/")) {
      contentType = "blog";
      const slug = matchPath.replace("/writings/", "");
      const item = published.find(x => x.contentType === "blog" && (x.slug === slug || x.id === slug));
      if (item) { pageId = `blog_${item.id}`; cmsItem = item; }
    } else if (matchPath.startsWith("/case-study/")) {
      contentType = "case_study";
      const slug = matchPath.replace("/case-study/", "");
      const item = published.find(x => x.contentType === "case_study" && (x.slug === slug || x.id === slug));
      if (item) { pageId = `case_study_${item.id}`; cmsItem = item; }
    }

    if (!pageId) return null;

    const pageSEO = config.pages?.[pageId] || {};
    const fallback = CANONICAL_PAGE_FALLBACKS[pageId] || {};

    const mdTitle = pageSEO.geo?.markdownTitleOverride || pageSEO.seo?.title || (cmsItem ? cmsItem.title : matchedStatic?.title) || pageId;
    const mdSummary = pageSEO.geo?.markdownSummary || pageSEO.geo?.aiSummary || pageSEO.seo?.description || fallback.summary || (cmsItem ? cmsItem.excerpt : "");
    const mdPurpose = pageSEO.geo?.pagePurpose || fallback.purpose || "";
    const mdCapabilities = pageSEO.geo?.markdownCapabilities || fallback.capabilities || [];
    const mdOutcomes = pageSEO.geo?.markdownOutcomes || fallback.outcomes || [];
    const curatedExplanation = pageSEO.geo?.curatedExplanation || "";

    let mdText = `# ${mdTitle}\n\n`;
    if (mdSummary) mdText += `> ${mdSummary}\n\n`;

    if (mdPurpose) {
      mdText += `## Purpose\n\n${mdPurpose}\n\n`;
    }

    if (mdCapabilities && mdCapabilities.length > 0) {
      mdText += `## Key Content / Capabilities\n\n`;
      for (const cap of mdCapabilities) {
        mdText += `- ${cap}\n`;
      }
      mdText += `\n`;
    }

    if (mdOutcomes && mdOutcomes.length > 0) {
      mdText += `## Outcomes / Value\n\n`;
      for (const out of mdOutcomes) {
        mdText += `- ${out}\n`;
      }
      mdText += `\n`;
    }

    if (cmsItem && cmsItem.content) {
      const strippedContent = stripHtml(cmsItem.content);
      mdText += `## Content\n\n${strippedContent}\n\n`;
    }

    if (curatedExplanation) {
      mdText += `## FAQ / Curated Explanations\n\n${curatedExplanation}\n\n`;
    }

    mdText += `## References\n\n`;
    mdText += `- Canonical: [${host}${matchPath}](${host}${matchPath})\n`;
    mdText += `- Publisher: [${orgName}](${host})\n`;

    return mdText;
  } catch (err) {
    console.error("Error generating static markdown:", err);
    return null;
  }
}

async function run() {
  console.log("Fetching SEO configurations from Firebase Realtime Database...");
  try {
    const res = await fetch(DB_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const config = await res.json();
    const host = getBaseHost(config);
    const orgName = config.organisation?.name || "Abdullah Malik";
    const orgDesc = config.organisation?.description || "Independent AI strategy and growth consultant.";

    // Fetch dynamic published items from Mock API
    let published = [];
    try {
      const pubRes = await fetch(`${host}/api/published`);
      if (pubRes.ok) {
        const d = await pubRes.json();
        published = d.items || [];
      }
    } catch (_) {}

    const staticRoutes = [
      "/",
      "/about",
      "/case-work",
      "/my-writings",
      "/reach-me",
      "/testimonials",
      "/my-life-story",
      "/services/ai-transformation",
      "/services/data-activation-intelligence",
      "/services/modern-marketing-growth",
      "/services/ai-maturity-capability-building"
    ];

    // 1. Generate robots.txt
    console.log("Generating robots.txt...");
    const robots = `User-agent: *\nAllow: /\nSitemap: ${host}/sitemap.xml\n`;
    fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robots);

    // 2. Generate sitemap.xml
    console.log("Generating sitemap.xml...");
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const route of staticRoutes) {
      sitemap += `  <url>\n    <loc>${host}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
    }
    sitemap += `</urlset>\n`;
    fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);

    // 3. Generate llms.txt
    console.log("Generating llms.txt...");
    const intro = config.controls?.llms?.intro || "This directory contains information about Malik Consultancy services, structured for artificial intelligence models, LLM agents, and semantic answer engines.";
    let llms = `# ${orgName} — AI Directory\n\n`;
    llms += `> ${intro}\n\n`;
    llms += `Looking for the full website content in a single file? See our [Consolidated Markdown Digest (llms-full.txt)](${host}/llms-full.txt).\n\n`;
    
    llms += `## Core Pages\n\n`;
    const staticPages = [
      { path: '/', pageId: 'homepage', defaultTitle: 'Abdullah Malik — AI Strategy & Growth Consultant' },
      { path: '/about', pageId: 'about', defaultTitle: 'About Abdullah Malik' },
      { path: '/case-work', pageId: 'case_work', defaultTitle: 'Case Work Portfolio' },
      { path: '/my-writings', pageId: 'my_writings', defaultTitle: 'Writings & Insights' },
      { path: '/reach-me', pageId: 'reach_me', defaultTitle: 'Contact Malik Consultancy' },
      { path: '/testimonials', pageId: 'testimonials', defaultTitle: 'Client Testimonials' },
      { path: '/my-life-story', pageId: 'my_life_story', defaultTitle: 'My Story' }
    ];
    for (const page of staticPages) {
      const pageSEO = config.pages?.[page.pageId];
      if (pageSEO?.geo?.includeInLlms !== false) {
        const desc = pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || CANONICAL_DESCRIPTIONS[page.pageId] || orgName;
        llms += `- [${pageSEO?.geo?.llmsTitle || pageSEO?.seo?.title || page.defaultTitle}](${host}${page.path}): ${desc}\n`;
      }
    }

    llms += `\n## Services\n\n`;
    const servicePages = [
      { path: '/services/ai-transformation', pageId: 'services_ai-transformation', defaultTitle: 'AI Transformation Strategy' },
      { path: '/services/data-activation-intelligence', pageId: 'services_data-activation-intelligence', defaultTitle: 'Data Activation & Intelligence' },
      { path: '/services/modern-marketing-growth', pageId: 'services_modern-marketing-growth', defaultTitle: 'Modern Marketing & Growth' },
      { path: '/services/ai-maturity-capability-building', pageId: 'services_ai-maturity-capability-building', defaultTitle: 'AI Maturity & Capability Building' }
    ];
    for (const page of servicePages) {
      const pageSEO = config.pages?.[page.pageId];
      if (pageSEO?.geo?.includeInLlms !== false) {
        const desc = pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || CANONICAL_DESCRIPTIONS[page.pageId] || "Advisory service page.";
        llms += `- [${pageSEO?.geo?.llmsTitle || pageSEO?.seo?.title || page.defaultTitle}](${host}${page.path}): ${desc}\n`;
      }
    }
    fs.writeFileSync(path.join(__dirname, '../public/llms.txt'), llms);

    // 4. Generate llms-full.txt
    console.log("Generating llms-full.txt...");
    let fullContent = `# ${orgName} — Full Website Content Digest\n\n`;
    fullContent += `> Consolidated content digest structured for artificial intelligence models, LLM agents, and semantic answer engines.\n\n`;
    fullContent += `## Organization Context\n${orgDesc}\n\n`;

    for (const route of staticRoutes) {
      const md = await generateMarkdownForRoute(route, config, published);
      if (md) {
        fullContent += `\n---\n# PAGE: ${route}\n\n${md}\n`;
      }
    }
    fs.writeFileSync(path.join(__dirname, '../public/llms-full.txt'), fullContent);

    console.log("Static SEO Assets generated successfully in public/ directory! 🎉");
  } catch (err) {
    console.error("Failed to build static SEO assets:", err);
    process.exit(1);
  }
}

run();
