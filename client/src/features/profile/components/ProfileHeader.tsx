import type { ReactNode } from "react";

import type { PublicUser, ProfileStats } from "../types/profile.types";

type ProfileHeaderProps = {
  user: PublicUser;
  stats: ProfileStats;
  actions?: ReactNode;
};

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

export function ProfileHeader({
  user,
  stats,
  actions,
}: ProfileHeaderProps) {
  const avatarSrc = resolveAvatarSrc(user.avatarUrl);

  return (
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

            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
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
  );
}