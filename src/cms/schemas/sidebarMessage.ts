import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'sidebarMessage',
  title: 'Sidebar Message',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'Only used for organization in the CMS.',
    }),
    defineField({
      name: 'customText',
      title: 'Custom Text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      initialValue: 'Learn More',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Button Link',
      type: 'url',
    }),
  ],
});
