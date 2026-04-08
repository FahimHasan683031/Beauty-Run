import { z } from 'zod';

const createOrderZod = z.object({
  body: z.object({
    product: z.string().nonempty('Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    address: z.string().min(1, 'Address is required'),
    number: z.string().min(1, 'Phone number is required'),
    instruction: z.string().optional(),
    label: z.enum(["Home", "Office", "Relative", "Other"]).optional(),
  }),
});

const updateOrderZod = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  }),
});

export const OrderValidations = {
  createOrderZod,
  updateOrderZod,
};
