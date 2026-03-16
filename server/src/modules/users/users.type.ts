import type { HydratedDocument } from "mongoose";

export type UserRole = "user";

export type UserDb = {
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = HydratedDocument<UserDb>;

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type RegisterUserInput = {
  username: string;
  email: string;
  fullName: string;
  password: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export function toPublicUser(user: UserDocument): PublicUser {
  const publicUser: PublicUser = {
    id: String(user._id),
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  if (user.bio !== undefined) {
    publicUser.bio = user.bio;
  }

  if (user.avatarUrl !== undefined) {
    publicUser.avatarUrl = user.avatarUrl;
  }

  return publicUser;
}
