import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { asyncHandler } from "../../shared/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login))