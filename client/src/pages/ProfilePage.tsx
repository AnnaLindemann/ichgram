import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";

function getAssetBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";

  return apiUrl.replace(/\/api\/?$/, "");
}

function resolveAvatarSrc(avatarUrl?: string | null): string {
  if (!avatarUrl) {
    return "/placeholder-avatar.svg";
  }

  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  return `${getAssetBaseUrl()}${avatarUrl}`;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  const { currentProfile, loading, error } = useAppSelector(
    (state) => state.profile,
  );

  useEffect(() => {
    void dispatch(fetchMyProfile());
  }, [dispatch]);

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!currentProfile) {
    return <div className="p-4">Profile not found.</div>;
  }

  const { user, stats, posts } = currentProfile;
  const avatarSrc = resolveAvatarSrc(user.avatarUrl);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        <div className="flex justify-center md:w-[180px] md:justify-start">
          <img
            src={avatarSrc}
            alt={user.username}
            className="h-24 w-24 rounded-full object-cover md:h-[150px] md:w-[150px]"
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <h1 className="text-2xl font-normal">{user.username}</h1>

              <Button
                asChild
                size="sm"
                className="h-8 w-fit rounded-[8px] bg-[rgba(239,239,239,1)] px-10 text-sm font-semibold text-black hover:bg-[rgba(239,239,239,1)]"
              >
                <Link to="/profile/edit">Edit profile</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm md:gap-10 md:text-base">
              <p>
                <span className="font-semibold">{stats.postsCount}</span> posts
              </p>
              <p>
                <span className="font-semibold">{stats.followersCount}</span>{" "}
                followers
              </p>
              <p>
                <span className="font-semibold">{stats.followingCount}</span>{" "}
                following
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-semibold">{user.fullName}</p>

              {user.bio ? (
                <p className="whitespace-pre-line text-sm text-foreground">
                  {user.bio}
                </p>
              ) : null}

              {user.website ? (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-sky-700 hover:underline"
                >
                  {user.website}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        {posts.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No posts yet.
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}