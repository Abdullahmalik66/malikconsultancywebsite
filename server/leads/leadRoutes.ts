import { Router, Request, Response } from "express";
import {
  processLeadSubmission,
  retryLeadEmail,
  regenerateLeadSummary
} from "./leadService";
import {
  getAllLeads,
  getLeadById,
  updateLeadRecord,
  deleteLeadById
} from "./leadRepository";
import { LeadRecord, LeadStatus, LeadPriority, DeliveryStatus, LeadSourceType } from "./leadTypes";

export const leadRouter = Router();

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}

function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${protocol}://${host}`;
}

// ─── PUBLIC ENDPOINT ──────────────────────────────────────────────────────────

/**
 * POST /api/leads
 * Handles public submissions for both Reach Me and all service Decision Questionnaires.
 */
leadRouter.post("/leads", async (req: Request, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    const baseUrl = getBaseUrl(req);

    const result = await processLeadSubmission(req.body, clientIp, baseUrl);
    res.status(result.statusCode).json(result.response);
  } catch (err) {
    console.error("[LeadRoutes] Unhandled error in POST /api/leads:", err);
    res.status(500).json({
      success: false,
      message: "An internal system error occurred. Please try again."
    });
  }
});

// ─── ADMIN AUTH MIDDLEWARE ──────────────────────────────────────────────────

/**
 * Middleware to verify that the request is from an authenticated admin.
 * Accepts Firebase Auth ID token in `Authorization: Bearer <token>`.
 */
async function requireAdminAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token." });
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();
  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: Invalid token format." });
  }

  // Verify Firebase ID Token via Google Identity Toolkit
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken })
        }
      );

      if (!response.ok) {
        return res.status(403).json({ error: "Forbidden: Invalid or expired admin credentials." });
      }

      const data = await response.json();
      if (!data.users || data.users.length === 0) {
        return res.status(403).json({ error: "Forbidden: Admin user not found." });
      }

      // Attached validated admin info to request
      (req as any).adminUser = data.users[0];
      return next();
    } catch (authError) {
      console.warn("[AdminAuth] Verification network error:", authError);
      // Fallback: decode JWT payload expiration in case Google network is unreachable
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            (req as any).adminUser = payload;
            return next();
          }
        }
      } catch (decodeErr) {
        // Fallback failed
      }
      return res.status(401).json({ error: "Unauthorized: Token verification failed." });
    }
  } else {
    // If no Firebase API key is configured (local mock/dev), inspect JWT expiration
    try {
      const parts = idToken.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          (req as any).adminUser = payload;
          return next();
        }
      }
    } catch (e) {
      // Ignore
    }
    return next();
  }
}

// ─── ADMIN ENDPOINTS ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/leads
 * List leads with filtering, search, and sorting.
 */
leadRouter.get("/admin/leads", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const leads = await getAllLeads();

    const {
      status,
      submissionType,
      priority,
      deliveryStatus,
      unreadOnly,
      search
    } = req.query;

    let filtered = leads;

    if (status && typeof status === "string") {
      filtered = filtered.filter(l => l.status === status);
    }

    if (submissionType && typeof submissionType === "string") {
      filtered = filtered.filter(l => l.submissionType === submissionType);
    }

    if (priority && typeof priority === "string") {
      filtered = filtered.filter(l => l.leadPriority === priority);
    }

    if (deliveryStatus && typeof deliveryStatus === "string") {
      filtered = filtered.filter(l => l.emailDelivery?.status === deliveryStatus);
    }

    if (unreadOnly === "true") {
      filtered = filtered.filter(l => !l.isRead);
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(l => {
        const matchName = l.name.toLowerCase().includes(q);
        const matchEmail = l.email.toLowerCase().includes(q);
        const matchCompany = l.company?.toLowerCase().includes(q) || false;
        const matchMessage = l.message?.toLowerCase().includes(q) || false;
        const matchAnswers = l.answers?.some(a => 
          a.question.toLowerCase().includes(q) || a.answer.toLowerCase().includes(q)
        ) || false;

        return matchName || matchEmail || matchCompany || matchMessage || matchAnswers;
      });
    }

    res.json({
      leads: filtered,
      totalCount: filtered.length
    });
  } catch (err) {
    console.error("[LeadRoutes] GET /api/admin/leads error:", err);
    res.status(500).json({ error: "Failed to fetch leads." });
  }
});

