# Markdown Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Overview & Markdown Usage `[Verified from repository]`

Markdown is utilized across two critical platform boundaries:
1. **Machine-Facing Delivery**: Serving AI agents, LLMs, and search crawlers clean Markdown representations of platform pages via `server.ts`.
2. **Editorial Authoring**: Slate.js rich-text editing in the Admin Console, converting structured JSON document nodes into clean HTML and Markdown exports.

---

## 2. Machine-Facing Markdown Pipeline (`server.ts`) `[Verified from repository]`

When an HTTP client requests a `.md` extension on any route:
1. `server.ts` intercepts the request pattern `/:slug.md` or `/services/:slug.md`.
2. Resolves route identity against `seoService.ts`.
3. Fetches article content from RTDB `/content` (for writings/case studies) or extracts structured data from service configuration definitions (`src/content/services/`).
4. Constructs a Markdown document structured with frontmatter, executive summary, methodologies, and diagnostic questions.
5. Returns `Content-Type: text/markdown; charset=UTF-8`.

---

## 3. Editorial Markdown Processing (Admin Console) `[Verified from repository]`

- **Editor Engine**: `src/components/admin/AdminContentEditor.tsx` utilizes Slate.js (`slate`, `slate-react`).
- **Markdown Ingestion**: Supports pasting raw Markdown, automatically deserializing it into Slate document blocks.
- **Serialization**: Content saves to Firebase RTDB as clean JSON element trees, while serving utilities compile it to semantic HTML for client rendering and pure Markdown for AI crawlers.
