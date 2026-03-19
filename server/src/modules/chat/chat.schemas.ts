import { z } from "zod";

export const objectIdParamSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const createDirectConversationSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required"),
});

export const sendMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "text is required")
    .max(1000, "text must be less than or equal to 1000 characters"),
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ObjectIdParamInput = z.infer<typeof objectIdParamSchema>;
export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListConversationsQueryInput = z.infer<typeof listConversationsQuerySchema>;
export type ListMessagesQueryInput = z.infer<typeof listMessagesQuerySchema>;