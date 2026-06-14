import React from 'react';
import ExecutiveLayout from '../components/ExecutiveLayout';

export default function RAGEngineCaseStudy() {
  return (
    <ExecutiveLayout
      category="Case Work"
      date="24.04.2026"
      title="How an AI‑Powered RAG Engine Transformed Technical Support in the Environmental Measurement Sector"
      slug="rag-engine-technical-support"
      image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200"
      tags={["AI Transformation", "Technical Support", "Environmental Tech"]}
      content={
        <>
          <p>
            In the rapidly evolving environmental measurement sector, technical support often involves navigating vast amounts of specialized documentation, legacy manuals, and complex data sheets. For a leading global measurement firm, the time required for support engineers to find precise answers was becoming a bottleneck for customer satisfaction and operational efficiency.
          </p>

          <blockquote>
            "We needed a way to make our institutional knowledge instantly accessible to the people who need it most, without compromising on technical accuracy."
          </blockquote>

          <h2>The Challenge</h2>
          <p>
            The company's documentation library spanned decades, comprising thousands of PDFs, technical drawings, and internal wikis. Support staff were spending up to 30% of their day searching for information rather than solving customer problems. Manual retrieval was not only slow but prone to human error, specially when dealing with similar-sounding equipment models.
          </p>

          <h2>The Solution</h2>
          <p>
            We engineered a custom Retrieval-Augmented Generation (RAG) engine specifically tuned for technical environmental data. Unlike generic LLM implementations, this system was built with a focus on "Precision Recall"—ensuring that every answer provided by the AI was grounded in the company's verified technical documentation.
          </p>
          <ul>
            <li><strong>Vectorized Knowledge Base:</strong> We processed and vectorized over 15,000 technical documents into a high-dimensional vector space.</li>
            <li><strong>Agentic Search Layer:</strong> Implemented an agentic layer that could decompose complex queries into sub-tasks, searching through both documentation and real-time sensor logs.</li>
            <li><strong>User Contextualization:</strong> The engine was designed to understand the specific hardware revisions and software versions the support staff were inquiring about.</li>
          </ul>

          <h2>Results</h2>
          <ul>
            <li><strong>70% Reduction in Search-to-Answer Time:</strong> Support engineers now find precise technical data in seconds rather than minutes.</li>
            <li><strong>98.5% Accuracy Rate:</strong> The specialized RAG architecture eliminated hallucinations common in standard LLM setups.</li>
            <li><strong>Global Scalability:</strong> The system supports multi-language queries, allowing local support teams across Europe and Asia to access the same centralized knowledge base.</li>
          </ul>

          <h2>Future Outlook</h2>
          <p>
            The success of the internal RAG engine has paved the way for "Self-Service Technical Assistants"—AI agents that customers can interact with directly for basic troubleshooting, further reducing the load on the high-level engineering support team.
          </p>
        </>
      }
    />
  );
}
