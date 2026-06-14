import React from 'react';
import ExecutiveLayout from '../components/ExecutiveLayout';

export default function AgenticJourneyCaseStudy() {
  return (
    <ExecutiveLayout
      category="Case Work"
      date="24.04.2026"
      title="Re-engineering the Customer Journey with Autonomous Agentic Assistance"
      slug="agentic-customer-journey"
      image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
      tags={["AI Transformation", "Customer Experience", "Autonomous Systems"]}
      content={
        <>
          <p>
            For large-scale retail and service providers, the traditional linear customer journey is being replaced by a dynamic, non-linear ecosystem. We worked with a major European retailer to re-engineer their entire digital touchpoint strategy using autonomous AI agents that act as personal shopping concierges.
          </p>

          <h2>The Challenge</h2>
          <p>
            Despite having a robust e-commerce platform, the client saw high abandonment rates during the "Discovery" and "Comparison" phases of the customer journey. Customers felt overwhelmed by the product catalog and the complexity of matching products to their specific needs.
          </p>

          <h2>The Solution</h2>
          <p>
            We deployed an "Agentic Orchestration Layer" that sits atop the existing commerce engine. This layer consists of specialized agents:
          </p>
          <ul>
            <li><strong>The Style Agent:</strong> Analyzes user behavior and visual preferences to recommend curated outfits and furniture sets.</li>
            <li><strong>The Value Agent:</strong> Monitors price fluctuations and availability to notify users of the optimal time to purchase.</li>
            <li><strong>The Logistics Agent:</strong> Proactively manages shipping updates and returns, handling 90% of basic delivery inquiries autonomously.</li>
          </ul>

          <blockquote>
            "The shift from a 'search-and-buy' interface to a 'consult-and-act' interface has fundamentally changed our relationship with our customers."
          </blockquote>

          <h2>Implementation Details</h2>
          <p>
            The project utilized a multi-agent framework where agents communicate via a shared context bus. This ensures that the Style Agent knows what the Logistics Agent has already communicated, creating a seamless and personalized end-to-end experience.
          </p>

          <h2>Quantitative Metrics</h2>
          <ul>
            <li><strong>22% Increase in Conversion Rate:</strong> Users who interacted with the agentic layer were significantly more likely to complete a purchase.</li>
            <li><strong>45% Reduction in Support Tickets:</strong> The proactively communicative agents addressed issues before they reached human support teams.</li>
            <li><strong>15% Improvement in Average Order Value (AOV):</strong> Cross-selling and up-selling became more effective when presented as "expert advice" by the AI assistants.</li>
          </ul>

          <h2>Key Takeaways</h2>
          <p>
            Autonomous agents excel at managing complexity. By delegating the heavy lifting of product discovery and logistics to AI, the client has freed up their human teams to focus on high-value brand strategy and customer loyalty initiatives.
          </p>
        </>
      }
    />
  );
}
