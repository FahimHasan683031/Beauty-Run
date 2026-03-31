import { z } from 'zod';

const createSupportZod = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    files: z.array(z.string()).optional(),
  }),
});

const updateSupportStatusZod = z.object({
  body: z.object({
    status: z.enum(['pending', 'resolved']),
    adminReply: z.string(),
  }),
});

export const SupportValidations = {
  createSupportZod,
  updateSupportStatusZod,
};
