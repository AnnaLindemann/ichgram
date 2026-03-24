import axios from "axios";

import { getAuthToken } from "@/lib/auth-storage";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";

export type CreatePostResponse =
  | {
      ok: true;
      data: {
        id: string;
        imageUrl: string;
        caption: string;
        createdAt: string;
        updatedAt: string;
        likesCount: number;
        likedByMe: boolean;
        commentsCount: number;
        author: {
          id: string;
          username: string;
          fullName: string;
          avatarUrl: string | null;
        };
      };
    }
  | {
      ok: false;
      error: string;
    };

export async function createPost(
  file: File,
  caption: string,
): Promise<CreatePostResponse> {
  const token = getAuthToken();

  if (!token) {
    return {
      ok: false,
      error: "Unauthorized",
    };
  }

  const formData = new FormData();
  formData.append("image", file);

  if (caption.trim() !== "") {
    formData.append("caption", caption.trim());
  }

  try {
    const res = await axios.post<CreatePostResponse>(
      `${import.meta.env.VITE_API_URL}/api/posts`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.data.ok) {
      return res.data;
    }

    return {
      ok: true,
      data: {
        ...res.data.data,
        imageUrl: resolveMediaUrl(res.data.data.imageUrl),
        author: {
          ...res.data.data.author,
          avatarUrl: res.data.data.author.avatarUrl
            ? resolveMediaUrl(res.data.data.author.avatarUrl)
            : null,
        },
      },
    };
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
        : "Failed to create post";

    return {
      ok: false,
      error: message,
    };
  }
}