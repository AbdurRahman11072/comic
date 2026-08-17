import { z } from 'zod';

const parseEnum = (values: readonly [string, ...string[]], defaultVal: string) =>
  z
    .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(values))
    .default(defaultVal as any);

export const createSeriesSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    altTitles: z.string().optional().nullable().or(z.literal('')),
    description: z.string().optional().nullable().or(z.literal('')),
    coverUrl: z.string().optional().nullable().or(z.literal('')),
    bgUrl: z.string().optional().nullable().or(z.literal('')),
    type: parseEnum(['MANHWA', 'MANGA', 'MANHUA', 'COMIC'], 'MANHWA'),
    status: parseEnum(['ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED'], 'ONGOING'),
    genres: z.array(z.string()).optional().default([]),
    isPinned: z.boolean().optional().default(false),
    discount: z.union([z.string(), z.number()]).optional().nullable(),
  }),
});

export const updateSeriesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Series ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    altTitles: z.string().optional().nullable().or(z.literal('')),
    description: z.string().optional().nullable().or(z.literal('')),
    coverUrl: z.string().optional().nullable().or(z.literal('')),
    bgUrl: z.string().optional().nullable().or(z.literal('')),
    type: z
      .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(['MANHWA', 'MANGA', 'MANHUA', 'COMIC']))
      .optional(),
    status: z
      .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(['ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED']))
      .optional(),
    genres: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    discount: z.union([z.string(), z.number()]).optional().nullable(),
  }),
});

export const toggleHideSeriesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Series ID is required'),
  }),
  body: z.object({
    isHidden: z.boolean({ message: 'isHidden status is required' }),
    hiddenReason: z.string().optional(),
  }),
});
