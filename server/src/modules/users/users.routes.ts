import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getMe,
  updateMe,
  uploadAvatar,
  listUsers,
  getUserById,
  searchUsers,
} from "./users.controller.js";
import {
  followUserController,
  unfollowUserController,
  getFollowersController,
  getFollowingController,
} from "../follows/follows.controller.js";
import { uploadSingleImage } from "../../shared/upload.middleware.js";
import { HttpError } from "../../shared/http-error.js";
import type { NextFunction, Request, Response } from "express";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, asyncHandler(getMe));
usersRouter.patch("/me", requireAuth, asyncHandler(updateMe));

// Wrap multer so its errors are converted to HttpError and handled by errorMiddleware
function handleMulterUpload(req: Request, res: Response, next: NextFunction): void {
  uploadSingleImage(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(new HttpError(400, err.message));
    } else if (err instanceof Error) {
      next(new HttpError(400, err.message));
    } else {
      next();
    }
  });
}

usersRouter.post("/me/avatar", requireAuth, handleMulterUpload, asyncHandler(uploadAvatar));

usersRouter.get("/search", asyncHandler(searchUsers));

usersRouter.post("/:id/follow", requireAuth, asyncHandler(followUserController));
usersRouter.delete("/:id/follow", requireAuth, asyncHandler(unfollowUserController));
usersRouter.get("/:id/followers", asyncHandler(getFollowersController));
usersRouter.get("/:id/following", asyncHandler(getFollowingController));

usersRouter.get("/", asyncHandler(listUsers));
usersRouter.get("/:id", asyncHandler(getUserById));