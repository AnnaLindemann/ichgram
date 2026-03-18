import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { LikeModel } from "./likes.model.js";
import { PostModel } from "../posts/posts.model.js";
import { likePostParamsSchema } from "./likes.schemas.js";
import { HttpError } from "../../shared/http-error.js";

function isMongoDuplicateKeyError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function likePost(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const { id: postId } = likePostParamsSchema.parse(req.params);
  const userId = req.user.id;

  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError(401, "authenticated user id is invalid");
  }

  const postExists = await PostModel.exists({ _id: postId });

  if (!postExists) {
    throw new HttpError(404, "post not found");
  }

  try {
    await LikeModel.create({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new HttpError(400, "invalid like payload");
    }

    if (isMongoDuplicateKeyError(error) && error.code === 11000) {
      throw new HttpError(409, "post already liked");
    }

    throw error;
  }

  const likesCount = await LikeModel.countDocuments({
    postId: new mongoose.Types.ObjectId(postId),
  });

  res.status(201).json({
    ok: true,
    data: {
      liked: true,
      likesCount,
    },
  });
}

export async function unlikePost(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const { id: postId } = likePostParamsSchema.parse(req.params);
  const userId = req.user.id;

  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpError(401, "authenticated user id is invalid");
  }

  await LikeModel.findOneAndDelete({
    postId: new mongoose.Types.ObjectId(postId),
    userId: new mongoose.Types.ObjectId(userId),
  }).exec();

  const likesCount = await LikeModel.countDocuments({
    postId: new mongoose.Types.ObjectId(postId),
  });

  res.status(200).json({
    ok: true,
    data: {
      liked: false,
      likesCount,
    },
  });
}