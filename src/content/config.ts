import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['video', 'image', 'both']),
    tags: z.array(z.string()),
    thumbnail: z.string(),
    date: z.string(),
    featured: z.boolean().optional(),
    client: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = { projects };
