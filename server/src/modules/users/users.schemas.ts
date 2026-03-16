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
      .min(1, "avatarUrl cannot be empty")
      .max(500, "avatarUrl must be less than or equal to 500 characters")
      .url("avatarUrl must be a valid URL")
      .optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.bio !== undefined ||
      data.avatarUrl !== undefined,
    {
      message: "at least one field is required",
    }
  );

export type UpdateMeInput = z.infer<typeof updateMeSchema>;