import { LeadRecord, AIQualificationResult, LeadPriority } from "./leadTypes";
import { getAICompletion } from "../../src/services/ai";

const SYSTEM_INSTRUCTION = `You are analysing a consulting enquiry submitted to Abdullah Malik’s website.

Use only the supplied form data.

Do not invent facts, budgets, timelines, company information, maturity levels, technologies, or motivations.

Write concise British English.

Return valid JSON only.

Your job is to:
1. Summarise the organisation’s stated situation
2. Identify explicitly stated blockers
3. Identify explicitly stated desired outcomes
4. Recommend the most relevant consultancy service
5. Suggest a practical next conversation
6. Assign a lead priority based only on declared urgency and needs
7. Explain the recommendation briefly

Priority is for inbox triage only and must not be treated as an automated decision about the person.`;

export function getDeterministicFallback(lead: LeadRecord): AIQualificationResult {
  const needs: string[] = [];
  const blockers: string[] = [];
  let detectedPriority: LeadPriority = "medium";
  let qualificationReason = "Deterministic baseline triage based on submitted responses.";

  // Extract needs and blockers from question answers
  for (const item of lead.answers) {
    const qLower = item.question.toLowerCase();
    const aText = item.answer.trim();

    if (qLower.includes("block") || qLower.includes("challenge") || qLower.includes("obstacle")) {
      blockers.push(aText);
    } else if (
      qLower.includes("where should") ||
      qLower.includes("value first") ||
      qLower.includes("support") ||
      qLower.includes("outcome") ||
      qLower.includes("help with")
    ) {
      needs.push(aText);
    }

    if (qLower.includes("urgency") || qLower.includes("urgent") || qLower.includes("timeline")) {
      const aLower = aText.toLowerCase();
      if (aLower.includes("start now") || aLower.includes("urgent") || aLower.includes("immediate")) {
        detectedPriority = "urgent";
        qualificationReason = "Lead indicated immediate readiness to start in questionnaire.";
      } else if (aLower.includes("active work") || aLower.includes("planning") || aLower.includes("soon")) {
        detectedPriority = "high";
        qualificationReason = "Lead stated active planning or near-term requirements.";
      } else if (aLower.includes("exploring") || aLower.includes("later")) {
        detectedPriority = "low";
        qualificationReason = "Lead stated early exploratory status.";
      }
    }
  }

  // Derive recommended service
  let recommendedService = "AI Transformation";
  if (lead.submissionType === "data-activation" || lead.primaryInterest?.includes("Data")) {
    recommendedService = "Data Activation & Intelligence";
  } else if (lead.submissionType === "modern-marketing-growth" || lead.primaryInterest?.includes("Marketing")) {
    recommendedService = "Modern Marketing & Growth";
  } else if (lead.submissionType === "ai-maturity-capability" || lead.primaryInterest?.includes("Maturity")) {
    recommendedService = "AI Maturity & Capability Building";
  } else if (lead.primaryInterest) {
    recommendedService = lead.primaryInterest;
  }

  const businessContext = lead.company 
    ? `${lead.name} representing ${lead.company}${lead.jobTitle ? ` as ${lead.jobTitle}` : ""}.`
    : `${lead.name}${lead.jobTitle ? ` (${lead.jobTitle})` : ""}.`;

  const summary = `${businessContext} Submitted via ${lead.sourcePageTitle}. ${
    lead.answers.length > 0 
      ? `Provided ${lead.answers.length} diagnostic answers.` 
      : (lead.message ? `Provided enquiry message.` : "Submitted contact request.")
  }`;

  return {
    summary,
    businessContext,
    identifiedNeeds: needs.length > 0 ? needs : ["Explore consulting and strategic alignment"],
    identifiedBlockers: blockers.length > 0 ? blockers : ["None explicitly declared"],
    recommendedService,
    recommendedNextStep: "A focused initial consultation to discuss specific requirements and scope.",
    leadPriority: detectedPriority,
    qualificationReason,
    isAIGenerated: false
  };
}