/**
 * GET /api/admin/leads-export.csv
 * Stream CSV export of all leads.
 */
leadRouter.get("/admin/leads-export.csv", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const leads = await getAllLeads();
    const headers = [
      "Lead ID",
      "Received Date",
      "Lead Type / Source",
      "Full Name",
      "Email Address",
      "Company",
      "Job Title / Role",
      "Phone",
      "Primary Interest",
      "Priority",
      "Status",
      "Email Delivery Status",
      "Source Page",
      "Source Page Title",
      "Executive / AI Summary",
      "Stated Needs",
      "Stated Blockers",
      "Recommended Service",
      "Recommended Next Step",
      "Questionnaire Responses",
      "Free-Text Message",
      "Internal Admin Notes",
      "Tags"
    ];

    const escapeCSV = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map(l => [
      escapeCSV(l.id),
      escapeCSV(l.createdAt),
      escapeCSV(l.submissionType === "newsletter" ? "Subscription" : l.submissionType),
      escapeCSV(l.name),
      escapeCSV(l.email),
      escapeCSV(l.company || ""),
      escapeCSV(l.jobTitle || ""),
      escapeCSV(l.phone || ""),
      escapeCSV(l.primaryInterest || ""),
      escapeCSV((l.leadPriority || "medium").toUpperCase()),
      escapeCSV(l.status),
      escapeCSV(l.emailDelivery?.status || "pending"),
      escapeCSV(l.sourcePage || ""),
      escapeCSV(l.sourcePageTitle || ""),
      escapeCSV(l.aiSummary || ""),
      escapeCSV((l.identifiedNeeds || []).join("; ")),
      escapeCSV((l.identifiedBlockers || []).join("; ")),
      escapeCSV(l.recommendedService || ""),
      escapeCSV(l.recommendedNextStep || ""),
      escapeCSV((l.answers || []).map(a => `${a.question}: ${a.answer}`).join(" | ")),
      escapeCSV(l.message || ""),
      escapeCSV(l.adminNotes || ""),
      escapeCSV((l.tags || []).join(", "))
    ]);

    const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(","), ...rows.map(r => r.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="malik_consultancy_leads_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error("[LeadRoutes] GET /api/admin/leads-export.csv error:", err);
    res.status(500).json({ error: "Failed to export leads CSV." });
  }
});

/**
 * GET /api/admin/leads/stats
 * Get overview metrics for the admin lead dashboard.
 */
leadRouter.get("/admin/leads-stats", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const leads = await getAllLeads();

    const stats = {
      totalLeads: leads.length,
      unreadLeads: leads.filter(l => !l.isRead).length,
      newLeads: leads.filter(l => l.status === "new").length,
      qualifiedLeads: leads.filter(l => l.status === "qualified").length,
      followUpLeads: leads.filter(l => l.status === "follow-up").length,
      failedDeliveries: leads.filter(l => l.emailDelivery?.status === "failed").length,
      bySource: {
        "reach-me": leads.filter(l => l.submissionType === "reach-me").length,
        "ai-transformation": leads.filter(l => l.submissionType === "ai-transformation").length,
        "data-activation": leads.filter(l => l.submissionType === "data-activation").length,
        "modern-marketing-growth": leads.filter(l => l.submissionType === "modern-marketing-growth").length,
        "ai-maturity-capability": leads.filter(l => l.submissionType === "ai-maturity-capability").length,
        "newsletter": leads.filter(l => l.submissionType === "newsletter").length
      },
      byStatus: {
        "new": leads.filter(l => l.status === "new").length,
        "reviewing": leads.filter(l => l.status === "reviewing").length,
        "qualified": leads.filter(l => l.status === "qualified").length,
        "follow-up": leads.filter(l => l.status === "follow-up").length,
        "proposal": leads.filter(l => l.status === "proposal").length,
        "won": leads.filter(l => l.status === "won").length,
        "not-a-fit": leads.filter(l => l.status === "not-a-fit").length,
        "archived": leads.filter(l => l.status === "archived").length
      },
      byPriority: {
        "urgent": leads.filter(l => l.leadPriority === "urgent").length,
        "high": leads.filter(l => l.leadPriority === "high").length,
        "medium": leads.filter(l => l.leadPriority === "medium").length,
        "low": leads.filter(l => l.leadPriority === "low").length
      },
      recentLeads: leads.slice(0, 5)
    };

    res.json(stats);
  } catch (err) {
    console.error("[LeadRoutes] GET /api/admin/leads-stats error:", err);
    res.status(500).json({ error: "Failed to compute lead statistics." });
  }
});

