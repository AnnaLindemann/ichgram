import mongoose, { type Model } from "mongoose";
import type { UserDb } from "./users.type.js";

const userSchema = new mongoose.Schema<UserDb>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    usernameNormalized: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user"],
    },
    resetPasswordToken: {
    type: String,
    default: null,
    },
   resetPasswordExpires: {
   type: Date,
   default: null,
  },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel: Model<UserDb> =
  (mongoose.models.User as Model<UserDb>) ??
  mongoose.model<UserDb>("User", userSchema);