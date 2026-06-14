import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bannerImage',
      title: 'Banner Image',
      type: 'image',
      options: { hotspot: true }, // Allows cropping
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }), // Standard formatting: bold, italic, quotes, lists
        defineArrayMember({ type: 'image' }),
        defineArrayMember({ type: 'youtube' }),
        defineArrayMember({ type: 'linkedin' }),
        defineArrayMember({ type: 'instagram' }),
      ],
    }),
    defineField({
      name: 'sidebarCards',
      title: 'Sidebar Cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'caseStudy' }, { type: 'sidebarMessage' }],
        }),
      ],
      description: 'Select case studies or messages to display in the sidebar for this post.',
    }),
  ],
});
