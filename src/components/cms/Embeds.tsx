import React from 'react';
import { motion } from 'motion/react';

// M3 styling wrappers for Embeds

export const YouTubeEmbed = ({ value }: { value: any }) => {
  if (!value || !value.url) return null;
  // Basic Regex to extract YouTube video ID
  const videoId = value.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((?:\w|-){11})/)?.[1];
  
  if (!videoId) return <div className="p-4 bg-m3-error-container text-m3-on-error-container rounded-2xl">Invalid YouTube URL</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 overflow-hidden rounded-[32px] bg-m3-surface-container shadow-sm border border-m3-outline/10 aspect-video w-full relative"
    >
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </motion.div>
  );
};

export const LinkedInEmbed = ({ value }: { value: any }) => {
  if (!value || !value.url) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 rounded-[32px] bg-m3-surface p-6 shadow-md border border-m3-outline/10 flex flex-col gap-4 text-center items-center justify-center min-h-[150px]"
    >
      <div className="w-12 h-12 bg-[#0077b5] rounded-xl flex items-center justify-center text-white font-bold text-2xl">in</div>
      <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-m3-primary hover:underline font-medium text-sm">
        View post on LinkedIn
      </a>
      <p className="text-xs text-m3-on-surface/60 max-w-sm mt-2">
        Note: LinkedIn embeds require specific &lt;iframe&gt; integrations tailored to their API. For standard setups without auth, providing a styled M3 fallback link is more robust.
      </p>
    </motion.div>
  );
};

export const InstagramEmbed = ({ value }: { value: any }) => {
  if (!value || !value.url) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-8 rounded-[32px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[2px] shadow-md max-w-md mx-auto"
    >
      <div className="bg-m3-surface rounded-[30px] p-6 text-center flex flex-col items-center justify-center min-h-[150px]">
         <div className="w-12 h-12 border-2 border-m3-on-surface/80 rounded-xl relative flex items-center justify-center mb-4">
            <div className="w-5 h-5 border-2 border-m3-on-surface/80 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-m3-on-surface/80 rounded-full absolute top-1.5 right-1.5"></div>
         </div>
        <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-m3-on-surface font-medium hover:text-m3-primary transition-colors">
          View on Instagram
        </a>
      </div>
    </motion.div>
  );
};
