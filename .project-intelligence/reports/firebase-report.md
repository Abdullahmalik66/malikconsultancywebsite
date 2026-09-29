# Firebase Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Firebase Services Utilized `[Verified from repository: package.json, src/services/firebase/*]`

The platform uses Firebase JS SDK v12.19.0 across client and server tiers:
1. **Firebase Realtime Database (RTDB)**: Primary datastore for CMS content, cards, testimonials, SEO configurations, and Inbound Leads.
2. **Firebase Authentication**: Email/password credentials securing the `/admin` portal.
3. **Firebase Cloud Storage**: Bucket storage for article media, client logos, and banner assets.
4. **Firebase Cloud Functions**: Serverless functions in `functions/` for background maintenance.

---

## 2. Realtime Database Data Topologies `[Verified from repository: database.rules.json, src/services/firebase/cms.ts, server/leads/leadRepository.ts]`

```
Firebase RTDB Root
├── content/                 Published articles and case studies
│   └── {contentId}/         title, slug, excerpt, body (Slate JSON), publishedAt
├── cards/                   CMS dynamic presentation cards
│   └── {cardId}/           heading, subtext, badge, ctaLink, theme
├── clientLogos/             Homepage client trust ribbon logos
├── clientShowcase2Logos/    Extended partner logos
├── testimonials/            Client executive endorsements
├── seo/                     Dual-layer SEO/GEO configuration
│   ├── organisation/        Global company data, founder schema, social links
│   ├── controls/            Indexing flags, sitemap controls
│   ├── pages/{pageId}/      Per-route titles, descriptions, JSON-LD, OG tags
│   └── tracking/            GA4, GTM, script container IDs
└── leads/                   Inbound Lead Management CRM
    └── {leadId}/            name, email, company, answers, aiSummary, leadPriority, emailDelivery
```

---

## 3. Database Security Rules (`database.rules.json`) `[Verified from repository]`

- **Public Read / Admin Write**:
  - `/content`, `/cards`, `/clientLogos`, `/testimonials`, and `/seo` permit public read (`.read: true`) for client rendering and server SSR. Write operations strictly require admin authentication (`auth != null`).
- **Leads Security (`/leads`)**:
  - Direct client-side reading or writing of `/leads` is restricted.
  - Submissions and management route through server endpoints authenticated via admin credentials or server environment variables.
