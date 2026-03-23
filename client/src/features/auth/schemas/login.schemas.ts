import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username or email is required")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;