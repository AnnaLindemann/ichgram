import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().trim().optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().trim().min(1, "notification id is required"),
});