import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be at most 30 characters long")
  .regex(
    /^[a-zA-Z0-9_.]+$/,
    "Username may contain only letters, numbers, dots, and underscores"
  );

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(100, "Email must be at most 100 characters long")
  .email("Email is invalid")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must be at most 72 characters long");

export const registerSchema = z.object({
  username: usernameSchema,

  email: emailSchema,

  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters long"),

  password: passwordSchema,
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .max(100, "Email or username must be at most 100 characters long")
    .transform((value) => value.toLowerCase()),

  password: z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must be at most 72 characters long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .max(100, "Email or username must be at most 100 characters long")
    .transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "Token is required"),

  password: passwordSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;