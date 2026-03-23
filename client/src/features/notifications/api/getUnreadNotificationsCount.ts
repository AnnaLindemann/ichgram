import { getAuthToken } from "@/lib/auth-storage";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

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
  const token = getAuthToken();

  if (!token) {
    throw new Error("Access token is missing");
  }

  const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread notifications count");
  }

  const rawData: unknown = await response.json();
  const result = normalizeUnreadNotificationsCountResponse(rawData);

  return result.unreadCount;
}