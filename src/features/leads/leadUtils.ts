import {
  LeadSourceType,
  LeadStatus,
  LeadPriority,
  DeliveryStatus
} from "./leadTypes";

export function formatSourceLabel(source: LeadSourceType): string {
  switch (source) {
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
