# Project Memory

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  
**Package Name**: `malik-consultancy-platform` (`package.json`) `[Verified from repository]`  
**Package Description**: `"Enterprise AI Strategy, Growth Architecture & Data Activation Advisory Web Platform"` (`package.json`) `[Verified from repository]`  

---

## 1. Project Purpose & Mission

The **Malik Consultancy Platform** is the digital operating foundation for Abdullah Malik’s executive advisory, AI transformation, growth architecture, and data activation practice `[Verified from repository: package.json, ARCHITECTURE.md, BRANDING.md]`.

Its primary objectives:
1. **Advisory Authority Hub** `[Verified from repository]`:
   - Publishing structured perspectives on Enterprise AI Strategy, Autonomous Systems, AI Maturity, and Data Activation.
2. **Inbound Lead Generation & Diagnostic Triage** `[Verified from repository]`:
   - Engaging enterprise prospects through diagnostic intake questionnaires on service pages and routing qualified inquiries into a Firebase Realtime Database CRM with automated AI qualification and Nodemailer email dispatch.
3. **Machine-Readable Web Presence (GEO / Markdown-for-Agents)** `[Verified from repository]`:
   - Exposing pure Markdown representations of site content via `GET /<route>.md`, `GET /llms.txt`, and `GET /llms-full.txt` to enable immediate ingestion by AI agents and crawlers.

---

## 2. Technology Stack Breakdown `[Verified from repository]`

### Frontend
- **Framework & Runtime**: React 19 (`react: ^19.0.0`, `react-dom: ^19.0.0`)
- **Language**: TypeScript (`typescript: ~5.8.2`)
- **Bundler & Build Tool**: Vite 6 (`vite: ^6.2.0`, `@vitejs/plugin-react: ^5.0.4`)
- **3D WebGL Graphics**: Three.js (`three: ^0.186.1`, `@types/three: ^0.186.0`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite: ^4.1.14`, `tailwindcss: ^4.1.14`) adhering to Material Design 3 (M3 Foundation) tokens (`src/styles/index.css`, `BRANDING.md`)
- **Motion & UI**: Motion v12 (`motion: ^12.23.24`), Lucide React (`lucide-react: ^0.546.0`)
- **Rich Text Authoring**: Slate (`slate: ^0.124.1`, `slate-react: ^0.124.2`)
- **Client Head Management**: React Helmet Async (`react-helmet-async: ^3.0.0`)

### Backend & Server Infrastructure
- **Server**: Node.js + Express (`express: ^4.21.2`, executed via `tsx server.ts`)
- **Email Dispatcher**: Nodemailer (`nodemailer: ^8.0.11`)
- **Environment**: Dotenv (`dotenv: ^17.2.3`)

### Cloud Services (Firebase)
- **SDK**: Firebase JS SDK (`firebase: ^12.19.0`)
- **Realtime Database (RTDB)**: Primary datastore for `/content`, `/cards`, `/clientLogos`, `/testimonials`, `/seo`, and `/leads`
- **Authentication**: Firebase Auth (Admin login credentials for `/admin`)
- **Storage**: Firebase Cloud Storage for uploaded imagery and logos
- **Cloud Functions**: Node functions located in `functions/`

### AI & Language Models
- **Lead Qualification Pipeline** (`server/leads/leadSummary.ts`):
  - Primary: Direct call to Google Gemini Flash API (`gemini-3.1-flash-lite` or custom `GEMINI_MODEL`)
  - Fallback 1: `getAICompletion` in `src/services/ai.ts` (NVIDIA Nemotron -> NVIDIA Llama -> Gemini)
  - Fallback 2: Deterministic heuristic scoring (`getDeterministicFallback`)
- **Admin Content Helpers** (`src/services/ai.ts`):
  - Cascading multi-provider client (Nemotron -> Llama -> Gemini)

### Code Intelligence & Project Memory
- **Engine**: Codebase Memory MCP (`codebase-memory-mcp` v0.11.0)
- **Local Graph Database**: `.codebase-memory/graph.db.zst`

---

## 3. Subsystem Breakdown `[Verified from repository]`

### A. Core Service Offerings
The platform implements 4 official service routes in `src/App.tsx`, each wrapping `ServicePageLayout` with config from `src/content/services/`:
1. **AI Maturity & Capability Building** (`/services/ai-maturity-capability-building`): Assessing AI readiness and operational maturity.
2. **Enterprise AI Transformation** (`/services/ai-transformation`): Architecting and deploying autonomous systems and enterprise AI solutions.
3. **Data Activation & Intelligence** (`/services/data-activation-intelligence`): Transforming raw data assets into real-time operational intelligence.
4. **Modern Marketing & Growth** (`/services/modern-marketing-growth`): Algorithmic customer acquisition and growth engineering.

### B. Inbound Lead Pipeline
- Interactive questionnaire component (`src/components/service/DecisionQuestionnaire.tsx`) collects diagnostic answers.
- `POST /api/leads` validates, stores to `/leads/{leadId}`, runs AI scoring in background, and emails notification alerts.
- Dedicated Admin CRM tab (`src/features/leads/`) for pipeline triage.

### C. SEO & GEO System
- Shared resolution logic in `src/features/seo/seoService.ts`.
- Server-side pre-render `<head>` injection in `server.ts`.
- Client-side navigation updates via `SEORenderer.tsx`.
- Pre-rendered static sitemap/robots/llms files in `scripts/prebuild-seo.cjs`.

### D. Admin Workspace
- Authenticated via Firebase Auth at `/admin/login` and `/admin`.
- Modules: Slate Rich Text Content Editor, Card Builder, Client Showcase Logo Manager, SEO Workspace, and Lead Inbox.

### E. The Intelligence Layer (`/intelligence-layer`) `[Verified from repository]`
- 3D interactive knowledge graph reproducing Codebase Memory telemetry visualization (`src/pages/IntelligenceLayerPage.tsx`, `src/components/intelligence/CodebaseMemory3DView.tsx`).
- Maps 1,309 AST nodes and 3,110 edges (`src/data/codebaseMemoryData.json`).
- Three.js WebGL canvas with orbit controls, particle nebulae, degree-scaled node geometries, raycasting, dynamic filter dimming, and symbol inspector.
- Features real-time filters for 14 node entity types, 13 edge relationship types, search bar, and interactive subsystem directory tree.
- Header integrates the official Abdullah Malik brand mark (`[ ABDULLAH_MALIK ]` with blinking cursor and neon brackets) and live memory telemetry badge.
- Permanent footer link in `src/components/layout/Footer.tsx`.
- Lazy-loaded route in `src/App.tsx` and server SSR-lite in `server.ts`.
