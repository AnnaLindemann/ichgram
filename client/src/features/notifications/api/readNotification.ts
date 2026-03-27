import { http } from "@/shared/api/http";
import type { NotificationItem } from "../types/notification.types";

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
  const res = await http.patch<unknown>(
    `/api/notifications/${notificationId}/read`,
  );

  return normalizeNotificationResponse(res.data);
}
