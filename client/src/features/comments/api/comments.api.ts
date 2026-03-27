import { http } from "@/shared/api/http";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";
import type {
  CommentDto,
  CreateCommentApiResponse,
  CreateCommentInput,
  GetCommentsApiResponse,
} from "../types/comments.types";

type GetCommentsResult =
  | {
      ok: true;
      data: CommentDto[];
    }
  | {
      ok: false;
      error: string;
    };

type CreateCommentResult =
  | {
      ok: true;
      data: CommentDto;
    }
  | {
      ok: false;
      error: string;
    };

    type UpdateCommentResult =
  | {
      ok: true;
      data: CommentDto;
    }
  | {
      ok: false;
      error: string;
    };

type DeleteCommentSuccessResponse = {
  ok: true;
  data: {
    message: string;
  };
};

type DeleteCommentErrorResponse = {
  ok: false;
  error: string;
};

type DeleteCommentApiResponse =
  | DeleteCommentSuccessResponse
  | DeleteCommentErrorResponse;

type DeleteCommentResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

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

function normalizeComment(comment: CommentDto): CommentDto {
  return {
    ...comment,
    author: {
      ...comment.author,
      avatarUrl: comment.author.avatarUrl
        ? resolveMediaUrl(comment.author.avatarUrl)
        : null,
    },
  };
}

export async function getCommentsByPostId(
  postId: string,
): Promise<GetCommentsResult> {
  try {
    const res = await http.get<GetCommentsApiResponse>(`/api/posts/${postId}/comments`);

    if (!res.data.ok) {
      return {
        ok: false,
        error: res.data.error,
      };
    }

    return {
      ok: true,
      data: res.data.data.map(normalizeComment),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to load comments"),
    };
  }
}

export async function createComment(
  postId: string,
  input: CreateCommentInput,
): Promise<CreateCommentResult> {
  try {
    const res = await http.post<CreateCommentApiResponse>(
      `/api/posts/${postId}/comments`,
      {
        content: input.content.trim(),
      },
    );

    if (!res.data.ok) {
      return {
        ok: false,
        error: res.data.error,
      };
    }

    return {
      ok: true,
      data: normalizeComment(res.data.data),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to create comment"),
    };
  }
}

export async function updateCommentById(
  commentId: string,
  input: CreateCommentInput,
): Promise<UpdateCommentResult> {
  try {
    const res = await http.patch<CreateCommentApiResponse>(
      `/api/posts/comments/${commentId}`,
      {
        content: input.content.trim(),
      },
    );

    if (!res.data.ok) {
      return {
        ok: false,
        error: res.data.error,
      };
    }

    return {
      ok: true,
      data: normalizeComment(res.data.data),
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to update comment"),
    };
  }
}

export async function deleteCommentById(
  commentId: string,
): Promise<DeleteCommentResult> {
  try {
    const res = await http.delete<DeleteCommentApiResponse>(
      `/api/posts/comments/${commentId}`,
    );

    if (!res.data.ok) {
      return {
        ok: false,
        error: res.data.error,
      };
    }

    return {
      ok: true,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      error: getApiErrorMessage(error, "Failed to delete comment"),
    };
  }
}