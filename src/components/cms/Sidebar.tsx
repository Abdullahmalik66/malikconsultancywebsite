import React from 'react';
import { CaseStudyCard } from './CaseStudyCard';
import { MessageCard } from './MessageCard';

export interface SidebarCard {
  _type: 'caseStudy' | 'sidebarMessage';
  _id: string;
  // Case Study fields
  title?: string;
  tag?: string;
  summary?: string;
  // Message fields
  customText?: string;
  ctaText?: string;
  // Shared
  ctaLink?: string;
}

interface SidebarProps {
  cards: SidebarCard[];
}

export const Sidebar: React.FC<SidebarProps> = ({ cards }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <aside className="sticky top-32 space-y-2">
      <div className="mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-m3-on-surface/40 px-2">
          Related
        </h3>
      </div>
      
      {cards.map((card, index) => {
        if (card._type === 'caseStudy') {
          return (
            <CaseStudyCard 
              key={card._id || index}
              title={card.title || ''}
              summary={card.summary || ''}
              tag={card.tag}
              ctaLink={card.ctaLink}
            />
          );
        }
        
        if (card._type === 'sidebarMessage') {
          return (
            <MessageCard 
              key={card._id || index}
              customText={card.customText || ''}
              ctaText={card.ctaText}
              ctaLink={card.ctaLink}
            />
          );
        }

        return null;
      })}
    </aside>
  );
};
