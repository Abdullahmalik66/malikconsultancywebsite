# Known Issues & Technical Debt

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  
**Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  

---

## 1. Active Technical Debt `[Verified from repository]`

### KD-001: Quadruple Static Route Registries
- **Severity**: Medium
- **Classification**: `[Verified from repository]`
- **Observation**: Static route paths and page IDs are declared across 4 separate locations:
  1. `server.ts` (Express static route array for SSR injection & markdown endpoints)
  2. `src/features/seo/seoService.ts` (SEO metadata default mapping)
  3. `src/components/admin/SeoWorkspace.tsx` (Admin SEO dropdown options)
  4. `scripts/prebuild-seo.cjs` (Static sitemap/robots generation)
- **Recommendation**: `[Recommendation]` Extract route descriptors into a shared TypeScript manifest (e.g. `src/config/routes.ts`) consumed by client, server, and prebuild scripts.

### KD-002: Dual Lead Type Definitions
- **Severity**: Low
- **Classification**: `[Verified from repository]`
- **Observation**: `src/features/leads/leadTypes.ts` (frontend) and `server/leads/leadTypes.ts` (backend) duplicate lead interface declarations.
- **Recommendation**: `[Recommendation]` Consolidate into a unified shared type definition to prevent drift when schema fields change.

### KD-003: Tree-Sitter JSX Partial Parse Ranges in Large Admin Modules
- **Severity**: Low (No runtime or compiler impact)
- **Classification**: `[Verified from repository]`
- **Observation**: `codebase-memory-mcp` reports partial parse ranges in 5 complex admin files (`AdminContentEditor.tsx`, `CardBuilder.tsx`, `ClientShowcaseManager.tsx`, `ContentList.tsx`, `SeoWorkspace.tsx`) due to deeply nested JSX generic types. All files compile with zero errors in `tsc`.
- **Recommendation**: `[Recommendation]` Split large files (such as `SeoWorkspace.tsx`, which exceeds 2,100 lines) into focused sub-components.

---

## 2. Resolved Historical Debt `[Verified from repository]`

- **Standardized Service Page Architecture**: Service pages previously had diverging layouts; now unified on `ServicePageLayout` with modular configs under `src/content/services/`.
- **Live Inbound Lead Engine**: Questionnaire forms previously lacked a connected backend; now wired to `POST /api/leads`, Firebase RTDB `/leads`, Gemini AI qualification, and Nodemailer.
- **Permanent Code Intelligence**: Added `codebase-memory-mcp` v0.11.0 AST graph and `.project-intelligence/` institutional memory.
