import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Please enter your username or email")
    .max(100, "Username or email must contain at most 100 characters")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Please enter your password")
    .max(72, "Password must contain at most 72 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;