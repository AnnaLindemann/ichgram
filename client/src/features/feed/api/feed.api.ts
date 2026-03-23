import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";

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
  author: PostAuthorDto;
};

export async function getPosts(authorId?: string): Promise<ApiResponse<PostDto[]>> {
  const res = await http.get<ApiResponse<PostDto[]>>("/api/posts", {
    params: authorId ? { authorId } : undefined,
  });

  return res.data;
}