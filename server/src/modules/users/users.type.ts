import type { HydratedDocument } from "mongoose";

export type UserRole = "user";

export type UserDb = {
  username: string;
  email: string;
  fullName: string;
  passwordHash: string;
  bio: string;
  website: string;
  avatarUrl: string;
  role: UserRole;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
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
  website: string;
  avatarUrl: string;
  role: UserRole;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SearchUserDto = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
};

export type LoginUserInput = {
  email: string;
  username: string;
  password: string;
};

function toIsoOrNull(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value as string);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    bio: user.bio,
    website: user.website,
    avatarUrl: user.avatarUrl,
    createdAt: toIsoOrNull(user.createdAt),
    updatedAt: toIsoOrNull(user.updatedAt),
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