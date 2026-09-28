import crypto from "crypto";
import { LeadSubmissionPayload, LeadSourceType } from "./leadTypes";

const ALLOWED_SUBMISSION_TYPES: LeadSourceType[] = [
  "reach-me",
  "ai-transformation",
  "data-activation",
  "modern-marketing-growth",
  "ai-maturity-capability"
];

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// In-memory rate limiting and duplicate detection
interface SubmissionLog {
  timestamp: number;
  email: string;
  fingerprint: string;
}

const recentSubmissions: SubmissionLog[] = [];
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 6;
const DUPLICATE_WINDOW_MS = 60 * 1000; // 60 seconds

function cleanSubmissionLogs() {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  while (recentSubmissions.length > 0 && recentSubmissions[0].timestamp < cutoff) {
    recentSubmissions.shift();
  }
}

export function hashIdentifier(input: string): string {
  return crypto.createHash("sha256").update(input.trim().toLowerCase()).digest("hex").slice(0, 16);
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPayload?: LeadSubmissionPayload;
  isSpamBot?: boolean;
}

export function validateLeadSubmission(
  rawBody: any,
  clientIpIdentifier: string
): ValidationResult {
  cleanSubmissionLogs();
  const errors: string[] = [];

  if (!rawBody || typeof rawBody !== "object") {
    return { isValid: false, errors: ["Invalid request body format."] };
  }

  // 1. Honeypot check
  if (rawBody._hp && typeof rawBody._hp === "string" && rawBody._hp.trim().length > 0) {
    return {
      isValid: false,
      errors: ["Spam verification failed."],
      isSpamBot: true
    };
  }

  // 2. Submission type check
  const submissionType = rawBody.submissionType;
  if (!ALLOWED_SUBMISSION_TYPES.includes(submissionType)) {
    errors.push(`Invalid or unsupported submission type: ${submissionType}`);
  }

  // 3. Name validation
  const rawName = typeof rawBody.name === "string" ? rawBody.name.trim() : "";
  if (!rawName || rawName.length < 2 || rawName.length > 120) {
    errors.push("Full name is required and must be between 2 and 120 characters.");
  }

  // 4. Email validation
  const rawEmail = typeof rawBody.email === "string" ? rawBody.email.trim().toLowerCase() : "";
  if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 150) {
    errors.push("A valid work email address is required.");
  }

  // 5. Consent validation
  const contactConsent = rawBody.consent?.contactConsent === true;
  const privacyAccepted = rawBody.consent?.privacyAccepted === true;
  if (!contactConsent && !privacyAccepted) {
    errors.push("Please acknowledge the privacy notice and consent to proceed.");
  }

  // 6. Optional string fields length validation
  const company = typeof rawBody.company === "string" ? rawBody.company.trim().slice(0, 150) : undefined;
  const jobTitle = typeof rawBody.jobTitle === "string" ? rawBody.jobTitle.trim().slice(0, 150) : undefined;
  const phone = typeof rawBody.phone === "string" ? rawBody.phone.trim().slice(0, 50) : undefined;
  const primaryInterest = typeof rawBody.primaryInterest === "string" ? rawBody.primaryInterest.trim().slice(0, 150) : undefined;
  const message = typeof rawBody.message === "string" ? rawBody.message.trim().slice(0, 5000) : undefined;

  // 7. Answers validation
  const answers: Array<{ questionId: string; question: string; answer: string }> = [];
  if (Array.isArray(rawBody.answers)) {
    if (rawBody.answers.length > 30) {
      errors.push("Exceeded maximum number of question responses.");
    }
    for (const item of rawBody.answers) {
      if (item && typeof item === "object") {
        const qId = String(item.questionId || "").trim().slice(0, 100);
        const qText = String(item.question || "").trim().slice(0, 500);
        const aText = String(item.answer || "").trim().slice(0, 1000);
        if (qText && aText) {
          answers.push({ questionId: qId, question: qText, answer: aText });
        }
      }
    }
  }

  // Source page metadata
  const sourcePage = typeof rawBody.sourcePage === "string" ? rawBody.sourcePage.trim().slice(0, 200) : "/";
  const sourcePageTitle = typeof rawBody.sourcePageTitle === "string" ? rawBody.sourcePageTitle.trim().slice(0, 200) : "Consultancy";
  const sourceUrl = typeof rawBody.sourceUrl === "string" ? rawBody.sourceUrl.trim().slice(0, 500) : "";
  const referrer = typeof rawBody.referrer === "string" ? rawBody.referrer.trim().slice(0, 500) : undefined;

  // Campaign parameters
  let campaign: any = undefined;
  if (rawBody.campaign && typeof rawBody.campaign === "object") {
    campaign = {
      source: typeof rawBody.campaign.source === "string" ? rawBody.campaign.source.slice(0, 100) : undefined,
      medium: typeof rawBody.campaign.medium === "string" ? rawBody.campaign.medium.slice(0, 100) : undefined,
      campaign: typeof rawBody.campaign.campaign === "string" ? rawBody.campaign.campaign.slice(0, 100) : undefined,
      content: typeof rawBody.campaign.content === "string" ? rawBody.campaign.content.slice(0, 100) : undefined,
      term: typeof rawBody.campaign.term === "string" ? rawBody.campaign.term.slice(0, 100) : undefined,
    };
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // 8. Rate limiting and duplicate protection
  const ipHash = hashIdentifier(clientIpIdentifier);
  const now = Date.now();

  const ipSubmissions = recentSubmissions.filter(s => s.fingerprint === ipHash);
  if (ipSubmissions.length >= MAX_REQUESTS_PER_WINDOW) {
    return {
      isValid: false,
      errors: ["Submission limit reached. Please wait a few minutes before trying again."]
    };
  }

  // Duplicate check: same email within 60 seconds
  const isDuplicate = recentSubmissions.some(
    s => s.email === rawEmail && (now - s.timestamp) < DUPLICATE_WINDOW_MS
  );
  if (isDuplicate) {
    return {
      isValid: false,
      errors: ["A submission from this email was recently received. Please wait a moment before sending another."]
    };
  }

  // Log successful validation
  recentSubmissions.push({
    timestamp: now,
    email: rawEmail,
    fingerprint: ipHash
  });

  const sanitizedPayload: LeadSubmissionPayload = {
    submissionType,
    sourcePage,
    sourcePageTitle,
    sourceUrl,
    referrer,
    name: rawName,
    email: rawEmail,
    company,
    jobTitle,
    phone,
    primaryInterest,
    message,
    answers,
    consent: {
      contactConsent,
      privacyAccepted,
      acceptedAt: new Date().toISOString()
    },
    campaign
  };

  return {
    isValid: true,
    errors: [],
    sanitizedPayload
  };
}
