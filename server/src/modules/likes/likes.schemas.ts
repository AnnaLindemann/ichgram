import { z } from "zod";
import mongoose from "mongoose";

export const likePostParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "post id is required")
    .refine((value) => mongoose.isValidObjectId(value), {
      message: "post id is invalid",
    }),
});

export type LikePostParamsInput = z.infer<typeof likePostParamsSchema>;