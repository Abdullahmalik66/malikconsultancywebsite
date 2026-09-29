# Admin Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Authentication Flow `[Verified from repository: src/pages/AdminPage.tsx, src/components/layout/ProtectedRoute.tsx]`

The `/admin` route provides an authenticated executive control center for Abdullah Malik.
- **Route Guard**: `src/components/layout/ProtectedRoute.tsx` verifies Firebase Auth state via `AuthContext`. Unauthenticated visitors are redirected to `/admin/login`.
- **Session Persistence**: Auth tokens persist in client browser storage via Firebase SDK.

---

## 2. Admin Workspace Modules `[Verified from repository: src/pages/AdminPage.tsx]`

The admin portal provides 5 core management interfaces:

### A. Lead Management CRM (`src/features/leads/`) `[Verified from repository]`
- Real-time pipeline monitoring for inbound prospect inquiries.
- Includes full-text search, status tabs (`new`, `reviewing`, `qualified`, `follow-up`, `proposal`, `won`, `not-a-fit`, `archived`), priority tagging (`urgent`, `high`, `medium`, `low`), and CSV data export.
- Detail drawer displays prospect responses to diagnostic questions, AI qualification summary, email delivery status, and internal admin notes.

### B. Content Editor (`src/components/admin/AdminContentEditor.tsx`) `[Verified from repository]`
- Custom Slate.js rich-text WYSIWYG editor.
- Supports Markdown copy-pasting, headings (H1–H3), blockquotes, lists, links, inline code, and media embedding.
- Manages published and draft articles and case studies in RTDB `/content`.

### C. Card Builder (`src/components/admin/CardBuilder.tsx`) `[Verified from repository]`
- Visual card builder for homepage presentation cards and callouts.
- Real-time preview of card themes, badges, and button destinations in RTDB `/cards`.

### D. Client Showcase Manager (`src/components/admin/ClientShowcaseManager.tsx`) `[Verified from repository]`
- Curates partner company logos and trust proof in RTDB `/clientLogos` and `/clientShowcase2Logos`.
- Manages file uploads to Firebase Cloud Storage.

### E. SEO Workspace (`src/components/admin/SeoWorkspace.tsx`) `[Verified from repository]`
- Metadata manager for every page on the platform.
- Configures titles, meta descriptions, canonical URLs, OpenGraph images, and custom JSON-LD schemas in RTDB `/seo`.
