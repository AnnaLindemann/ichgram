import { z } from "zod";

export const createPostSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, "imageUrl is required")
    .url("imageUrl must be a valid URL"),
  caption: z
    .string()
    .trim()
    .max(200, "caption must be less than or equal to 200 characters")
    .optional(),
});

export const updatePostSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(200, "caption must be less than or equal to 200 characters"),
});

export const listPostsQuerySchema = z.object({
  authorId: z.string().trim().optional(),
});

export type CreatePostInputSchema = z.infer<typeof createPostSchema>;
export type UpdatePostInputSchema = z.infer<typeof updatePostSchema>;
export type ListPostsQuerySchema = z.infer<typeof listPostsQuerySchema>;