import {
  LeadSubmissionPayload,
  LeadSubmissionResponse,
  LeadRecord,
  LeadOverviewStats,
  LeadStatus,
  LeadPriority,
  DeliveryStatus,
  LeadSourceType
} from "@/features/leads/leadTypes";
import { db } from "@/services/firebase/db";
import { ref as dbRef, get, set, update, remove } from "firebase/database";

/**
 * Extract UTM campaign parameters from current URL query string.
 */
export function extractCampaignParams(): LeadSubmissionPayload["campaign"] {
  if (typeof window === "undefined" || !window.location.search) {
    return undefined;
  }

  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source") || undefined;
  const medium = params.get("utm_medium") || undefined;
  const campaign = params.get("utm_campaign") || undefined;
  const content = params.get("utm_content") || undefined;
  const term = params.get("utm_term") || undefined;

  if (!source && !medium && !campaign && !content && !term) {
    return undefined;
  }

  return { source, medium, campaign, content, term };
}

/**
 * Get client technical context safely without invasive fingerprinting.
 */
function getClientTechnicalContext() {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    userAgent: navigator?.userAgent,
    locale: navigator?.language,
    timezone: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone,
    referrer: document.referrer || undefined
  };
}

/**
 * Compute deterministic triage & executive summary when server or AI is offline.
 */
function computeClientLeadTriage(payload: LeadSubmissionPayload) {
  if (payload.submissionType === "newsletter") {
    return {
      summary: `Newsletter subscription for ${payload.email}.`,
      businessContext: `Subscribed to weekly insights from ${payload.sourcePageTitle || "website"}.`,
      identifiedNeeds: ["Weekly insights on marketing, AI, data, and strategy"],
      identifiedBlockers: [],
      recommendedService: "Insights & Strategy Advisory",
      recommendedNextStep: "Send welcome overview and add to newsletter list.",
      leadPriority: "medium" as LeadPriority,
      qualificationReason: "Direct newsletter opt-in."
    };
  }

  const needs: string[] = [];
  const blockers: string[] = [];
  let detectedPriority: LeadPriority = "medium";
  let qualificationReason = "Deterministic baseline triage based on submitted responses.";

  for (const item of payload.answers || []) {
    const qLower = (item.question || "").toLowerCase();
    const aText = (item.answer || "").trim();

    if (qLower.includes("block") || qLower.includes("challenge") || qLower.includes("obstacle")) {
      blockers.push(aText);
    } else if (
      qLower.includes("where should") ||
      qLower.includes("value first") ||
      qLower.includes("support") ||
      qLower.includes("outcome") ||
      qLower.includes("help with")
    ) {
      needs.push(aText);
    }

    if (qLower.includes("urgency") || qLower.includes("urgent") || qLower.includes("timeline")) {
      const aLower = aText.toLowerCase();
      if (aLower.includes("start now") || aLower.includes("urgent") || aLower.includes("immediate")) {
        detectedPriority = "urgent";
        qualificationReason = "Lead indicated immediate readiness to start in questionnaire.";
      } else if (aLower.includes("active work") || aLower.includes("planning") || aLower.includes("soon")) {
        detectedPriority = "high";
        qualificationReason = "Lead stated active planning or near-term requirements.";
      } else if (aLower.includes("exploring") || aLower.includes("later")) {
        detectedPriority = "low";
        qualificationReason = "Lead stated early exploratory status.";
      }
    }
  }

  let recommendedService = "AI Transformation";
  if (payload.submissionType === "data-activation" || payload.primaryInterest?.includes("Data")) {
    recommendedService = "Data Activation & Intelligence";
  } else if (payload.submissionType === "modern-marketing-growth" || payload.primaryInterest?.includes("Marketing")) {
    recommendedService = "Modern Marketing & Growth";
  } else if (payload.submissionType === "ai-maturity-capability" || payload.primaryInterest?.includes("Maturity")) {
    recommendedService = "AI Maturity & Capability Building";
  } else if (payload.primaryInterest) {
    recommendedService = payload.primaryInterest;
  }

  const businessContext = payload.company 
    ? `${payload.name} representing ${payload.company}${payload.jobTitle ? ` as ${payload.jobTitle}` : ""}.`
    : `${payload.name}${payload.jobTitle ? ` (${payload.jobTitle})` : ""}.`;

  const summary = `${businessContext} Submitted via ${payload.sourcePageTitle}. ${
    payload.answers && payload.answers.length > 0 
      ? `Provided ${payload.answers.length} diagnostic answers.` 
      : (payload.message ? `Provided enquiry message.` : "Submitted contact request.")
  }`;

  return {
    summary,
    businessContext,
    identifiedNeeds: needs.length > 0 ? needs : ["Explore consulting and strategic alignment"],
    identifiedBlockers: blockers.length > 0 ? blockers : ["None explicitly declared"],
    recommendedService,
    recommendedNextStep: "A focused initial consultation to discuss specific requirements and scope.",
    leadPriority: detectedPriority,
    qualificationReason
  };
}

