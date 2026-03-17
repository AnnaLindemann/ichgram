import type { HydratedDocument } from "mongoose";

export type UserRole = "user";

export type UserDb = {
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  bio: string;
  avatarUrl: string;
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
  bio: string;
  avatarUrl: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type SearchUserDto = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
};

export type LoginUserInput = {
  email: string;
  username: string,
  password: string;
};

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}


export type SearchUserSource = {
  _id: unknown;
  username: string;
  fullName: string;
  avatarUrl: string;
};

export function toSearchUserDto(user: SearchUserSource): SearchUserDto {
  return {
    id: String(user._id),
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
  };
}