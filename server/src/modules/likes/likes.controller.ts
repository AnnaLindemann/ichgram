import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { LikeModel } from "./likes.model.js";
import { PostModel } from "../posts/posts.model.js";
import { likePostParamsSchema } from "./likes.schemas.js";
import { HttpError } from "../../shared/http-error.js";
import { createNotification } from "../notifications/notifications.service.js";

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

  const post = await PostModel.findById(postId).exec();

  if (!post) {
    throw new HttpError(404, "post not found");
  }

  try {
    const createdLike = await LikeModel.create({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    await createNotification({
      recipientId: post.author.toString(),
      actorId: userId,
      type: "like",
      entityType: "like",
      entityId: createdLike._id.toString(),
      postId: post._id.toString(),
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