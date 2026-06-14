import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
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

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
