# GEO (Generative Engine Optimization) Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Objectives & Generative Strategy `[Verified from repository: server.ts, scripts/prebuild-seo.cjs]`

Generative Engine Optimization (GEO) ensures that autonomous AI agents, web crawlers, and LLM-powered answer engines (Perplexity, ChatGPT Search, Claude, Gemini) receive high-density, structured, token-efficient representations of the platform's consultancy offerings.

Classical HTML contains DOM boilerplate, scripts, and layout markup that consume unnecessary tokens. GEO exposes native machine-readable endpoints.

---

## 2. Machine Interfaces & Endpoints `[Verified from repository: server.ts]`

### A. Live Markdown Routes (`GET /<route>.md`)
- Supported on primary routes (e.g. `/services/enterprise-ai.md`, `/about.md`).
- Handled via Express middleware in `server.ts`.
- Extracts core text, service deliverables, and diagnostic questions, stripping navigation and styling noise.
- Returns pure `text/markdown; charset=utf-8`.

### B. Agent Directory (`GET /llms.txt`)
- Standardized directory adhering to the `llms.txt` specification.
- Enumerates available pages, providing concise summaries and direct links to their `.md` machine-readable variants.

### C. Consolidated Knowledge Corpus (`GET /llms-full.txt`)
- Single consolidated Markdown document concatenating all service definitions, case studies, perspectives, and organizational profiles.

---

## 3. Dynamic & Static Synchronization `[Verified from repository]`

- **Dynamic Server**: `server.ts` generates `/llms.txt` and `/llms-full.txt` live from active Firebase RTDB configurations.
- **Build Pre-rendering**: `scripts/prebuild-seo.cjs` pre-renders static copies into `public/llms.txt` and `public/llms-full.txt` during `npm run build`, ensuring continuous availability on CDN edge nodes.
