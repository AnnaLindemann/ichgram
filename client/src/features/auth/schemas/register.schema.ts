import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email")
    .max(100, "Email must contain at most 100 characters")
    .email("Enter a valid email address, for example: example@example.com")
    .transform((value) => value.toLowerCase()),

  fullName: z
    .string()
    .trim()
    .min(1, "Please enter your full name")
    .max(100, "Full name must contain at most 100 characters"),

  username: z
    .string()
    .trim()
    .min(3, "Username must contain at least 3 characters")
    .max(30, "Username must contain at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can contain only letters, numbers, dots, and underscores"
    ),

  password: z
   .string()
  .min(8, "Password must contain at least 8 characters")
  .max(72, "Password must contain at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;