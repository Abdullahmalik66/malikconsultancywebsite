# Project State

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Package Version**: `1.0.0` (`package.json`) `[Verified from repository]`  
**Last Updated**: 2026-09-29  

---

## 1. Executive Status Overview

| Subsystem | Operational Status | Classification | Key Dependencies |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | Production-ready / Functional | `[Verified from repository]` | React 19, Vite 6, Tailwind v4, Motion |
| **The Intelligence Layer**| 3D WebGL AST Knowledge Graph | `[Verified from repository]` | Three.js, OrbitControls, `codebaseMemoryData.json` |
| **Service Engine** | Standardized on `ServicePageLayout` | `[Verified from repository]` | `ServicePageLayout.tsx`, `src/content/services/*` |
| **Lead Management** | Ingestion pipeline active | `[Verified from repository]` | Express `server/leads/*`, RTDB `leads/`, Nodemailer |
| **Admin Panel** | Multi-manager portal active | `[Verified from repository]` | Slate editor, RTDB CMS, Lead Inbox, SEO Workspace |
| **SEO & GEO Engine**| Dual-layer (SSR-lite + Client) | `[Verified from repository]` | RTDB `seo/`, Express head injection, `llms.txt`, prebuild |
| **Mobile Architecture**| Responsive via M3 & Tailwind | `[Verified from repository]` | Media queries, accordion fallback in `SubServicesShowcase` |
| **Memory & MCP** | Installed & Indexed | `[Verified from repository]` | `codebase-memory-mcp` v0.11.0, `.codebase-memory/` |

---

## 2. Recent Major Architectural Implementations

1. **The Intelligence Layer (`/intelligence-layer`)** `[Verified from repository]`:
   - Built a signature 3D WebGL interactive knowledge graph page reproducing the Codebase Memory visual telemetry interface.
   - Connected directly to 1,309 AST nodes and 3,110 relational edges exported from Codebase Memory (`src/data/codebaseMemoryData.json`).
   - Implemented Three.js WebGL canvas (`src/components/intelligence/CodebaseMemory3DView.tsx`) with white-hot particle nebulae, degree-scaled node geometries, raycasting, orbit controls, and live filtering.
   - Features real-time sidebar filters for 14 node entity types, 13 edge types, search bar, and interactive subsystem directory tree.
   - Top-left header integrates the official Abdullah Malik brand mark (`[ ABDULLAH_MALIK ]` with blinking cursor and neon brackets) and live memory telemetry badge.
   - Added permanent "The Intelligence Layer" link in site footer beside Privacy Policy, Terms of Service, Cookies.
   - Registered lazy-loaded route in `src/App.tsx` (`CLEAN_LAYOUT_PATHS`) and added to `server.ts` SSR-lite and sitemap generators.
2. **Enterprise Inbound Lead Pipeline** `[Verified from repository]`:
   - Built server-side lead ingestion under `server/leads/`: validation (`leadValidation.ts`), repository persistence (`leadRepository.ts`), lead summary/scoring (`leadSummary.ts`), and email alerts (`leadEmail.ts`).
   - Wired public endpoint `POST /api/leads` in `server.ts` connected to Firebase RTDB `/leads`.
   - Built Admin Lead Management suite under `src/features/leads/`: `LeadInbox`, `LeadOverview`, `LeadDetail`, `LeadFilters`, and CSV export (`/api/admin/leads-export.csv`).
3. **Standardized Service Page Architecture** `[Verified from repository]`:
   - Unified all 4 service pages (`AIMaturityPage`, `AITransformationPage`, `DataActivationPage`, `ModernMarketingPage`) onto `ServicePageLayout` dynamically configured by modular content in `src/content/services/{aiMaturity, aiTransformation, dataActivation, modernMarketing}`.
4. **Machine-Readable Intelligence (GEO / Markdown-for-Agents)** `[Verified from repository]`:
   - Implemented `GET /<route>.md` live markdown endpoints for LLM crawlers in `server.ts`.
   - Added `GET /llms.txt` and `GET /llms-full.txt` endpoints in `server.ts` and prebuild generator in `scripts/prebuild-seo.cjs`.
5. **Codebase Memory MCP & Project Intelligence Layer** `[Verified from repository]`:
   - Installed `codebase-memory-mcp` v0.11.0.
   - Built `.project-intelligence/` knowledge, architecture, decision, and report structure.
