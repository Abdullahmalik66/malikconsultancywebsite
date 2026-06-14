import React from 'react';
import ExecutiveLayout from '../components/ExecutiveLayout';

export default function UniversityOuluCaseStudy() {
  return (
    <ExecutiveLayout
      category="Case Work"
      date="24.04.2026"
      title="University of Oulu: Cultivating Agentic Thinking Through Data Design"
      slug="oulu-university-data-design"
      image="https://images.unsplash.com/photo-1541339907198-e08759df9a73?auto=format&fit=crop&q=80&w=1200"
      tags={["AI Maturity", "Data Design", "Higher Education"]}
      content={
        <>
          <p>
            The University of Oulu, a prominent research institution in Finland, sought to integrate advanced AI capabilities into its administrative and research workflows. The goal was not just to use AI as a tool, but to foster "Agentic Thinking"—a paradigm shift where data systems and human researchers collaborate to drive innovation.
          </p>

          <blockquote>
            "AI in education is not about replacing human intellect; it's about shifting the cognitive load from retrieval to reasoning."
          </blockquote>

          <h2>The Challenge</h2>
          <p>
            The university faced significant data fragmentation across various departments, from research funding databases to student enrollment systems. This siloed approach made it difficult to gain a holistic view of the institution's impact and hindered the development of cross-disciplinary AI initiatives.
          </p>

          <h2>The Solution</h2>
          <p>
            We partnered with the university to architect a "Core Data Fabric" that serves as the foundation for agentic systems. This involved:
          </p>
          <ul>
            <li><strong>Semantic Interoperability:</strong> Designing a common data schema that allows different systems to "speak" the same language.</li>
            <li><strong>Maturity Assessment Framework:</strong> Developing a custom framework to assess the AI readiness of various faculty units, identifying high-impact pilot projects.</li>
            <li><strong>Agentic Workflow Design:</strong> Creating automated workflows that use AI agents to summarize research trends, identify funding opportunities, and streamline grant applications.</li>
          </ul>

          <h2>Results</h2>
          <ul>
            <li><strong>Unified Data Strategy:</strong> Established a roadmap for long-term AI integration that aligns with the university's research mission.</li>
            <li><strong>3 Pilot Projects Launched:</strong> Successfully implemented AI-driven agents in the faculties of Technology, Medicine, and Humanities.</li>
            <li><strong>Institutional Buy-in:</strong> Conducted workshops for over 500 faculty members, shifting the culture toward proactive AI adoption rather than reactive use.</li>
          </ul>

          <h2>Key Learnings</h2>
          <p>
            This project demonstrated that AI maturity is as much about cultural readiness as it is about technical infrastructure. By starting with data design, the University of Oulu has built a foundation that will support decades of AI-driven research and administration.
          </p>
        </>
      }
    />
  );
}