/**
 * Direct fallback persistence to Firebase Realtime Database
 * (used on static hosting environments like Firebase Hosting where /api/* returns HTML index)
 */
async function saveLeadDirectlyToFirebase(
  payload: LeadSubmissionPayload & { technical?: any }
): Promise<LeadSubmissionResponse> {
  const leadId = `lead_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();
  const triage = computeClientLeadTriage(payload);

  const initialLead: LeadRecord = {
    id: leadId,
    submissionType: payload.submissionType,
    sourcePage: payload.sourcePage,
    sourcePageTitle: payload.sourcePageTitle,
    sourceUrl: payload.sourceUrl || (typeof window !== "undefined" ? window.location.href : ""),
    referrer: payload.referrer,
    name: payload.name,
    email: payload.email,
    company: payload.company,
    jobTitle: payload.jobTitle,
    phone: payload.phone,
    primaryInterest: payload.primaryInterest,
    message: payload.message,
    answers: payload.answers || [],
    aiSummary: triage.summary,
    businessContext: triage.businessContext,
    identifiedNeeds: triage.identifiedNeeds,
    identifiedBlockers: triage.identifiedBlockers,
    recommendedService: triage.recommendedService,
    recommendedNextStep: triage.recommendedNextStep,
    leadPriority: triage.leadPriority,
    qualificationReason: triage.qualificationReason,
    status: "new",
    isRead: false,
    emailDelivery: {
      status: "pending",
      attempts: 0
    },
    createdAt: now,
    updatedAt: now,
    consent: {
      contactConsent: payload.consent?.contactConsent !== false,
      privacyAccepted: payload.consent?.privacyAccepted !== false,
      acceptedAt: now
    },
    technical: payload.technical || {}
  };

  const cleanLead = JSON.parse(JSON.stringify(initialLead));
  await set(dbRef(db, `leads/${leadId}`), cleanLead);

  let successMessage = "Thank you for reaching out. Your message has been received.";
  if (payload.submissionType === "newsletter") {
    successMessage = "Thank you for subscribing to weekly insights.";
  } else if (payload.submissionType !== "reach-me") {
    successMessage = "Thank you. Your context has been received. I will review the information and follow up if a conversation would be useful.";
  }

  return {
    success: true,
    leadId,
    message: successMessage,
    emailDelivery: "pending"
  };
}

/**
 * Submit questionnaire enquiry to the secure server API or directly to Firebase.
 */
export async function submitQuestionnaireLead(
  payload: Omit<LeadSubmissionPayload, "sourceUrl" | "referrer" | "campaign">
): Promise<LeadSubmissionResponse> {
  // Silent bot trap
  if (payload._hp && String(payload._hp).trim().length > 0) {
    return {
      success: true,
      message: "Thank you. Your context has been received."
    };
  }

  const campaign = extractCampaignParams();
  const tech = getClientTechnicalContext();

  const fullPayload: LeadSubmissionPayload & { technical?: any } = {
    ...payload,
    sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    referrer: tech.referrer,
    campaign,
    technical: tech
  };

  // 1. Attempt API server route
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(fullPayload)
    });

    const contentType = response.headers.get("content-type") || "";

    // If server responded with JSON
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to submit questionnaire context. Please try again.",
          error: data.message || "Request failed"
        };
      }

      return {
        success: true,
        leadId: data.leadId,
        message: data.message || "Thank you. Your context has been received. I will review the information and follow up if a conversation would be useful.",
        emailDelivery: data.emailDelivery
      };
    }
  } catch (apiErr) {
    console.warn("[LeadApi] API endpoint unavailable, falling back to direct Firebase write:", apiErr);
  }

  // 2. Direct Firebase Realtime Database fallback (runs when on static Firebase Hosting)
  try {
    return await saveLeadDirectlyToFirebase(fullPayload);
  } catch (fbErr) {
    console.error("[LeadApi] Direct Firebase save error:", fbErr);
    return {
      success: false,
      message: "Network error saving submission. Please check your internet connection and try again.",
      error: fbErr instanceof Error ? fbErr.message : String(fbErr)
    };
  }
}

/**
 * Submit Reach Me form enquiry to the central secure server API or Firebase.
 */
export async function submitReachMeLead(
  payload: Omit<LeadSubmissionPayload, "submissionType" | "sourcePage" | "sourcePageTitle">
): Promise<LeadSubmissionResponse> {
  return submitQuestionnaireLead({
    ...payload,
    submissionType: "reach-me",
    sourcePage: "/reach-me",
    sourcePageTitle: "Reach Me"
  });
}

/**
 * Submit Newsletter subscription to the central secure server API or Firebase.
 */
export async function submitNewsletterLead(
  email: string,
  sourcePage?: string,
  sourcePageTitle?: string
): Promise<LeadSubmissionResponse> {
  return submitQuestionnaireLead({
    submissionType: "newsletter",
    sourcePage: sourcePage || (typeof window !== "undefined" ? window.location.pathname : "/"),
    sourcePageTitle: sourcePageTitle || "Weekly Insights Newsletter",
    name: "Newsletter Subscriber",
    email: email.trim().toLowerCase(),
    primaryInterest: "Weekly Insights Newsletter",
    message: "Subscribed to weekly insights on marketing, AI, data, and strategy.",
    answers: [],
    consent: {
      contactConsent: true,
      privacyAccepted: true
    }
  });
}

// ─── ADMIN API FUNCTIONS (With Native Firebase Realtime Database Fallback) ───

export interface AdminLeadFilterParams {
  status?: LeadStatus;
  submissionType?: LeadSourceType;
  priority?: LeadPriority;
  deliveryStatus?: DeliveryStatus;
  unreadOnly?: boolean;
  search?: string;
}

export async function fetchAdminLeads(
  idToken: string,
  filters: AdminLeadFilterParams = {}
): Promise<{ leads: LeadRecord[]; totalCount: number }> {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.submissionType) query.set("submissionType", filters.submissionType);
  if (filters.priority) query.set("priority", filters.priority);
  if (filters.deliveryStatus) query.set("deliveryStatus", filters.deliveryStatus);
  if (filters.unreadOnly) query.set("unreadOnly", "true");
  if (filters.search) query.set("search", filters.search);

  // 1. Try Express API route
  try {
    const res = await fetch(`/api/admin/leads?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back to direct Firebase query
  }

  // 2. Direct Firebase RTDB query (for Firebase Hosting static SPA)
  const snap = await get(dbRef(db, "leads"));
  if (!snap.exists()) {
    return { leads: [], totalCount: 0 };
  }

  let allLeads: LeadRecord[] = Object.values(snap.val() as Record<string, LeadRecord>);
  allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters.status) {
    allLeads = allLeads.filter(l => l.status === filters.status);
  }
  if (filters.submissionType) {
    allLeads = allLeads.filter(l => l.submissionType === filters.submissionType);
  }
  if (filters.priority) {
    allLeads = allLeads.filter(l => l.leadPriority === filters.priority);
  }
  if (filters.deliveryStatus) {
    allLeads = allLeads.filter(l => l.emailDelivery?.status === filters.deliveryStatus);
  }
  if (filters.unreadOnly) {
    allLeads = allLeads.filter(l => !l.isRead);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    allLeads = allLeads.filter(l => {
      const matchName = l.name?.toLowerCase().includes(q);
      const matchEmail = l.email?.toLowerCase().includes(q);
      const matchCompany = l.company?.toLowerCase().includes(q) || false;
      const matchMessage = l.message?.toLowerCase().includes(q) || false;
      const matchAnswers = l.answers?.some(a =>
        a.question?.toLowerCase().includes(q) || a.answer?.toLowerCase().includes(q)
      ) || false;
      return matchName || matchEmail || matchCompany || matchMessage || matchAnswers;
    });
  }

  return { leads: allLeads, totalCount: allLeads.length };
}

