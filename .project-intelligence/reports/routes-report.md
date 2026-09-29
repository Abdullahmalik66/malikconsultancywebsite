# Routes Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Client Route Table (`src/App.tsx`) `[Verified from repository]`

The client application uses `react-router-dom` v7 with route-level code splitting via `React.lazy()` and `Suspense`. Only `HomePage` ships in the synchronous entry chunk.

| Client Route | Page Component | Loading Strategy | Classification |
| :--- | :--- | :---: | :--- |
| `/` | `HomePage` | Synchronous Bundle | `[Verified from repository]` |
| `/case-work` | `CaseWorkPage` | `React.lazy()` | `[Verified from repository]` |
| `/my-writings` | `WritingsPage` | `React.lazy()` | `[Verified from repository]` |
| `/writings/:id` | `BlogPostPage` | `React.lazy()` | `[Verified from repository]` |
| `/my-life-story` | `MyLifeStoryPage` | `React.lazy()` | `[Verified from repository]` |
| `/my-life-playground` | `MyLifeStoryPage` | `React.lazy()` | `[Verified from repository]` |
| `/services/ai-transformation` | `AITransformationPage` | `React.lazy()` | `[Verified from repository]` |
| `/services/data-activation-intelligence` | `DataActivationPage` | `React.lazy()` | `[Verified from repository]` |
| `/services/modern-marketing-growth` | `ModernMarketingPage` | `React.lazy()` | `[Verified from repository]` |
| `/services/ai-maturity-capability-building` | `AIMaturityPage` | `React.lazy()` | `[Verified from repository]` |
| `/case-studies/:id` / `/case-study/:slug` | `CaseStudyPage` | `React.lazy()` | `[Verified from repository]` |
| `/about` / `/about-me` | `AboutPage` | `React.lazy()` | `[Verified from repository]` |
| `/create-insight` | `BlogEditorPage` | `React.lazy()` | `[Verified from repository]` |
| `/reach-me` | `ReachMePage` | `React.lazy()` | `[Verified from repository]` |
| `/testimonials` | `TestimonialsPage` | `React.lazy()` | `[Verified from repository]` |
| `/admin/login` | `AdminLoginPage` | `React.lazy()` | `[Verified from repository]` |
| `/admin` | `AdminPage` | `React.lazy()` + `ProtectedRoute` | `[Verified from repository]` |
| `/intelligence-layer` | `IntelligenceLayerPage` | `React.lazy()` | `[Verified from repository]` |

---

## 2. Server API & Machine Routes (`server.ts`) `[Verified from repository]`

| HTTP Method | Route Endpoint | Controller / Handler | Classification |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leads` | `leadService.processLeadSubmission` | `[Verified from repository]` |
| `GET` | `/api/admin/leads` | `leadRepository.getAllLeads` | `[Verified from repository]` |
| `GET` | `/api/admin/leads-stats` | `leadRepository.getLeadStats` | `[Verified from repository]` |
| `GET` | `/api/admin/leads/:id` | `leadRepository.getLeadById` | `[Verified from repository]` |
| `PATCH` | `/api/admin/leads/:id` | `leadRepository.updateLeadRecord` | `[Verified from repository]` |
| `DELETE`| `/api/admin/leads/:id` | `leadRepository.deleteLeadById` | `[Verified from repository]` |
| `POST` | `/api/admin/leads/:id/retry-email` | `leadService.retryLeadEmail` | `[Verified from repository]` |
| `POST` | `/api/admin/leads/:id/regenerate-summary` | `leadService.regenerateLeadSummary` | `[Verified from repository]` |
| `GET` | `/api/admin/leads-export.csv` | Streaming CSV Handler | `[Verified from repository]` |
| `GET` | `/:route.md` | Markdown Content Generator | `[Verified from repository]` |
| `GET` | `/llms.txt` | LLMs Directory Handler | `[Verified from repository]` |
| `GET` | `/llms-full.txt` | Aggregated Context Handler | `[Verified from repository]` |
| `GET` | `/robots.txt` | Robots Text Controller | `[Verified from repository]` |
| `GET` | `/sitemap.xml` | XML Sitemap Controller | `[Verified from repository]` |
| `GET` | `*` | SSR-Lite Head Middleware | `[Verified from repository]` |
