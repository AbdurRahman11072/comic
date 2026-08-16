import { z } from 'zod';

export const createSeriesSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    altTitles: z.string().optional(),
    description: z.string().optional(),
    coverUrl: z.string().url('Cover URL must be a valid URL').optional().or(z.literal('')),
    bgUrl: z.string().url('Background URL must be a valid URL').optional().or(z.literal('')),
    type: z.enum(['MANHWA', 'MANGA', 'MANHUA', 'COMIC']).default('MANHWA'),
    status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED']).default('ONGOING'),
    genres: z.array(z.string()).min(1, 'Please select at least one genre'),
    isPinned: z.boolean().optional().default(false),
    discount: z.number().min(0).max(100).optional().nullable(),
  }),
});

export const updateSeriesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Series ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    altTitles: z.string().optional(),
    description: z.string().optional(),
    coverUrl: z.string().optional().or(z.literal('')),
    bgUrl: z.string().optional().or(z.literal('')),
    type: z.enum(['MANHWA', 'MANGA', 'MANHUA', 'COMIC']).optional(),
    status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED']).optional(),
    genres: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    discount: z.number().min(0).max(100).optional().nullable(),
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
