import React from 'react';
import ExecutiveLayout from '@/components/layout/ExecutiveLayout';

export default function AboutPage() {
  return (
    <ExecutiveLayout
      category="The Story"
      title="From Curiosity to Commercial Velocity"
      image="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200"
      content={
        <>
          <p>
            My journey into growth and performance marketing wasn't linear. It began with a fundamental curiosity about how systems work—and more importantly, how they can be optimized to work better.
          </p>
          
          <h2>The Early Days</h2>
          <p>
            I've always been fascinated by the intersection of technology and human behavior. Early in my career, I realized that data isn't just a record of the past; it's a map for the future. By deconstructing complex user journeys, I found that the smallest adjustments often lead to the largest breakthroughs.
          </p>

          <blockquote>
            "The goal isn't just to grow; it's to grow with precision, purpose, and profitability."
          </blockquote>

          <h2>Scaling Impact</h2>
          <p>
            Over the years, I've had the privilege of working with some of the most innovative brands in the world. From re-engineering retail journeys to architecting agentic AI frameworks for search bidding, my focus has always been on driving 'Commercial Velocity'—the speed at which a business turns opportunities into revenue.
          </p>

          <h2>My Philosophy</h2>
          <p>
            I believe in a 'Systems First' approach. Marketing shouldn't be a series of disconnected experiments; it should be a durable, self-optimizing engine. Whether I'm building a performance framework or advising a startup, I look for the leverage points that provide sustained, long-term advantage.
          </p>

          <p>
            When I'm not looking at data or crafting strategies, you'll find me exploring the latest in tech, philosophy, and how we can better humanize the digital world we've built.
          </p>
        </>
      }
    />
  );
}
