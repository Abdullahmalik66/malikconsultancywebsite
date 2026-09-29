# SEO Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Subsystem Architecture `[Verified from repository]`

The SEO system pairs server-side `<head>` injection with client-side SPA navigation hydration.

```mermaid
flowchart TD
    ConfigStore[(RTDB /seo)]
    
    subgraph Build_Time
        PrebuildScript[scripts/prebuild-seo.cjs]
        StaticFiles[public/robots.txt, public/sitemap.xml]
    end

    subgraph Runtime_Server
        Incoming[Incoming GET Request]
        SSRLite[server.ts SSR-Lite Head Middleware]
        HTMLStream[Injected HTML Document]
    end

    subgraph Runtime_Client
        ClientNav[React Router Nav]
        Renderer[SEORenderer (react-helmet-async)]
    end

    ConfigStore --> PrebuildScript --> StaticFiles
    ConfigStore --> SSRLite
    Incoming --> SSRLite --> HTMLStream
    HTMLStream --> ClientNav --> Renderer
```

---

## 2. Core Modules & Functions `[Verified from repository]`

1. **`src/features/seo/seoService.ts`**:
   - `resolveRoute(path)`: Maps any URL path to its canonical `pageId`.
   - `resolveMetadata(pageId)`: Resolves titles, descriptions, OpenGraph attributes, and JSON-LD schema using RTDB data or static fallbacks.
2. **`server.ts`**:
   - Intercepts all incoming GET requests.
   - Evaluates URL against `resolveRoute` and `resolveMetadata`.
   - Injects `<title>`, `<meta name="description">`, OpenGraph, Twitter Cards, and schema.org JSON-LD directly into the HTML string before streaming to the client.
   - Maintains an in-memory 5-minute cache per route.
3. **`src/features/seo/SEORenderer.tsx`**:
   - React component wrapping `react-helmet-async`.
   - Updates document title and meta elements dynamically during client-side SPA navigation.
4. **`scripts/prebuild-seo.cjs`**:
   - Executes during `npm run build` prior to Vite compilation.
   - Connects to Firebase RTDB to generate static `sitemap.xml` and `robots.txt` in `public/`.
