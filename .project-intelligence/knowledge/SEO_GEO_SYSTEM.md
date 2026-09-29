# SEO & GEO (Generative Engine Optimization) System

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  
**Source Files**: `server.ts`, `src/features/seo/*`, `scripts/prebuild-seo.cjs` `[Verified from repository]`  

---

## 1. Overview & Dual-Layer Strategy `[Verified from repository]`

The platform employs a **dual-layer SEO and GEO architecture** designed to support both classical search engines (Google, Bing) and AI discovery engines (Perplexity, ChatGPT Search, Claude Search, Gemini).

```mermaid
flowchart LR
    subgraph Data_Source [Firebase Realtime Database]
        RTDB[(/seo/pages & /seo/organisation)]
    end

    subgraph Classical_SEO [Classical Search Engine Optimization]
        SSR[Express server.ts SSR-Lite Head Injection]
        Client[react-helmet-async SEORenderer]
        Sitemap[sitemap.xml & robots.txt]
    end

    subgraph Generative_SEO [Generative Engine Optimization (GEO)]
        MD[GET /route.md Markdown Endpoints]
        LLMS[GET /llms.txt Directory]
        LLMSFull[GET /llms-full.txt Aggregated Context]
    end

    RTDB --> SSR
    RTDB --> Client
    RTDB --> Sitemap
    RTDB --> MD
    RTDB --> LLMS
    RTDB --> LLMSFull
```

---

## 2. Classical SEO Architecture `[Verified from repository]`

### A. Realtime Database Structure (`/seo/`)
The SEO data model is stored under four root paths in Firebase RTDB:
1. `/seo/organisation`: Global metadata (organization name, founder, URL, logo, social profiles).
2. `/seo/controls`: Global toggles (indexing enable/disable, sitemap inclusion, robots rules).
3. `/seo/pages/{pageId}`: Page-specific metadata overrides (`metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `structuredData`, `robotsDirectives`).
4. `/seo/tracking`: Analytics and tracking container IDs.

### B. Server-Side Head Injection (`server.ts`)
- On initial page request, Express intercepts the HTML template.
- Calls `seoService.resolveRoute(pathname)` to determine page ID.
- Fetches active configuration with an in-memory 5-minute cache.
- Injects `<title>`, `<meta>`, and JSON-LD schema blocks before streaming HTML to the client.

### C. Client-Side Hydration (`SEORenderer.tsx`)
- When the user transitions between routes on the SPA, `SEORenderer` uses `react-helmet-async` to dynamically synchronize the `<head>` without a page reload.

---

## 3. Generative Engine Optimization (GEO) & Machine Endpoints `[Verified from repository]`

To support autonomous AI agents and web crawlers, the platform exposes native machine interfaces:

### A. Live Markdown Routes (`GET /<route>.md`)
- Requesting `.md` on primary routes returns clean Markdown formatted for LLM context windows.
- Extracts core text, deliverables, and diagnostic questions while omitting navigation boilerplate.

### B. `GET /llms.txt`
- Standardized directory of public platform pages with concise summaries and links to `.md` endpoints.

### C. `GET /llms-full.txt`
- Consolidated knowledge corpus of all routes in a single payload, enabling full-context ingestion.

---

## 4. Build-Time Static Generation (`scripts/prebuild-seo.cjs`) `[Verified from repository]`

During `npm run build`:
- `node scripts/prebuild-seo.cjs` executes before `vite build`.
- Queries Firebase RTDB to generate static fallback files in `public/`:
  - `public/robots.txt`
  - `public/sitemap.xml`
  - `public/llms.txt`
  - `public/llms-full.txt`
