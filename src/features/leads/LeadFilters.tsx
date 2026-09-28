import React from "react";
import { Search, Filter, X, RotateCcw } from "lucide-react";
import { LeadSourceType, LeadStatus, LeadPriority, DeliveryStatus } from "./leadTypes";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  submissionType: string;
  onSubmissionTypeChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  deliveryStatus: string;
  onDeliveryStatusChange: (val: string) => void;
  unreadOnly: boolean;
  onUnreadOnlyToggle: () => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  submissionType,
  onSubmissionTypeChange,
  priority,
  onPriorityChange,
  deliveryStatus,
  onDeliveryStatusChange,
  unreadOnly,
  onUnreadOnlyToggle,
  onReset,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-4 md:p-5 rounded-[24px] shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-m3-on-surface/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads by name, email, company, question answers..."
            className="w-full pl-10 pr-9 py-2.5 rounded-full border border-m3-outline/15 bg-m3-surface/30 dark:bg-m3-surface/10 text-xs font-sans text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-on-surface/40 hover:text-m3-on-surface cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Unread Only Pill Button */}
        <button
          onClick={onUnreadOnlyToggle}
          className={`px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer border flex items-center justify-center gap-2 ${
            unreadOnly
              ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700"
              : "bg-m3-surface/30 dark:bg-m3-surface/10 text-m3-on-surface/60 border-m3-outline/10 hover:border-m3-outline/30"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${unreadOnly ? "bg-amber-600 animate-pulse" : "bg-neutral-400"}`} />
          Unread Only
        </button>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-m3-error hover:bg-m3-error/5 transition-all cursor-pointer border border-m3-error/20 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Select Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-m3-outline/5">
        {/* Source Filter */}
        <select
          value={submissionType}
          onChange={(e) => onSubmissionTypeChange(e.target.value)}
          aria-label="Filter by Source"
          className="w-full px-3 py-2 rounded-xl border border-m3-outline/15 bg-m3-surface/30 dark:bg-[#25232a] text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all cursor-pointer"
        >
          <option value="">All Sources</option>
          <option value="reach-me">Reach Me</option>
          <option value="ai-transformation">AI Transformation</option>
          <option value="data-activation">Data Activation</option>
          <option value="modern-marketing-growth">Growth Systems</option>
          <option value="ai-maturity-capability">AI Maturity</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by Status"
          className="w-full px-3 py-2 rounded-xl border border-m3-outline/15 bg-m3-surface/30 dark:bg-[#25232a] text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="qualified">Qualified</option>
          <option value="follow-up">Follow-up</option>
          <option value="proposal">Proposal</option>
          <option value="won">Won</option>
          <option value="not-a-fit">Not a fit</option>
          <option value="archived">Archived</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          aria-label="Filter by Priority"
          className="w-full px-3 py-2 rounded-xl border border-m3-outline/15 bg-m3-surface/30 dark:bg-[#25232a] text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Email Delivery Filter */}
        <select
          value={deliveryStatus}
          onChange={(e) => onDeliveryStatusChange(e.target.value)}
          aria-label="Filter by Email Delivery Status"
          className="w-full px-3 py-2 rounded-xl border border-m3-outline/15 bg-m3-surface/30 dark:bg-[#25232a] text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all cursor-pointer"
        >
          <option value="">All Deliveries</option>
          <option value="sent">Email Sent</option>
          <option value="failed">Email Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
};
