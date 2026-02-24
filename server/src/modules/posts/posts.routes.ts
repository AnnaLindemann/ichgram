import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { createPost } from "./posts.controller.js";


export const postRouter = Router();

postRouter.post("/", asyncHandler(createPost))