import { z } from "zod";

export const forgotPasswordFormSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Enter your email or username"),
});

export type ForgotPasswordFormValues = z.infer<
  typeof forgotPasswordFormSchema
>;