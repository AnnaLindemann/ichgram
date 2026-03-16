import mongoose, {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";

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
type PostModelType = Model<Post>;

export const PostModel =
  (mongoose.models.Post as PostModelType | undefined) ??
  model<Post>("Post", postSchema);