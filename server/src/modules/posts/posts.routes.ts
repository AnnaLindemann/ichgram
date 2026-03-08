import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { createPost,listPosts, getPostById, updatePostCaption, deletePost } from "./posts.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";



export const postRouter = Router();

postRouter.post("/",requireAuth, asyncHandler(createPost))
postRouter.get("/",asyncHandler(listPosts))
postRouter.get("/:id", asyncHandler(getPostById))
postRouter.patch("/:id", asyncHandler(updatePostCaption))
postRouter.delete("/:id",asyncHandler(deletePost))