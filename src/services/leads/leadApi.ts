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
 * Submit questionnaire enquiry to the central secure server API.
 */
export async function submitQuestionnaireLead(
  payload: Omit<LeadSubmissionPayload, "sourceUrl" | "referrer" | "campaign">
): Promise<LeadSubmissionResponse> {
  const campaign = extractCampaignParams();
  const tech = getClientTechnicalContext();

  const fullPayload: LeadSubmissionPayload & { technical?: any } = {
    ...payload,
    sourceUrl: typeof window !== "undefined" ? window.location.href : "",
    referrer: tech.referrer,
    campaign,
    technical: tech
  };

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(fullPayload)
    });

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
  } catch (err) {
    console.error("[LeadApi] Network error submitting questionnaire lead:", err);
    return {
      success: false,
      message: "Network connection error. Please check your internet connection and try again.",
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Submit Reach Me form enquiry to the central secure server API.
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

// ─── ADMIN API FUNCTIONS ────────────────────────────────────────────────────

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

  const res = await fetch(`/api/admin/leads?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leads (${res.status})`);
  }

  return res.json();
}

export async function fetchAdminLeadStats(idToken: string): Promise<LeadOverviewStats> {
  const res = await fetch("/api/admin/leads-stats", {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch lead stats (${res.status})`);
  }

  return res.json();
}

export async function fetchAdminLeadDetail(idToken: string, id: string): Promise<LeadRecord> {
  const res = await fetch(`/api/admin/leads/${id}`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch lead detail (${res.status})`);
  }

  return res.json();
}

export async function updateAdminLead(
  idToken: string,
  id: string,
  updates: Partial<Pick<LeadRecord, "status" | "leadPriority" | "adminNotes" | "tags" | "isRead">>
): Promise<{ success: boolean; lead: LeadRecord }> {
  const res = await fetch(`/api/admin/leads/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    throw new Error(`Failed to update lead (${res.status})`);
  }

  return res.json();
}

export async function retryAdminLeadEmail(
  idToken: string,
  id: string
): Promise<{ success: boolean; message: string; emailDelivery: DeliveryStatus }> {
  const res = await fetch(`/api/admin/leads/${id}/retry-email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to retry email delivery (${res.status})`);
  }

  return res.json();
}

export async function regenerateAdminLeadSummary(
  idToken: string,
  id: string
): Promise<{ success: boolean; lead?: LeadRecord; message: string }> {
  const res = await fetch(`/api/admin/leads/${id}/regenerate-summary`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to regenerate summary (${res.status})`);
  }

  return res.json();
}

export async function deleteAdminLead(
  idToken: string,
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/leads/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to delete lead (${res.status})`);
  }

  return res.json();
}
