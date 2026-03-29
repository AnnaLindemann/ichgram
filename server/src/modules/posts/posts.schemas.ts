import { z } from "zod";

export const createPostBodySchema = z.object({
  caption: z
    .string()
    .trim()
    .max(200, "caption must be less than or equal to 200 characters")
    .optional(),
});

export type CreatePostBody = z.infer<typeof createPostBodySchema>;

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
    .max(200, "caption must be less than or equal to 200 characters")
    .optional(),
});

export const listPostsQuerySchema = z.object({
  authorId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1, "page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "limit must be at least 1")
    .max(20, "limit must be less than or equal to 20")
    .default(10),
  sort: z.enum(["createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePostInputSchema = z.infer<typeof createPostSchema>;
export type UpdatePostInputSchema = z.infer<typeof updatePostSchema>;
export type ListPostsQuerySchema = z.infer<typeof listPostsQuerySchema>;