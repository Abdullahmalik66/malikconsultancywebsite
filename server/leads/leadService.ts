import crypto from "crypto";
import {
  LeadRecord,
  LeadSubmissionPayload,
  LeadStatus,
  LeadPriority,
  DeliveryStatus
} from "./leadTypes";
import { validateLeadSubmission } from "./leadValidation";
import {
  createLeadRecord,
  updateLeadRecord,
  getLeadById,
  getAllLeads,
  deleteLeadById
} from "./leadRepository";
import { generateLeadQualification } from "./leadSummary";
import { sendLeadNotificationEmail } from "./leadEmail";

function generateLeadId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString("hex");
  return `lead_${timestamp}_${random}`;
}

export interface SubmissionServiceResult {
  statusCode: number;
  response: {
    success: boolean;
    leadId?: string;
    message: string;
    emailDelivery?: DeliveryStatus;
    errors?: string[];
  };
}

export async function processLeadSubmission(
  rawBody: any,
  clientIp: string,
  adminBaseUrl: string = process.env.APP_URL || "https://abdullahmalik.com"
): Promise<SubmissionServiceResult> {
  // 1. Validation & Spam Check
  const validation = validateLeadSubmission(rawBody, clientIp);
  if (!validation.isValid) {
    if (validation.isSpamBot) {
      // Deceive automated bots
      return {
        statusCode: 200,
        response: {
          success: true,
          message: "Thank you for reaching out."
        }
      };
    }
    return {
      statusCode: 400,
      response: {
        success: false,
        message: validation.errors[0] || "Validation failed.",
        errors: validation.errors
      }
    };
  }

  const payload = validation.sanitizedPayload!;
  const now = new Date().toISOString();
  const leadId = generateLeadId();

  // 2. Build initial LeadRecord
  const initialLead: LeadRecord = {
    id: leadId,
    submissionType: payload.submissionType,
    sourcePage: payload.sourcePage,
    sourcePageTitle: payload.sourcePageTitle,
    sourceUrl: payload.sourceUrl || "",
    referrer: payload.referrer,
    name: payload.name,
    email: payload.email,
    company: payload.company,
    jobTitle: payload.jobTitle,
    phone: payload.phone,
    primaryInterest: payload.primaryInterest,
    message: payload.message,
    answers: payload.answers || [],
    status: "new",
    isRead: false,
    emailDelivery: {
      status: "pending",
      attempts: 0
    },
    createdAt: now,
    updatedAt: now,
    consent: {
      contactConsent: payload.consent.contactConsent,
      privacyAccepted: payload.consent.privacyAccepted,
      acceptedAt: payload.consent.acceptedAt || now
    },
    technical: {
      userAgent: rawBody?.technical?.userAgent?.slice(0, 300),
      locale: rawBody?.technical?.locale?.slice(0, 50),
      timezone: rawBody?.technical?.timezone?.slice(0, 50),
      referrer: payload.referrer,
      campaign: payload.campaign
    }
  };

  // 3. Persist Lead to Firebase (System of Record)
  try {
    await createLeadRecord(initialLead);
  } catch (err) {
    console.error("[LeadService] Failed to create lead in database:", err);
    return {
      statusCode: 500,
      response: {
        success: false,
        message: "Failed to store submission securely. Please try again."
      }
    };
  }

  // 4. Generate AI Qualification & Summary
  let qualification;
  try {
    qualification = await generateLeadQualification(initialLead);
  } catch (err) {
    console.error("[LeadService] AI qualification threw unexpected error:", err);
  }

  // Update lead in memory and Firebase with AI qualification
  const qualifiedLead: LeadRecord = {
    ...initialLead,
    aiSummary: qualification?.summary,
    businessContext: qualification?.businessContext,
    identifiedNeeds: qualification?.identifiedNeeds,
    identifiedBlockers: qualification?.identifiedBlockers,
    recommendedService: qualification?.recommendedService,
    recommendedNextStep: qualification?.recommendedNextStep,
    leadPriority: qualification?.leadPriority || "medium",
    qualificationReason: qualification?.qualificationReason
  };

  try {
    await updateLeadRecord(leadId, {
      aiSummary: qualifiedLead.aiSummary,
      businessContext: qualifiedLead.businessContext,
      identifiedNeeds: qualifiedLead.identifiedNeeds,
      identifiedBlockers: qualifiedLead.identifiedBlockers,
      recommendedService: qualifiedLead.recommendedService,
      recommendedNextStep: qualifiedLead.recommendedNextStep,
      leadPriority: qualifiedLead.leadPriority,
      qualificationReason: qualifiedLead.qualificationReason
    });
  } catch (err) {
    console.warn("[LeadService] Failed to update lead with qualification:", err);
  }

  // 5. Render & Send Email Notification to Abdullah
  let deliveryStatus: DeliveryStatus = "pending";
  let deliveryError: string | undefined = undefined;

  try {
    const emailResult = await sendLeadNotificationEmail(qualifiedLead, adminBaseUrl);
    if (emailResult.sent) {
      deliveryStatus = "sent";
    } else {
      deliveryStatus = "failed";
      deliveryError = emailResult.error;
    }
  } catch (err) {
    deliveryStatus = "failed";
    deliveryError = err instanceof Error ? err.message : String(err);
  }

  // 6. Update Lead with Email Delivery Status
  try {
    await updateLeadRecord(leadId, {
      emailDelivery: {
        status: deliveryStatus,
        sentAt: deliveryStatus === "sent" ? new Date().toISOString() : undefined,
        error: deliveryError,
        attempts: 1
      }
    });
  } catch (err) {
    console.warn("[LeadService] Failed to update email delivery state:", err);
  }

  // 7. Truthful success response to visitor
  const isQuestionnaire = payload.submissionType !== "reach-me";
  const successMessage = isQuestionnaire
    ? "Thank you. Your context has been received. I will review the information and follow up if a conversation would be useful."
    : "Thank you for reaching out. Your message has been received.";

  return {
    statusCode: 200,
    response: {
      success: true,
      leadId,
      message: successMessage,
      emailDelivery: deliveryStatus
    }
  };
}

