import { http } from "@/shared/api/http";
import { getAuthToken } from "@/lib/auth-storage";

type PostLikeSuccessResponse = {
  ok: true;
  data: {
    liked: boolean;
    likesCount: number;
  };
};

type PostLikeErrorResponse = {
  ok: false;
  error: string;
};

type PostLikeApiResponse = PostLikeSuccessResponse | PostLikeErrorResponse;

export type PostLikeResult =
  | {
      ok: true;
      liked: boolean;
      likesCount: number;
    }
  | {
      ok: false;
      error: string;
    };

function getAuthHeaders(): Record<string, string> | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
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

export async function likePostById(postId: string): Promise<PostLikeResult> {
  const headers = getAuthHeaders();

  if (!headers) {
    return {
      ok: false,
      error: "Unauthorized",
    };
  }

  try {
    const res = await http.post<PostLikeApiResponse>(
      `/api/posts/${postId}/like`,
      {},
      { headers },
    );

    if (!res.data.ok) {
      return {
        ok: false,
        error: res.data.error,
      };
    }

    return {
      ok: true,
      liked: res.data.data.liked,
      likesCount: res.data.data.likesCount,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to like post"),
    };
  }
}

export async function unlikePostById(postId: string): Promise<PostLikeResult> {
  const headers = getAuthHeaders();

  if (!headers) {
    return {
      ok: false,
      error: "Unauthorized",
    };
  }

  try {
    const res = await http.delete<PostLikeApiResponse>(`/api/posts/${postId}/like`, {
      headers,
    });

    if (!res.data.ok) {
      return {
        ok: false,
        error: res.data.error,
      };
    }

    return {
      ok: true,
      liked: res.data.data.liked,
      likesCount: res.data.data.likesCount,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to unlike post"),
    };
  }
}