import { Schema, model, Types } from "mongoose";

export interface LikeDocument {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<LikeDocument>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
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


likeSchema.index({ postId: 1, userId: 1 }, { unique: true });


likeSchema.index({ postId: 1 });

export const LikeModel = model<LikeDocument>("Like", likeSchema);