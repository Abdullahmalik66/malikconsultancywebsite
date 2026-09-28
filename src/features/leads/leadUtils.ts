import {
  LeadSourceType,
  LeadStatus,
  LeadPriority,
  DeliveryStatus,
  LeadRecord
} from "./leadTypes";

export function formatSourceLabel(source: LeadSourceType): string {
  switch (source) {
    case "newsletter":
      return "Subscription";
    case "reach-me":
      return "Reach Me";
    case "ai-transformation":
      return "AI Transformation";
    case "data-activation":
      return "Data Activation";
    case "modern-marketing-growth":
      return "Growth Systems";
    case "ai-maturity-capability":
      return "AI Maturity";
    default:
      return source;
  }
}

export function getSourceBadgeClasses(source: LeadSourceType): string {
  switch (source) {
    case "newsletter":
      return "bg-[#6d55a7]/10 text-[#6d55a7] dark:bg-[#6d55a7]/25 dark:text-[#E8DEF8] border-[#6d55a7]/30 font-semibold";
    case "reach-me":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    case "ai-transformation":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "data-activation":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "modern-marketing-growth":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "ai-maturity-capability":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    default:
      return "bg-m3-surface/60 border-m3-outline/10 text-m3-on-surface/80";
  }
}

export function formatStatusLabel(status: LeadStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "reviewing":
      return "Reviewing";
    case "qualified":
      return "Qualified";
    case "follow-up":
      return "Follow-up";
    case "proposal":
      return "Proposal";
    case "won":
      return "Won";
    case "not-a-fit":
      return "Not a Fit";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export function getStatusBadgeClasses(status: LeadStatus): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "reviewing":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "qualified":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "follow-up":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "proposal":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    case "won":
      return "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-200 border-green-300 dark:border-green-700 font-bold";
    case "not-a-fit":
      return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700";
    case "archived":
      return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function getPriorityBadgeClasses(priority?: LeadPriority): string {
  switch (priority) {
    case "urgent":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    case "medium":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "low":
    default:
      return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700";
  }
}

export function getDeliveryBadgeClasses(status: DeliveryStatus): string {
  switch (status) {
    case "sent":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "failed":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold animate-pulse";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "not-required":
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short"
    }).format(date);
  } catch (e) {
    return isoString;
  }
}

/**
 * Generates and triggers download of a CSV file containing lead records.
 * Includes UTF-8 BOM so Excel and Numbers correctly decode accents and formatting.
 */
export function exportLeadsToCSV(leads: LeadRecord[], filenamePrefix = "malik_consultancy_leads"): void {
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
    escapeCSV(formatSourceLabel(l.submissionType)),
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
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
