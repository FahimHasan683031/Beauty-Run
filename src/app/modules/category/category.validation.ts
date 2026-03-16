import { z } from "zod";

// Create category validation
export const createCategoryZod = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    image: z.string().min(1, "Image URL is required"),
  }).strict(),
});

// Update category validation
export const updateCategoryZod = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").optional(),
    image: z.string().min(1, "Image URL is required").optional(),
  }).strict(),
});
