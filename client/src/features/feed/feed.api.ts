import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";

export type PostDto = {
  id: string;
  authorId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getPosts(authorId?: string): Promise<ApiResponse<PostDto[]>> {
  const res = await http.get<ApiResponse<PostDto[]>>("/api/posts", {
    params: authorId ? { authorId } : undefined,
  });
  return res.data;
}