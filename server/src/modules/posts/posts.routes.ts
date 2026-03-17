import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import {
  createPost,
  listPosts,
  getPostById,
  updatePostCaption,
  deletePost,
} from "./posts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { likesRouter } from "../likes/likes.routes.js";
import { optionalAuth } from "../../middlewares/optionalAuth.middleware.js";

export const postRouter = Router();

postRouter.post("/", requireAuth, asyncHandler(createPost));
postRouter.get("/", optionalAuth, asyncHandler(listPosts));
postRouter.get("/:id", optionalAuth, asyncHandler(getPostById));
postRouter.patch("/:id", requireAuth, asyncHandler(updatePostCaption));
postRouter.delete("/:id", requireAuth, asyncHandler(deletePost));

postRouter.use("/:id", likesRouter);