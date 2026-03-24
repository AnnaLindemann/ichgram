import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import { getAuthToken } from "@/lib/auth-storage";

import type { PublicUser, ProfilePostsData } from "./profile.types";

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

function getAuthHeaders(): Record<string, string> | undefined {
  const token = getAuthToken();

  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getMeProfile(): Promise<ApiResponse<PublicUser>> {
  const res = await http.get<ApiResponse<PublicUser>>("/api/users/me", {
    headers: getAuthHeaders(),
  });

  return res.data;
}

export async function getUserProfileById(
  userId: string,
): Promise<ApiResponse<PublicUser>> {
  const res = await http.get<ApiResponse<PublicUser>>(`/api/users/${userId}`);

  return res.data;
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
    headers: getAuthHeaders(),
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
      imageUrl: post.imageUrl,
    })),
    total: res.data.meta.total,
  };
}

