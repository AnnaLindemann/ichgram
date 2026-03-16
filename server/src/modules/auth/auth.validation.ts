import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .transform((value) => value.toLowerCase()),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Email is invalid")
    .transform((value) => value.toLowerCase()),

  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;