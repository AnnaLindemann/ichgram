import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { createPost,listPosts } from "./posts.controller.js";



export const postRouter = Router();

postRouter.post("/", asyncHandler(createPost))
postRouter.get("/",asyncHandler(listPosts))