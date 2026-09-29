# Business Rules & Platform Objectives

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  

---

## 1. Platform Purpose & Commercial Objectives

The platform serves as Abdullah Malik’s professional consultancy and executive advisory interface `[Verified from repository: package.json, ARCHITECTURE.md, BRANDING.md]`.

Core business objectives:
1. **Advisory & Transformation Client Engagements** `[Verified from repository]`:
   - Engaging enterprise leaders, founders, and technical executives navigating generative AI adoption, data activation, growth architecture, and AI capability building.
2. **Personal Brand & Authority Hub** `[Explicitly provided by the project owner & Verified from BRANDING.md]`:
   - Establishing a credible, cohesive platform showcasing case studies, published perspectives, and client testimonials.
3. **Structured Lead Intake & Triage** `[Verified from repository: server/leads/*, src/features/leads/*]`:
   - Providing conversational diagnostic questionnaires on service pages that collect structured responses rather than generic contact form submissions.
4. **Agentic Web Discoverability (GEO)** `[Verified from repository: server.ts, scripts/prebuild-seo.cjs]`:
   - Supporting discovery by LLM search agents (Perplexity, ChatGPT, Claude) through native structured Markdown endpoints (`/route.md`, `/llms.txt`).

---

## 2. Core Service Offerings `[Verified from repository: src/App.tsx, src/content/services/]`

| Service Offering | Target Focus | Route |
| :--- | :--- | :--- |
| **AI Maturity & Capability Building** | AI readiness, capability benchmarking, and organizational literacy | `/services/ai-maturity-capability-building` |
| **Enterprise AI Transformation** | Autonomous agent architecture, workflow automation, and custom model deployments | `/services/ai-transformation` |
| **Data Activation & Intelligence** | Modern data infrastructure, real-time analytics, and data pipeline activation | `/services/data-activation-intelligence` |
| **Modern Marketing & Growth** | Algorithmic customer acquisition, full-funnel growth architecture, and conversion optimization | `/services/modern-marketing-growth` |

*(Note: Pricing and contract ranges vary by client scope and are not hardcoded into the repository codebase. Any specific dollar figures previously stated were unverified assumptions and have been removed.)*

---

## 3. Brand Identity & Design System `[Verified from repository: BRANDING.md, src/styles/index.css]`

The brand identity is governed by the **Material Design 3 (M3 Foundation)** framework:
- **Design Philosophy**: "Material You" (adaptive, expressive, physical motion).
- **Color System (Dynamic Tonal Palette)**:
  - Primary: `#6750A4` (Light) / `#D0BCFF` (Dark)
  - Secondary: `#625B71` (Light) / `#CCC2DC` (Dark)
  - Tertiary: `#7D5260` (Light) / `#EFB8C8` (Dark)
  - Surface: `#FEF7FF` (Light) / `#141218` (Dark)
  - Outline: `#79747E` (Light) / `#938F99` (Dark)
  - Rule: Never use pure black (`#000000`) or pure white (`#FFFFFF`) for surfaces; use M3 tinted neutrals for depth.
- **Typography**:
  - Primary Body Typeface: `Nunito` (Sans-serif)
  - Secondary Headline Typeface: `Syne` (Display / Headlines)
- **Grid & Spacing**: 8dp base unit, 24px desktop gutter, 16px mobile gutter, max content width 1280px.

---

## 4. Lead Intake & Conversion Funnel `[Verified from repository]`

1. **Service Page Engagement**: Prospective clients explore service methodologies via `CinematicStory` and capability cards via `SubServicesShowcase`.
2. **Conversational Diagnostic**: Prospects complete the interactive `DecisionQuestionnaire` component which asks structured diagnostic questions regarding their challenges, timeline, and goals.
3. **Automated Qualification**: The backend immediately calculates a baseline qualification via Gemini AI or deterministic heuristics and sends an executive notification email to Abdullah Malik via Nodemailer.
4. **Follow-Up**: The inquiry appears in the Admin Lead Inbox (`/admin`) for review, tagging, and direct scheduling.
