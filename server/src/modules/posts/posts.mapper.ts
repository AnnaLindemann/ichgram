import { Types } from "mongoose";
import type { PostDocument } from "./posts.model.js";
import type { PostDto } from "./posts.type.js";

type PopulatedAuthor = {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatarUrl?: string;
};

type BuildPostDtoParams = {
  post: PostDocument;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  isFollowingAuthor: boolean;
};

export function buildPostDto({
  post,
  likesCount,
  likedByMe,
  commentsCount,
  isFollowingAuthor,
}: BuildPostDtoParams): PostDto {
  const author = post.author as unknown as PopulatedAuthor;

  return {
    id: post._id.toString(),
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likesCount,
    likedByMe,
    commentsCount,
    isFollowingAuthor,
    author: {
      id: author._id.toString(),
      username: author.username,
      fullName: author.fullName,
      avatarUrl: author.avatarUrl?.trim() ? author.avatarUrl : null,
    },
  };
}