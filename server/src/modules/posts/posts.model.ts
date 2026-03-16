import { Schema, model, models, type InferSchemaType, type HydratedDocument } from "mongoose";

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type Post = InferSchemaType<typeof postSchema>;
export type PostDocument = HydratedDocument<Post>;

export const PostModel = models.Post || model<Post>("Post", postSchema);