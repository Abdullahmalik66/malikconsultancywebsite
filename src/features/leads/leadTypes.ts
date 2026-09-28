export type LeadSourceType =
  | 'reach-me'
  | 'ai-transformation'
  | 'data-activation'
  | 'modern-marketing-growth'
  | 'ai-maturity-capability';

export type LeadStatus =
  | 'new'
  | 'reviewing'
  | 'qualified'
  | 'follow-up'
  | 'proposal'
  | 'won'
  | 'not-a-fit'
  | 'archived';

export type LeadPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type DeliveryStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'not-required';

export interface LeadAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface LeadEmailDelivery {
  status: DeliveryStatus;
  sentAt?: string;
  error?: string;
  attempts: number;
}

export interface LeadConsent {
  contactConsent: boolean;
  privacyAccepted: boolean;
  acceptedAt?: string;
}

export interface LeadCampaign {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface LeadTechnical {
  userAgent?: string;
  locale?: string;
  timezone?: string;
  referrer?: string;
  campaign?: LeadCampaign;
}

export interface LeadRecord {
  id: string;

  submissionType: LeadSourceType;
  sourcePage: string;
  sourcePageTitle: string;
  sourceUrl: string;
  referrer?: string;

  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  primaryInterest?: string;
  message?: string;

  answers: LeadAnswer[];

  aiSummary?: string;
  businessContext?: string;
  identifiedNeeds?: string[];
  identifiedBlockers?: string[];
  recommendedService?: string;
  recommendedNextStep?: string;
  leadPriority?: LeadPriority;
  qualificationReason?: string;

  status: LeadStatus;
  isRead: boolean;

  emailDelivery: LeadEmailDelivery;

  adminNotes?: string;
  tags?: string[];

  createdAt: string;
  updatedAt: string;

  consent: LeadConsent;
  technical: LeadTechnical;

  externalCrmId?: string;
}

export interface LeadSubmissionPayload {
  submissionType: LeadSourceType;
  sourcePage: string;
  sourcePageTitle: string;
  sourceUrl?: string;
  referrer?: string;

  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  primaryInterest?: string;
  message?: string;

  answers: LeadAnswer[];

  consent: {
    contactConsent: boolean;
    privacyAccepted: boolean;
  };

  campaign?: LeadCampaign;

  // Honeypot field for bot detection
  _hp?: string;
}

export interface LeadSubmissionResponse {
  success: boolean;
  leadId?: string;
  message: string;
  emailDelivery?: DeliveryStatus;
  warning?: string;
  error?: string;
}

export interface LeadOverviewStats {
  totalLeads: number;
  unreadLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  followUpLeads: number;
  failedDeliveries: number;
  bySource: Record<LeadSourceType, number>;
  byStatus: Record<LeadStatus, number>;
  byPriority: Record<LeadPriority, number>;
  recentLeads: LeadRecord[];
}
