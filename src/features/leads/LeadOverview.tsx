import React from "react";
import {
  Inbox,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Mail,
  TrendingUp,
  Layers,
  ArrowRight
} from "lucide-react";
import { LeadOverviewStats, LeadRecord } from "./leadTypes";
import { formatSourceLabel, getPriorityBadgeClasses, getStatusBadgeClasses, formatDateShort } from "./leadUtils";

interface LeadOverviewProps {
  stats: LeadOverviewStats | null;
  loading: boolean;
  onSelectLead: (lead: LeadRecord) => void;
  onViewAllLeads: () => void;
}

export const LeadOverview: React.FC<LeadOverviewProps> = ({
  stats,
  loading,
  onSelectLead,
  onViewAllLeads
}) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-white/60 dark:bg-[#1d1b20]/60 rounded-2xl border border-m3-outline/10 p-4" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Leads",
      value: stats.totalLeads,
      icon: Inbox,
      color: "text-m3-primary bg-m3-primary/10"
    },
    {
      label: "Unread",
      value: stats.unreadLeads,
      icon: Mail,
      color: stats.unreadLeads > 0 ? "text-amber-600 bg-amber-500/10 font-bold" : "text-m3-on-surface/60 bg-m3-surface/30"
    },
    {
      label: "New",
      value: stats.newLeads,
      icon: Clock,
      color: "text-blue-600 bg-blue-500/10"
    },
    {
      label: "Qualified",
      value: stats.qualifiedLeads,
      icon: Sparkles,
      color: "text-purple-600 bg-purple-500/10"
    },
    {
      label: "Follow-up",
      value: stats.followUpLeads,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-500/10"
    },
    {
      label: "Email Issues",
      value: stats.failedDeliveries,
      icon: AlertTriangle,
      color: stats.failedDeliveries > 0 ? "text-rose-600 bg-rose-500/10 font-bold animate-pulse" : "text-m3-on-surface/40 bg-m3-surface/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-4 rounded-2xl flex flex-col justify-between shadow-xs hover:border-m3-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-display font-semibold text-m3-on-surface">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown by Source & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Distribution */}
        <div className="lg:col-span-5 bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-6 rounded-[28px] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-m3-on-surface flex items-center gap-2">
              <Layers className="w-4 h-4 text-m3-primary" />
              Leads by Origin Source
            </h3>
            <span className="text-xs font-mono text-m3-on-surface/50">
              {stats.totalLeads} Total
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(stats.bySource) as Array<keyof typeof stats.bySource>).map(source => {
              const count = stats.bySource[source] || 0;
              const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;

              return (
                <div key={source} className="space-y-1">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="font-medium text-m3-on-surface">
                      {formatSourceLabel(source)}
                    </span>
                    <span className="font-mono text-m3-on-surface/60">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-m3-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-m3-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Enquiries Preview */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-[#1d1b20]/80 border border-m3-outline/10 p-6 rounded-[28px] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-m3-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-m3-primary" />
              Latest Inbound Submissions
            </h3>
            <button
              onClick={onViewAllLeads}
              className="text-xs font-mono uppercase tracking-wider text-m3-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              View table <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {stats.recentLeads.length === 0 ? (
              <div className="text-center py-8 text-xs text-m3-on-surface/50 font-mono">
                No leads recorded yet.
              </div>
            ) : (
              stats.recentLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    !lead.isRead
                      ? "bg-m3-primary/5 border-m3-primary/20 hover:border-m3-primary/50"
                      : "bg-m3-surface/30 dark:bg-m3-surface/5 border-m3-outline/10 hover:border-m3-outline/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${!lead.isRead ? "bg-m3-primary animate-pulse" : "bg-transparent"}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-m3-on-surface truncate">
                        {lead.name} {lead.company ? <span className="text-xs font-normal text-m3-on-surface/60">({lead.company})</span> : null}
                      </div>
                      <div className="text-xs text-m3-on-surface/60 truncate flex items-center gap-2 font-mono">
                        <span>{formatSourceLabel(lead.submissionType)}</span>
                        <span>&bull;</span>
                        <span>{formatDateShort(lead.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getPriorityBadgeClasses(lead.leadPriority)}`}>
                      {lead.leadPriority || "med"}
                    </span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${getStatusBadgeClasses(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
