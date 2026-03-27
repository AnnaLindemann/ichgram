import { http } from "@/shared/api/http";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";

export type PostAuthorDto = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type PostDto = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  author: PostAuthorDto;
};

export type UpdatePostInput = {
  caption?: string;
  imageFile?: File | null;
};

export type CreatePostResponse =
  | {
      ok: true;
      data: PostDto;
    }
  | {
      ok: false;
      error: string;
    };

export type UpdatePostResponse =
  | {
      ok: true;
      data: PostDto;
    }
  | {
      ok: false;
      error: string;
    };

export type DeletePostResponse =
  | {
      ok: true;
      data: {
        id: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

function normalizePost(post: PostDto): PostDto {
  return {
    ...post,
    imageUrl: resolveMediaUrl(post.imageUrl),
    author: {
      ...post.author,
      avatarUrl: post.author.avatarUrl
        ? resolveMediaUrl(post.author.avatarUrl)
        : null,
    },
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  return typeof error === "object" &&
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
    : fallback;
}

export async function createPost(
  file: File,
  caption: string,
): Promise<CreatePostResponse> {
  const formData = new FormData();
  formData.append("image", file);

  if (caption.trim() !== "") {
    formData.append("caption", caption.trim());
  }

  try {
    const res = await http.post<CreatePostResponse>("/api/posts", formData);

    if (!res.data.ok) {
      return res.data;
    }

    return {
      ok: true,
      data: normalizePost(res.data.data),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to create post"),
    };
  }
}

export async function updatePost(
  postId: string,
  input: UpdatePostInput,
): Promise<UpdatePostResponse> {
  const formData = new FormData();

  if (input.caption !== undefined) {
    formData.append("caption", input.caption.trim());
  }

  if (input.imageFile) {
    formData.append("image", input.imageFile);
  }

  try {
    const res = await http.patch<UpdatePostResponse>(
      `/api/posts/${postId}`,
      formData,
    );

    if (!res.data.ok) {
      return res.data;
    }

    return {
      ok: true,
      data: normalizePost(res.data.data),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to update post"),
    };
  }
}

export async function deletePost(postId: string): Promise<DeletePostResponse> {
  try {
    const res = await http.delete<DeletePostResponse>(`/api/posts/${postId}`);
    return res.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to delete post"),
    };
  }
}
