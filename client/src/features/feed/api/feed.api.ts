import { http } from "@/shared/api/http";
import { getAuthToken } from "@/lib/auth-storage";

function getAuthHeaders(): Record<string, string> | undefined {
  const token = getAuthToken();

  if (!token) {
    return undefined;
  }

  return { Authorization: `Bearer ${token}` };
}

export type PostAuthorDto = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type PostDto = {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  isFollowingAuthor: boolean;
  author: PostAuthorDto;
};

type ListPostsApiResponse =
  | {
      ok: true;
      data: PostDto[];
      meta: {
        page: number;
        pages: number;
        limit: number;
        total: number;
        sort: string;
        order: string;
      };
    }
  | { ok: false; error: string };

export type GetPostsResult =
  | { ok: true; data: PostDto[]; page: number; totalPages: number }
  | { ok: false; error: string };

export async function getPosts(
  page = 1,
  authorId?: string,
): Promise<GetPostsResult> {
  const res = await http.get<ListPostsApiResponse>("/api/posts", {
    headers: getAuthHeaders(),
    params: {
      limit: 10,
      page,
      ...(authorId ? { authorId } : {}),
    },
  });

  if (!res.data.ok) {
    return res.data;
  }

  return {
    ok: true,
    data: res.data.data,
    page: res.data.meta.page,
    totalPages: res.data.meta.pages,
  };
}