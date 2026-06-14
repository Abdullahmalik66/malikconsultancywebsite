import React from 'react';
import { motion } from 'motion/react';
import { PortableText } from '@portabletext/react';
import { YouTubeEmbed, LinkedInEmbed, InstagramEmbed } from './Embeds';
import { Sidebar, SidebarCard } from './Sidebar';

interface BlogLayoutProps {
  title: string;
  bannerImageUrl?: string;
  content: any[]; // The Portable Text Blocks array from Sanity
  sidebarCards?: SidebarCard[];
}

// Map custom blocks from Sanity schema to our strictly styled React components
const portableTextComponents = {
  types: {
    youtube: YouTubeEmbed,
    linkedin: LinkedInEmbed,
    instagram: InstagramEmbed,
    image: ({ value }: any) => {
      // Basic image renderer assuming we have the asset URL.
      // In a real Sanity implementation, use @sanity/image-url for responsive widths.
      return (
        <div className="my-12 overflow-hidden rounded-[32px] bg-m3-surface-container shadow-sm border border-m3-outline/10">
          <img src={value.asset?.url || value.url} alt={value.alt || ''} className="w-full h-auto object-cover" />
        </div>
      );
    }
  },
  block: {
    // Override default block styles with M3 typography tokens (from Tailwind setup)
    h2: ({children}: any) => <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-m3-on-surface mt-16 mb-8">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-2xl md:text-3xl font-display font-medium text-m3-on-surface mt-12 mb-6">{children}</h3>,
    normal: ({children}: any) => <p className="text-lg md:text-xl text-m3-on-surface/80 leading-relaxed mb-8">{children}</p>,
    blockquote: ({children}: any) => (
      <blockquote className="my-12 border-l-4 border-m3-primary pl-8 py-2">
        <p className="text-2xl italic font-display text-m3-primary">{children}</p>
      </blockquote>
    ),
  },
  marks: {
    strong: ({children}: any) => <strong className="font-bold text-m3-on-surface">{children}</strong>,
    em: ({children}: any) => <em className="italic text-m3-on-surface/90">{children}</em>,
    link: ({value, children}: any) => (
      <a href={value?.href} className="text-m3-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({children}: any) => <ul className="list-disc pl-8 mb-8 text-lg md:text-xl text-m3-on-surface/80 leading-relaxed">{children}</ul>,
    number: ({children}: any) => <ol className="list-decimal pl-8 mb-8 text-lg md:text-xl text-m3-on-surface/80 leading-relaxed">{children}</ol>,
  },
  listItem: {
    bullet: ({children}: any) => <li className="mb-2 pl-2">{children}</li>,
    number: ({children}: any) => <li className="mb-2 pl-2">{children}</li>,
  }
};

export const BlogLayout: React.FC<BlogLayoutProps> = ({ title, bannerImageUrl, content, sidebarCards = [] }) => {
  return (
    <article className="max-w-[1240px] mx-auto px-6 pt-32 pb-32">
      {/* Blog Post Header: Locked styling */}
      <header className="mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-medium leading-[0.95] tracking-[-0.03em] mb-12 max-w-4xl"
        >
          {title}
        </motion.h1>

        {bannerImageUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="aspect-[16/7] w-full rounded-[48px] overflow-hidden bg-m3-surface-container mb-16 shadow-lg border border-m3-outline/10"
          >
            <img 
              src={bannerImageUrl} 
              alt="Banner" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        )}
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Rich Text CMS Content */}
        <div className="lg:col-span-8">
          <div className="max-w-none">
            {content ? (
              <PortableText 
                value={content} 
                components={portableTextComponents}
              />
            ) : (
               <p className="text-xl text-m3-on-surface/50 italic">No content available.</p>
            )}
          </div>
        </div>

        {/* Dynamic Sidebar */}
        <div className="lg:col-span-4">
          <Sidebar cards={sidebarCards} />
        </div>
      </div>
    </article>
  );
};
