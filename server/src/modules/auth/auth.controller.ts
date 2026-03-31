import type { Request, Response } from "express";
import { UserModel } from "../users/users.model.js";
import { toPublicUser } from "../users/users.type.js";
import { signToken } from "../../shared/jwt.helper.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import {
  comparePassword,
  hashPassword,
} from "../../shared/password.helper.js";
import { HttpError } from "../../shared/http-error.js";
import { forgotPasswordSchema } from "./auth.schemas.js";
import { forgotPasswordService } from "./auth.service.js";
import { resetPasswordSchema } from "./auth.schemas.js";
import { resetPasswordService } from "./auth.service.js";

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, fullName, password } = registerSchema.parse(req.body);

  const usernameNormalized = username.trim().toLowerCase();

  const [existingEmailUser, existingUsernameUser] = await Promise.all([
    UserModel.findOne({ email }).select("_id").lean().exec(),
    UserModel.findOne({
      $or: [{ usernameNormalized }, { username: usernameNormalized }],
    })
      .select("_id")
      .lean()
      .exec(),
  ]);

  const fieldErrors: Record<string, string> = {};

  if (existingEmailUser) {
    fieldErrors.email = "The email is already taken";
  }

  if (existingUsernameUser) {
    fieldErrors.username = "The username is already taken";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new HttpError(409, "Validation failed", fieldErrors);
  }

  const passwordHash = await hashPassword(password);

  const createdUser = await UserModel.create({
    username,
    usernameNormalized,
    email,
    fullName,
    passwordHash,
    role: "user",
  });

  const token = signToken({
    id: String(createdUser._id),
    email: createdUser.email,
    username: createdUser.username,
    role: createdUser.role,
  });

  res.status(201).json({
    ok: true,
    data: {
      token,
      user: toPublicUser(createdUser),
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { identifier, password } = loginSchema.parse(req.body);

  const isEmail = looksLikeEmail(identifier);

  const existingUser = await UserModel.findOne(
    isEmail
      ? { email: identifier }
      : { $or: [{ usernameNormalized: identifier }, { username: identifier }] }
  ).exec();

  if (!existingUser) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await comparePassword(password, existingUser.passwordHash);

  if (!isPasswordCorrect) {
    throw new HttpError(401, "Invalid credentials");
  }

  const token = signToken({
    id: String(existingUser._id),
    email: existingUser.email,
    username: existingUser.username,
    role: existingUser.role,
  });

  res.status(200).json({ ok: true, data: { token, user: toPublicUser(existingUser) } });
}

export async function forgotPasswordController(
  req: Request,
  res: Response
): Promise<void> {
  const { identifier } = forgotPasswordSchema.parse(req.body);

  const result = await forgotPasswordService(identifier);

  res.status(200).json({
    ok: true,
    message: "If account exists, password reset instructions were sent",
    ...(result.resetToken
      ? {
          data: {
            resetToken: result.resetToken,
          },
        }
      : {}),
  });
}

export async function resetPasswordController(
  req: Request,
  res: Response
): Promise<void> {
  const { token, password } = resetPasswordSchema.parse(req.body);

  await resetPasswordService(token, password);

  res.status(200).json({
    ok: true,
    message: "Password successfully reset",
  });
}