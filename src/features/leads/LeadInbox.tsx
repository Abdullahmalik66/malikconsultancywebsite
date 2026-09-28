import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/providers/AuthContext";
import {
  LeadRecord,
  LeadOverviewStats,
  LeadStatus,
  LeadPriority,
  DeliveryStatus,
  LeadSourceType
} from "./leadTypes";
import {
  fetchAdminLeads,
  fetchAdminLeadStats,
  updateAdminLead,
  retryAdminLeadEmail,
  regenerateAdminLeadSummary,
  deleteAdminLead
} from "@/services/leads/leadApi";
import { LeadOverview } from "./LeadOverview";
import { LeadFilters } from "./LeadFilters";
import { LeadTable } from "./LeadTable";
import { LeadDetail } from "./LeadDetail";
import { exportLeadsToCSV } from "./leadUtils";
import {
  Inbox,
  Filter,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  MessageSquare,
  TrendingUp,
  Archive,
  Mail,
  Download
} from "lucide-react";

type SubTab = "all" | "questionnaires" | "reach-me" | "newsletter" | "follow-up" | "archived";

export const LeadInbox: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<SubTab>("all");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [stats, setStats] = useState<LeadOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Selected Lead for Detail Drawer
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();

      // Determine filters based on activeTab
      let tabSubmissionType = sourceFilter || undefined;
      let tabStatus = statusFilter || undefined;

      if (activeTab === "reach-me") {
        tabSubmissionType = "reach-me";
      } else if (activeTab === "newsletter") {
        tabSubmissionType = "newsletter";
      } else if (activeTab === "questionnaires") {
        // Exclude reach-me handled below
      } else if (activeTab === "follow-up") {
        tabStatus = "follow-up";
      } else if (activeTab === "archived") {
        tabStatus = "archived";
      }

      const [leadsRes, statsRes] = await Promise.all([
        fetchAdminLeads(token, {
          search: search || undefined,
          status: tabStatus as LeadStatus,
          submissionType: tabSubmissionType as LeadSourceType,
          priority: (priorityFilter as LeadPriority) || undefined,
          deliveryStatus: (deliveryFilter as DeliveryStatus) || undefined,
          unreadOnly: unreadOnly || undefined
        }),
        fetchAdminLeadStats(token)
      ]);

      let resultLeads = leadsRes.leads;

      // Filter questionnaires tab
      if (activeTab === "questionnaires") {
        resultLeads = resultLeads.filter(l => l.submissionType !== "reach-me" && l.submissionType !== "newsletter");
      } else if (activeTab === "newsletter") {
        resultLeads = resultLeads.filter(l => l.submissionType === "newsletter");
      } else if (activeTab === "all" && !statusFilter) {
        // Exclude archived by default on "all" unless requested
        resultLeads = resultLeads.filter(l => l.status !== "archived");
      }

      setLeads(resultLeads);
      setStats(statsRes);

      // Check if lead ID in URL
      const leadIdFromUrl = searchParams.get("lead");
      if (leadIdFromUrl) {
        const found = resultLeads.find(l => l.id === leadIdFromUrl);
        if (found) {
          setSelectedLead(found);
        }
      }
    } catch (err) {
      console.error("[LeadInbox] Error loading leads data:", err);
      setError(err instanceof Error ? err.message : "Failed to load leads data.");
    } finally {
      setLoading(false);
    }
  }, [
    currentUser,
    activeTab,
    search,
    statusFilter,
    sourceFilter,
    priorityFilter,
    deliveryFilter,
    unreadOnly,
    searchParams
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectLead = async (lead: LeadRecord) => {
    setSelectedLead(lead);

    // If unread, mark as read automatically
    if (!lead.isRead && currentUser) {
      try {
        const token = await currentUser.getIdToken();
        await updateAdminLead(token, lead.id, { isRead: true });
        setLeads(prev =>
          prev.map(l => (l.id === lead.id ? { ...l, isRead: true } : l))
        );
        setStats(prev => prev ? { ...prev, unreadLeads: Math.max(0, prev.unreadLeads - 1) } : null);
      } catch (err) {
        console.warn("[LeadInbox] Failed to mark read:", err);
      }
    }
  };

  const handleUpdateLead = async (id: string, updates: Partial<LeadRecord>) => {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    const res = await updateAdminLead(token, id, updates as any);
    if (res.success && res.lead) {
      setLeads(prev => prev.map(l => (l.id === id ? res.lead : l)));
      if (selectedLead?.id === id) {
        setSelectedLead(res.lead);
      }
      loadData();
    }
  };

  const handleRetryEmail = async (id: string) => {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    const res = await retryAdminLeadEmail(token, id);
    if (res.success) {
      loadData();
    }
  };

  const handleRegenerateSummary = async (id: string) => {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    const res = await regenerateAdminLeadSummary(token, id);
    if (res.success && res.lead) {
      setLeads(prev => prev.map(l => (l.id === id ? res.lead! : l)));
      if (selectedLead?.id === id) {
        setSelectedLead(res.lead);
      }
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!currentUser) return;
    const token = await currentUser.getIdToken();
    await deleteAdminLead(token, id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
    loadData();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSourceFilter("");
    setPriorityFilter("");
    setDeliveryFilter("");
    setUnreadOnly(false);
  };

  const hasActiveFilters = Boolean(
    search || statusFilter || sourceFilter || priorityFilter || deliveryFilter || unreadOnly
  );

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-m3-on-surface tracking-tight">
            Consultancy Lead Inbox
          </h2>
          <p className="text-xs text-m3-on-surface/60 font-sans mt-0.5">
            Realtime lead capture, AI qualification triage, and contact follow-up management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => exportLeadsToCSV(leads)}
            disabled={leads.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-m3-outline/20 hover:border-m3-primary hover:text-m3-primary bg-white dark:bg-[#25232a] text-xs font-mono uppercase tracking-wider text-m3-on-surface transition-all cursor-pointer disabled:opacity-40"
            title="Download CSV export of leads"
          >
            <Download className="w-3.5 h-3.5 text-m3-primary" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-m3-outline/15 hover:bg-m3-surface-container text-xs font-mono uppercase tracking-wider text-m3-on-surface transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Leads</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="text-rose-700 dark:text-rose-300 font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview Analytics Dashboard */}
      <LeadOverview
        stats={stats}
        loading={loading}
        onSelectLead={handleSelectLead}
        onViewAllLeads={() => {
          setActiveTab("all");
          handleResetFilters();
        }}
      />

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-m3-outline/10 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "all"
              ? "bg-m3-surface-container-high text-m3-on-surface shadow-xs border border-m3-outline/10"
              : "text-m3-on-surface/50 hover:bg-m3-surface-container"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>All Leads ({stats?.totalLeads || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("questionnaires")}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "questionnaires"
              ? "bg-m3-surface-container-high text-m3-on-surface shadow-xs border border-m3-outline/10"
              : "text-m3-on-surface/50 hover:bg-m3-surface-container"
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>Questionnaires</span>
        </button>

        <button
          onClick={() => setActiveTab("reach-me")}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "reach-me"
              ? "bg-m3-surface-container-high text-m3-on-surface shadow-xs border border-m3-outline/10"
              : "text-m3-on-surface/50 hover:bg-m3-surface-container"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reach Me</span>
        </button>

        <button
          onClick={() => setActiveTab("newsletter")}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "newsletter"
              ? "bg-m3-surface-container-high text-m3-on-surface shadow-xs border border-m3-outline/10"
              : "text-m3-on-surface/50 hover:bg-m3-surface-container"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Newsletter ({stats?.bySource?.newsletter || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("follow-up")}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "follow-up"
              ? "bg-m3-surface-container-high text-m3-on-surface shadow-xs border border-m3-outline/10"
              : "text-m3-on-surface/50 hover:bg-m3-surface-container"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Follow-ups ({stats?.followUpLeads || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("archived")}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "archived"
              ? "bg-m3-surface-container-high text-m3-on-surface shadow-xs border border-m3-outline/10"
              : "text-m3-on-surface/50 hover:bg-m3-surface-container"
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived</span>
        </button>
      </div>

      {/* Filter Controls */}
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        submissionType={sourceFilter}
        onSubmissionTypeChange={setSourceFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        deliveryStatus={deliveryFilter}
        onDeliveryStatusChange={setDeliveryFilter}
        unreadOnly={unreadOnly}
        onUnreadOnlyToggle={() => setUnreadOnly(!unreadOnly)}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        onExportCSV={() => exportLeadsToCSV(leads)}
      />

      {/* Leads Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        onSelectLead={handleSelectLead}
        selectedLeadId={selectedLead?.id}
      />

      {/* Detail Drawer Modal */}
      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onRetryEmail={handleRetryEmail}
          onRegenerateSummary={handleRegenerateSummary}
          onDeleteLead={handleDeleteLead}
        />
      )}
    </div>
  );
};
