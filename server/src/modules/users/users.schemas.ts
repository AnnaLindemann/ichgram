import { z } from "zod";

export const updateMeSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "fullName cannot be empty")
      .max(100, "fullName must be less than or equal to 100 characters")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(200, "bio must be less than or equal to 200 characters")
      .optional(),

    avatarUrl: z
      .string()
      .trim()
      .max(500, "avatarUrl must be less than or equal to 500 characters")
      .url("avatarUrl must be a valid URL")
      .optional()
      .or(z.literal("")),

    website: z
      .string()
      .trim()
      .max(200, "website must be less than or equal to 200 characters")
      .url("website must be a valid URL")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.bio !== undefined ||
      data.avatarUrl !== undefined ||
      data.website !== undefined,
    {
      message: "at least one field is required",
    }
  );

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export const searchUsersQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "q must contain at least 2 characters")
    .max(50, "q must contain at most 50 characters"),
  limit: z.coerce
    .number()
    .int("limit must be an integer")
    .min(1, "limit must be at least 1")
    .max(20, "limit must be at most 20")
    .default(10),
});

export type SearchUsersQuery = z.infer<typeof searchUsersQuerySchema>;