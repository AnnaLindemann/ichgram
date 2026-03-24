import type { PostDto } from "./feed.api";
import type { FeedPost } from "../types/feed-post.types";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";

export function mapPostDtoToFeedPost(dto: PostDto): FeedPost {
  return {
    id: dto.id,
    imageUrl: resolveMediaUrl(dto.imageUrl),
    caption: dto.caption ?? null,
    createdAt: dto.createdAt,
    author: {
      id: dto.author.id,
      username: dto.author.username,
      avatarUrl: dto.author.avatarUrl
        ? resolveMediaUrl(dto.author.avatarUrl)
        : null,
    },
    likesCount: dto.likesCount,
    commentsCount: dto.commentsCount,
  };
}