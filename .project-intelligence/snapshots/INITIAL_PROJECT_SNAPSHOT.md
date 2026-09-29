# Initial Project Architecture Snapshot

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  
**AST Nodes Total**: 1,287  
**Graph Edges Total**: 3,089  
**Languages**: TypeScript (114 files), HTML (1 file), CSS (1 file)  
**Package / Directory Footprint**: `src/` (571 nodes), `server/` (52 nodes), `public/` (5 nodes), `scripts/` (4 nodes)  

---

## 1. System Baseline Metrics `[Verified from repository: CBM AST Index]`

| Metric | Measured Baseline Value |
| :--- | :--- |
| **Total AST Function Nodes** | 455 |
| **Total Variable / Constant Nodes** | 165 |
| **Total File Nodes** | 125 |
| **Total Module Nodes** | 123 |
| **Total Interface Declarations** | 119 |
| **Total Type Aliases** | 45 |
| **Total HTTP Route Nodes** | 28 |
| **Identified Entry Points** | 20 |
| **Direct Call Relationships (`CALLS`)** | 622 |
| **Structural Definitions (`DEFINES`)**| 962 |
| **Import References (`IMPORTS`)** | 389 |
| **Knowledge Graph Compression** | Raw: 6.09 MB → Compressed: 989 KB (zstd level 9) |

---

## 2. Baseline Architecture Topology `[Verified from repository]`

### A. Service Structure Baseline
- **Engine**: Single layout engine `ServicePageLayout.tsx` supporting 4 instantiated service pages.
- **Config Directories**:
  - `src/content/services/aiMaturity/`
  - `src/content/services/aiTransformation/`
  - `src/content/services/dataActivation/`
  - `src/content/services/modernMarketing/`
- **Integrity**: 0 duplicate service page layouts.

### B. Inbound Lead Architecture Baseline
- **Ingestion**: `POST /api/leads` operational in `server.ts`.
- **Validation**: Schema enforcement in `server/leads/leadValidation.ts`.
- **Persistence**: Firebase Realtime Database collection `/leads/{leadId}` managed by `server/leads/leadRepository.ts`.
- **AI Scoring**: Gemini Flash API + AIService fallback + deterministic heuristic fallback in `server/leads/leadSummary.ts`.
- **Dispatch**: Nodemailer notification alerts in `server/leads/leadEmail.ts`.
- **Admin CRM**: Feature-complete dashboard in `src/features/leads/` (`LeadInbox`, `LeadOverview`, `LeadDetail`, `LeadFilters`).

### C. SEO & GEO Architecture Baseline
- **Dual-Layer SEO**:
  - Server-side `<head>` injection via Express middleware with 5-minute memory cache.
  - Client-side dynamic hydration via `react-helmet-async` in `SEORenderer.tsx`.
- **GEO / Machine Endpoints**:
  - `GET /<slug>.md`
  - `GET /llms.txt`
  - `GET /llms-full.txt`
- **Build Pre-rendering**: `scripts/prebuild-seo.cjs` pre-populates static fallback files into `public/`.

### D. Admin Console Baseline
- **Access Control**: Firebase Auth email/password protected via `ProtectedRoute.tsx`.
- **Editorial Tooling**: Custom Slate.js WYSIWYG editor with rich text and markdown support.
- **CMS Entities**: Content articles, site presentation cards, partner showcases, SEO meta tags, and Inbound Leads.
