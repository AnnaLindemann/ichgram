import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { likePost,unlikePost } from "./likes.controller.js";

export const likesRouter = Router({ mergeParams: true });

likesRouter.post("/like", requireAuth, asyncHandler(likePost));
likesRouter.delete("/like", requireAuth, asyncHandler(unlikePost));