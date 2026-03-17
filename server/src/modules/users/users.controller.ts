import type { Request, Response } from "express";
import { UserModel } from "./users.model.js";
import mongoose from "mongoose";
import { toPublicUser } from "./users.type.js";
import { updateMeSchema, searchUsersQuerySchema  } from "./users.schemas.js";
import { toSearchUserDto } from "./users.type.js";
import { escapeRegex } from "../../shared/escapeRegex.js";

export async function getUserById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim() === "") {
    res.status(400).json({ ok: false, error: "id is required" });
    return;
  }

  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ ok: false, error: "id is invalid" });
    return;
  }

  const user = await UserModel.findById(id).exec();

  if (!user) {
    res.status(404).json({ ok: false, error: "user not found" });
    return;
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
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const user = await UserModel.findById(req.user.id).exec();

  if (!user) {
    res.status(404).json({ ok: false, error: "user not found" });
    return;
  }

  res.status(200).json({
    ok: true,
    data: toPublicUser(user),
  });
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const parsed = updateMeSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid request body",
    });
    return;
  }

  const { fullName, bio, avatarUrl } = parsed.data;

  const user = await UserModel.findById(req.user.id).exec();

  if (!user) {
    res.status(404).json({ ok: false, error: "user not found" });
    return;
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

  await user.save();

  res.status(200).json({
    ok: true,
    data: toPublicUser(user),
  });
}

export async function searchUsers(req: Request, res: Response): Promise<void> {
  const parsed = searchUsersQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "invalid query params",
    });
    return;
  }

  const { q, limit } = parsed.data;
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
    },
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