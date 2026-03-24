import type { ProfilePostPreview } from "../types/profile.types";

type ProfilePostsGridProps = {
  posts: ProfilePostPreview[];
};

export function ProfilePostsGrid({ posts }: ProfilePostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post) => (
        <button
          key={post.id}
          type="button"
          className="aspect-square overflow-hidden bg-muted"
        >
          <img
            src={post.imageUrl}
            alt="User post"
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}