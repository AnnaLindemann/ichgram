import type { Request, Response } from "express";
import { UserModel } from "./users.model.js";
import mongoose from "mongoose";
import { toPublicUser } from "./users.type.js";


export async function getUserById(req: Request, res: Response): Promise<void> {
  const {id} = req.params;

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
    user: toPublicUser(user),
  });
}

export async function listUsers(_req: Request, res: Response): Promise<void>{
const users = await UserModel.find()
.sort({createdAt:-1})
.limit(20)
.exec();

res.status(200).json({
  ok:true,
  users:users.map(toPublicUser)
})
}