# Lead System Subsystem Report

**Repository Absolute Path**: `/Users/amabdu/Desktop/Agents/My_personal_website.worktrees/install-configure-codebase-memory-mcp`  
**Git Branch**: `agents/install-configure-codebase-memory-mcp`  
**Commit SHA**: `fc9ef55b869d590fb2f40bcd67f436223c8b3fdf`  
**Working-Tree Status**: Clean git working tree (untracked `.codebase-memory/`, `.project-intelligence/`, `.cbmignore`)  
**Index Timestamp**: `2026-09-29T08:58:59Z`  
**Indexed Paths**: `src/`, `server/`, `scripts/`, `functions/`, `public/` (non-media), configuration files  
**Excluded Paths**: `node_modules/`, `dist/`, `build/`, `coverage/`, `.firebase/`, `.npm-cache/`, `*.log`, `BannerImages*/`, `logocustomer/`, `public/images/`, `public/banners/`, `public/*.webp`, `public/*.png`, `public/*.ico`, `reach_me_submissions.json`, `leads_backup.json`, `.codebase-memory/`  
**Coverage Report**: 8 key paths tested (7 clean `no_recorded_issue`, 1 `partial` in `src/pages/AdminPage.tsx` line 214)  

---

## 1. Pipeline Architecture `[Verified from repository]`

The Lead Management System connects diagnostic questionnaires on service pages directly to an asynchronous backend processing engine and an executive CRM interface.

```mermaid
flowchart LR
    subgraph Client
        Form[DecisionQuestionnaire.tsx]
        APIClient[leadApi.submitLead()]
    end

    subgraph Server_Pipeline [Express server/leads/]
        Endpoint[POST /api/leads]
        Validator[leadValidation.ts]
        Repo[leadRepository.ts]
        SummaryEngine[leadSummary.ts]
        EmailEngine[leadEmail.ts]
    end

    subgraph Persistence_And_AI
        RTDB[(Firebase RTDB /leads)]
        Gemini[Google Gemini Flash API]
        AIService[NVIDIA / Gemini Fallback Chain]
        SMTP[Nodemailer SMTP]
    end

    Form --> APIClient
    APIClient --> Endpoint
    Endpoint --> Validator
    Validator --> Repo
    Repo --> RTDB
    Repo -.-> SummaryEngine
    SummaryEngine -.-> Gemini
    SummaryEngine -.-> AIService
    SummaryEngine -.-> RTDB
    Repo -.-> EmailEngine
    EmailEngine -.-> SMTP
```

---

## 2. Key Modules & Responsibilities `[Verified from repository]`

| File | Subsystem | Responsibility | Classification |
| :--- | :--- | :--- | :--- |
| `src/services/leads/leadApi.ts` | Client Transport | HTTP client for `/api/leads` and `/api/admin/leads*`. | `[Verified from repository]` |
| `server/leads/leadValidation.ts` | Server Validation | Sanitizes inputs, checks email format, rate limits, and validates diagnostic answers. | `[Verified from repository]` |
| `server/leads/leadRepository.ts` | Persistence | RTDB operations (`createLeadRecord`, `updateLeadRecord`, `getLeadById`, `getAllLeads`, `deleteLeadById`). | `[Verified from repository]` |
| `server/leads/leadSummary.ts` | AI Triage | Invokes Gemini Flash API, falls back to `getAICompletion`, and executes deterministic scoring fallback on failure. | `[Verified from repository]` |
| `server/leads/leadEmail.ts` | Notification | Renders HTML and plaintext email templates and dispatches alerts to Abdullah Malik via Nodemailer. | `[Verified from repository]` |
| `src/features/leads/LeadInbox.tsx` | Admin UI | High-density CRM table with live search, filters, pagination, and slide-over dossier panel. | `[Verified from repository]` |

---

## 3. Resilience & Failure Modes `[Verified from repository]`

1. **Third-Party AI Downtime**: If the Gemini API fails or times out, `leadSummary.ts` attempts `getAICompletion` and ultimately executes `getDeterministicFallback()`. The lead is scored immediately without human disruption.
2. **SMTP Outage**: If email delivery fails, the error is recorded in `/leads/{leadId}/emailDelivery`. The lead record remains safely saved in RTDB, and the admin can click "Retry Email" from the Admin Lead Detail drawer.
