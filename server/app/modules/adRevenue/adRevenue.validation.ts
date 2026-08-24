import { z } from 'zod';

export const trackReadEventSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    seriesId: z.string().min(1, 'Series ID is required'),
    chapterId: z.string().min(1, 'Chapter ID is required'),
    durationSeconds: z.number().int().min(0),
    pagesViewed: z.number().int().min(0),
    totalPages: z.number().int().min(1),
    completionPercent: z.number().min(0).max(100),
    scrollDepthPercent: z.number().min(0).max(100).optional().default(0),
    interactionCount: z.number().int().min(0).optional().default(0),
    isExitBeacon: z.boolean().optional().default(false),
  }),
});

export const previewDistributionSchema = z.object({
  query: z.object({
    periodStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid periodStart date string',
    }),
    periodEnd: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid periodEnd date string',
    }),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
    currency: z.enum(['USD', 'POINTS']).optional().default('USD'),
  }),
});

export const executeDistributionSchema = z.object({
  body: z.object({
    periodStart: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid periodStart date string',
    }),
    periodEnd: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid periodEnd date string',
    }),
    amount: z.number().positive('Amount must be greater than zero'),
    currency: z.enum(['USD', 'POINTS']).default('USD'),
    notes: z.string().optional(),
  }).refine((data) => {
    const start = new Date(data.periodStart);
    const end = new Date(data.periodEnd);
    const now = new Date();
    return end <= now && end > start && start <= now;
  }, {
    message: 'periodEnd cannot be in the future, and must be after periodStart.',
    path: ['periodEnd'],
  }),
});

export const revertDistributionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Distribution Run ID is required'),
  }),
  body: z.object({
    revertReason: z.string().optional(),
  }),
});

