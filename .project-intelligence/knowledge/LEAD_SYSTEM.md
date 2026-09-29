# Lead Management System (LMS) & Pipeline Architecture

**Repository**: `Abdullahmalik66/malikconsultancywebsite`  
**Source Files**: `server/leads/*`, `src/features/leads/*`, `src/services/leads/*` `[Verified from repository]`  

---

## 1. System Overview `[Verified from repository]`

The Lead Management System is the commercial intake engine of the consultancy platform. It manages the entire funnel from diagnostic questionnaires on service pages through server validation, persistence, AI qualification, executive email alerts, and admin CRM management.

---

## 2. Lead Record Schema `[Verified from repository: server/leads/leadTypes.ts]`

Leads persist in Firebase Realtime Database at `/leads/{leadId}` according to the following TypeScript interface contract:

```typescript
export interface LeadRecord {
  id: string;

  submissionType: LeadSourceType; // 'reach-me' | 'ai-transformation' | 'data-activation' | 'modern-marketing-growth' | 'ai-maturity-capability' | 'newsletter'
  sourcePage: string;
  sourcePageTitle: string;
  sourceUrl: string;
  referrer?: string;

  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  primaryInterest?: string;
  message?: string;

  answers: LeadAnswer[]; // { questionId, question, answer }

  // AI & Triage Fields (populated asynchronously)
  aiSummary?: string;
  businessContext?: string;
  identifiedNeeds?: string[];
  identifiedBlockers?: string[];
  recommendedService?: string;
  recommendedNextStep?: string;
  leadPriority?: LeadPriority; // 'low' | 'medium' | 'high' | 'urgent'
  qualificationReason?: string;

  status: LeadStatus; // 'new' | 'reviewing' | 'qualified' | 'follow-up' | 'proposal' | 'won' | 'not-a-fit' | 'archived'
  isRead: boolean;

  emailDelivery: LeadEmailDelivery; // { status, sentAt, error, attempts }

  adminNotes?: string;
  tags?: string[];

  createdAt: string;
  updatedAt: string;

  consent: LeadConsent; // { contactConsent, privacyAccepted, acceptedAt }
  technical: LeadTechnical; // { userAgent, locale, timezone, referrer, campaign, ipHash }

  externalCrmId?: string;
}
```

---

## 3. Server-Side Execution Pipeline `[Verified from repository: server/leads/*]`

1. **Intake (`POST /api/leads`)**: Client submits payload via `src/services/leads/leadApi.ts` to `server.ts`.
2. **Validation (`leadValidation.ts`)**: Validates email format, sanitizes inputs, enforces required fields, and applies rate limiting based on IP and email hash.
3. **Persistence (`leadRepository.ts`)**: Creates lead record in Firebase RTDB `/leads/{leadId}` with status `new` and `isRead: false`.
4. **Immediate Response**: Endpoint returns `201 Created` with `{ success: true, leadId }` immediately without waiting for AI or email operations.
5. **Background Asynchronous Workers**:
   - **AI Analysis (`leadSummary.ts`)**:
     - Attempts primary call to Google Gemini Flash API (`gemini-3.1-flash-lite`).
     - If Gemini fails, calls `getAICompletion` (NVIDIA Nemotron -> NVIDIA Llama -> Gemini).
     - If all AI calls fail, executes `getDeterministicFallback()` using keyword heuristics and declared timeline.
     - Updates `/leads/{leadId}` with summary, needs, blockers, and `leadPriority`.
   - **Executive Notification (`leadEmail.ts`)**:
     - Renders responsive HTML and plaintext email templates.
     - Sends alert email to Abdullah Malik via Nodemailer SMTP.
     - Updates `/leads/{leadId}/emailDelivery`.

---

## 4. Admin CRM Interface `[Verified from repository: src/features/leads/*]`

Located within `/admin`:
- **`LeadInbox.tsx`**: High-density CRM table with live search, status tabs, and priority filters.
- **`LeadOverview.tsx`**: High-level metric summary cards.
- **`LeadDetail.tsx`**: Slide-over panel showing prospect contact details, diagnostic answers, AI analysis, email delivery status, and internal admin notes.
- **CSV Export**: Endpoint `/api/admin/leads-export.csv` streams all leads in CSV format for offline analysis.
