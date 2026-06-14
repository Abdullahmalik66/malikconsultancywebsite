import { createClient } from '@sanity/client';

// Generic fetching logic for Sanity CMS
// Replace projectId and dataset with actual values from Sanity Dashboard
export const client = createClient({
  projectId: (import.meta as any).env?.VITE_SANITY_PROJECT_ID || 'your-project-id',
  dataset: (import.meta as any).env?.VITE_SANITY_DATASET || 'production',
  useCdn: true, // `false` if you want to ensure fresh data
  apiVersion: '2024-01-01', // use current date (YYYY-MM-DD) to target the latest API version
});

// Helper fetching function to pull a blog post by slug along with referenced sidebar cards
export async function getBlogPostBySlug(slug: string) {
  const query = `
    *[_type == "blogPost" && slug.current == $slug][0] {
      ...,
      "bannerImageUrl": bannerImage.asset->url,
      sidebarCards[]-> {
        _type,
        title,
        tag,
        summary,
        ctaLink,
        customText,
        ctaText
      }
    }
  `;
  const params = { slug };
  return await client.fetch(query, params);
}
