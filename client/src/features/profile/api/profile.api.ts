import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";
import type { PublicUser, ProfilePostsData } from "../types/profile.types";

type FollowListResponse = ApiResponse<{
  items: PublicUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;

type PostsListResponse =
  | {
      ok: true;
      data: Array<{
        id: string;
        imageUrl: string;
      }>;
      meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        sort: string;
        order: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

type FollowActionResponse =
  | {
      ok: true;
      data: {
        id?: string;
        followerId?: string;
        followingId?: string;
        createdAt?: string;
        updatedAt?: string;
        message?: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

export type UploadMyAvatarResponse =
  | {
      ok: true;
      data: {
        avatarUrl: string;
      };
    }
  | {
      ok: false;
      message: string;
    };

export async function getMeProfile(): Promise<ApiResponse<PublicUser>> {
  const res = await http.get<ApiResponse<PublicUser>>("/api/users/me");
  return res.data;
}

export async function getUserProfileById(
  userId: string,
): Promise<ApiResponse<PublicUser>> {
  const res = await http.get<ApiResponse<PublicUser>>(`/api/users/${userId}`);
  return res.data;
}

export type UpdateMeProfileInput = {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
};

export async function updateMeProfile(
  input: UpdateMeProfileInput,
): Promise<ApiResponse<PublicUser>> {
  const res = await http.patch<ApiResponse<PublicUser>>("/api/users/me", input);
  return res.data;
}

export async function uploadMyAvatar(
  file: File,
): Promise<UploadMyAvatarResponse> {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await http.post<UploadMyAvatarResponse>(
      "/api/users/me/avatar",
      formData,
    );
    return res.data;
  } catch (error: unknown) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to upload avatar";

    return {
      ok: false,
      message,
    };
  }
}

export async function followUserById(
  userId: string,
): Promise<FollowActionResponse> {
  try {
    const res = await http.post<FollowActionResponse>(
      `/api/users/${userId}/follow`,
      {},
    );
    return res.data;
  } catch (error: unknown) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "error" in error.response.data &&
      typeof error.response.data.error === "string"
        ? error.response.data.error
        : "Failed to follow user";

    return {
      ok: false,
      error: message,
    };
  }
}

export async function unfollowUserById(
  userId: string,
): Promise<FollowActionResponse> {
  try {
    const res = await http.delete<FollowActionResponse>(
      `/api/users/${userId}/follow`,
    );
    return res.data;
  } catch (error: unknown) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null &&
      "error" in error.response.data &&
      typeof error.response.data.error === "string"
        ? error.response.data.error
        : "Failed to unfollow user";

    return {
      ok: false,
      error: message,
    };
  }
}

export async function getFollowersCount(userId: string): Promise<number> {
  const res = await http.get<FollowListResponse>(`/api/users/${userId}/followers`, {
    params: {
      page: 1,
      limit: 1,
    },
  });

  if (!res.data.ok) {
    throw new Error(res.data.error);
  }

  return res.data.data.meta.total;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const res = await http.get<FollowListResponse>(`/api/users/${userId}/following`, {
    params: {
      page: 1,
      limit: 1,
    },
  });

  if (!res.data.ok) {
    throw new Error(res.data.error);
  }

  return res.data.data.meta.total;
}

export async function getPostsByUser(userId: string): Promise<ProfilePostsData> {
  const res = await http.get<PostsListResponse>("/api/posts", {
    params: {
      authorId: userId,
      page: 1,
      limit: 12,
      sort: "createdAt",
      order: "desc",
    },
  });

  if (!res.data.ok) {
    throw new Error(res.data.error);
  }

  return {
    items: res.data.data.map((post) => ({
      id: post.id,
      imageUrl: resolveMediaUrl(post.imageUrl),
    })),
    total: res.data.meta.total,
  };
}

type PostDetailsResponse = {
  ok: boolean;
  data: {
    id: string;
    imageUrl: string;
    caption: string;
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    likedByMe: boolean;
    commentsCount: number;
    isFollowingAuthor?: boolean;
    author: {
      id: string;
      username: string;
      avatarUrl?: string | null;
    };
  };
  error: string;
};

export type ProfilePostDetailsData = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  isFollowingAuthor?: boolean;
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
};

export async function getPostById(
  postId: string,
): Promise<ProfilePostDetailsData> {
  const res = await http.get<PostDetailsResponse>(`/api/posts/${postId}`);

  if (!res.data.ok) {
    throw new Error(res.data.error);
  }

  return {
    id: res.data.data.id,
    imageUrl: resolveMediaUrl(res.data.data.imageUrl),
    caption: res.data.data.caption,
    createdAt: res.data.data.createdAt,
    updatedAt: res.data.data.updatedAt,
    likesCount: res.data.data.likesCount,
    likedByMe: res.data.data.likedByMe,
    commentsCount: res.data.data.commentsCount,
    isFollowingAuthor: res.data.data.isFollowingAuthor ?? false,
    author: {
      ...res.data.data.author,
      avatarUrl: res.data.data.author.avatarUrl
        ? resolveMediaUrl(res.data.data.author.avatarUrl)
        : null,
    },
  };
}
