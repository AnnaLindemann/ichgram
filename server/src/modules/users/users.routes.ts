import { Router } from "express";
import { createUser,getUserById, listUsers } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.post("/api/users", createUser);
usersRouter.get("/api/users",listUsers)
usersRouter.get("/api/users/:id", getUserById)
