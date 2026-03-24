import type { Request, Response } from "express";
import mongoose from "mongoose";
import { UserModel } from "./users.model.js";
import { toPublicUser, toSearchUserDto } from "./users.type.js";
import { updateMeSchema, searchUsersQuerySchema } from "./users.schemas.js";
import { escapeRegex } from "../../shared/escapeRegex.js";
import { HttpError } from "../../shared/http-error.js";

export async function getUserById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim() === "") {
    throw new HttpError(400, "id is required");
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "id is invalid");
  }

  const user = await UserModel.findById(id).exec();

  if (!user) {
    throw new HttpError(404, "user not found");
  }

  res.status(200).json({
    ok: true,
    data: toPublicUser(user),
  });
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await UserModel.find().sort({ createdAt: -1 }).limit(20).exec();

  res.status(200).json({
    ok: true,
    data: users.map(toPublicUser),
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const user = await UserModel.findById(req.user.id).exec();

  if (!user) {
    throw new HttpError(404, "user not found");
  }

  res.status(200).json({
    ok: true,
    data: toPublicUser(user),
  });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  const parsed = updateMeSchema.parse(req.body);
  const { fullName, bio, avatarUrl, website } = parsed;

  const user = await UserModel.findById(req.user.id).exec();

  if (!user) {
    throw new HttpError(404, "user not found");
  }

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  if (avatarUrl !== undefined) {
    user.avatarUrl = avatarUrl;
  }

  if (website !== undefined) {
    user.website = website;
  }

  await user.save();

  res.status(200).json({
    ok: true,
    data: toPublicUser(user),
  });
}

export async function uploadAvatar(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new HttpError(401, "unauthorized");
  }

  if (!req.file) {
    throw new HttpError(400, "avatar file is required");
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  const user = await UserModel.findById(req.user.id).exec();

  if (!user) {
    throw new HttpError(404, "user not found");
  }

  user.avatarUrl = avatarUrl;
  await user.save();

  res.status(200).json({
    ok: true,
    data: { avatarUrl },
  });
}

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const { q, limit } = searchUsersQuerySchema.parse(req.query);

  const escapedQuery = escapeRegex(q);
  const regex = new RegExp(escapedQuery, "i");

  const users = await UserModel.find(
    {
      $or: [{ username: regex }, { fullName: regex }],
    },
    {
      username: 1,
      fullName: 1,
      avatarUrl: 1,
    }
  )
    .sort({ username: 1 })
    .limit(limit)
    .lean()
    .exec();

  const items = users.map((user) => toSearchUserDto(user));

  res.status(200).json({
    ok: true,
    data: {
      items,
    },
  });
}