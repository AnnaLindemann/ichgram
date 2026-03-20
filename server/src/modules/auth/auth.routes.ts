import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { forgotPasswordController } from "./auth.controller.js";
import { resetPasswordController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login))
authRouter.post("/forgot-password",asyncHandler(forgotPasswordController));
authRouter.post("/reset-password",asyncHandler(resetPasswordController));