async function callGeminiFlash(prompt: string, systemPrompt: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const fullPrompt = `${systemPrompt}\n\nTask:\n${prompt}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty candidate text.");
  }
  return text;
}

export async function generateLeadQualification(lead: LeadRecord): Promise<AIQualificationResult> {
  const fallback = getDeterministicFallback(lead);

  // Construct structured data for AI
  const promptData = {
    submissionType: lead.submissionType,
    sourcePage: lead.sourcePage,
    sourcePageTitle: lead.sourcePageTitle,
    contact: {
      name: lead.name,
      company: lead.company || "Not specified",
      jobTitle: lead.jobTitle || "Not specified",
      primaryInterest: lead.primaryInterest || "Not specified"
    },
    message: lead.message || "None",
    answers: lead.answers.map(a => ({
      question: a.question,
      selectedAnswer: a.answer
    }))
  };

  const prompt = `Please analyse the following consulting enquiry data and return the required JSON object.

Submission Data:
${JSON.stringify(promptData, null, 2)}

Expected JSON schema:
{
  "summary": "Concise factual summary in British English",
  "businessContext": "What the lead explicitly described",
  "identifiedNeeds": ["Need 1", "Need 2"],
  "identifiedBlockers": ["Blocker 1"],
  "recommendedService": "Recommended consultancy service name",
  "recommendedNextStep": "A practical next conversation suggestion",
  "leadPriority": "low" | "medium" | "high" | "urgent",
  "qualificationReason": "Brief explanation based strictly on submitted data"
}`;

  try {
    let rawResponse: string;
    try {
      rawResponse = await callGeminiFlash(prompt, SYSTEM_INSTRUCTION);
    } catch (geminiErr) {
      console.warn("[LeadSummary] Direct Gemini call failed, trying AI fallback pipeline:", geminiErr);
      rawResponse = await getAICompletion(prompt, {
        systemPrompt: SYSTEM_INSTRUCTION,
        jsonMode: true,
        temperature: 0.2
      });
    }

    if (!rawResponse) {
      console.warn("[LeadSummary] AI returned empty response. Using deterministic fallback.");
      return fallback;
    }

    // Parse JSON safely
    const cleaned = rawResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const validPriorities: LeadPriority[] = ["low", "medium", "high", "urgent"];
    const leadPriority: LeadPriority = validPriorities.includes(parsed.leadPriority)
      ? parsed.leadPriority
      : fallback.leadPriority;

    return {
      summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : fallback.summary,
      businessContext: typeof parsed.businessContext === "string" ? parsed.businessContext.trim() : fallback.businessContext,
      identifiedNeeds: Array.isArray(parsed.identifiedNeeds) && parsed.identifiedNeeds.length > 0 
        ? parsed.identifiedNeeds.map(String) 
        : fallback.identifiedNeeds,
      identifiedBlockers: Array.isArray(parsed.identifiedBlockers) && parsed.identifiedBlockers.length > 0 
        ? parsed.identifiedBlockers.map(String) 
        : fallback.identifiedBlockers,
      recommendedService: typeof parsed.recommendedService === "string" && parsed.recommendedService.trim() 
        ? parsed.recommendedService.trim() 
        : fallback.recommendedService,
      recommendedNextStep: typeof parsed.recommendedNextStep === "string" && parsed.recommendedNextStep.trim() 
        ? parsed.recommendedNextStep.trim() 
        : fallback.recommendedNextStep,
      leadPriority,
      qualificationReason: typeof parsed.qualificationReason === "string" && parsed.qualificationReason.trim() 
        ? parsed.qualificationReason.trim() 
        : fallback.qualificationReason,
      isAIGenerated: true
    };
  } catch (err) {
    console.warn("[LeadSummary] AI analysis encountered an error, falling back to deterministic summary:", err);
    return fallback;
  }
}
