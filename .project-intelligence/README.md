# Project Intelligence Layer

Welcome to the **Project Intelligence Layer** for the Malik Consultancy Platform.

## Purpose

This repository is an enterprise consultancy and personal brand platform powered by:
- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion
- **Backend & Cloud**: Firebase (Realtime Database, Authentication, Cloud Storage), Express server
- **AI & GEO/SEO**: Gemini API, NVIDIA AI fallback chain, Markdown-for-Agents endpoints, `llms.txt` generation, and dynamic SEO head injection
- **Business Systems**: End-to-end Lead Management System, CMS Admin Panel, and 4 Core AI Service Offerings

The `.project-intelligence/` directory acts as a **permanent institutional memory bank** for human engineers and AI coding agents. It prevents future agents from modifying outdated files, duplicating features, introducing technical debt, or degrading production design standards.

---

## Directory Architecture

```
.project-intelligence/
│
├── knowledge/               Permanent project rules, architecture patterns, and domain memory
│   ├── PROJECT_STATE.md      Single source of dynamic operational status & priorities
│   ├── PROJECT_MEMORY.md     Foundational mission, stack, phases, and roadmap
│   ├── ARCHITECTURE_MEMORY.md System diagrams (Mermaid), data flows, and subsystem layers
│   ├── BUSINESS_RULES.md     Consultancy business context, brand positioning, client funnels
│   ├── AI_AGENT_RULES.md     Strict behavioral guardrails and immutability zones for AI agents
│   ├── SOURCE_OF_TRUTH.md    Official authoritative file references for each subsystem
│   ├── KNOWN_ISSUES.md       Cataloged technical debt, quirks, and active workarounds
│   ├── MOBILE_RULES.md       Responsive design paradigms, touch targets, and layout logic
│   ├── SEO_GEO_SYSTEM.md     SEO/GEO architecture, server hydration, and llms.txt pipeline
│   └── LEAD_SYSTEM.md        Lead intake, qualification pipeline, and CRM schema
│
├── architecture/            Deep architectural analyses, module topologies, and dependency graphs
│
├── reports/                 Subsystem audits, codebase intelligence reports, and MCP metrics
│   ├── MCP_INTEGRATION_REPORT.md
│   ├── INITIAL_CODEBASE_INTELLIGENCE_REPORT.md
│   ├── routes-report.md
│   ├── components-report.md
│   ├── firebase-report.md
│   ├── admin-report.md
│   ├── lead-system-report.md
│   ├── seo-report.md
│   ├── geo-report.md
│   └── markdown-report.md
│
├── prompts/                 System prompts, design proposals, and agent onboarding blueprints
│   └── AI_INTELLIGENCE_PAGE.md (Conceptual proposal for interactive AI visualizer)
│
├── snapshots/               Baseline metrics and generational snapshots of the codebase
│   └── INITIAL_PROJECT_SNAPSHOT.md
│
├── decisions/               Architecture Decision Records (ADRs) and rationale logs
│   └── PROJECT_DECISIONS.md
│
└── README.md                (This file)
```

---

## Critical Invariant for Agents

1. **Isolation**: Intelligence files live strictly inside `.project-intelligence/`. Never place intelligence documentation or MCP runtime binaries inside `src/`, `public/`, `functions/`, or `server/`.
2. **Consult First**: Before touching code, agents must read `knowledge/PROJECT_STATE.md` and `knowledge/AI_AGENT_RULES.md`.
3. **Graph Intelligence**: Use `codebase-memory-mcp` tools (`get_architecture`, `search_graph`, `trace_path`, `check_index_coverage`) rather than raw filesystem scans to understand symbol connectivity.
