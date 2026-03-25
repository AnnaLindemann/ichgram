import type { FeedPost } from "../types/feed-post.types";

type ApplyFeedFollowStateParams = {
  posts: FeedPost[];
  authorId: string;
  isFollowing: boolean;
};

export function applyFeedFollowState({
  posts,
  authorId,
  isFollowing,
}: ApplyFeedFollowStateParams): FeedPost[] {
  return posts.map((post) =>
    post.author.id === authorId
      ? {
          ...post,
          isFollowingAuthor: isFollowing,
        }
      : post,
  );
}