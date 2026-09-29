# AI Agent Rules & Engineering Guardrails

**MANDATORY DIRECTIVE FOR ALL FUTURE AI AGENTS**:  
You are operating on the Malik Consultancy Platform. Careless refactors, duplicate components, or styling drift degrade production reliability and executive brand credibility. You MUST adhere to the following rules without exception.

---

## 1. DO NOT TOUCH (Strictly Immutable Zones) `[Explicitly provided by the project owner & Verified from repository]`

1. **Desktop Hero Section Architecture**:
   - `src/components/sections/Hero.tsx` and the hero headers within `ServicePageLayout.tsx`.
   - Do NOT modify desktop hero layout grids, perspective transforms, or primary typography hierarchies.
2. **Service Card Architecture**:
   - `src/components/cards/CardRenderer.tsx` and `src/components/service/SubServicesShowcase.tsx`.
   - The sticky stacked-card scroll mechanic on desktop is precision-tuned with Framer Motion scroll offsets. Do NOT replace it with generic grid cards or slider carousels.
3. **Core Brand Tokens & Design System**:
   - Material Design 3 tokens defined in `src/styles/index.css` and documented in `BRANDING.md` (`bg-m3-surface`, `text-m3-primary`, `border-m3-outline`, etc.).
   - Do NOT inject arbitrary inline HEX color values or break the dynamic M3 tonal palette.

---

## 2. ALWAYS REUSE (Single Responsibility & Modular Patterns) `[Explicitly provided by the project owner & Verified from repository]`

1. **Service Pages MUST Use `ServicePageLayout`**:
   - All service routes MUST render `src/components/service/ServicePageLayout.tsx`.
   - Never build a one-off JSX layout for any service. Pass service configuration through `src/content/services/<service>/`.
2. **Shared Questionnaire Engine**:
   - All interactive questionnaires MUST use `src/components/service/DecisionQuestionnaire.tsx`.
   - Provide questions and styling parameters via `questionnaire.ts` configuration files.
3. **Unified Inbound Lead Transport**:
   - Client-side lead submissions must use `src/services/leads/leadApi.ts`.
   - Server-side validation and persistence must route through `server/leads/leadService.ts` and `server/leads/leadRepository.ts`.
4. **Shared SEO Resolver**:
   - Always query `src/features/seo/seoService.ts` for route-to-metadata resolution across both server and client contexts.

---

## 3. DO NOT CREATE (Anti-Duplication Invariants) `[Explicitly provided by the project owner & Verified from repository]`

1. **NO Duplicate Questionnaires**:
   - Do NOT create `CustomQuestionnaire.tsx`, `LeadModal.tsx`, or inline multi-step forms. The `DecisionQuestionnaire` component is universal.
2. **NO Duplicate Service Page Layouts**:
   - Do NOT create custom service page scaffolds. Every service page follows the standardized 7-section stack defined in `ServicePageLayout`.
3. **NO Fragmented Lead Collections**:
   - Do NOT create separate RTDB paths like `/inquiries`, `/contacts`, or `/service-leads`. All prospects map to the unified `/leads` schema with appropriate `submissionType` tags.
4. **NO Code Infiltration from Intelligence Assets**:
   - Do NOT import files from `.project-intelligence/` into application runtime code (`src/`, `server/`, `functions/`).

---

## 4. Pre-Flight Verification Checklist for Agents `[Recommendation]`

Before marking any task complete, future agents MUST:
- [ ] Verify that no uncommitted temporary or test files remain in the repository.
- [ ] Verify all modified TypeScript files compile cleanly.
- [ ] Confirm no files were placed in `.project-intelligence/` that belong in source code, and vice versa.
- [ ] Run `codebase-memory-mcp cli check_index_coverage` on affected files to verify AST coverage.
