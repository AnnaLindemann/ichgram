import type { HydratedDocument } from "mongoose";
import { Types } from "mongoose";


export type CommentDb = {
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentDocument = HydratedDocument<CommentDb>;

export type PublicComment = {
  id: string,
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCommentInput = {
  content: string;
}

export function toPublicComment(comment: CommentDocument): PublicComment{
  return{
    id: String(comment._id),
    postId: String(comment.postId),
    authorId: String(comment.authorId),
    content: comment.content,
     createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }
}