# Source of Truth Directory

This document establishes the **Official Authoritative Source of Truth** for every subsystem across the Malik Consultancy Platform on git branch `agents/install-configure-codebase-memory-mcp`. Every file listed below has been verified to exist on the current filesystem.

---

## Subsystem Authority Matrix `[Verified from repository]`

| Subsystem | Official Source of Truth File(s) | Status | Key Responsibility |
| :--- | :--- | :---: | :--- |
| **Page Layout & Routes** | `src/App.tsx` | Verified | Client route declarations, lazy loading, and layout wrapping. |
| **Service Engine Template** | `src/components/service/ServicePageLayout.tsx` | Verified | Universal 7-section layout for all service offerings. |
| **Service Content & Copy** | `src/content/services/{aiMaturity, aiTransformation, dataActivation, modernMarketing}/` | Verified | Content configs (`story.ts`, `showcase.ts`, `questionnaire.ts`, `index.tsx`). |
| **Interactive Questionnaire** | `src/components/service/DecisionQuestionnaire.tsx` | Verified | Conversational diagnostic intake engine. |
| **Lead Submission (Client)**| `src/services/leads/leadApi.ts` | Verified | Client HTTP transport to `/api/leads` and admin lead API queries. |
| **Lead Validation (Server)**| `server/leads/leadValidation.ts` | Verified | Schema validation, sanitization, and rate-limiting. |
| **Lead Repository (Server)**| `server/leads/leadRepository.ts` | Verified | Realtime Database `/leads` persistence and atomic updates. |
| **Lead Qualification (AI)** | `server/leads/leadSummary.ts` | Verified | Gemini API scoring and deterministic fallback scoring. |
| **Lead Email Dispatcher** | `server/leads/leadEmail.ts` | Verified | Nodemailer transport and executive alert templates. |
| **SEO Resolver (Shared)** | `src/features/seo/seoService.ts` | Verified | `resolveRoute()`, `resolveMetadata()`, and RTDB `/seo` schema. |
| **SEO Head Injection (SSR)**| `server.ts` | Verified | Pre-render HTML string replacement and caching. |
| **SEO Hydration (Client)** | `src/features/seo/SEORenderer.tsx` | Verified | `react-helmet-async` client SPA title & tag updater. |
| **Static SEO & LLMs Build** | `scripts/prebuild-seo.cjs` | Verified | Build script exporting `robots.txt`, `sitemap.xml`, `llms.txt`. |
| **GEO / Markdown Endpoints** | `server.ts` | Verified | `GET /<slug>.md`, `GET /llms.txt`, `GET /llms-full.txt`. |
| **Admin Console Entry** | `src/pages/AdminPage.tsx` | Verified | Authenticated workspace shell with tab switching. |
| **Admin Lead Inbox** | `src/features/leads/LeadInbox.tsx` | Verified | Lead pipeline dashboard, search, filters, status toggles. |
| **Admin Rich Text Editor** | `src/components/admin/AdminContentEditor.tsx` | Verified | Slate.js WYSIWYG editor for articles & case studies. |
| **Admin SEO Workspace** | `src/components/admin/SeoWorkspace.tsx` | Verified | Direct RTDB `/seo` configuration editor. |
| **Firebase Client Init** | `src/services/firebase/client.ts` | Verified | Firebase App initialization with public `VITE_FIREBASE_*` config. |
| **Firebase CMS Services** | `src/services/firebase/cms.ts` | Verified | RTDB CRUD methods for `content`, `cards`, `testimonials`, `logos`. |
| **Brand Identity Tokens** | `BRANDING.md` & `src/styles/index.css` | Verified | Material Design 3 (M3 Foundation) design tokens and rules. |
| **The Intelligence Layer** | `src/pages/IntelligenceLayerPage.tsx` | Verified | 3D interactive knowledge graph UI, telemetry sidebar, search, and tree. |
| **3D Knowledge Graph WebGL** | `src/components/intelligence/CodebaseMemory3DView.tsx` | Verified | Three.js WebGL canvas, particle nebulae, raycasting, and orbit controls. |
| **Website AST Graph Dataset** | `src/data/codebaseMemoryData.json` | Verified | Exported Codebase Memory graph dataset (1,309 AST nodes, 3,110 edges). |

---

## Architectural Note: Known Divergence `[Verified from repository]`

Static route paths currently exist in 4 locations:
1. `server.ts`
2. `src/features/seo/seoService.ts`
3. `src/components/admin/SeoWorkspace.tsx`
4. `scripts/prebuild-seo.cjs`

*Authoritative Rule*: Until unified in a shared configuration file, `src/features/seo/seoService.ts` represents the functional model authority for route definitions.