export async function fetchAdminLeadStats(idToken: string): Promise<LeadOverviewStats> {
  // 1. Try Express API route
  try {
    const res = await fetch("/api/admin/leads-stats", {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back to direct Firebase calculation
  }

  // 2. Direct Firebase RTDB calculation
  const snap = await get(dbRef(db, "leads"));
  const leads: LeadRecord[] = snap.exists() ? Object.values(snap.val() as Record<string, LeadRecord>) : [];
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
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
}

export async function fetchAdminLeadDetail(idToken: string, id: string): Promise<LeadRecord> {
  // 1. Try Express API
  try {
    const res = await fetch(`/api/admin/leads/${id}`, {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back to direct Firebase
  }

  // 2. Direct Firebase query
  const snap = await get(dbRef(db, `leads/${id}`));
  if (!snap.exists()) {
    throw new Error("Lead not found.");
  }
  return snap.val() as LeadRecord;
}

export async function updateAdminLead(
  idToken: string,
  id: string,
  updates: Partial<Pick<LeadRecord, "status" | "leadPriority" | "adminNotes" | "tags" | "isRead">>
): Promise<{ success: boolean; lead: LeadRecord }> {
  // 1. Try Express API
  try {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify(updates)
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back to direct Firebase
  }

  // 2. Direct Firebase update
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  await update(dbRef(db, `leads/${id}`), cleanPayload);

  const updatedSnap = await get(dbRef(db, `leads/${id}`));
  return {
    success: true,
    lead: updatedSnap.val() as LeadRecord
  };
}

export async function retryAdminLeadEmail(
  idToken: string,
  id: string
): Promise<{ success: boolean; message: string; emailDelivery: DeliveryStatus }> {
  // 1. Try Express API
  try {
    const res = await fetch(`/api/admin/leads/${id}/retry-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back
  }

  // 2. Direct Firebase fallback
  const snap = await get(dbRef(db, `leads/${id}`));
  if (!snap.exists()) {
    return { success: false, message: "Lead not found.", emailDelivery: "failed" };
  }

  const currentAttempts = (snap.val().emailDelivery?.attempts || 0) + 1;
  await update(dbRef(db, `leads/${id}/emailDelivery`), {
    attempts: currentAttempts,
    status: "pending",
    error: "Email notification queued for delivery."
  });

  return {
    success: true,
    message: "Email delivery re-queued successfully.",
    emailDelivery: "pending"
  };
}

export async function regenerateAdminLeadSummary(
  idToken: string,
  id: string
): Promise<{ success: boolean; lead?: LeadRecord; message: string }> {
  // 1. Try Express API
  try {
    const res = await fetch(`/api/admin/leads/${id}/regenerate-summary`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back
  }

  // 2. Direct Firebase regeneration
  const snap = await get(dbRef(db, `leads/${id}`));
  if (!snap.exists()) {
    return { success: false, message: "Lead not found." };
  }

  const lead = snap.val() as LeadRecord;
  const triage = computeClientLeadTriage({
    submissionType: lead.submissionType,
    sourcePage: lead.sourcePage,
    sourcePageTitle: lead.sourcePageTitle,
    name: lead.name,
    email: lead.email,
    company: lead.company,
    jobTitle: lead.jobTitle,
    primaryInterest: lead.primaryInterest,
    message: lead.message,
    answers: lead.answers,
    consent: lead.consent
  });

  const updates = {
    aiSummary: triage.summary,
    businessContext: triage.businessContext,
    identifiedNeeds: triage.identifiedNeeds,
    identifiedBlockers: triage.identifiedBlockers,
    recommendedService: triage.recommendedService,
    recommendedNextStep: triage.recommendedNextStep,
    leadPriority: triage.leadPriority,
    qualificationReason: triage.qualificationReason,
    updatedAt: new Date().toISOString()
  };

  await update(dbRef(db, `leads/${id}`), updates);
  const updatedSnap = await get(dbRef(db, `leads/${id}`));

  return {
    success: true,
    lead: updatedSnap.val() as LeadRecord,
    message: "Summary refreshed successfully."
  };
}

export async function deleteAdminLead(
  idToken: string,
  id: string
): Promise<{ success: boolean; message: string }> {
  // 1. Try Express API
  try {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    });

    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {
    // Fall back
  }

  // 2. Direct Firebase removal
  await remove(dbRef(db, `leads/${id}`));
  return { success: true, message: "Lead permanently removed from Firebase." };
}
