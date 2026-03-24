import { Router } from "express";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
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
import { uploadSinglePostImage } from "../../shared/upload.middleware.js";
import { HttpError } from "../../shared/http-error.js";

export const postRouter = Router();

// Convert multer errors to HttpError so errorMiddleware formats them uniformly
function handlePostImageUpload(req: Request, res: Response, next: NextFunction): void {
  uploadSinglePostImage(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(new HttpError(400, err.message));
    } else if (err instanceof Error) {
      next(new HttpError(400, err.message));
    } else {
      next();
    }
  });
}

postRouter.post("/", requireAuth, handlePostImageUpload, asyncHandler(createPost));
postRouter.get("/", optionalAuth, asyncHandler(listPosts));
postRouter.get("/:id", optionalAuth, asyncHandler(getPostById));
postRouter.patch("/:id", requireAuth, asyncHandler(updatePostCaption));
postRouter.delete("/:id", requireAuth, asyncHandler(deletePost));

postRouter.use("/:id", likesRouter);