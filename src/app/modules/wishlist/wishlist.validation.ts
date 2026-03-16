import { z } from 'zod';

const createWishlistZod = z.object({
  body: z.object({
    product: z.string().nonempty('Product ID is required'),
  }),
});

export const WishlistValidations = {
  createWishlistZod,
};
