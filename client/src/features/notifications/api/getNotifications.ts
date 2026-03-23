import { getAuthToken } from "@/lib/auth-storage";
import type { NotificationsListResponse } from "../types/notification.types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

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
  const token = getAuthToken();

  if (!token) {
    throw new Error("Access token is missing");
  }

  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(limit));

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const rawData: unknown = await response.json();

  return normalizeNotificationsResponse(rawData);
}