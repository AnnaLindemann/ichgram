import { Schema, model, Types } from "mongoose";

export interface FollowDocument {
  _id: Types.ObjectId;
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<FollowDocument>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

followSchema.index(
  { followerId: 1, followingId: 1 },
  { unique: true }
);

export const FollowModel = model<FollowDocument>("Follow", followSchema);