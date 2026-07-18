import dotenv from "dotenv";
dotenv.config();

// Polyfill import.meta.env for Node environment
if (!(import.meta as any).env) {
  (import.meta as any).env = process.env;
}

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodemailer from "nodemailer";
// Dynamic SEO imports deferred inside startServer to avoid ESM hoisting execution order issues

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Load database helpers dynamically after dotenv has populated process.env
  const { getSEOConfig, resolveMetadata, saveSiteControlsConfig, saveOrganisationConfig } = await import("./src/lib/firebase/seo");
  const { getPublishedContent } = await import("./src/lib/firebase/cms");

  // ─── SINGLE SOURCE OF TRUTH: Base domain ───────────────────────────────────
  const getBaseHost = (cfg: any): string =>
    (cfg?.organisation?.baseOriginUrl || "").replace(/\/$/, "") ||
    "https://abdullahmalikconsultancy.web.app";
  // ───────────────────────────────────────────────────────────────────────────

  // Perform database migration check for old domain values on start
  try {
    const config = await getSEOConfig();
    let updatedControls = false;
    let updatedOrg = false;

    if (config.controls?.robotsTxt?.content?.includes("artery---animated-experience")) {
      config.controls.robotsTxt.content = config.controls.robotsTxt.content.replace(
        /artery---animated-experience/g,
        "abdullahmalikconsultancy"
      );
      await saveSiteControlsConfig(config.controls);
      updatedControls = true;
    }

    if (config.organisation?.baseOriginUrl?.includes("artery---animated-experience")) {
      config.organisation.baseOriginUrl = config.organisation.baseOriginUrl.replace(
        /artery---animated-experience/g,
        "abdullahmalikconsultancy"
      );
      await saveOrganisationConfig(config.organisation);
      updatedOrg = true;
    }

    if (updatedControls || updatedOrg) {
      console.log("Migration check complete: Migrated old domain to abdullahmalikconsultancy in Realtime Database.");
    }
  } catch (e) {
    console.error("Migration check failed:", e);
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const TESTIMONIALS_FILE = path.join(process.cwd(), 'testimonials.json');

  // Initialize testimonials file if it doesn't exist
  if (!fs.existsSync(TESTIMONIALS_FILE)) {
    const defaultTestimonials = [
      {
        "id": "t1",
        "name": "Lenard Jan Lempenauer",
        "company": "Avaus oy",
        "role": "Business Development & Managing Consultant",
        "testimonial": "I had the opportunity to work with Abdullah on a client project where he managed performance marketing and activation. Abdullah demonstrated strong technical expertise, effectively bridging the gap between our strategic vision and the customers' needs. He is a reliable problem solver and analyst, always approaching challenges with a positive outlook.",
        "approved": true,
        "featured": true,
        "createdAt": "2026-01-10T12:00:00Z",
        "imgSrc": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
      },
      {
        "id": "t2",
        "name": "Naeem Sattar",
        "company": "NaeemSattar Company",
        "role": "Founder & Product Leader",
        "testimonial": "It does not happen quite often that a resource has the exact skill set for your projects to function like a plug n play system, well Abdullah Malik is one. He is truly a solution provider. It was a great venture, working with him and a learning for myself on the digital front.",
        "approved": true,
        "featured": true,
        "createdAt": "2026-02-15T12:00:00Z",
        "imgSrc": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
      },
      {
        "id": "t3",
        "name": "Samia Nouman",
        "company": "Scrum Master PM",
        "role": "Technical Project Manager | Scrum Master",
        "testimonial": "I found Abdullah to be consistently pleasant, tackling assignments with dedication and a smile. Abdullah is a take-charge person who is able to present creative ideas and communicate the benefits. He is a great team player and would make a great asset to any organization.",
        "approved": true,
        "featured": false,
        "createdAt": "2026-03-20T12:00:00Z",
        "imgSrc": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
      },
      {
        "id": "t4",
        "name": "Hafiz Muhammad Aleem",
        "company": "OD",
        "role": "Manager HR | HRBP | OD",
        "testimonial": "Abdullah Malik works with dedication and commitment. He knows his work and manages his goals efficiently. Achieving success as a professional, Malik is young, energetic and self-motivated. He has a strong reputation for motivation, vision and honour.",
        "approved": true,
        "featured": false,
        "createdAt": "2026-04-05T12:00:00Z",
        "imgSrc": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
      },
      {
        "id": "t5",
        "name": "Nawaz Bhutto",
        "company": "Tarsil.pk",
        "role": "Co-Founder | CMO",
        "testimonial": "Malik is a talented and passionate digital marketer with a thirst for knowledge. It was a pleasure to work with Abdullah on different projects and I look forward to working with him again in the future.",
        "approved": true,
        "featured": false,
        "createdAt": "2026-05-12T12:00:00Z",
        "imgSrc": "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop"
      }
    ];
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(defaultTestimonials, null, 2));
  }

  // API Routes
  app.get("/api/testimonials", (req, res) => {
    try {
      const testimonialsData = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf-8'));
      res.json(testimonialsData);
    } catch (error) {
      console.error("GET /api/testimonials error:", error);
      res.status(500).json({ error: "Failed to read testimonials" });
    }
  });

  app.post("/api/testimonials", (req, res) => {
    try {
      const { name, company, testimonial, role } = req.body;
      if (!name || !company || !testimonial) {
        return res.status(400).json({ error: "Missing required fields (name, company, testimonial)." });
      }

      const testimonialsData = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf-8'));
      
      const newTestimonial = {
        id: "t_" + Date.now().toString(),
        name,
        company,
        role: role || "",
        testimonial,
        approved: false, // Must be curated before showing publicly!
        featured: false,
        createdAt: new Date().toISOString()
      };

      testimonialsData.unshift(newTestimonial);
      fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonialsData, null, 2));
      res.status(201).json(newTestimonial);
    } catch (error) {
      console.error("POST /api/testimonials error:", error);
      res.status(500).json({ error: "Failed to submit testimonial", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app.post("/api/submit-reach-me", async (req, res) => {
    try {
      const { name, role, company, serviceArea, branchAnswers, email, additionalNote } = req.body;

      if (!name || !role || !company || !serviceArea || !email) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const q1 = branchAnswers?.[0]?.answer || "N/A";
      const q2 = branchAnswers?.[1]?.answer || "N/A";
      const q3 = branchAnswers?.[2]?.answer || "N/A";
      const q4 = branchAnswers?.[3]?.answer || "N/A";
      const q5 = branchAnswers?.[4]?.answer || "N/A";

      const subject = `New Reach Me Submission — ${name} — ${company} — ${serviceArea}`;

      const emailText = `Name: ${name}
Role: ${role}
Company: ${company}
Service Area: ${serviceArea}
Question 1 answer: ${q1}
Question 2 answer: ${q2}
Question 3 answer: ${q3}
Question 4 answer: ${q4}
Question 5 answer: ${q5}
Email: ${email}
Additional Note: ${additionalNote || "None"}`;

      // Save locally to reach_me_submissions.json
      const SUBMISSIONS_FILE = path.join(process.cwd(), 'reach_me_submissions.json');
      let submissions = [];
      if (fs.existsSync(SUBMISSIONS_FILE)) {
        try {
          submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8'));
        } catch (e) {
          console.error("Error reading submissions file:", e);
        }
      }
      const newSubmission = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        name,
        role,
        company,
        serviceArea,
        branchAnswers,
        email,
        additionalNote,
        formattedText: emailText
      };
      submissions.unshift(newSubmission);
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));

      // Attempt to send via Nodemailer
      let emailSent = false;
      let emailError: string | null = null;

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT || '587';
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || smtpUser || 'no-reply@example.com';

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort, 10),
            secure: smtpPort === '465',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
            from: `"Reach Me System" <${smtpFrom}>`,
            to: "abdullahmalik66@gmail.com",
            subject: subject,
            text: emailText,
            html: `
              <div style="font-family: sans-serif; padding: 24px; line-height: 1.6; max-width: 600px; border: 1px solid #79747E; border-radius: 28px; background-color: #FEF7FF; color: #1D1B20;">
                <h2 style="color: #6750A4; font-family: 'Syne', sans-serif; font-size: 24px; border-bottom: 1px solid #79747E; padding-bottom: 12px; margin-top: 0;">New Reach Me Submission</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; font-weight: bold; width: 35%;">Name:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; font-weight: bold;">Role:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E;">${role}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; font-weight: bold;">Company:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E;">${company}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; font-weight: bold;">Service Area:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; color: #6750A4; font-weight: bold;">${serviceArea}</td>
                  </tr>
                </table>
                
                <h3 style="color: #625B71; margin-top: 24px; font-family: 'Syne', sans-serif;">Detailed Responses:</h3>
                <div style="background-color: #E8DEF8; padding: 16px; border-radius: 16px; margin-bottom: 24px;">
                  <p style="margin: 0 0 12px 0;"><strong>Q1: ${branchAnswers?.[0]?.question || "Question 1"}</strong><br/><span style="color: #1D1B20;">${q1}</span></p>
                  <p style="margin: 0 0 12px 0;"><strong>Q2: ${branchAnswers?.[1]?.question || "Question 2"}</strong><br/><span style="color: #1D1B20;">${q2}</span></p>
                  <p style="margin: 0 0 12px 0;"><strong>Q3: ${branchAnswers?.[2]?.question || "Question 3"}</strong><br/><span style="color: #1D1B20;">${q3}</span></p>
                  <p style="margin: 0 0 12px 0;"><strong>Q4: ${branchAnswers?.[3]?.question || "Question 4"}</strong><br/><span style="color: #1D1B20;">${q4}</span></p>
                  ${branchAnswers?.[4] ? `<p style="margin: 0;"><strong>Q5: ${branchAnswers[4].question}</strong><br/><span style="color: #1D1B20;">${q5}</span></p>` : ''}
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; font-weight: bold; width: 35%;">Contact Email:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #79747E; color: #6750A4; font-weight: bold;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Additional Note:</td>
                    <td style="padding: 8px 0; white-space: pre-wrap;">${additionalNote || "None provided"}</td>
                  </tr>
                </table>
              </div>
            `
          });
          emailSent = true;
          console.log(`Email sent successfully via SMTP for ${name}.`);
        } catch (err) {
          console.error("SMTP delivery failed:", err);
          emailError = err instanceof Error ? err.message : String(err);
        }
      } else {
        console.log("Local development/preview environment: logged response internally (reach_me_submissions.json). Configure SMTP to enable external email forwarding.");
      }

      res.status(200).json({
        success: true,
        savedLocally: true,
        emailSent,
        emailErrorText: emailError,
        message: "Submission processed successfully."
      });

    } catch (error) {
      console.error("POST /api/submit-reach-me error:", error);
      res.status(500).json({ error: "Failed to process submission", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // --- SEO/GEO WORKSPACE CACHING AND ROUTING INTEGRATION ---
  const seoCache: Record<string, { html: string; expiry: number }> = {};
  const CACHE_TTL = 60000; // 1 minute route cache

  // Cache invalidation endpoint
  app.post("/api/seo/invalidate-cache", (req, res) => {
    Object.keys(seoCache).forEach(key => delete seoCache[key]);
    console.log("SEO Control Center: Local cache cleared.");
    res.status(200).json({ success: true, message: "Server-side SEO cache cleared." });
  });

  // ─── Gemini AI-powered SEO content auto-generation ────────────────────────
  app.post("/api/seo/auto-generate", async (req, res) => {
    try {
      const { pageId, pageType, pageTitle, existingContent } = req.body;
      if (!pageId) return res.status(400).json({ error: "pageId is required" });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "GEMINI_API_KEY not configured. Add it to your .env file." });
      }

      const config = await getSEOConfig();
      const host = getBaseHost(config);
      const orgName = config.organisation?.name || "Abdullah Malik";
      const orgDesc = config.organisation?.description || "Independent AI strategy and growth consultant.";
      const pageSEO = (config.pages as any)?.[pageId] || {};

      const contextTitle = pageTitle || pageSEO?.seo?.title ||
        pageId.replace(/[_-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const contextDesc = existingContent || pageSEO?.seo?.description || pageSEO?.geo?.aiSummary || "";
      const pType = pageType || pageSEO?.pageType || "custom";

      // Load site-wide content digest for context mapping and voice consistency
      let siteContext = "";
      try {
        const fullTxtPath = path.resolve(__dirname, "./public/llms-full.txt");
        if (fs.existsSync(fullTxtPath)) {
          siteContext = fs.readFileSync(fullTxtPath, "utf-8");
        } else {
          // fallback to generating it dynamically
          const staticRoutes = [
            "/", "/about", "/case-work", "/my-writings", "/reach-me", "/testimonials", "/my-life-story",
            "/services/ai-transformation", "/services/data-activation-intelligence", 
            "/services/modern-marketing-growth", "/services/ai-maturity-capability-building"
          ];
          let fallbackContent = `## Organization Context\n${orgDesc}\n\n`;
          for (const r of staticRoutes) {
            const md = await generateMarkdownForRoute(r);
            if (md) fallbackContent += `\n---\n# PAGE: ${r}\n\n${md}\n`;
          }
          siteContext = fallbackContent;
        }
      } catch (err) {
        console.error("Failed to read site-wide context:", err);
        siteContext = orgDesc;
      }

      // Compile specific page context (actual page content)
      let pageCopy = "";
      try {
        const pagePath = pageSEO?.path || (pageId === "homepage" ? "/" : `/${pageId.replace(/_/g, "-")}`);
        const mdText = await generateMarkdownForRoute(pagePath);
        if (mdText) {
          pageCopy = mdText;
        }
      } catch (err) {
        console.error("Failed to compile page-level copy context:", err);
      }

      const targetField = req.body.targetField;
      let prompt = "";
      if (targetField) {
        prompt = `You are an expert SEO strategist and consultancy content writer for ${orgName}. ${orgDesc}

Brand voice: professional, precise, consultancy-level clarity. No marketing fluff. Specific, structured, actionable content. Natural keyword use — never spammy. Tone: a trusted senior consultant writing for sophisticated business decision-makers.

Generate ONLY the value for the field "${targetField}" for this page. Return ONLY valid JSON with no markdown code fences, structured like:
{
  "${targetField}": "your generated value"
}

Site-wide Context (use for alignment, context matching, and styling reference):
<SITE_CONTEXT>
${siteContext}
</SITE_CONTEXT>

Page Content Context (use this actual page content as the source of truth to write the SEO/GEO meta tags):
<PAGE_CONTENT>
${pageCopy || "Not yet configured"}
</PAGE_CONTENT>

Page context details:
- Page ID: ${pageId}
- Page type: ${pType}
- Page title hint: ${contextTitle}
- Existing content: ${contextDesc || "Not yet configured"}
- Site URL: ${host}
- Organisation: ${orgName}

Field descriptions:
- seoTitle: 50-60 chars, includes primary keyword, no keyword stuffing
- metaDescription: 120-160 chars, specific and action-oriented, includes primary keyword once
- primaryKeyword: single most important search keyword for this page
- aiSummary: 2-3 factual sentences describing what this page covers and why it matters to AI agents and answer engines
- pagePurpose: 1 sentence: what specific problem or need does this page solve
- llmsDescription: 1 factual line for llms.txt directory, max 25 words, describes what the page covers
- markdownTitleOverride: clean title without brand suffix, suitable for AI-readable markdown heading
- markdownSummary: 1-2 sentence factual summary for AI agent endpoints
- curatedExplanation: FAQ in markdown format (### Q: Question?\\nA: Answer.) — only for service/about pages; empty string for others
`;
      } else {
        prompt = `You are an expert SEO strategist and consultancy content writer for ${orgName}. ${orgDesc}

Brand voice: professional, precise, consultancy-level clarity. No marketing fluff. Specific, structured, actionable content. Natural keyword use — never spammy. Tone: a trusted senior consultant writing for sophisticated business decision-makers.

Generate complete SEO and GEO content for this page. Return ONLY valid JSON with no markdown code fences.

Site-wide Context (use for alignment, context matching, and styling reference):
<SITE_CONTEXT>
${siteContext}
</SITE_CONTEXT>

Page Content Context (use this actual page content as the source of truth to write the SEO/GEO meta tags):
<PAGE_CONTENT>
${pageCopy || "Not yet configured"}
</PAGE_CONTENT>

Page context details:
- Page ID: ${pageId}
- Page type: ${pType}
- Page title hint: ${contextTitle}
- Existing content: ${contextDesc || "Not yet configured"}
- Site URL: ${host}
- Organisation: ${orgName}

Content alignment by page type:
- homepage: positioning + primary value proposition + service overview
- service: solution + methodology + specific outcomes + who it is for
- blog_post: core insight + key takeaways + practitioner value
- case_study: problem statement → approach → measurable results
- about/reach_me/testimonials: credibility + trust + clear action

Return JSON with EXACTLY these fields:
{
  "seoTitle": "50-60 chars, includes primary keyword, no keyword stuffing",
  "metaDescription": "120-160 chars, specific and action-oriented, includes primary keyword once",
  "primaryKeyword": "single most important search keyword for this page",
  "secondaryKeywords": ["keyword2", "keyword3", "keyword4"],
  "aiSummary": "2-3 factual sentences describing what this page covers and why it matters to AI agents and answer engines",
  "pagePurpose": "1 sentence: what specific problem or need does this page solve",
  "keyEntities": ["entity1", "entity2", "entity3", "entity4"],
  "markdownCapabilities": ["capability 1", "capability 2", "capability 3", "capability 4"],
  "markdownOutcomes": ["outcome 1", "outcome 2", "outcome 3"],
  "curatedExplanation": "FAQ in markdown format (### Q: Question?\\nA: Answer.) — only for service/about pages; empty string for others",
  "markdownTitle": "clean title without brand suffix, suitable for AI-readable markdown heading",
  "markdownSummary": "1-2 sentence factual summary for AI agent endpoints",
  "llmsDescription": "1 factual line for llms.txt directory, max 25 words, describes what the page covers",
  "schemaType": "Organization or WebPage or Service or Article"
}`;
      }

      const { getAICompletion } = await import("./src/lib/ai");
      const rawText = await getAICompletion(prompt, {
        temperature: 0.85,
        jsonMode: true
      });

      let parsed: any;
      try {
        const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse Gemini JSON response:", rawText.substring(0, 300));
        return res.status(500).json({ error: "AI returned invalid JSON — please retry.", raw: rawText.substring(0, 200) });
      }

      // Enforce SEO length constraints
      if (parsed.seoTitle?.length > 65) parsed.seoTitle = parsed.seoTitle.substring(0, 62) + "...";
      if (parsed.metaDescription?.length > 165) parsed.metaDescription = parsed.metaDescription.substring(0, 157) + "...";

      console.log(`[Auto-Generate] Generated content for page: ${pageId}`);
      res.status(200).json({ success: true, generated: parsed });
    } catch (err) {
      console.error("Auto-generate API error:", err);
      res.status(500).json({ error: "Content generation failed", details: err instanceof Error ? err.message : String(err) });
    }
  });
  // ──────────────────────────────────────────────────────────────────────────

  // Serve Dynamic Agent-Readable Markdown (.md) or Content-Negotiated requests
  app.get("*", async (req, res, next) => {
    const url = req.path;
    const isMd = url.endsWith(".md");
    const acceptsMd = req.headers.accept?.includes("text/markdown") || req.headers.accept?.includes("text/x-markdown");

    if (isMd || acceptsMd) {
      try {
        const mdText = await generateMarkdownForRoute(url);
        if (mdText !== null) {
          res.header("Content-Type", "text/markdown; charset=utf-8");
          res.header("Cache-Control", "public, max-age=60");
          return res.send(mdText);
        }
      } catch (err) {
        console.error("Error generating agent markdown representation:", err);
      }
    }
    next();
  });

  // Dynamic robots.txt serving (with Sitemap deduplication)
  app.get("/robots.txt", async (req, res) => {
    try {
      const config = await getSEOConfig();
      const host = getBaseHost(config);
      // Strip any existing Sitemap directives and re-inject exactly one canonical one
      const rawContent = config.controls?.robotsTxt?.content || "User-agent: *\nAllow: /";
      const lines = rawContent.split("\n").filter((line: string) => !line.trim().toLowerCase().startsWith("sitemap:"));
      const finalContent = lines.join("\n").trimEnd() + `\nSitemap: ${host}/sitemap.xml`;
      res.header("Content-Type", "text/plain").send(finalContent);
    } catch (e) {
      console.error("Failed to serve robots.txt dynamically:", e);
      res.header("Content-Type", "text/plain").send("User-agent: *\nAllow: /\nSitemap: https://abdullahmalikconsultancy.web.app/sitemap.xml");
    }
  });

  // ─── Canonical fallbacks for rich markdown when GEO fields not yet configured ───
  const CANONICAL_PAGE_FALLBACKS: Record<string, { summary: string; purpose: string; capabilities: string[]; outcomes: string[] }> = {
    homepage: {
      summary: "Abdullah Malik is an independent AI strategy and growth consultant helping organisations engineer sustainable competitive advantage through AI systems, data activation, and performance architecture.",
      purpose: "Serve as the primary entry point to Abdullah Malik's consultancy, presenting core service areas and positioning for organisations exploring AI-driven growth.",
      capabilities: ["AI strategy and roadmap advisory", "Growth architecture and performance marketing", "Data activation and intelligence systems", "AI maturity and capability building"],
      outcomes: ["Clear understanding of available consultancy services", "Direct path to relevant service or case study", "Confidence in the consultant's expertise and track record"]
    },
    about: {
      summary: "Abdullah Malik is an independent consultant with experience bridging AI systems, digital growth, and performance marketing across European and global markets.",
      purpose: "Establish credibility and context for Abdullah Malik's professional background, methodologies, and consulting philosophy.",
      capabilities: ["AI transformation strategy", "Growth systems architecture", "Performance marketing leadership", "Cross-functional team enablement"],
      outcomes: ["Clear picture of consultant expertise and industry focus", "Trust in the advisory relationship", "Alignment on consulting philosophy and approach"]
    },
    case_work: {
      summary: "A curated portfolio of strategic client engagements with documented outcomes, execution frameworks, and measurable business results.",
      purpose: "Demonstrate the real-world impact of Abdullah Malik's consultancy work through concrete case evidence and outcome metrics.",
      capabilities: ["AI implementation case studies", "Growth architecture examples", "Data-driven campaign results", "Organisational change documentation"],
      outcomes: ["Evidence-based confidence in consulting capabilities", "Relevant precedents for similar challenges", "Quantified business impact from past engagements"]
    },
    my_writings: {
      summary: "A collection of expert articles, strategic insights, and commentary on AI strategy, digital transformation, growth systems, and modern marketing.",
      purpose: "Share knowledge, establish thought leadership, and provide actionable frameworks for professionals navigating AI transformation and growth challenges.",
      capabilities: ["AI strategy analysis and frameworks", "Growth and marketing system design", "Digital transformation playbooks", "Case-based insight articles"],
      outcomes: ["Actionable insights for practitioners", "Thought leadership on AI and growth topics", "Reference material for strategic planning"]
    },
    reach_me: {
      summary: "Contact and project enquiry page for Malik Consultancy — the starting point for strategic engagements in AI transformation, data intelligence, and growth architecture.",
      purpose: "Enable qualified organisations to initiate an advisory conversation and assess alignment with Abdullah Malik's consulting focus areas.",
      capabilities: ["Service area qualification", "Project scoping initiation", "Direct contact routing"],
      outcomes: ["Clear channel to start an engagement", "Qualification of project fit", "Response from the consultant directly"]
    },
    testimonials: {
      summary: "Professional testimonials and endorsements from clients, colleagues, and collaborators who have worked with Abdullah Malik across AI, marketing, and strategy engagements.",
      purpose: "Provide social proof and third-party validation of Abdullah Malik's consulting expertise, reliability, and delivery quality.",
      capabilities: ["Client success validation", "Peer professional endorsements", "Cross-sector credibility evidence"],
      outcomes: ["Increased confidence in engaging the consultant", "Validated track record from real collaborators", "Reduced due diligence friction"]
    },
    my_life_story: {
      summary: "The personal background, career trajectory, and philosophical foundations that shaped Abdullah Malik's approach to AI strategy, growth architecture, and independent consulting.",
      purpose: "Build authentic human connection and context around the consultant's journey, values, and what drives the quality of their advisory work.",
      capabilities: ["Personal narrative and career timeline", "Philosophical foundations of consulting approach", "Cross-cultural and cross-market experience"],
      outcomes: ["Deeper trust and authentic connection", "Understanding of the consultant's motivations", "Context for long-term advisory relationships"]
    },
    "services_ai-transformation": {
      summary: "Strategic advisory service focused on designing and implementing end-to-end AI transformation roadmaps for organisations ready to move from experimentation to production-grade AI systems.",
      purpose: "Help organisations develop a structured, governed, and executable AI strategy that aligns with business objectives and scales with organisational maturity.",
      capabilities: ["AI opportunity assessment and prioritisation", "Roadmap design and governance frameworks", "Model selection and vendor evaluation", "Workflow automation integration", "Production AI system architecture", "Change management for AI adoption"],
      outcomes: ["Clear AI investment roadmap with business case", "Reduced risk of AI initiative failure", "Accelerated time from prototype to production", "Measurable ROI from AI implementations"]
    },
    "services_data-activation-intelligence": {
      summary: "End-to-end data strategy and intelligence advisory — from data architecture design to predictive analytics pipelines and actionable business intelligence capability.",
      purpose: "Enable organisations to transform raw data assets into structured intelligence systems that power real-time decisions, forecasting, and performance optimisation.",
      capabilities: ["Data architecture and infrastructure design", "Customer data platform strategy", "Predictive analytics pipeline development", "Business intelligence dashboard architecture", "Data quality and governance frameworks"],
      outcomes: ["Actionable intelligence from existing data assets", "Faster, data-driven business decisions", "Reduced cost of insight generation", "Foundation for AI model training pipelines"]
    },
    "services_modern-marketing-growth": {
      summary: "Omnichannel growth architecture and performance marketing advisory — designing scalable acquisition, conversion, and retention systems driven by data and automation.",
      purpose: "Help organisations build durable, measurement-driven growth engines that reduce dependency on ad spend volatility and maximise return on marketing investment.",
      capabilities: ["Growth model architecture and funnel design", "Omnichannel campaign strategy", "Conversion rate optimisation frameworks", "Marketing automation and personalisation", "Performance analytics and attribution"],
      outcomes: ["Scalable and repeatable growth system", "Improved customer acquisition cost efficiency", "Higher conversion rates across key funnels", "Data-driven marketing investment decisions"]
    },
    "services_ai-maturity-capability-building": {
      summary: "Structured AI maturity assessment and capability building service — helping organisations understand where they are on the AI adoption curve and build internal capacity to advance.",
      purpose: "Equip organisations with the frameworks, skills, and processes needed to independently sustain and scale AI capabilities beyond the initial consultancy engagement.",
      capabilities: ["AI maturity assessment and benchmarking", "Custom AI upskilling programme design", "Internal AI centre of excellence setup", "Engineering standards and MLOps frameworks", "Responsible AI governance and ethics"],
      outcomes: ["Clear view of current AI maturity level", "Structured roadmap to next maturity stage", "Reduced dependency on external AI expertise over time", "Stronger internal culture of AI-driven decision making"]
    }
  };

  // Strip HTML tags from content strings (for blog/case study markdown)
  function stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  // Helper: dynamic Markdown-for-agents compiler (7-section rich builder)
  async function generateMarkdownForRoute(pathname: string): Promise<string | null> {
    try {
      const config = await getSEOConfig();
      const published = await getPublishedContent();
      const host = getBaseHost(config);
      const orgName = config.organisation?.name || "Abdullah Malik";

      if (config.controls?.markdownAgents?.enabled === false) return null;

      let pageId = "";
      let contentType = "pages";
      let cmsItem: any = null;
      const matchPath = pathname.replace(/\.md$/, "");

      const staticRoutes: Record<string, { id: string; title: string; type: string }> = {
        "/": { id: "homepage", title: "Abdullah Malik — AI Strategy & Growth Consultant", type: "pages" },
        "/about": { id: "about", title: "About Abdullah Malik", type: "pages" },
        "/case-work": { id: "case_work", title: "Case Work Portfolio", type: "pages" },
        "/my-writings": { id: "my_writings", title: "Writings & Insights", type: "pages" },
        "/reach-me": { id: "reach_me", title: "Contact Malik Consultancy", type: "pages" },
        "/testimonials": { id: "testimonials", title: "Client Testimonials", type: "pages" },
        "/my-life-story": { id: "my_life_story", title: "My Story", type: "pages" },
        "/services/ai-transformation": { id: "services_ai-transformation", title: "AI Transformation Strategy", type: "services" },
        "/services/data-activation-intelligence": { id: "services_data-activation-intelligence", title: "Data Activation & Intelligence", type: "services" },
        "/services/modern-marketing-growth": { id: "services_modern-marketing-growth", title: "Modern Marketing & Growth", type: "services" },
        "/services/ai-maturity-capability-building": { id: "services_ai-maturity-capability-building", title: "AI Maturity & Capability Building", type: "services" }
      };

      const matchedStatic = staticRoutes[matchPath];
      if (matchedStatic) {
        pageId = matchedStatic.id;
        contentType = matchedStatic.type;
      } else if (matchPath.startsWith("/writings/")) {
        contentType = "blog";
        const slug = matchPath.replace("/writings/", "");
        const item = published.find((x: any) => x.contentType === "blog" && (x.slug === slug || x.id === slug));
        if (item) { pageId = `blog_${item.id}`; cmsItem = item; }
      } else if (matchPath.startsWith("/case-study/")) {
        contentType = "case_study";
        const slug = matchPath.replace("/case-study/", "");
        const item = published.find((x: any) => x.contentType === "case_study" && (x.slug === slug || x.id === slug));
        if (item) { pageId = `case_study_${item.id}`; cmsItem = item; }
      }

      if (!pageId) return null;

      const supportedTypes = config.controls?.markdownAgents?.supportedContentTypes || { pages: true, services: true, blog: true, case_study: true };
      const configKey = contentType === "blog" ? "blog" : contentType === "case_study" ? "case_study" : contentType === "services" ? "services" : "pages";
      if (!supportedTypes[configKey as keyof typeof supportedTypes]) return null;

      const pageSEO = config.pages?.[pageId];
      if (pageSEO?.geo?.markdownEnabled === false) return null;

      const fallback = CANONICAL_PAGE_FALLBACKS[pageId] || null;
      const defaultTitle = matchedStatic?.title || cmsItem?.title || pageId;

      const title = pageSEO?.geo?.markdownTitleOverride || pageSEO?.seo?.title || defaultTitle;
      const summary = pageSEO?.geo?.markdownSummary || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || fallback?.summary || "";
      const purpose = pageSEO?.geo?.pagePurpose || fallback?.purpose || "";
      const includeEntities = pageSEO?.geo?.markdownIncludeEntities !== false;
      const includeFaq = pageSEO?.geo?.markdownIncludeFaq !== false;

      // Capabilities: new markdownCapabilities field || keyEntities || fallback
      const capabilities: string[] =
        (pageSEO?.geo as any)?.markdownCapabilities?.length > 0 ? (pageSEO.geo as any).markdownCapabilities :
        (includeEntities && pageSEO?.geo?.keyEntities?.length > 0 ? pageSEO.geo.keyEntities : null) ||
        fallback?.capabilities || [];

      // Outcomes: new markdownOutcomes field || fallback
      const outcomes: string[] = (pageSEO?.geo as any)?.markdownOutcomes || fallback?.outcomes || [];

      // --- BUILD RICH 7-SECTION MARKDOWN ---
      let md = `# ${title}\n\n`;

      // Summary blockquote
      if (summary && summary.length > 10) md += `> ${summary}\n\n`;

      // 1. Purpose
      if (purpose && purpose.length > 10) md += `## Purpose\n\n${purpose}\n\n`;

      // 2. Key Content / Capabilities
      if (capabilities.length > 0) {
        md += `## Key Content / Capabilities\n\n`;
        capabilities.forEach((cap: string) => { md += `- ${cap}\n`; });
        md += `\n`;
      }

      // 3. Outcomes / Value
      if (outcomes.length > 0) {
        md += `## Outcomes / Value\n\n`;
        outcomes.forEach((out: string) => { md += `- ${out}\n`; });
        md += `\n`;
      }

      // 4. Content section
      if (cmsItem) {
        const contentBody = cmsItem.content ? stripHtml(cmsItem.content) : (cmsItem.excerpt || "");
        if (contentBody && contentBody.length > 10) md += `## Content\n\n${contentBody}\n\n`;
      } else {
        const aiBody = pageSEO?.geo?.aiSummary;
        if (aiBody && aiBody.length > 10 && aiBody !== summary) md += `## Content\n\n${aiBody}\n\n`;
      }

      // 5. FAQ section
      if (includeFaq && pageSEO?.geo?.curatedExplanation && pageSEO.geo.curatedExplanation.length > 10) {
        md += `## FAQ\n\n${pageSEO.geo.curatedExplanation}\n\n`;
      }

      // 6. References
      md += `## References\n\n`;
      md += `- Canonical: [${host}${matchPath}](${host}${matchPath})\n`;
      md += `- Publisher: [${orgName}](${host})\n`;
      if (cmsItem?.authorName) md += `- Author: ${cmsItem.authorName}\n`;

      return md;
    } catch (e) {
      console.error("Markdown generation compiler error:", e);
      return null;
    }
  }

  // Helper: dynamic sitemap generator
  async function generateSitemapXml(): Promise<string> {
    const config = await getSEOConfig();
    const published = await getPublishedContent();
    const host = getBaseHost(config);
    
    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];
    
    // 1. Static & Service page definitions
    const staticPages = [
      { path: '/', pageType: 'homepage', priority: '1.0', changefreq: 'daily' },
      { path: '/about', pageType: 'about', priority: '0.8', changefreq: 'weekly' },
      { path: '/case-work', pageType: 'case_work', priority: '0.8', changefreq: 'weekly' },
      { path: '/my-writings', pageType: 'my_writings', priority: '0.8', changefreq: 'weekly' },
      { path: '/reach-me', pageType: 'reach_me', priority: '0.7', changefreq: 'monthly' },
      { path: '/testimonials', pageType: 'testimonials', priority: '0.7', changefreq: 'weekly' },
      { path: '/my-life-story', pageType: 'my_life_story', priority: '0.6', changefreq: 'monthly' },
      { path: '/services/ai-transformation', pageType: 'service', priority: '0.9', changefreq: 'weekly' },
      { path: '/services/data-activation-intelligence', pageType: 'service', priority: '0.9', changefreq: 'weekly' },
      { path: '/services/modern-marketing-growth', pageType: 'service', priority: '0.9', changefreq: 'weekly' },
      { path: '/services/ai-maturity-capability-building', pageType: 'service', priority: '0.9', changefreq: 'weekly' }
    ];

    for (const page of staticPages) {
      const pageId = page.pageType === 'homepage' ? 'homepage' : page.path.replace(/^\//, '').replace(/\//g, '_');
      const pageSEO = config.pages?.[pageId];
      
      const isIndex = pageSEO?.seo?.robots ? pageSEO.seo.robots.index : true;
      const sitemapInclusion = pageSEO?.technical?.includeInSitemap !== false;
      
      if (isIndex && sitemapInclusion) {
        urls.push({
          loc: `${host}${page.path}`,
          lastmod: pageSEO?.updatedAt || new Date().toISOString(),
          changefreq: page.changefreq,
          priority: page.priority
        });
      }
    }

    // 2. Dynamic Blog posts sitemap mapping
    const excludeBlog = config.controls?.sitemap?.excludePageTypes?.blog === true;
    if (!excludeBlog) {
      const blogPosts = published.filter(item => item.contentType === 'blog');
      for (const post of blogPosts) {
        const pageId = `blog_${post.id}`;
        const pageSEO = config.pages?.[pageId];
        const isIndex = pageSEO?.seo?.robots ? pageSEO.seo.robots.index : true;
        const sitemapInclusion = pageSEO?.technical?.includeInSitemap !== false;
        
        if (isIndex && sitemapInclusion) {
          urls.push({
            loc: `${host}/writings/${post.slug || post.id}`,
            lastmod: post.updatedAt || post.createdAt || new Date().toISOString(),
            changefreq: 'weekly',
            priority: '0.7'
          });
        }
      }
    }

    // 3. Dynamic Case studies sitemap mapping
    const excludeCase = config.controls?.sitemap?.excludePageTypes?.case_study === true;
    if (!excludeCase) {
      const studies = published.filter(item => item.contentType === 'case_study');
      for (const study of studies) {
        const pageId = `case_study_${study.id}`;
        const pageSEO = config.pages?.[pageId];
        const isIndex = pageSEO?.seo?.robots ? pageSEO.seo.robots.index : true;
        const sitemapInclusion = pageSEO?.technical?.includeInSitemap !== false;
        
        if (isIndex && sitemapInclusion) {
          urls.push({
            loc: `${host}/case-study/${study.slug || study.id}`,
            lastmod: study.updatedAt || study.createdAt || new Date().toISOString(),
            changefreq: 'weekly',
            priority: '0.8'
          });
        }
      }
    }

    // Compile dynamic XML layout
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod.split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    xml += '</urlset>';
    return xml;
  }

  // Serve Sitemap XML
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const xml = await generateSitemapXml();
      res.header("Content-Type", "application/xml").send(xml);
    } catch (e) {
      console.error("Failed to compile dynamic sitemap.xml:", e);
      res.status(500).send("Failed to generate sitemap.");
    }
  });

  // Helper: dynamic llms.txt generator
  async function generateLlmsTxt(): Promise<string> {
    const config = await getSEOConfig();
    const published = await getPublishedContent();
    const host = getBaseHost(config);

    // Canonical fallback descriptions for llms.txt — factual, no filler
    const CANONICAL_DESCRIPTIONS: Record<string, string> = {
      homepage: "Abdullah Malik's consultancy hub covering AI strategy, growth architecture, and digital transformation advisory services.",
      about: "Background, professional expertise, and consulting philosophy of Abdullah Malik as an independent AI and growth strategist.",
      case_work: "Portfolio of executed client engagements with documented outcomes, pipeline metrics, and strategy execution results.",
      my_writings: "Expert articles and insights on AI strategy, growth systems, digital transformation, and modern marketing practices.",
      reach_me: "Project enquiry and contact page for Malik Consultancy strategic advisory and AI transformation engagements.",
      testimonials: "Professional endorsements and client testimonials from collaborators across growth, AI, and consulting projects.",
      my_life_story: "Personal background, career journey, and the philosophy driving Abdullah Malik's independent consultancy practice.",
      "services_ai-transformation": "Strategic advisory on AI roadmap design, model governance, workflow automation, and production AI system scaling.",
      "services_data-activation-intelligence": "End-to-end data structuring, predictive analytics pipeline design, and business intelligence capability building.",
      "services_modern-marketing-growth": "Omnichannel growth model design, conversion funnel optimisation, and performance marketing architecture.",
      "services_ai-maturity-capability-building": "AI maturity assessment, team upskilling programmes, and engineering standards for sustainable AI adoption."
    };

    const intro = config.controls?.llms?.intro || "This directory contains information about Malik Consultancy — structured for AI models, LLM agents, and semantic answer engines.";
    const orgName = config.organisation?.name || "Malik Consultancy";
    
    let markdown = `# ${orgName} — AI Directory\n\n`;
    markdown += `> ${intro}\n\n`;
    markdown += `Looking for the full website content in a single file? See our [Consolidated Markdown Digest (llms-full.txt)](${host}/llms-full.txt).\n\n`;
    
    const allPages: Array<{ loc: string; title: string; desc: string; priority: number; category: string }> = [];
    
    // Core pages
    const staticPages = [
      { path: '/', pageId: 'homepage', category: 'Core Pages', defaultTitle: 'Abdullah Malik — AI Strategy & Growth Consultant' },
      { path: '/about', pageId: 'about', category: 'Core Pages', defaultTitle: 'About Abdullah Malik' },
      { path: '/case-work', pageId: 'case_work', category: 'Core Pages', defaultTitle: 'Case Work Portfolio' },
      { path: '/my-writings', pageId: 'my_writings', category: 'Core Pages', defaultTitle: 'Writings & Insights' },
      { path: '/reach-me', pageId: 'reach_me', category: 'Core Pages', defaultTitle: 'Contact Malik Consultancy' },
      { path: '/testimonials', pageId: 'testimonials', category: 'Core Pages', defaultTitle: 'Client Testimonials' },
      { path: '/my-life-story', pageId: 'my_life_story', category: 'Core Pages', defaultTitle: 'My Story' }
    ];
    
    for (const page of staticPages) {
      const pageSEO = config.pages?.[page.pageId];
      if (pageSEO?.geo?.includeInLlms !== false) {
        const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
        const linkPath = isMdLink ? `${page.path === '/' ? '' : page.path}.md` : page.path;
        allPages.push({
          loc: `${host}${linkPath}`,
          title: pageSEO?.geo?.llmsTitle || pageSEO?.seo?.title || page.defaultTitle,
          desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || CANONICAL_DESCRIPTIONS[page.pageId] || orgName,
          priority: pageSEO?.geo?.aiVisiblePriority ?? 0.8,
          category: page.category
        });
      }
    }

    // Service pages
    const servicePages = [
      { path: '/services/ai-transformation', pageId: 'services_ai-transformation', defaultTitle: 'AI Transformation Strategy' },
      { path: '/services/data-activation-intelligence', pageId: 'services_data-activation-intelligence', defaultTitle: 'Data Activation & Intelligence' },
      { path: '/services/modern-marketing-growth', pageId: 'services_modern-marketing-growth', defaultTitle: 'Modern Marketing & Growth' },
      { path: '/services/ai-maturity-capability-building', pageId: 'services_ai-maturity-capability-building', defaultTitle: 'AI Maturity & Capability Building' }
    ];
    
    for (const page of servicePages) {
      const pageSEO = config.pages?.[page.pageId];
      if (pageSEO?.geo?.includeInLlms !== false) {
        const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
        const linkPath = isMdLink ? `${page.path}.md` : page.path;
        allPages.push({
          loc: `${host}${linkPath}`,
          title: pageSEO?.geo?.llmsTitle || pageSEO?.seo?.title || page.defaultTitle,
          desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || pageSEO?.seo?.description || CANONICAL_DESCRIPTIONS[page.pageId] || "Advisory service page.",
          priority: pageSEO?.geo?.aiVisiblePriority ?? 0.9,
          category: "Services"
        });
      }
    }

    // Dynamic Blog pages
    const blogPosts = published.filter((item: any) => item.contentType === 'blog');
    for (const post of blogPosts) {
      const pageId = `blog_${post.id}`;
      const pageSEO = config.pages?.[pageId];
      if (pageSEO?.geo?.includeInLlms === true) {
        const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
        const linkPath = isMdLink ? `/writings/${post.slug || post.id}.md` : `/writings/${post.slug || post.id}`;
        allPages.push({
          loc: `${host}${linkPath}`,
          title: pageSEO?.geo?.llmsTitle || post.title || "Insight Article",
          desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || post.excerpt || "Insight and analysis from Abdullah Malik.",
          priority: pageSEO?.geo?.aiVisiblePriority ?? 0.7,
          category: "Insights"
        });
      }
    }

    // Dynamic Case studies
    const studies = published.filter((item: any) => item.contentType === 'case_study');
    for (const study of studies) {
      const pageId = `case_study_${study.id}`;
      const pageSEO = config.pages?.[pageId];
      if (pageSEO?.geo?.includeInLlms === true) {
        const isMdLink = pageSEO?.geo?.markdownLlmsLinkBehaviour === 'md_link';
        const linkPath = isMdLink ? `/case-study/${study.slug || study.id}.md` : `/case-study/${study.slug || study.id}`;
        allPages.push({
          loc: `${host}${linkPath}`,
          title: pageSEO?.geo?.llmsTitle || study.title || "Case Study",
          desc: pageSEO?.geo?.llmsDescription || pageSEO?.geo?.aiSummary || study.excerpt || "Strategic engagement with measurable business outcomes.",
          priority: pageSEO?.geo?.aiVisiblePriority ?? 0.8,
          category: "Case Studies"
        });
      }
    }

    // Sort descending by priority
    allPages.sort((a, b) => b.priority - a.priority);

    // Group & format to markdown list
    const categories = ["Core Pages", "Services", "Insights", "Case Studies"];
    for (const cat of categories) {
      const catPages = allPages.filter(p => p.category === cat);
      if (catPages.length > 0) {
        markdown += `## ${cat}\n\n`;
        for (const p of catPages) {
          markdown += `- [${p.title}](${p.loc}): ${p.desc}\n`;
        }
        markdown += `\n`;
      }
    }

    return markdown;
  }

  // Serve llms.txt
  app.get("/llms.txt", async (req, res) => {
    try {
      const markdown = await generateLlmsTxt();
      res.header("Content-Type", "text/plain").send(markdown);
    } catch (e) {
      console.error("Failed to compile dynamic llms.txt:", e);
      res.status(500).send("Failed to generate llms.txt.");
    }
  });

  // Serve llms-full.txt (Consolidated Markdown digest of all pages)
  app.get("/llms-full.txt", async (req, res) => {
    try {
      const config = await getSEOConfig();
      const orgName = config.organisation?.name || "Abdullah Malik";
      const orgDesc = config.organisation?.description || "Independent AI strategy and growth consultant.";

      let fullContent = `# ${orgName} — Full Website Content Digest\n\n`;
      fullContent += `> Consolidated content digest structured for artificial intelligence models, LLM agents, and semantic answer engines.\n\n`;
      fullContent += `## Organization Context\n${orgDesc}\n\n`;

      const staticRoutes = [
        "/",
        "/about",
        "/case-work",
        "/my-writings",
        "/reach-me",
        "/testimonials",
        "/my-life-story",
        "/services/ai-transformation",
        "/services/data-activation-intelligence",
        "/services/modern-marketing-growth",
        "/services/ai-maturity-capability-building"
      ];

      for (const route of staticRoutes) {
        const md = await generateMarkdownForRoute(route);
        if (md) {
          fullContent += `\n---\n# PAGE: ${route}\n\n${md}\n`;
        }
      }

      // Append blogs and case studies dynamically
      try {
        const published = await getPublishedContent();
        for (const item of published) {
          const route = item.contentType === "blog" ? `/writings/${item.slug || item.id}` : `/case-study/${item.slug || item.id}`;
          const md = await generateMarkdownForRoute(route);
          if (md) {
            fullContent += `\n---\n# PAGE: ${route}\n\n${md}\n`;
          }
        }
      } catch (err) {
        console.error("Error reading CMS content for llms-full.txt:", err);
      }

      res.header("Content-Type", "text/plain").send(fullContent);
    } catch (e) {
      console.error("Failed to compile dynamic llms-full.txt:", e);
      res.status(500).send("Failed to generate llms-full.txt.");
    }
  });


  // Early Server-Side Injection HTML Pre-Renderer
  async function injectSeoMetadata(html: string, pathname: string): Promise<string> {
    try {
      const meta = await resolveMetadata(pathname);
      const config = await getSEOConfig();

      let tags = `
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <link rel="canonical" href="${meta.canonical}" />
  <meta name="robots" content="${meta.robots.index ? 'index' : 'noindex'},${meta.robots.follow ? 'follow' : 'nofollow'}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${meta.ogTitle}" />
  <meta property="og:description" content="${meta.ogDescription}" />
  <meta property="og:image" content="${meta.ogImage}" />
  <meta property="og:url" content="${meta.ogUrl}" />
  <meta property="og:type" content="${meta.ogType}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="${meta.twitterCard}" />
  <meta name="twitter:title" content="${meta.twitterTitle}" />
  <meta name="twitter:description" content="${meta.twitterDescription}" />
  <meta name="twitter:image" content="${meta.twitterImage}" />
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="${meta.faviconUrl}" />
  <link rel="icon" type="image/png" sizes="16x16" href="${meta.favicon16Url}" />
  <link rel="icon" type="image/png" sizes="32x32" href="${meta.favicon32Url}" />
  <link rel="icon" type="image/png" sizes="192x192" href="${meta.icon192Url}" />
  <link rel="icon" type="image/png" sizes="512x512" href="${meta.icon512Url}" />
  <link rel="apple-touch-icon" sizes="180x180" href="${meta.appleTouchIconUrl}" />
  <meta name="theme-color" content="${meta.themeColor}" />
  
  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">${meta.schemaJsonLd}</script>
`;

      // Inject Verification tags
      const verification = config.integrations?.verification;
      if (verification) {
        if (verification.google) {
          tags += `\n  <meta name="google-site-verification" content="${verification.google}" />`;
        }
        if (verification.bing) {
          tags += `\n  <meta name="msvalidate.01" content="${verification.bing}" />`;
        }
        if (verification.pinterest) {
          tags += `\n  <meta name="p:domain_verify" content="${verification.pinterest}" />`;
        }
        if (verification.custom) {
          for (const item of verification.custom) {
            if (item.name && item.value) {
              tags += `\n  <meta name="${item.name}" content="${item.value}" />`;
            }
          }
        }
      }

      // Inject Analytics Scripts dynamically
      const tracking = config.integrations?.tracking;
      if (tracking) {
        // GTM Head
        if (tracking.googleTagManager?.enabled && tracking.googleTagManager?.id) {
          tags += `
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${tracking.googleTagManager.id}');</script>
  <!-- End Google Tag Manager -->`;
        }

        // GA Tracking Head
        if (tracking.googleAnalytics?.enabled && tracking.googleAnalytics?.id) {
          tags += `
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalytics.id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${tracking.googleAnalytics.id}');
  </script>
  <!-- End Google Analytics -->`;
        }

        // Meta Pixel Head
        if (tracking.metaPixel?.enabled && tracking.metaPixel?.id) {
          tags += `
  <!-- Meta Pixel Code -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${tracking.metaPixel.id}');
    fbq('track', 'PageView');
  </script>
  <!-- End Meta Pixel Code -->`;
        }

        // Custom scripts head zone
        if (tracking.customScripts) {
          for (const scr of tracking.customScripts) {
            if (scr.enabled && scr.placement === 'head' && scr.code) {
              tags += `\n  <!-- Custom Script: ${scr.name} -->\n  ${scr.code}\n`;
            }
          }
        }
      }

      // Inject tags right before </head>
      if (html.includes('</head>')) {
        return html.replace('</head>', `${tags}\n</head>`);
      }
      return html;
    } catch (e) {
      console.error("Failed to compile head tags:", e);
      return html;
    }
  }

  function injectBodyScripts(html: string, config: any): string {
    let bodyTags = "";
    const tracking = config.integrations?.tracking;
    if (tracking) {
      if (tracking.googleTagManager?.enabled && tracking.googleTagManager?.id) {
        bodyTags += `
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${tracking.googleTagManager.id}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;
      }
      if (tracking.metaPixel?.enabled && tracking.metaPixel?.id) {
        bodyTags += `
  <!-- Meta Pixel NoScript -->
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${tracking.metaPixel.id}&ev=PageView&noscript=1"
  /></noscript>`;
      }
      if (tracking.customScripts) {
        for (const scr of tracking.customScripts) {
          if (scr.enabled && scr.placement === 'noscript' && scr.code) {
            bodyTags += `\n  ${scr.code}\n`;
          }
        }
      }
    }

    if (bodyTags) {
      if (html.includes('<body>')) {
        return html.replace('<body>', `<body>\n${bodyTags}`);
      } else if (html.includes('<body ')) {
        const idx = html.indexOf('<body');
        const endIdx = html.indexOf('>', idx);
        if (endIdx !== -1) {
          return html.substring(0, endIdx + 1) + `\n${bodyTags}` + html.substring(endIdx + 1);
        }
      }
    }
    return html;
  }

  // Vite configuration & Dynamic Page serving
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Important! Fallthrough allows server-side template resolution
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // Exclude automatic index file serving
  }

  // Single wildcard route handler for HTML page delivery
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    // Fallthrough for static assets, files, or api routes
    if (url.includes('.') || url.startsWith('/api')) {
      return next();
    }

    try {
      let template = "";
      if (process.env.NODE_ENV !== "production") {
        template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        if (vite) {
          template = await vite.transformIndexHtml(url, template);
        }
      } else {
        template = fs.readFileSync(path.resolve(process.cwd(), "dist/index.html"), "utf-8");
      }

      // Route Caching check
      let html = "";
      const cached = seoCache[url];
      if (cached && cached.expiry > Date.now()) {
        html = cached.html;
      } else {
        const config = await getSEOConfig();
        const injectedHead = await injectSeoMetadata(template, url);
        html = injectBodyScripts(injectedHead, config);
        seoCache[url] = {
          html,
          expiry: Date.now() + CACHE_TTL
        };
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      if (process.env.NODE_ENV !== "production" && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
