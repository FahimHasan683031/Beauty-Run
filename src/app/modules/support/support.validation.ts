import { z } from 'zod';

const createSupportZod = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    attachment: z.string().optional(),
  }),
});

const updateSupportStatusZod = z.object({
  body: z.object({
    status: z.enum(['pending', 'resolved']),
  }),
});

export const SupportValidations = {
  createSupportZod,
  updateSupportStatusZod,
};
