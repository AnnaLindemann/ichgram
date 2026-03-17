import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getMe,
  updateMe,
  listUsers,
  getUserById, searchUsers
} from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, asyncHandler(getMe));
usersRouter.patch("/me", requireAuth, asyncHandler(updateMe));
usersRouter.get("/search", asyncHandler(searchUsers));
usersRouter.get("/", asyncHandler(listUsers));
usersRouter.get("/:id", asyncHandler(getUserById));