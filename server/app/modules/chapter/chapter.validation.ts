import { z } from 'zod';

export const createChapterSchema = z.object({
  body: z.object({
    seriesId: z.string().min(1, 'Series ID is required'),
    number: z.number().min(0, 'Chapter number must be 0 or positive'),
    title: z.string().optional(),
    isLocked: z.boolean().optional().default(false),
    coinCost: z.number().min(0).optional().default(0),
    images: z
      .array(
        z.object({
          url: z.string().url('Image URL must be valid'),
          order: z.number().min(0),
        })
      )
      .optional()
      .default([]),
  }),
});

export const updateChapterSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Chapter ID is required'),
  }),
  body: z.object({
    number: z.number().min(0).optional(),
    title: z.string().optional(),
    isLocked: z.boolean().optional(),
    coinCost: z.number().min(0).optional(),
    images: z
      .array(
        z.object({
          url: z.string().url('Image URL must be valid'),
          order: z.number().min(0),
        })
      )
      .optional(),
  }),
});
