import type { Request, Response } from "express";
import { UserModel } from "./users.model.js";
import mongoose from "mongoose";

type CreateUserBody = {
  email?: unknown;
  username?: unknown;
  passwordHash?: unknown;
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const body = req.body as CreateUserBody;

  if(typeof body.email !== "string" || body.email.trim() === ""){
    res.status(400).json({ok: false, error: "email is required"})
    return
  }

    if(typeof body.username !== "string" || body.username.trim() === ""){
    res.status(400).json({ok: false, error: "username is required"})
    return
  }
  if(typeof body.passwordHash !== "string" || body.passwordHash.trim() === ""){
    res.status(400).json({ok: false, error: "passwordHash is required"})
    return
  }
try{
const created = await UserModel.create({
  email: body.email.trim().toLowerCase(),
  username: body.username.trim().toLowerCase(),
  passwordHash: body.passwordHash.trim().toLowerCase(),
})
res.status(201).json({
ok: true,
user:{
  id:created._id.toString(),
  email: created.email,
  username: created.username,
  createdAt: created.createdAt,
}
})
} catch(err:unknown){
  // Duplicate key error (unique index)
  if(typeof err === "object" && err !== null && "code" in err && (err as {code?: unknown }).code === 11000) {
    res.status(409).json({ok: false, error: "email already exists"});
    return
  }
     res.status(500).json({ok: false, error: "internal error"})
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const id = req.params.id;

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
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    },
  });
}

export async function listUsers(req: Request, res: Response): Promise<void>{
const users = await UserModel.find()
.sort({createdAt:-1})
.limit(20)
.exec();

res.status(200).json({
  ok:true,
  users:users.map((u) => ({
id: u._id.toString(),
email: u.email,
username: u.username,
createdAt: u.createdAt,
  }))
})
}