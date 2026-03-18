import type { Request, Response } from "express";
import { followParamsSchema, followListQuerySchema } from "./follows.schemas.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "./follows.service.js";
import { HttpError } from "../../shared/http-error.js";

type AuthRequest = Request & {
  user?: {
    id: string;
  };
};

export async function followUserController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    throw new HttpError(401, "unauthorized");
  }

  const { id } = followParamsSchema.parse(req.params);

  const data = await followUser(req.user.id, id);

  res.status(201).json({
    ok: true,
    data,
  });
}

export async function unfollowUserController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user?.id) {
    throw new HttpError(401, "unauthorized");
  }

  const { id } = followParamsSchema.parse(req.params);

  const data = await unfollowUser(req.user.id, id);

  res.status(200).json({
    ok: true,
    data,
  });
}

export async function getFollowersController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = followParamsSchema.parse(req.params);
  const { page, limit } = followListQuerySchema.parse(req.query);

  const data = await getFollowers(id, { page, limit });

  res.status(200).json({
    ok: true,
    data,
  });
}

export async function getFollowingController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = followParamsSchema.parse(req.params);
  const { page, limit } = followListQuerySchema.parse(req.query);

  const data = await getFollowing(id, { page, limit });

  res.status(200).json({
    ok: true,
    data,
  });
}