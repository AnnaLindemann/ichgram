import type { FeedPost } from "../types/feed-post.types";

type FeedPostCardProps = {
  post: FeedPost;
};

export function FeedPostCard({ post }: FeedPostCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300" />
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-black">
              {post.author.username}
            </p>
            <p className="truncate text-xs text-gray-500">
              {post.createdAt}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-sm font-medium text-sky-500"
        >
          Follow
        </button>
      </div>

      <div className="aspect-square w-full bg-gray-100">
        <img
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex items-center gap-3 px-3 pt-3 text-lg">
        <button type="button" aria-label="Like">
          ♡
        </button>
        <button type="button" aria-label="Comment">
          ◯
        </button>
        <button type="button" aria-label="Share">
          ↗
        </button>
      </div>

      <div className="px-3 pb-3 pt-2 text-sm">
        <p className="font-medium text-black">{post.likesCount} likes</p>

        <p className="mt-1 text-black">
          <span className="mr-1 font-medium">{post.author.username}</span>
          {post.caption}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          View all comments ({post.commentsCount})
        </p>
      </div>
    </article>
  );
}