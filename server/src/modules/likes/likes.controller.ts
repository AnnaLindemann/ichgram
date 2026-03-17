import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import { LikeModel } from "./likes.model.js";
import { PostModel } from "../posts/posts.model.js";
import { likePostParamsSchema } from "./likes.schemas.js";

export async function likePost(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const parsedParams = likePostParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    const firstIssue = parsedParams.error.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "post id is invalid",
    });
    return;
  }

  const userId = req.user.id;
  const postId = parsedParams.data.id;

  if (!Types.ObjectId.isValid(userId)) {
    res.status(401).json({
      ok: false,
      error: "authenticated user id is invalid",
    });
    return;
  }

  const postExists = await PostModel.exists({ _id: postId });

  if (!postExists) {
    res.status(404).json({
      ok: false,
      error: "post not found",
    });
    return;
  }

  try {
    await LikeModel.create({
      postId: new mongoose.Types.ObjectId(postId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        ok: false,
        error: "invalid like payload",
      });
      return;
    }

    if (error instanceof mongoose.Error && "code" in error && error.code === 11000) {
      res.status(409).json({
        ok: false,
        error: "post already liked",
      });
      return;
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
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const parsedParams = likePostParamsSchema.safeParse(req.params);

  if (!parsedParams.success) {
    const firstIssue = parsedParams.error.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "post id is invalid",
    });
    return;
  }

  const userId = req.user.id;
  const postId = parsedParams.data.id;

  if (!Types.ObjectId.isValid(userId)) {
    res.status(401).json({
      ok: false,
      error: "authenticated user id is invalid",
    });
    return;
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