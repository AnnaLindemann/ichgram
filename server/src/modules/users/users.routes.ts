import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { createUser,getUserById, listUsers } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/api/users",asyncHandler(listUsers))
usersRouter.get("/api/users/:id", asyncHandler(getUserById))
usersRouter.post("/api/users", asyncHandler(createUser));