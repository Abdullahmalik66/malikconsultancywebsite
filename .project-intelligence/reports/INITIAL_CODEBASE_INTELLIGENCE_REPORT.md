# Initial Codebase Intelligence Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  
**AST Nodes Analyzed**: 1,287  
**Graph Relationships**: 3,089  

---

## Architectural Answers `[Verified from repository & AST Graph]`

### 1. What are the primary modules? `[Verified from repository]`
The platform decomposes into 5 core operational modules:
1. **Core Service Engine (`src/components/service/`)**:
   - `ServicePageLayout.tsx`, `CinematicStory.tsx`, `SubServicesShowcase.tsx`, `DecisionQuestionnaire.tsx`.
   - Generates all 4 service offerings with zero layout duplication.
2. **Inbound Lead Processing Pipeline (`server/leads/`)**:
   - Ingestion, validation, Gemini AI scoring, RTDB persistence, and Nodemailer executive alerts.
3. **Dual-Layer SEO & GEO System (`src/features/seo/`, `server.ts`, `scripts/prebuild-seo.cjs`)**:
   - Server-side `<head>` injection, client-side `react-helmet-async` hydration, and machine endpoints (`/llms.txt`, `/<slug>.md`).
4. **Admin Control Console (`src/components/admin/`, `src/features/leads/`)**:
   - Slate rich-text authoring, CardBuilder, partner showcase management, SEO metadata config, and CRM Lead Inbox.
5. **Interactive Engagement & Terminal (`src/components/terminal/`, `src/components/sections/`)**:
   - Marketing sections (Hero, WorkedWith, ServicesTabs) and retro audio-synthesized terminal experience.

---

### 2. What files are most connected? (Graph Hotspots) `[Verified from repository: CBM get_architecture]`
- `src/services/firebase/cms.ts` (Fan-in: 14 callers): Central data fetching gateway for published content, case studies, cards, and client logos.
- `src/features/seo/seoService.ts` (Fan-in: 10 callers): Shared resolver bridging server-side Express head injection, client Helmet tags, and admin SEO tools.
- `src/components/service/ServicePageLayout.tsx` (Top structural cluster): Orchestrates narrative story, sub-service showcase, and diagnostic questionnaires.
- `src/components/service/SubServicesShowcase.tsx` (High cohesion cluster: 0.971): Highly integrated with contrast utilities and Framer Motion layout hooks.
- `server/leads/leadService.ts` & `server/leads/leadRepository.ts` (Cluster cohesion: 0.95): The server backbone for all lead transactions.
- `src/utils/terminalAudio.ts` (High internal fan-in): Dedicated Web Audio API synthesizer for terminal interactions.

---

### 3. What are the highest-risk modules? `[Verified from repository]`
1. **`server.ts` & `server/leads/*`**: Handles public HTTP traffic, incoming customer lead data, rate limiting, and email dispatch. Any uncaught promise here drops client leads or breaks site SSR.
2. **`src/features/seo/seoService.ts`**: A regression here breaks both client metadata hydration and server-side SSR head injection, degrading search engine crawlability and AI agent ingestion.
3. **`src/components/service/ServicePageLayout.tsx`**: Renders all 4 commercial consultancy service pages. Any breaking layout bug simultaneously impacts all 4 pages.

---

### 4. Which files should never be changed lightly? `[Explicitly provided by the project owner & Verified from repository]`
- **`src/components/sections/Hero.tsx`**: Carefully tuned brand typography, glowing atmospheric canvas, and desktop perspective coordinates.
- **`src/components/service/ServicePageLayout.tsx`**: The unified template for all service offerings.
- **`src/components/service/SubServicesShowcase.tsx`**: Contains delicate Framer Motion scroll offsets and mobile accordion conditional logic.
- **`src/styles/index.css` & `BRANDING.md`**: Global Material Design 3 tokens (`bg-m3-surface`, `text-m3-primary`, etc.).
- **`database.rules.json`**: Security rules protecting RTDB `/leads`, `/seo`, and `/content`.

---

### 5. Are duplicate implementations present? `[Verified from repository]`
- **Static Route Lists**: Declared across `server.ts`, `src/features/seo/seoService.ts`, `src/components/admin/SeoWorkspace.tsx`, and `scripts/prebuild-seo.cjs`.
- **Lead Type Declarations**: Duplicate declarations between `src/features/leads/leadTypes.ts` and `server/leads/leadTypes.ts`.
- **Component Implementations**: Zero component duplication. Clean adherence to `ServicePageLayout` and single `DecisionQuestionnaire`.

---

### 6. Are dead components present? `[Verified from repository]`
- `codebase-memory-mcp` AST scan confirms that all core components and pages mapped in `src/App.tsx` have active call sites or route bindings.
- Legacy `reach_me_submissions.json` and `leads_backup.json` local flat files are historical artifacts that should remain ignored by git and CBM.

---

### 7. What architectural weaknesses exist? `[Verified from repository]`
1. **Monolithic Admin Component (`SeoWorkspace.tsx`)**: Exceeds 2,100 lines, causing tree-sitter AST partial parse warnings.
2. **Coupled Static Prebuild**: `scripts/prebuild-seo.cjs` uses CommonJS (`.cjs`) while the rest of the project is modern ESM (`"type": "module"`).
3. **Network Resilience on Questionnaire**: While `DecisionQuestionnaire` submits to `/api/leads`, client-side offline retry queuing is not yet implemented for intermittent network drops.

---

### 8. What future refactoring opportunities exist? `[Recommendation]`
1. **Extract Canonical Route Manifest**: Create a single `src/config/routes.ts` file that exports the master route list to server, client, admin, and prebuild scripts.
2. **Decompose `SeoWorkspace.tsx`**: Refactor into modular tabbed sub-components for better maintainability and faster linting.
3. **Unified Shared Types**: Move lead interfaces and SEO types into a shared `@/types/` module imported by both client and server files.
