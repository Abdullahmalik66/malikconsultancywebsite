import React from 'react';
import { motion } from 'motion/react';

interface MessageCardProps {
  customText: string;
  ctaText?: string;
  ctaLink?: string;
}

export const MessageCard: React.FC<MessageCardProps> = ({ customText, ctaText = 'Learn More', ctaLink }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-m3-primary text-m3-on-primary rounded-[32px] p-8 mt-6 shadow-md"
    >
      <p className="text-sm font-medium leading-relaxed mb-6">
        {customText}
      </p>

      {ctaLink && (
        <a 
          href={ctaLink}
          className="inline-block w-full py-4 bg-m3-on-primary text-m3-primary text-center rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform"
        >
          {ctaText}
        </a>
      )}
    </motion.div>
  );
};
