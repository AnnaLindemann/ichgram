import { http } from "@/shared/api/http";

export type UnreadNotificationsCountResponse = {
  unreadCount: number;
};

type WrappedUnreadNotificationsCountResponse = {
  data?: UnreadNotificationsCountResponse;
};

function isUnreadNotificationsCountResponse(
  value: unknown,
): value is UnreadNotificationsCountResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UnreadNotificationsCountResponse>;

  return typeof candidate.unreadCount === "number";
}

function normalizeUnreadNotificationsCountResponse(
  value: unknown,
): UnreadNotificationsCountResponse {
  if (isUnreadNotificationsCountResponse(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    isUnreadNotificationsCountResponse(
      (value as WrappedUnreadNotificationsCountResponse).data,
    )
  ) {
    return (value as WrappedUnreadNotificationsCountResponse)
      .data as UnreadNotificationsCountResponse;
  }

  throw new Error("Invalid unread notifications count response shape");
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const res = await http.get<unknown>("/api/notifications/unread-count");
  const result = normalizeUnreadNotificationsCountResponse(res.data);

  return result.unreadCount;
}
