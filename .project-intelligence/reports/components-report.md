# Components Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Component Topology & Tier Hierarchy `[Verified from repository]`

```
src/components/
├── layout/                  Structural shells and boundary wrappers
│   ├── Navbar.tsx            Main header, desktop nav links, mobile drawer
│   ├── Footer.tsx            Platform footer, legal links, newsletter CTA
│   ├── NewsletterSection.tsx Newsletter subscription bar
│   ├── ExecutiveLayout.tsx   Container with ambient gradient and header spacing
│   └── ProtectedRoute.tsx    Firebase Auth route guard for /admin
│
├── service/                 Standardized Service Page Engine
│   ├── ServicePageLayout.tsx Universal 7-section template
│   ├── CinematicStory.tsx    Scroll-gated multi-phase narrative with typewriter
│   ├── SubServicesShowcase.tsx Sticky stacked card deck (desktop) / accordion (mobile)
│   └── DecisionQuestionnaire.tsx Conversational intake and lead capture form
│
├── sections/                Shared Marketing & Authority Sections
│   ├── Hero.tsx              Primary homepage hero with dynamic typography
│   ├── ServicesTabs.tsx      Interactive tabs showcasing service lines
│   ├── WorkedWith.tsx        Enterprise brand partner logo ribbon
│   ├── CaseWorkSection.tsx   Curated case study showcases
│   └── InsightsSection.tsx   Recent published perspectives & articles
│
├── cards/                   CMS Dynamic Presentation Cards
│   ├── CardRenderer.tsx      Polymorphic renderer for RTDB site cards
│   └── AnimatedBackground.tsx Ambient canvas/particle background
│
├── terminal/                Interactive Terminal & Audio Simulation
│   ├── TerminalView.tsx      Retro terminal interface
│   └── hooks/                Terminal audio and command execution hooks
│
└── admin/                   Executive Management Console
    ├── AdminContentEditor.tsx Slate rich-text WYSIWYG editor
    ├── CardBuilder.tsx       Visual builder for CMS presentation cards
    ├── ClientShowcaseManager.tsx Partner logo and social proof curator
    ├── ContentList.tsx       Published articles and case study manager
    └── SeoWorkspace.tsx      Realtime SEO & GEO metadata manager
```

---

## 2. Inbound Lead Components (`src/features/leads/`) `[Verified from repository]`

| Component | Responsibility | Props / Key Interactions | Classification |
| :--- | :--- | :--- | :--- |
| `LeadInbox.tsx` | Main CRM Dashboard | Live search, status filters, priority sorting, selection drawer | `[Verified from repository]` |
| `LeadOverview.tsx` | Funnel Metric Cards | Total leads, high-priority counts, conversion breakdown | `[Verified from repository]` |
| `LeadDetail.tsx` | Slide-over Dossier | Contact details, diagnostic answers, AI summary, note log | `[Verified from repository]` |
| `LeadFilters.tsx` | Filter Bar | Dropdown selectors for source, status, priority, date | `[Verified from repository]` |

---

## 3. SEO Component (`src/features/seo/`) `[Verified from repository]`

- **`SEORenderer.tsx`**: Client-side component powered by `react-helmet-async`.
  - Ingests current route path.
  - Queries `seoService.resolveMetadata(pageId)`.
  - Injects updated `<title>`, meta descriptions, canonical URLs, and OpenGraph headers on client route transitions.
