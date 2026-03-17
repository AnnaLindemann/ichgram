import mongoose, { Schema, model, type HydratedDocument, type InferSchemaType, type Model} from "mongoose";



const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },    
  },
  {
    timestamps: true,
  }
)

export type Comment = InferSchemaType<typeof commentSchema>;
export type CommentDocument = HydratedDocument<Comment>;
type CommentModelType = Model<Comment>;

export const CommentModel = (mongoose.models.Comment as CommentModelType | undefined) ?? model<Comment>("Comment", commentSchema)