import type { FeedPost } from "../types/feed-post.types";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { Heart, MessageCircle} from "lucide-react";

type FeedPostCardProps = {
  post: FeedPost;
  onPostClick: (postId: string) => void;
};

export function FeedPostCard({ post, onPostClick }: FeedPostCardProps) {
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
<div className="flex min-w-0 items-center gap-1.5 text-sm">
  <p className="truncate font-medium text-black">
    {post.author.username}
  </p>

  <span className="shrink-0 text-xs text-gray-400">•</span>

  <p className="shrink-0 text-sm text-gray-500">
    {formatRelativeTime(post.createdAt)}
  </p>

  <span className="shrink-0 text-xs text-gray-400">•</span>
</div>

<button
  type="button"
  className="shrink-0 text-sm font-medium text-sky-500"
>
  Follow
</button>
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
  <button type="button" aria-label="Like" className="text-black">
    <Heart className="h-7 w-7" strokeWidth={1.75} />
  </button>

  <button type="button" aria-label="Comment" className="text-black">
    <MessageCircle className="h-7 w-7 scale-x-[-1]" strokeWidth={1.75} />
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