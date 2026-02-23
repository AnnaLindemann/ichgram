import mongoose, {Schema, Types, type Model} from "mongoose";

export type PostDocument = {
  author: Types.ObjectId;
  imageUrl: string;
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
{
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl:{
    type: String,
    required:true,
  },
  caption:{
    type: String,
    default: "",
    maxlength: 200
  }
  },
  {timestamps: true} 
)

export const PostModel: Model<PostDocument> = (mongoose.models.Post as Model<PostDocument>) ?? mongoose.model<PostDocument>("Post", postSchema)