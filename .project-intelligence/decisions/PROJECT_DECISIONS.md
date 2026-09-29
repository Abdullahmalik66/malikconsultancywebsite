# Project Architecture Decisions (ADRs)

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  
**Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  

---

## ADR-001: Unified Service Page Template (`ServicePageLayout`)
- **Status**: Implemented / Permanent `[Verified from repository: src/components/service/ServicePageLayout.tsx]`
- **Context**: Multiple service offerings risked creating bespoke layouts, causing duplicate JSX code and inconsistent brand presentation.
- **Decision**: `[Explicitly provided by the project owner & Verified from repository]` Unify all service pages into a universal layout engine (`src/components/service/ServicePageLayout.tsx`). The layout renders 7 standardized sections (Hero, Cinematic Story, Sub-Services Showcase, Clients, Diagnostic Questionnaire, Case Work, Insights). All service-specific variance is isolated to configuration files under `src/content/services/<service>/`.
- **Consequences**:
  - Positive: Guarantees 100% layout consistency, fixes apply globally to all service pages, zero layout duplication.
  - Negative: Bespoke section additions must be supported via configuration flags in `ServicePageLayout`.

---

## ADR-002: Single Unified Inbound Lead Schema
- **Status**: Implemented / Permanent `[Verified from repository: server/leads/*, src/features/leads/*]`
- **Context**: Inbound prospect data could originate from service diagnostics, direct reach-out, terminal easter egg, or newsletter. Fragmenting collections would scatter customer data.
- **Decision**: `[Explicitly provided by the project owner & Verified from repository]` Store all prospect interactions in a single Firebase Realtime Database collection at `/leads/{leadId}`. Channel differentiation is captured via the `submissionType` field (`reach-me`, `ai-transformation`, `data-activation`, `modern-marketing-growth`, `ai-maturity-capability`, `newsletter`).
- **Consequences**:
  - Positive: Single CRM inbox for admin management, unified AI qualification, streamlined CSV export.
  - Negative: Schema must accommodate optional questionnaire answer arrays for simple contact form submissions.

---

## ADR-003: Dual-Layer SEO & Generative Engine Optimization (GEO)
- **Status**: Implemented / Permanent `[Verified from repository: server.ts, src/features/seo/*, scripts/prebuild-seo.cjs]`
- **Context**: Single-page React applications suffer from delayed crawler indexing and are inaccessible to LLM agents that do not execute client-side JavaScript.
- **Decision**: `[Explicitly provided by the project owner & Verified from repository]` Implement a dual-layer approach:
  1. Express middleware injects complete `<title>`, `<meta>`, OpenGraph tags, and JSON-LD schema into HTML on initial GET requests with a 5-minute cache.
  2. Client-side `react-helmet-async` dynamically updates tags during SPA navigation.
  3. Machine endpoints (`GET /<route>.md`, `GET /llms.txt`, `GET /llms-full.txt`) expose high-density Markdown for AI crawlers.
- **Consequences**:
  - Positive: Complete search engine indexability and native agentic readability.
  - Negative: Route metadata must be shared between client and server contexts (`seoService.ts`).

---

## ADR-004: Cascading AI Qualification with Deterministic Fallbacks
- **Status**: Implemented / Permanent `[Verified from repository: server/leads/leadSummary.ts, src/services/ai.ts]`
- **Context**: Inbound lead triage uses LLM inference to generate executive summaries and priority scores. Network failures or API quota limits must never disrupt lead intake.
- **Decision**: `[Explicitly provided by the project owner & Verified from repository]` Isolate lead scoring to background asynchronous execution in `server/leads/leadSummary.ts`:
  1. Primary call executes Google Gemini Flash (`gemini-3.1-flash-lite`).
  2. If Gemini fails, it invokes `getAICompletion` in `src/services/ai.ts` (NVIDIA Nemotron -> NVIDIA Llama -> Gemini).
  3. If all LLM calls fail, it executes `getDeterministicFallback()` using keyword heuristics and declared urgency.
- **Consequences**:
  - Positive: 100% submission resilience; lead creation never fails or blocks the client response.
  - Negative: Deterministic fallback summaries are rule-based and lack natural-language nuances.

---

## ADR-005: Adoption of Codebase Memory MCP as Permanent Project Intelligence Engine
- **Status**: Implemented / Permanent `[Verified from repository: .codebase-memory/, .project-intelligence/]`
- **Context**: As the codebase evolves, future AI coding agents risk modifying outdated files, duplicating components, or breaking M3 design tokens.
- **Decision**: `[Explicitly provided by the project owner & Verified from repository]` Install `codebase-memory-mcp` (v0.11.0) to provide native AST parsing, hybrid LSP resolution, and persistent graph artifacts (`.codebase-memory/graph.db.zst`), complemented by institutional memory in `.project-intelligence/`.
- **Consequences**:
  - Positive: Fast structural queries, low token consumption, verified AST coverage, and clear guardrails.
  - Negative: Requires maintaining `.project-intelligence/` documentation during major refactors.

---

## ADR-006: The Intelligence Layer (`/intelligence-layer`) 3D AST Knowledge Graph
- **Status**: Implemented / Permanent `[Verified from repository: src/pages/IntelligenceLayerPage.tsx, src/components/intelligence/CodebaseMemory3DView.tsx]`
- **Context**: The consultancy platform positions Abdullah Malik as an enterprise AI systems architect. Replicating the Codebase Memory WebGL telemetry UI directly on the website allows visitors to interactively inspect the actual interconnected code variables, functions, and files of the website.
- **Decision**: `[Explicitly provided by the project owner & Verified from repository]`
  1. Build `/intelligence-layer` using Three.js and OrbitControls with WebGL particle nebulae and filament edges, driven by exported Codebase Memory AST data (`codebaseMemoryData.json`).
  2. Implement real-time filtering for 14 node entity types, 13 edge relationship types, live symbol search, and subsystem directory tree.
  3. Feature the official Abdullah Malik brand mark (`[ ABDULLAH_MALIK ]` with blinking cursor and neon brackets) and live memory indicator in the top header, linking back to `/`.
  4. Place a permanent footer link "The Intelligence Layer" beside the legal links (Privacy, Terms, Cookies) without replacing any existing footer links.
  5. Lazy-load Three.js and the page chunk (`CLEAN_LAYOUT_PATHS`) so other site pages incur zero performance overhead.
- **Consequences**:
  - Positive: High-impact positioning for enterprise AI consultancy, interactive exploration of the site's architecture, zero performance hit on other pages.
  - Negative: Requires bundling `three` (~194kB gzip lazy chunk loaded only when entering `/intelligence-layer`).
