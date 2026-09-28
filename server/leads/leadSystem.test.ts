import assert from "assert";
import { validateLeadSubmission } from "./leadValidation";
import { getDeterministicFallback, generateLeadQualification } from "./leadSummary";
import { renderEmailHtml, renderEmailPlainText, getEmailSubject } from "./leadEmail";
import { processLeadSubmission } from "./leadService";
import { LeadRecord, LeadSubmissionPayload } from "./leadTypes";

async function runLeadSystemTests() {
  console.log("🧪 Starting Lead Capture & Management System Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      } catch (err: any) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        failed++;
      }
    })();
  }

  // ─── 1. VALIDATION TESTS ──────────────────────────────────────────────────
  console.log("--- Group 1: Server-Side Validation & Spam Detection ---");

  await test("Rejects invalid submission type", () => {
    const result = validateLeadSubmission({
      submissionType: "invalid-type",
      name: "John Doe",
      email: "john@example.com",
      consent: { contactConsent: true, privacyAccepted: true }
    }, "127.0.0.1");

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes("submission type")));
  });

  await test("Rejects missing or invalid email format", () => {
    const result = validateLeadSubmission({
      submissionType: "reach-me",
      name: "John Doe",
      email: "not-an-email",
      consent: { contactConsent: true, privacyAccepted: true }
    }, "127.0.0.1");

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes("email")));
  });

  await test("Rejects missing name or overly short name", () => {
    const result = validateLeadSubmission({
      submissionType: "reach-me",
      name: "A",
      email: "valid@example.com",
      consent: { contactConsent: true, privacyAccepted: true }
    }, "127.0.0.1");

    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes("Full name")));
  });

  await test("Honeypot field triggers spam detection", () => {
    const result = validateLeadSubmission({
      submissionType: "reach-me",
      name: "Spam Bot",
      email: "spambot@example.com",
      _hp: "I am a bot value",
      consent: { contactConsent: true, privacyAccepted: true }
    }, "127.0.0.1");

    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.isSpamBot, true);
  });

  await test("Accepts valid questionnaire submission payload", () => {
    const result = validateLeadSubmission({
      submissionType: "ai-transformation",
      sourcePage: "/services/ai-transformation",
      sourcePageTitle: "AI Transformation Diagnostic",
      name: "Sarah Ahmed",
      email: "sarah.ahmed@acmecorp.com",
      company: "Acme Corp",
      jobTitle: "VP of Digital",
      message: "Looking for an AI transformation roadmap.",
      answers: [
        { questionId: "q1", question: "Where are you right now?", answer: "Need a full transformation roadmap" },
        { questionId: "q5", question: "How urgent is this?", answer: "Ready to start now" }
      ],
      consent: { contactConsent: true, privacyAccepted: true }
    }, "192.168.1.10");

    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.sanitizedPayload?.name, "Sarah Ahmed");
    assert.strictEqual(result.sanitizedPayload?.answers.length, 2);
  });

  await test("Detects and rejects duplicate submission within 60s", () => {
    // Second submission with exact same email from earlier test
    const duplicateResult = validateLeadSubmission({
      submissionType: "ai-transformation",
      name: "Sarah Ahmed",
      email: "sarah.ahmed@acmecorp.com",
      consent: { contactConsent: true, privacyAccepted: true }
    }, "192.168.1.10");

    assert.strictEqual(duplicateResult.isValid, false);
    assert.ok(duplicateResult.errors.some(e => e.includes("recently received")));
  });

  // ─── 2. AI QUALIFICATION & DETERMINISTIC FALLBACK TESTS ───────────────────
  console.log("\n--- Group 2: AI Triage & Fallback Qualifications ---");

  const mockLead: LeadRecord = {
    id: "lead_test_001",
    submissionType: "ai-transformation",
    sourcePage: "/services/ai-transformation",
    sourcePageTitle: "AI Transformation Diagnostic",
    sourceUrl: "https://abdullahmalik.com/services/ai-transformation",
    name: "Marcus Vance",
    email: "marcus@vanceenterprises.com",
    company: "Vance Enterprises",
    jobTitle: "Chief Operating Officer",
    answers: [
      { questionId: "q1", question: "Where are you right now with AI?", answer: "Need a full transformation roadmap" },
      { questionId: "q2", question: "What is blocking progress?", answer: "Governance and risk" },
      { questionId: "q3", question: "Where should AI create value first?", answer: "Internal productivity" },
      { questionId: "q5", question: "How urgent is this?", answer: "Ready to start now" }
    ],
    status: "new",
    isRead: false,
    emailDelivery: { status: "pending", attempts: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    consent: { contactConsent: true, privacyAccepted: true }
  };

  await test("Deterministic fallback assigns high/urgent priority based on explicit answers", () => {
    const qualification = getDeterministicFallback(mockLead);
    assert.strictEqual(qualification.leadPriority, "urgent");
    assert.ok(qualification.identifiedBlockers.includes("Governance and risk"));
    assert.ok(qualification.identifiedNeeds.includes("Internal productivity"));
    assert.strictEqual(qualification.recommendedService, "AI Transformation");
    assert.ok(qualification.summary.includes("Marcus Vance"));
  });

  // ─── 3. EMAIL RENDERING TESTS ─────────────────────────────────────────────
  console.log("\n--- Group 3: Email Rendering & HTML Escaping ---");

  await test("Email subject line formats correctly by source", () => {
    const subject = getEmailSubject(mockLead);
    assert.strictEqual(subject, "New AI Transformation Lead | Vance Enterprises");

    const reachMeLead = { ...mockLead, submissionType: "reach-me" as const, company: undefined };
    assert.strictEqual(getEmailSubject(reachMeLead), "New Reach Me Enquiry | Marcus Vance");
  });

  await test("HTML email escaping prevents XSS injection", () => {
    const maliciousLead: LeadRecord = {
      ...mockLead,
      name: "<script>alert('xss')</script> John",
      company: "<b>Bold Inc</b>",
      message: '<img src=x onerror="alert(1)">'
    };

    const html = renderEmailHtml(maliciousLead, "https://abdullahmalik.com");
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt; John"));
    assert.ok(html.includes("&lt;b&gt;Bold Inc&lt;/b&gt;"));
    assert.ok(!html.includes("<img src=x"));
  });

  await test("HTML email contains all required sections and direct admin link", () => {
    const html = renderEmailHtml(mockLead, "https://abdullahmalik.com");
    assert.ok(html.includes("NEW CONSULTING LEAD"));
    assert.ok(html.includes("Marcus Vance"));
    assert.ok(html.includes("marcus@vanceenterprises.com"));
    assert.ok(html.includes("Vance Enterprises"));
    assert.ok(html.includes("https://abdullahmalik.com/admin?lead=lead_test_001"));
    assert.ok(html.includes("abdullahmalik66@gmail.com") || html.includes("Abdullah Malik"));
  });

  await test("Plain-text email provides complete fallback summary", () => {
    const text = renderEmailPlainText(mockLead, "https://abdullahmalik.com");
    assert.ok(text.includes("NEW CONSULTING LEAD: Vance Enterprises"));
    assert.ok(text.includes("Source: AI Transformation Diagnostic"));
    assert.ok(text.includes("https://abdullahmalik.com/admin?lead=lead_test_001"));
  });

  // ─── 4. END-TO-END LEAD CAPTURE PIPELINE ─────────────────────────────────
  console.log("\n--- Group 4: End-to-End Lead Ingestion Pipeline ---");

  await test("Full lead submission creates record and survives when SMTP is offline", async () => {
    const uniqueEmail = `test_${Date.now()}@testcompany.org`;
    const payload: LeadSubmissionPayload = {
      submissionType: "data-activation",
      sourcePage: "/services/data-activation-intelligence",
      sourcePageTitle: "Data Activation Diagnostic",
      name: "Dr. Elena Rostova",
      email: uniqueEmail,
      company: "Nordic Health Systems",
      jobTitle: "Head of Data Architecture",
      message: "Evaluating CDP implementation for multi-market rollout.",
      answers: [
        { questionId: "q1", question: "How unified is your customer data today?", answer: "Siloed across campaign tools" },
        { questionId: "q2", question: "What is your primary activation blocker?", answer: "Messy / untrusted data quality" }
      ],
      consent: { contactConsent: true, privacyAccepted: true }
    };

    const result = await processLeadSubmission(payload, "192.168.1.99", "https://abdullahmalik.com");

    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.response.success, true);
    assert.ok(result.response.leadId?.startsWith("lead_"));
    assert.strictEqual(
      result.response.message,
      "Thank you. Your context has been received. I will review the information and follow up if a conversation would be useful."
    );
    // Email delivery is recorded as failed or pending gracefully (no crash when SMTP not configured)
    assert.ok(result.response.emailDelivery === "failed" || result.response.emailDelivery === "pending");
  });

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLeadSystemTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
