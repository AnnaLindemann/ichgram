import { AxiosError } from "axios";

import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  CreateDirectConversationInput,
  Conversation,
  EditMessageInput,
  Message,
  PaginatedConversations,
  PaginatedMessages,
  SendMessageInput,
} from "@/features/chat/types/chat.types";

type PaginationQuery = {
  page?: number;
  limit?: number;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "error" in responseData &&
      typeof responseData.error === "string"
    ) {
      return responseData.error;
    }

    if (typeof error.message === "string" && error.message.trim() !== "") {
      return error.message;
    }
  }

  return "Something went wrong";
}

export async function createDirectConversation(
  input: CreateDirectConversationInput,
): Promise<ApiResponse<Conversation>> {
  try {
    const response = await http.post<ApiResponse<Conversation>>(
      "/api/chat/conversations/direct",
      input,
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function getMyConversations(
  query: PaginationQuery = {},
): Promise<ApiResponse<PaginatedConversations>> {
  try {
    const response = await http.get<ApiResponse<PaginatedConversations>>(
      "/api/chat/conversations",
      {
        params: query,
      },
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function getConversationMessages(
  conversationId: string,
  query: PaginationQuery = {},
): Promise<ApiResponse<PaginatedMessages>> {
  try {
    const response = await http.get<ApiResponse<PaginatedMessages>>(
      `/api/chat/conversations/${conversationId}/messages`,
      {
        params: query,
      },
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function sendMessage(
  conversationId: string,
  input: SendMessageInput,
): Promise<ApiResponse<Message>> {
  try {
    const response = await http.post<ApiResponse<Message>>(
      `/api/chat/conversations/${conversationId}/messages`,
      input,
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function editMessage(
  messageId: string,
  input: EditMessageInput,
): Promise<ApiResponse<Message>> {
  try {
    const response = await http.patch<ApiResponse<Message>>(
      `/api/chat/messages/${messageId}`,
      input,
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function markConversationAsRead(
  conversationId: string,
): Promise<ApiResponse<{ updatedCount: number }>> {
  try {
    const response = await http.patch<ApiResponse<{ updatedCount: number }>>(
      `/api/chat/conversations/${conversationId}/read`,
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteMessage(
  messageId: string,
): Promise<ApiResponse<Message>> {
  try {
    const response = await http.delete<ApiResponse<Message>>(
      `/api/chat/messages/${messageId}`,
    );

    return response.data;
  } catch (error: unknown) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}