import mongoose from "mongoose";
import type { User } from "./users.type.js";

type UserSchemaShape = Omit<User, "createdAt"> & {
createdAt: Date;
}

const userShema = new mongoose.Schema<UserSchemaShape>(
  {
    email:{
      type: String,
      required: true,  
      unique: true,  
    },
    username:{
      type: String,
      required: true,
    },
    passwordHash:{
      type: String,
      required: true,
    },
    createdAt:{
      type: Date,
      default: Date.now,
    },
  },
    {
      versionKey: false,
  }
)

export const UserModel = mongoose.model<UserSchemaShape>("User", userShema)