export async function retryLeadEmail(
  leadId: string,
  adminBaseUrl: string = process.env.APP_URL || "https://abdullahmalik.com"
): Promise<{ success: boolean; message: string; emailDelivery: DeliveryStatus; error?: string }> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return { success: false, message: "Lead not found.", emailDelivery: "failed" };
  }

  const result = await sendLeadNotificationEmail(lead, adminBaseUrl);
  const newAttempts = (lead.emailDelivery?.attempts || 0) + 1;
  const newStatus: DeliveryStatus = result.sent ? "sent" : "failed";

  await updateLeadRecord(leadId, {
    emailDelivery: {
      status: newStatus,
      sentAt: result.sent ? new Date().toISOString() : lead.emailDelivery?.sentAt,
      error: result.error,
      attempts: newAttempts
    }
  });

  return {
    success: result.sent,
    message: result.sent ? "Notification email sent successfully." : (result.error || "Failed to deliver email."),
    emailDelivery: newStatus,
    error: result.error
  };
}

export async function regenerateLeadSummary(
  leadId: string
): Promise<{ success: boolean; lead?: LeadRecord; message: string }> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    return { success: false, message: "Lead not found." };
  }

  const qualification = await generateLeadQualification(lead);

  const updates: Partial<LeadRecord> = {
    aiSummary: qualification.summary,
    businessContext: qualification.businessContext,
    identifiedNeeds: qualification.identifiedNeeds,
    identifiedBlockers: qualification.identifiedBlockers,
    recommendedService: qualification.recommendedService,
    recommendedNextStep: qualification.recommendedNextStep,
    leadPriority: qualification.leadPriority,
    qualificationReason: qualification.qualificationReason
  };

  await updateLeadRecord(leadId, updates);
  const updated = await getLeadById(leadId);

  return {
    success: true,
    lead: updated || undefined,
    message: qualification.isAIGenerated ? "AI summary regenerated successfully." : "Summary refreshed with fallback triage."
  };
}
