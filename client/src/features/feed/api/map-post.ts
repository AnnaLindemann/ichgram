import type { PostDto } from "./feed.api";
import type { FeedPost } from "../types/feed-post.types";

export function mapPostDtoToFeedPost(dto: PostDto): FeedPost {
  return {
    id: dto.id,
    imageUrl: dto.imageUrl,
    caption: dto.caption ?? null,
    createdAt: dto.createdAt,
    author: {
      id: dto.author.id,
      username: dto.author.username,
      avatarUrl: dto.author.avatarUrl,
    },
    likesCount: dto.likesCount,
    commentsCount: dto.commentsCount,
  };
}