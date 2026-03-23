import { getAuthToken } from "@/lib/auth-storage";
import type { NotificationItem } from "../types/notification.types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type WrappedNotificationResponse = {
  data?: NotificationItem;
};

function isNotificationItem(value: unknown): value is NotificationItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<NotificationItem>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.entityType === "string" &&
    typeof candidate.entityId === "string" &&
    typeof candidate.recipientId === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.isRead === "boolean" &&
    "actor" in candidate
  );
}

function normalizeNotificationResponse(value: unknown): NotificationItem {
  if (isNotificationItem(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    isNotificationItem((value as WrappedNotificationResponse).data)
  ) {
    return (value as WrappedNotificationResponse).data as NotificationItem;
  }

  throw new Error("Invalid notification response shape");
}

export async function readNotification(
  notificationId: string,
): Promise<NotificationItem> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Access token is missing");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  const rawData: unknown = await response.json();

  return normalizeNotificationResponse(rawData);
}