import nodemailer from "nodemailer";
import escapeHtml from "escape-html";
import { LeadRecord } from "./leadTypes";

export function getEmailSubject(lead: LeadRecord): string {
  const entity = lead.company || lead.name;

  switch (lead.submissionType) {
    case "ai-transformation":
      return `New AI Transformation Lead | ${entity}`;
    case "data-activation":
      return `New Data Activation Lead | ${entity}`;
    case "modern-marketing-growth":
      return `New Growth Systems Lead | ${entity}`;
    case "ai-maturity-capability":
      return `New AI Maturity Lead | ${entity}`;
    case "reach-me":
    default:
      return `New Reach Me Enquiry | ${entity}`;
  }
}

export function renderEmailHtml(lead: LeadRecord, adminBaseUrl: string): string {
  const safeName = escapeHtml(lead.name);
  const safeEmail = escapeHtml(lead.email);
  const safeCompany = lead.company ? escapeHtml(lead.company) : "";
  const safeJobTitle = lead.jobTitle ? escapeHtml(lead.jobTitle) : "";
  const safePrimaryInterest = lead.primaryInterest ? escapeHtml(lead.primaryInterest) : "";
  const safePhone = lead.phone ? escapeHtml(lead.phone) : "";
  const safeSummary = lead.aiSummary ? escapeHtml(lead.aiSummary) : "";
  const safeNextStep = lead.recommendedNextStep ? escapeHtml(lead.recommendedNextStep) : "";
  const safeService = lead.recommendedService ? escapeHtml(lead.recommendedService) : "";
  const safeMessage = lead.message ? escapeHtml(lead.message) : "";
  const safeSourceTitle = escapeHtml(lead.sourcePageTitle);
  const safeDate = new Date(lead.createdAt).toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";

  const priorityColorMap: Record<string, { bg: string; text: string }> = {
    urgent: { bg: "#FFDAD6", text: "#410002" },
    high: { bg: "#FFDCC1", text: "#2E1500" },
    medium: { bg: "#E8DEF8", text: "#1D192B" },
    low: { bg: "#E7F8E8", text: "#00210E" }
  };
  const priorityStyle = priorityColorMap[lead.leadPriority || "medium"] || priorityColorMap.medium;

  const adminLeadUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin?lead=${lead.id}`;

  // Build needs items HTML
  const needsHtml = (lead.identifiedNeeds && lead.identifiedNeeds.length > 0)
    ? `<div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6750A4; margin: 0 0 10px 0;">Stated Needs</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1D1B20; font-size: 14px; line-height: 1.6;">
          ${lead.identifiedNeeds.map(n => `<li style="margin-bottom: 6px;">${escapeHtml(n)}</li>`).join("")}
        </ul>
      </div>`
    : "";

  // Build blockers items HTML
  const blockersHtml = (lead.identifiedBlockers && lead.identifiedBlockers.length > 0)
    ? `<div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #B3261E; margin: 0 0 10px 0;">Stated Blockers</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1D1B20; font-size: 14px; line-height: 1.6;">
          ${lead.identifiedBlockers.map(b => `<li style="margin-bottom: 6px;">${escapeHtml(b)}</li>`).join("")}
        </ul>
      </div>`
    : "";

  // Build questionnaire responses HTML
  const answersHtml = (lead.answers && lead.answers.length > 0)
    ? `<div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #625B71; margin: 0 0 12px 0;">Questionnaire Responses (${lead.answers.length})</h3>
        <div style="background-color: #F3EDF7; border-radius: 12px; padding: 16px; border: 1px solid #E6E0E9;">
          ${lead.answers.map((a, i) => `
            <div style="margin-bottom: ${i === lead.answers.length - 1 ? "0" : "14px"};">
              <div style="font-size: 12px; font-weight: 600; color: #49454F; margin-bottom: 3px;">
                ${escapeHtml(a.question)}
              </div>
              <div style="font-size: 14px; font-weight: 600; color: #1D1B20; background-color: #FFFFFF; padding: 6px 10px; border-radius: 6px; display: inline-block; border: 1px solid #CAC4D0;">
                ${escapeHtml(a.answer)}
              </div>
            </div>
          `).join("")}
        </div>
      </div>`
    : "";

  // Build free message HTML
  const messageHtml = safeMessage
    ? `<div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #625B71; margin: 0 0 8px 0;">Free-Text Message</h3>
        <div style="background-color: #FFFFFF; border-left: 3px solid #6750A4; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #1D1B20; font-size: 14px; line-height: 1.6; white-space: pre-wrap; border-top: 1px solid #E6E0E9; border-right: 1px solid #E6E0E9; border-bottom: 1px solid #E6E0E9;">
          ${safeMessage}
        </div>
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Notification</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F5F3FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1D1B20; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E6E0E9; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    <!-- Top Header -->
    <tr>
      <td style="padding: 24px 28px; background: linear-gradient(135deg, #1A102E 0%, #2A1B4E 100%); color: #FFFFFF;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #EADDFF; display: block; margin-bottom: 6px;">NEW CONSULTING LEAD</span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em;">${safeName}${safeCompany ? ` — ${safeCompany}` : ""}</h1>
              <span style="font-size: 13px; color: #D0BCFF; display: block; margin-top: 4px;">Source: ${safeSourceTitle}</span>
            </td>
            <td align="right" valign="top">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background-color: ${priorityStyle.bg}; color: ${priorityStyle.text};">
                ${escapeHtml((lead.leadPriority || "medium").toUpperCase())}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Container -->
    <tr>
      <td style="padding: 28px;">
        <!-- Contact Block -->
        <div style="background-color: #FEF7FF; border: 1px solid #E8DEF8; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71; width: 35%;">Name</td>
              <td style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #1D1B20;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71;">Work Email</td>
              <td style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #6750A4;">
                <a href="mailto:${safeEmail}" style="color: #6750A4; text-decoration: underline;">${safeEmail}</a>
              </td>
            </tr>
            ${safeCompany ? `<tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71;">Company</td>
              <td style="padding: 4px 0; font-size: 14px; color: #1D1B20;">${safeCompany}</td>
            </tr>` : ""}
            ${safeJobTitle ? `<tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71;">Job Title / Role</td>
              <td style="padding: 4px 0; font-size: 14px; color: #1D1B20;">${safeJobTitle}</td>
            </tr>` : ""}
            ${safePhone ? `<tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71;">Phone</td>
              <td style="padding: 4px 0; font-size: 14px; color: #1D1B20;">${safePhone}</td>
            </tr>` : ""}
            ${safePrimaryInterest ? `<tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71;">Primary Interest</td>
              <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #1D1B20;">${safePrimaryInterest}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #625B71;">Received At</td>
              <td style="padding: 4px 0; font-size: 13px; color: #49454F;">${safeDate}</td>
            </tr>
          </table>
        </div>

        <!-- Executive Summary -->
        ${safeSummary ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6750A4; margin: 0 0 8px 0;">Executive Summary</h3>
            <div style="font-size: 14px; line-height: 1.6; color: #1D1B20; background-color: #FAF8F3; padding: 14px 16px; border-radius: 10px; border: 1px solid #EADDFF;">
              ${safeSummary}
            </div>
          </div>
        ` : ""}

        <!-- Stated Needs -->
        ${needsHtml}

        <!-- Stated Blockers -->
        ${blockersHtml}

        <!-- Questionnaire Answers -->
        ${answersHtml}

        <!-- Recommended Service & Next Step -->
        ${(safeService || safeNextStep) ? `
          <div style="background-color: #EEF8F5; border: 1px solid #C4EED0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #00522B; margin: 0 0 10px 0;">Recommended Follow-Up</h3>
            ${safeService ? `<p style="margin: 0 0 6px 0; font-size: 13px; color: #1D1B20;"><strong>Service:</strong> ${safeService}</p>` : ""}
            ${safeNextStep ? `<p style="margin: 0; font-size: 13px; color: #1D1B20;"><strong>Proposed Next Step:</strong> ${safeNextStep}</p>` : ""}
          </div>
        ` : ""}

        <!-- Free-text Message -->
        ${messageHtml}

        <!-- Admin CTA Button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${adminLeadUrl}" style="display: inline-block; background: #6750A4; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 999px; box-shadow: 0 2px 6px rgba(103, 80, 164, 0.3);">
            Open Lead in Admin Inbox &rarr;
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #FAF8F3; padding: 20px 28px; border-top: 1px solid #E6E0E9; text-align: center; font-size: 12px; color: #49454F;">
        <div style="font-weight: 600; color: #1D1B20; margin-bottom: 4px;">Abdullah Malik</div>
        <div>AI Transformation, Data Activation and Growth Systems</div>
        <div style="font-size: 11px; color: #79747E; margin-top: 8px;">Lead ID: ${lead.id} &bull; Stored securely in Firebase</div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function renderEmailPlainText(lead: LeadRecord, adminBaseUrl: string): string {
  const entity = lead.company || lead.name;
  const adminLeadUrl = `${adminBaseUrl.replace(/\/$/, "")}/admin?lead=${lead.id}`;

  const lines: string[] = [
    `NEW CONSULTING LEAD: ${entity}`,
    `========================================`,
    `Source: ${lead.sourcePageTitle} (${lead.sourcePage})`,
    `Received: ${lead.createdAt}`,
    `Priority: ${(lead.leadPriority || "medium").toUpperCase()}`,
    `Status: ${lead.status}`,
    ``,
    `CONTACT DETAILS`,
    `----------------------------------------`,
    `Name: ${lead.name}`,
    `Work Email: ${lead.email}`,
    lead.company ? `Company: ${lead.company}` : "",
    lead.jobTitle ? `Job Title: ${lead.jobTitle}` : "",
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.primaryInterest ? `Primary Interest: ${lead.primaryInterest}` : "",
    ``
  ];

  if (lead.aiSummary) {
    lines.push(`EXECUTIVE SUMMARY`, `----------------------------------------`, lead.aiSummary, ``);
  }

  if (lead.identifiedNeeds && lead.identifiedNeeds.length > 0) {
    lines.push(`STATED NEEDS`, `----------------------------------------`);
    lead.identifiedNeeds.forEach(n => lines.push(`- ${n}`));
    lines.push(``);
  }

  if (lead.identifiedBlockers && lead.identifiedBlockers.length > 0) {
    lines.push(`STATED BLOCKERS`, `----------------------------------------`);
    lead.identifiedBlockers.forEach(b => lines.push(`- ${b}`));
    lines.push(``);
  }

  if (lead.answers && lead.answers.length > 0) {
    lines.push(`QUESTIONNAIRE RESPONSES (${lead.answers.length})`, `----------------------------------------`);
    lead.answers.forEach(a => {
      lines.push(`Q: ${a.question}`);
      lines.push(`A: ${a.answer}`);
      lines.push(``);
    });
  }

  if (lead.recommendedService || lead.recommendedNextStep) {
    lines.push(`RECOMMENDED FOLLOW-UP`, `----------------------------------------`);
    if (lead.recommendedService) lines.push(`Service: ${lead.recommendedService}`);
    if (lead.recommendedNextStep) lines.push(`Next Step: ${lead.recommendedNextStep}`);
    lines.push(``);
  }

  if (lead.message) {
    lines.push(`MESSAGE`, `----------------------------------------`, lead.message, ``);
  }

  lines.push(
    `ADMIN INBOX LINK`,
    `----------------------------------------`,
    adminLeadUrl,
    ``,
    `Abdullah Malik — AI Transformation, Data Activation and Growth Systems`,
    `Lead ID: ${lead.id}`
  );

  return lines.filter(l => l !== undefined).join("\n");
}

export interface EmailSendResult {
  sent: boolean;
  error?: string;
}

export async function sendLeadNotificationEmail(
  lead: LeadRecord,
  adminBaseUrl: string = process.env.APP_URL || "https://abdullahmalik.com"
): Promise<EmailSendResult> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || "587";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@abdullahmalik.com";

  if (!smtpHost || !smtpUser || !smtpPass) {
    const msg = "SMTP credentials not configured in environment (SMTP_HOST, SMTP_USER, SMTP_PASS).";
    console.warn(`[LeadEmail] ${msg} Notification recorded as pending/local.`);
    return { sent: false, error: msg };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const subject = getEmailSubject(lead);
    const html = renderEmailHtml(lead, adminBaseUrl);
    const text = renderEmailPlainText(lead, adminBaseUrl);

    await transporter.sendMail({
      from: `"Malik Consultancy Lead System" <${smtpFrom}>`,
      to: "abdullahmalik66@gmail.com",
      replyTo: lead.email,
      subject,
      text,
      html
    });

    console.log(`[LeadEmail] Successfully sent notification email for lead ${lead.id} to abdullahmalik66@gmail.com.`);
    return { sent: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[LeadEmail] Failed to send email for lead ${lead.id}:`, errorMsg);
    return { sent: false, error: errorMsg };
  }
}
