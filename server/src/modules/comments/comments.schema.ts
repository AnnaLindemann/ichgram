import { z } from "zod";
import mongoose from "mongoose";

export const commentPostParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.isValidObjectId(value), {
    message: "invalid post id",
  }),
});

export const createCommentBodySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "content is required")
    .max(1000, "content must be less than or equal to 1000 characters"),
});

export const commentIdParamsSchema = z.object({
  id: z.string().refine((value) => mongoose.isValidObjectId(value), {
    message: "invalid comment id",
  }),
});

export const updateCommentBodySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "content is required")
    .max(1000, "content must be less than or equal to 1000 characters"),
});

export type CommentPostParams = z.infer<typeof commentPostParamsSchema>;
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
export type CommentIdParams = z.infer<typeof commentIdParamsSchema>;
export type UpdateCommentBody = z.infer<typeof updateCommentBodySchema>;