/**
 * GET /api/admin/leads/:id
 * Retrieve full details for a single lead.
 */
leadRouter.get("/admin/leads/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found." });
    }
    res.json(lead);
  } catch (err) {
    console.error("[LeadRoutes] GET /api/admin/leads/:id error:", err);
    res.status(500).json({ error: "Failed to retrieve lead." });
  }
});

/**
 * PATCH /api/admin/leads/:id
 * Update lead properties (status, priority, adminNotes, tags, isRead).
 */
leadRouter.patch("/admin/leads/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await getLeadById(id);
    if (!existing) {
      return res.status(404).json({ error: "Lead not found." });
    }

    const updates: Partial<LeadRecord> = {};
    const { status, leadPriority, adminNotes, tags, isRead } = req.body;

    if (status !== undefined) updates.status = status as LeadStatus;
    if (leadPriority !== undefined) updates.leadPriority = leadPriority as LeadPriority;
    if (adminNotes !== undefined) updates.adminNotes = String(adminNotes);
    if (tags !== undefined && Array.isArray(tags)) updates.tags = tags.map(String);
    if (isRead !== undefined) updates.isRead = Boolean(isRead);

    await updateLeadRecord(id, updates);
    const updatedLead = await getLeadById(id);

    res.json({
      success: true,
      lead: updatedLead
    });
  } catch (err) {
    console.error("[LeadRoutes] PATCH /api/admin/leads/:id error:", err);
    res.status(500).json({ error: "Failed to update lead." });
  }
});

/**
 * POST /api/admin/leads/:id/retry-email
 * Retry sending the notification email for a lead.
 */
leadRouter.post("/admin/leads/:id/retry-email", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);
    const result = await retryLeadEmail(id, baseUrl);
    res.json(result);
  } catch (err) {
    console.error("[LeadRoutes] POST /api/admin/leads/:id/retry-email error:", err);
    res.status(500).json({ error: "Failed to retry email delivery." });
  }
});

/**
 * POST /api/admin/leads/:id/regenerate-summary
 * Regenerate Gemini lead qualification summary.
 */
leadRouter.post("/admin/leads/:id/regenerate-summary", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await regenerateLeadSummary(id);
    res.json(result);
  } catch (err) {
    console.error("[LeadRoutes] POST /api/admin/leads/:id/regenerate-summary error:", err);
    res.status(500).json({ error: "Failed to regenerate lead summary." });
  }
});

/**
 * DELETE /api/admin/leads/:id
 * Permanently delete a lead record (requires confirmation on client).
 */
leadRouter.delete("/admin/leads/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteLeadById(id);
    if (!deleted) {
      return res.status(404).json({ error: "Lead not found." });
    }
    res.json({ success: true, message: "Lead permanently removed." });
  } catch (err) {
    console.error("[LeadRoutes] DELETE /api/admin/leads/:id error:", err);
    res.status(500).json({ error: "Failed to delete lead." });
  }
});
