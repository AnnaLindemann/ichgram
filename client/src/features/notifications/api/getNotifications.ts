import { http } from "@/shared/api/http";
import type { NotificationsListResponse } from "../types/notification.types";

type WrappedNotificationsResponse = {
  data?: NotificationsListResponse;
};

function isNotificationsListResponse(
  value: unknown,
): value is NotificationsListResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<NotificationsListResponse>;

  return Array.isArray(candidate.items) && "nextCursor" in candidate;
}

function normalizeNotificationsResponse(
  value: unknown,
): NotificationsListResponse {
  if (isNotificationsListResponse(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    isNotificationsListResponse((value as WrappedNotificationsResponse).data)
  ) {
    return (value as WrappedNotificationsResponse).data as NotificationsListResponse;
  }

  throw new Error("Invalid notifications response shape");
}

export async function getNotifications(
  cursor?: string,
  limit = 20,
): Promise<NotificationsListResponse> {
  const params: Record<string, string | number> = { limit };

  if (cursor) {
    params.cursor = cursor;
  }

  const res = await http.get<unknown>("/api/notifications", { params });

  return normalizeNotificationsResponse(res.data);
}
