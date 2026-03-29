import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { Heart, MessageCircle } from "lucide-react";

import type { FeedPost } from "../types/feed-post.types";

type FeedPostCardProps = {
  post: FeedPost;
  canFollowAuthor: boolean;
  isSubmittingFollow: boolean;
  isSubmittingLike: boolean;
  onPostClick: (postId: string) => void;
  onCommentClick: (postId: string) => void;
  onAuthorClick: (authorId: string) => void;
  onFollowToggle: (authorId: string) => void;
  onLikeToggle: (postId: string) => void;
};

export function FeedPostCard({
  post,
  canFollowAuthor,
  isSubmittingFollow,
  isSubmittingLike,
  onPostClick,
  onCommentClick,
  onAuthorClick,
  onFollowToggle,
  onLikeToggle,
}: FeedPostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onAuthorClick(post.author.id)}
            className="shrink-0"
            aria-label={`Open ${post.author.username} profile`}
          >
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300" />
            )}
          </button>

          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => onAuthorClick(post.author.id)}
              className="truncate font-medium text-black"
            >
              {post.author.username}
            </button>

            <span className="shrink-0 text-xs text-gray-400">•</span>

            <p className="shrink-0 text-sm text-gray-500">
              {formatRelativeTime(post.createdAt)}
            </p>

            {canFollowAuthor ? (
              <>
                <span className="shrink-0 text-xs text-gray-400">•</span>

                {post.isFollowingAuthor ? (
                  <button
                    type="button"
                    onClick={() => onFollowToggle(post.author.id)}
                    disabled={isSubmittingFollow}
                    className="shrink-0 text-sm font-medium text-gray-500 disabled:opacity-60"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onFollowToggle(post.author.id)}
                    disabled={isSubmittingFollow}
                    className="shrink-0 text-sm font-medium text-sky-500 disabled:opacity-60"
                  >
                    {isSubmittingFollow ? "Following..." : "Follow"}
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="block aspect-square w-full bg-gray-100"
        onClick={() => onPostClick(post.id)}
        aria-label="Open post"
      >
        <img
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </button>

      <div className="flex items-center gap-4 px-3 pt-3">
        <button
          type="button"
          aria-label={post.likedByMe ? "Unlike post" : "Like post"}
          onClick={() => onLikeToggle(post.id)}
          disabled={isSubmittingLike}
          className="text-black disabled:opacity-60"
        >
          <Heart
            className={`h-7 w-7 ${post.likedByMe ? "fill-red-500 text-red-500" : ""}`}
            strokeWidth={1.75}
          />
        </button>

        <button
          type="button"
          aria-label="Comment"
          className="text-black"
          onClick={() => onCommentClick(post.id)}
        >
          <MessageCircle className="h-7 w-7 scale-x-[-1]" strokeWidth={1.75} />
        </button>
      </div>

      <div className="px-3 pb-3 pt-2 text-sm min-h-[88px]">
        {post.likesCount > 0 ? (
          <p className="font-medium text-black">{post.likesCount} likes</p>
        ) : null}

        <p className="mt-1 text-black">
          <button
            type="button"
            onClick={() => onAuthorClick(post.author.id)}
            className="mr-1 font-medium"
          >
            {post.author.username}
          </button>
          {post.caption}
        </p>

        {post.commentsCount > 0 ? (
          <button
            type="button"
            onClick={() => onCommentClick(post.id)}
            className="mt-1 text-xs text-gray-500"
          >
            View all comments ({post.commentsCount})
          </button>
        ) : null}
      </div>
    </article>
  );
}