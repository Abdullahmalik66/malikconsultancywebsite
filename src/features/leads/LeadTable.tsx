import React, { useState } from "react";
import {
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { LeadRecord, LeadPriority, LeadStatus } from "./leadTypes";
import {
  formatSourceLabel,
  formatStatusLabel,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
  getDeliveryBadgeClasses,
  formatDateShort,
  formatDateTime
} from "./leadUtils";

interface LeadTableProps {
  leads: LeadRecord[];
  loading: boolean;
  onSelectLead: (lead: LeadRecord) => void;
  selectedLeadId?: string;
}

type SortField = "createdAt" | "name" | "company" | "status" | "leadPriority";
type SortDirection = "asc" | "desc";

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  loading,
  onSelectLead,
  selectedLeadId
}) => {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const priorityWeights: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;
    if (sortField === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "company") {
      comparison = (a.company || "").localeCompare(b.company || "");
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === "leadPriority") {
      const wA = priorityWeights[a.leadPriority || "medium"] || 2;
      const wB = priorityWeights[b.leadPriority || "medium"] || 2;
      comparison = wA - wB;
    }
    return sortDir === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedLeads.length / pageSize) || 1;
  const paginatedLeads = sortedLeads.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-8 rounded-[28px] text-center space-y-4">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-m3-primary/20 border-t-m3-primary rounded-full" />
        <p className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/50">
          Loading leads database...
        </p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-12 rounded-[28px] text-center space-y-3">
        <Mail className="w-10 h-10 text-m3-on-surface/30 mx-auto" />
        <h4 className="text-base font-display font-semibold text-m3-on-surface">No enquiries found</h4>
        <p className="text-xs text-m3-on-surface/60 max-w-sm mx-auto">
          No leads match your current search filters or none have been submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 rounded-[28px] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-m3-outline/10 bg-m3-surface/40 dark:bg-m3-surface/5 text-[11px] font-mono uppercase tracking-wider text-m3-on-surface/60 select-none">
              <th className="py-3.5 pl-6 pr-2 w-10"></th>
              <th
                onClick={() => handleSort("createdAt")}
                className="py-3.5 px-3 cursor-pointer hover:text-m3-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Received</span>
                  {sortField === "createdAt" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort("name")}
                className="py-3.5 px-4 cursor-pointer hover:text-m3-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Contact</span>
                  {sortField === "name" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort("company")}
                className="py-3.5 px-4 cursor-pointer hover:text-m3-primary transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Company / Role</span>
                  {sortField === "company" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Source</th>
              <th
                onClick={() => handleSort("leadPriority")}
                className="py-3.5 px-3 cursor-pointer hover:text-m3-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  {sortField === "leadPriority" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="py-3.5 px-3 cursor-pointer hover:text-m3-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {sortField === "status" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3.5 px-3 hidden sm:table-cell">Email Delivery</th>
              <th className="py-3.5 pr-6 pl-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-m3-outline/5 text-xs font-sans">
            {paginatedLeads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`hover:bg-m3-primary/5 transition-colors cursor-pointer ${
                    isSelected ? "bg-m3-primary/10" : !lead.isRead ? "bg-m3-primary/3 font-medium" : ""
                  }`}
                >
                  {/* Read state dot */}
                  <td className="py-4 pl-6 pr-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        !lead.isRead
                          ? "bg-m3-primary animate-pulse"
                          : "bg-transparent"
                      }`}
                      title={lead.isRead ? "Read" : "Unread"}
                    />
                  </td>

                  {/* Date */}
                  <td className="py-4 px-3 font-mono text-[11px] text-m3-on-surface/70 whitespace-nowrap">
                    {formatDateShort(lead.createdAt)}
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 min-w-[140px]">
                    <div className="font-semibold text-m3-on-surface">{lead.name}</div>
                    <div className="text-[11px] text-m3-on-surface/60 font-mono truncate max-w-[180px]">
                      {lead.email}
                    </div>
                  </td>

                  {/* Company & Role */}
                  <td className="py-4 px-4 hidden md:table-cell max-w-[160px]">
                    <div className="text-m3-on-surface truncate font-medium">
                      {lead.company || "—"}
                    </div>
                    {lead.jobTitle && (
                      <div className="text-[11px] text-m3-on-surface/50 truncate font-mono">
                        {lead.jobTitle}
                      </div>
                    )}
                  </td>

                  {/* Origin Source */}
                  <td className="py-4 px-4 hidden lg:table-cell whitespace-nowrap">
                    <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-m3-surface/60 border border-m3-outline/10 text-m3-on-surface/80">
                      {formatSourceLabel(lead.submissionType)}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeClasses(
                        lead.leadPriority
                      )}`}
                    >
                      {lead.leadPriority || "med"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadgeClasses(
                        lead.status
                      )}`}
                    >
                      {formatStatusLabel(lead.status)}
                    </span>
                  </td>

                  {/* Email Delivery */}
                  <td className="py-4 px-3 hidden sm:table-cell whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDeliveryBadgeClasses(
                        lead.emailDelivery?.status || "pending"
                      )}`}
                    >
                      {lead.emailDelivery?.status === "sent" ? "Delivered" : (lead.emailDelivery?.status || "Pending")}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 pr-6 pl-2 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-mono uppercase text-m3-primary hover:underline px-2.5 py-1 rounded-full hover:bg-m3-primary/10 transition-all cursor-pointer"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-m3-outline/10 bg-m3-surface/20 text-xs font-mono">
          <span className="text-m3-on-surface/60">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-m3-outline/15 disabled:opacity-40 hover:bg-m3-surface-container transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-m3-on-surface">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border border-m3-outline/15 disabled:opacity-40 hover:bg-m3-surface-container transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
