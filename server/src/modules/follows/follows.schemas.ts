import { z } from "zod";

export const followParamsSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const followListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type FollowParamsInput = z.infer<typeof followParamsSchema>;
export type FollowListQueryInput = z.infer<typeof followListQuerySchema>;