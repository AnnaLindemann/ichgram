import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { createUser,getUserById, listUsers } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/",asyncHandler(listUsers))
usersRouter.get("/:id", asyncHandler(getUserById))
usersRouter.post("/", asyncHandler(createUser));