6. **Firebase Production Deployment** `[Verified from repository]`:
   - Deployed updated hosting build and Realtime Database rules (`database.rules.json`) to Firebase project `malikconsultancy-3451f`.
   - Live URL: `https://malikconsultancy-3451f.web.app/intelligence-layer` verified (HTTP 200).
   - Generated static SEO assets (`sitemap.xml`, `robots.txt`, `llms.txt`) pushed to Firebase hosting.

---

## 3. Known Issues & Technical Debt

- **Duplicated Route Registries** `[Verified from repository]`: Static route lists and page ID mappings exist in 4 separate locations:
  1. `server.ts`
  2. `src/features/seo/seoService.ts`
  3. `src/components/admin/SeoWorkspace.tsx`
  4. `scripts/prebuild-seo.cjs`
  *Actionable Recommendation*: Centralize into a single shared TypeScript manifest.
- **ServicePageLayout Questionnaire Submission** `[Verified from repository]`:
  - `DecisionQuestionnaire` submits to `/api/leads` via `leadApi.submitLead()`, but offline client-side retry queuing is not yet implemented.
- **Tree-sitter Parsing Warnings** `[Verified from repository]`:
  - CBM reports 12 minor partial parse ranges in heavy admin components (`AdminContentEditor.tsx`, `CardBuilder.tsx`, `ClientShowcaseManager.tsx`, `ContentList.tsx`, `SeoWorkspace.tsx`) due to complex generic JSX patterns. (These compile with zero errors under `tsc`).

---

## 4. Open Refactors `[Recommendation]`

1. **Extract Shared Route Registry**: Deduplicate static routes across server SSR-lite, client SEO, Admin SEO Workspace, and prebuild scripts.
2. **Harmonize Type Definitions**: Consolidate `server/leads/leadTypes.ts` and `src/features/leads/leadTypes.ts` into a unified shared type contract to prevent drift.
3. **Admin Component Decomposition**: Break down the monolithic `SeoWorkspace.tsx` (>2,100 lines) into smaller tabbed sub-components.

---

## 5. Mobile Status `[Verified from repository]`

- **Header / Navigation**: Responsive drawer in `Navbar.tsx`.
- **Service Pages**: Sticky stacked-card scroll on desktop converts to vertical accordion in `SubServicesShowcase.tsx` on `< 768px` viewports.
- **Questionnaire**: Interactive card layout adapts to full-width containers on mobile with touch targets >= 48px.

---

## 6. Lead System Status `[Verified from repository]`

- **API Route**: `POST /api/leads` in `server.ts`.
- **Storage**: Firebase Realtime Database path `/leads/{leadId}`.
- **Validation**: Schema-validated in `server/leads/leadValidation.ts`.
- **AI Scoring**: Primary call to Google Gemini Flash, fallback to `getAICompletion` (NVIDIA Nemotron -> NVIDIA Llama -> Gemini), and deterministic fallback in `server/leads/leadSummary.ts`.
- **Email Delivery**: Nodemailer SMTP dispatcher with HTML and plain-text templates in `server/leads/leadEmail.ts`.
- **Admin Inbox**: Full Lead tab in `/admin` with search, status filters, priority tagging, and detail modal.

---

## 7. SEO & GEO Status `[Verified from repository]`

- **RTDB Store**: `/seo/{organisation,controls,pages,tracking}`.
- **Server Injection**: Express middleware intercepts all GET requests, resolves route against SEO database with 5-minute memory cache, and injects `<title>`, `<meta>`, OpenGraph, and JSON-LD schema into HTML.
- **Client Hydration**: `react-helmet-async` via `SEORenderer` keeps tags synchronized during SPA navigation.
- **GEO Endpoints**: `GET /llms.txt`, `GET /llms-full.txt`, and `GET /<slug>.md`.

---

## 8. Admin Status `[Verified from repository]`

- **Auth**: Firebase Authentication (`signInWithEmailAndPassword`) wrapped in `ProtectedRoute.tsx`.
- **Editor**: Custom Slate.js rich-text WYSIWYG editor supporting Markdown paste and formatting.
- **Managers**:
  - Content Editor (Articles, Case Studies)
  - Card Builder
  - Client Showcase & Partner Logos
  - Lead Management CRM Inbox
  - SEO & Meta Configuration Workspace

---

## 9. Next Priorities `[Recommendation]`

1. Maintain strict architectural guardrails: prevent future AI agents from creating duplicate service pages or altering desktop hero layouts.
2. Unify shared route definitions across the build, client, and server tools.
3. Add client-side offline retry queuing to lead submission forms.
