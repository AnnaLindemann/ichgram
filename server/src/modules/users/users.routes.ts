import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getMe,
  updateMe,
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

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, asyncHandler(getMe));
usersRouter.patch("/me", requireAuth, asyncHandler(updateMe));

usersRouter.get("/search", asyncHandler(searchUsers));

usersRouter.post("/:id/follow", requireAuth, asyncHandler(followUserController));
usersRouter.delete("/:id/follow", requireAuth, asyncHandler(unfollowUserController));
usersRouter.get("/:id/followers", asyncHandler(getFollowersController));
usersRouter.get("/:id/following", asyncHandler(getFollowingController));

usersRouter.get("/", asyncHandler(listUsers));
usersRouter.get("/:id", asyncHandler(getUserById));