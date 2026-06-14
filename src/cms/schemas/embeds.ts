import React from 'react';
import { defineType, defineField } from 'sanity';

// For Sanity Studio Preview (Note: If using inside Sanity Studio, this would render a preview)
const YouTubePreview = ({ value }: { value: any }) => {
  return value?.url ? React.createElement('div', null, 'YouTube URL: ', value.url) : React.createElement('div', null, 'Add a YouTube URL');
};

export const youtube = defineType({
  name: 'youtube',
  type: 'object',
  title: 'YouTube Embed',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'YouTube URL',
      description: 'Paste standard YouTube URL',
    }),
  ],
  preview: {
    select: { url: 'url' },
    component: YouTubePreview,
  } as any,
});

export const linkedin = defineType({
  name: 'linkedin',
  type: 'object',
  title: 'LinkedIn Embed',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'LinkedIn Post URL',
    }),
  ],
});

export const instagram = defineType({
  name: 'instagram',
  type: 'object',
  title: 'Instagram Embed',
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'Instagram Post URL',
    }),
  ],
});
