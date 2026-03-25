import { z } from 'zod';

export const createProductZod = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be non-negative'),
    deliveryCharge: z.number().min(0, 'Delivery charge must be non-negative').default(0),
    offer: z.number().min(0).max(100).optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0, 'Quantity must be non-negative'),
  }),
});

export const updateProductZod = z.object({
  body: z.object({
    productName: z.string().min(1).optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    deliveryCharge: z.number().min(0).optional(),
    offer: z.number().min(0).max(100).optional().nullable(),
    description: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    quantity: z.number().optional(),
  }),
});

export const ProductValidations = {
  createProductZod,
  updateProductZod,
};
