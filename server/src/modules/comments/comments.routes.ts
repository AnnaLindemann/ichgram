import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  createComment,
  getCommentsByPostId,
  updateComment,
  deleteComment,
} from "./comments.controller.js";

export const commentsRouter = Router();

commentsRouter.post("/:id/comments", requireAuth, asyncHandler(createComment));
commentsRouter.get("/:id/comments", asyncHandler(getCommentsByPostId));
commentsRouter.patch("/comments/:id", requireAuth, asyncHandler(updateComment));
commentsRouter.delete("/comments/:id", requireAuth, asyncHandler(deleteComment));