import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { likePost } from "../likes/likes.controller.js";
import { createPost,listPosts,
  getPostById,
  updatePostCaption,
  deletePost, } from "../posts/posts.controller.js";

export const postRouter = Router();

postRouter.post("/", requireAuth, asyncHandler(createPost));
postRouter.get("/", asyncHandler(listPosts));
postRouter.get("/:id", asyncHandler(getPostById));
postRouter.patch("/:id", requireAuth, asyncHandler(updatePostCaption));
postRouter.delete("/:id", requireAuth, asyncHandler(deletePost));

postRouter.post("/:id/like", requireAuth, asyncHandler(likePost));