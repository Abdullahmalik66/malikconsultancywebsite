import React, { useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  RotateCcw,
  Trash2,
  Archive,
  Clock,
  User,
  Building,
  Briefcase,
  Phone,
  HelpCircle,
  FileText,
  Tag,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from "lucide-react";
import {
  LeadRecord,
  LeadStatus,
  LeadPriority,
  DeliveryStatus
} from "./leadTypes";
import {
  formatSourceLabel,
  formatStatusLabel,
  getStatusBadgeClasses,
  getPriorityBadgeClasses,
  getDeliveryBadgeClasses,
  formatDateTime
} from "./leadUtils";

interface LeadDetailProps {
  lead: LeadRecord;
  onClose: () => void;
  onUpdateLead: (id: string, updates: Partial<LeadRecord>) => Promise<void>;
  onRetryEmail: (id: string) => Promise<void>;
  onRegenerateSummary: (id: string) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  isActionLoading?: boolean;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onRetryEmail,
  onRegenerateSummary,
  onDeleteLead,
  isActionLoading = false
}) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(lead.adminNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryingEmail, setRetryingEmail] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(lead.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    await onUpdateLead(lead.id, { status: newStatus });
  };

  const handlePriorityChange = async (newPriority: LeadPriority) => {
    await onUpdateLead(lead.id, { leadPriority: newPriority });
  };

  const handleToggleRead = async () => {
    await onUpdateLead(lead.id, { isRead: !lead.isRead });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onUpdateLead(lead.id, { adminNotes: notes });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (!cleanTag) return;

    const currentTags = lead.tags || [];
    if (!currentTags.includes(cleanTag)) {
      const nextTags = [...currentTags, cleanTag];
      await onUpdateLead(lead.id, { tags: nextTags });
    }
    setTagInput("");
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const nextTags = (lead.tags || []).filter(t => t !== tagToRemove);
    await onUpdateLead(lead.id, { tags: nextTags });
  };

  const handleRetryEmailClick = async () => {
    setRetryingEmail(true);
    try {
      await onRetryEmail(lead.id);
    } finally {
      setRetryingEmail(false);
    }
  };

  const handleRegenerateClick = async () => {
    setRegenerating(true);
    try {
      await onRegenerateSummary(lead.id);
    } finally {
      setRegenerating(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteLead(lead.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-2xl bg-white dark:bg-[#1d1b20] h-full shadow-2xl flex flex-col border-l border-m3-outline/10 text-m3-on-surface font-sans overflow-hidden"
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-m3-outline/10 bg-m3-surface/30 dark:bg-m3-surface/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                !lead.isRead ? "bg-m3-primary animate-pulse" : "bg-neutral-300"
              }`}
            />
            <div className="min-w-0">
              <h2 className="text-lg font-display font-semibold text-m3-on-surface truncate">
                {lead.name}
              </h2>
              <div className="text-xs font-mono text-m3-on-surface/60 flex items-center gap-2">
                <span>{formatSourceLabel(lead.submissionType)}</span>
                <span>&bull;</span>
                <span>ID: {lead.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRead}
              className="px-3 py-1.5 rounded-full border border-m3-outline/15 text-xs font-mono uppercase hover:bg-m3-surface-container transition-all cursor-pointer"
            >
              {lead.isRead ? "Mark Unread" : "Mark Read"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-m3-surface-container text-m3-on-surface/60 hover:text-m3-on-surface transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions & Triage Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-m3-surface/30 dark:bg-m3-surface/5 border border-m3-outline/10">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold block mb-1.5">
                Lead Status
              </label>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                aria-label="Update Lead Status"
                className="w-full px-3 py-2 rounded-xl border border-m3-outline/15 bg-white dark:bg-[#25232a] text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all cursor-pointer"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="qualified">Qualified</option>
                <option value="follow-up">Follow-up</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="not-a-fit">Not a fit</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold block mb-1.5">
                Priority
              </label>
              <select
                value={lead.leadPriority || "medium"}
                onChange={(e) => handlePriorityChange(e.target.value as LeadPriority)}
                aria-label="Update Lead Priority"
                className="w-full px-3 py-2 rounded-xl border border-m3-outline/15 bg-white dark:bg-[#25232a] text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all cursor-pointer"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-5 rounded-[24px] border border-m3-outline/10 bg-white dark:bg-[#25232a] shadow-xs space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-m3-primary" />
              Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-[10px] font-mono text-m3-on-surface/50 block">Name</span>
                <span className="font-semibold text-m3-on-surface text-sm">{lead.name}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-m3-on-surface/50 block">Email Address</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-m3-primary font-medium">{lead.email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 hover:bg-m3-surface-container rounded-md text-m3-on-surface/60 hover:text-m3-on-surface cursor-pointer"
                    title="Copy Email"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={`mailto:${lead.email}`}
                    className="p-1 hover:bg-m3-surface-container rounded-md text-m3-on-surface/60 hover:text-m3-on-surface"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-m3-on-surface/50 block">Company</span>
                <span className="text-m3-on-surface">{lead.company || "Not provided"}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-m3-on-surface/50 block">Role / Job Title</span>
                <span className="text-m3-on-surface">{lead.jobTitle || "Not provided"}</span>
              </div>

              {lead.phone && (
                <div>
                  <span className="text-[10px] font-mono text-m3-on-surface/50 block">Phone</span>
                  <span className="text-m3-on-surface font-mono">{lead.phone}</span>
                </div>
              )}

              {lead.primaryInterest && (
                <div>
                  <span className="text-[10px] font-mono text-m3-on-surface/50 block">Primary Interest</span>
                  <span className="text-m3-on-surface font-medium">{lead.primaryInterest}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Executive Summary & Qualification */}
          <div className="p-5 rounded-[24px] border border-m3-primary/20 bg-gradient-to-br from-m3-primary/5 via-white to-purple-50/50 dark:from-m3-primary/10 dark:via-[#25232a] dark:to-[#1d1b20] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-m3-primary font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Triage & Executive Summary
              </h3>
              <button
                onClick={handleRegenerateClick}
                disabled={regenerating}
                className="inline-flex items-center gap-1 text-[11px] font-mono uppercase text-m3-primary hover:underline cursor-pointer disabled:opacity-50"
              >
                {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                <span>Regenerate</span>
              </button>
            </div>

            {lead.aiSummary ? (
              <p className="text-xs font-sans text-m3-on-surface leading-relaxed bg-white/70 dark:bg-black/20 p-3.5 rounded-xl border border-m3-outline/10">
                {lead.aiSummary}
              </p>
            ) : (
              <p className="text-xs text-m3-on-surface/60 italic font-sans">
                AI summary is currently not generated. Click Regenerate to process.
              </p>
            )}

            {lead.qualificationReason && (
              <div className="text-[11px] text-m3-on-surface/70 font-sans border-l-2 border-m3-primary/50 pl-3 py-0.5">
                <strong className="text-m3-on-surface">Triage Rationale: </strong>
                {lead.qualificationReason}
              </div>
            )}

            {/* Stated Needs & Blockers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {lead.identifiedNeeds && lead.identifiedNeeds.length > 0 && (
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Stated Needs
                  </span>
                  <ul className="text-xs text-m3-on-surface space-y-1 list-disc list-inside">
                    {lead.identifiedNeeds.map((need, idx) => (
                      <li key={idx} className="leading-snug">{need}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lead.identifiedBlockers && lead.identifiedBlockers.length > 0 && (
                <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-rose-800 dark:text-rose-300 block mb-1">
                    Stated Blockers
                  </span>
                  <ul className="text-xs text-m3-on-surface space-y-1 list-disc list-inside">
                    {lead.identifiedBlockers.map((blocker, idx) => (
                      <li key={idx} className="leading-snug">{blocker}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommended Service & Next Step */}
            {(lead.recommendedService || lead.recommendedNextStep) && (
              <div className="bg-white/80 dark:bg-[#1d1b20]/60 p-3.5 rounded-xl border border-m3-outline/10 text-xs space-y-1">
                {lead.recommendedService && (
                  <div>
                    <span className="font-semibold text-m3-on-surface">Recommended Service: </span>
                    <span className="text-m3-primary font-medium">{lead.recommendedService}</span>
                  </div>
                )}
                {lead.recommendedNextStep && (
                  <div>
                    <span className="font-semibold text-m3-on-surface">Suggested Next Step: </span>
                    <span className="text-m3-on-surface/80">{lead.recommendedNextStep}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Questionnaire Answers */}
          {lead.answers && lead.answers.length > 0 && (
            <div className="p-5 rounded-[24px] border border-m3-outline/10 bg-white dark:bg-[#25232a] shadow-xs space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-m3-primary" />
                Submitted Questions & Answers ({lead.answers.length})
              </h3>

              <div className="space-y-3">
                {lead.answers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-m3-surface/30 dark:bg-m3-surface/5 border border-m3-outline/5 space-y-1"
                  >
                    <div className="text-[11px] font-mono text-m3-on-surface/60">
                      Q{idx + 1}: {item.question}
                    </div>
                    <div className="text-xs font-semibold text-m3-on-surface bg-white dark:bg-[#1d1b20] px-3 py-1.5 rounded-lg border border-m3-outline/10 inline-block">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free-text Message */}
          {lead.message && (
            <div className="p-5 rounded-[24px] border border-m3-outline/10 bg-white dark:bg-[#25232a] shadow-xs space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-m3-primary" />
                Free-text Message
              </h3>
              <p className="text-xs text-m3-on-surface leading-relaxed whitespace-pre-wrap bg-m3-surface/20 p-3 rounded-xl border border-m3-outline/10">
                {lead.message}
              </p>
            </div>
          )}

          {/* Email Delivery Status Card */}
          <div className="p-5 rounded-[24px] border border-m3-outline/10 bg-white dark:bg-[#25232a] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-m3-primary" />
                Email Notification Status
              </h3>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDeliveryBadgeClasses(
                  lead.emailDelivery?.status || "pending"
                )}`}
              >
                {lead.emailDelivery?.status || "Pending"}
              </span>
            </div>

            <div className="text-xs text-m3-on-surface/70 space-y-1 font-mono">
              <div>Recipient: abdullahmalik66@gmail.com</div>
              <div>Delivery attempts: {lead.emailDelivery?.attempts || 0}</div>
              {lead.emailDelivery?.sentAt && (
                <div>Sent at: {formatDateTime(lead.emailDelivery.sentAt)}</div>
              )}
              {lead.emailDelivery?.error && (
                <div className="text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900 mt-2">
                  <strong>Delivery notice:</strong> {lead.emailDelivery.error}
                </div>
              )}
            </div>

            <button
              onClick={handleRetryEmailClick}
              disabled={retryingEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-m3-outline/15 hover:bg-m3-surface-container text-xs font-mono uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              {retryingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{lead.emailDelivery?.status === "sent" ? "Resend Notification Email" : "Retry Email Notification"}</span>
            </button>
          </div>

          {/* Internal Admin Notes */}
          <div className="p-5 rounded-[24px] border border-m3-outline/10 bg-white dark:bg-[#25232a] shadow-xs space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-m3-primary" />
              Internal Admin Notes
            </h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about conversations, deals, or follow-ups..."
              className="w-full p-3 rounded-xl border border-m3-outline/15 bg-m3-surface/30 dark:bg-black/20 text-xs font-sans text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes || notes === (lead.adminNotes || "")}
                className="px-4 py-1.5 rounded-full bg-m3-primary text-m3-on-primary text-xs font-mono uppercase font-semibold disabled:opacity-40 hover:bg-m3-primary/90 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="p-5 rounded-[24px] border border-m3-outline/10 bg-white dark:bg-[#25232a] shadow-xs space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-m3-on-surface/60 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-m3-primary" />
              Tags
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {(lead.tags || []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md bg-m3-surface/60 border border-m3-outline/10 text-xs font-mono flex items-center gap-1"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-m3-error cursor-pointer ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag (e.g. enterprise, high-urgency)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-m3-outline/15 bg-m3-surface/30 dark:bg-black/20 text-xs font-mono text-m3-on-surface focus:outline-none focus:border-m3-primary transition-all"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl border border-m3-outline/15 text-xs font-mono uppercase hover:bg-m3-surface-container cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Technical Metadata */}
          <div className="p-4 rounded-xl border border-m3-outline/5 bg-m3-surface/20 text-[11px] font-mono text-m3-on-surface/60 space-y-1">
            <div>Source Page: {lead.sourcePage} ({lead.sourcePageTitle})</div>
            <div>Submitted: {formatDateTime(lead.createdAt)}</div>
            <div>Updated: {formatDateTime(lead.updatedAt)}</div>
            {lead.technical?.referrer && <div>Referrer: {lead.technical.referrer}</div>}
            {lead.technical?.campaign?.source && (
              <div>Campaign: {lead.technical.campaign.source} / {lead.technical.campaign.medium}</div>
            )}
          </div>

          {/* Destructive Actions */}
          <div className="pt-4 border-t border-m3-outline/10 flex items-center justify-between">
            <button
              onClick={() => handleStatusChange("archived")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-m3-outline/15 hover:bg-m3-surface-container text-xs font-mono uppercase tracking-wider text-m3-on-surface/70 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Lead</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-m3-error/20 hover:bg-m3-error/5 text-xs font-mono uppercase tracking-wider text-m3-error cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Lead</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-50">
            <div className="bg-white dark:bg-[#1d1b20] p-6 rounded-3xl border border-m3-error/30 max-w-sm w-full space-y-4 shadow-xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-display font-semibold text-m3-on-surface">
                Permanently delete lead?
              </h4>
              <p className="text-xs text-m3-on-surface/70 leading-relaxed">
                This action cannot be undone. All contact details and questionnaire responses for{" "}
                <strong>{lead.name}</strong> will be permanently removed.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-full border border-m3-outline/20 text-xs font-mono uppercase font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-mono uppercase font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
