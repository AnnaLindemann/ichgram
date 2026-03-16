import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { getUserById, listUsers } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get("/",asyncHandler(listUsers))
usersRouter.get("/:id", asyncHandler(getUserById))
