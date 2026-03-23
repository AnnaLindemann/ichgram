import { getAuthToken } from "@/lib/auth-storage";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type ReadAllNotificationsResponse = {
  updatedCount: number;
};

type WrappedReadAllNotificationsResponse = {
  data?: ReadAllNotificationsResponse;
};

function isReadAllNotificationsResponse(
  value: unknown,
): value is ReadAllNotificationsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ReadAllNotificationsResponse>;

  return typeof candidate.updatedCount === "number";
}

function normalizeReadAllNotificationsResponse(
  value: unknown,
): ReadAllNotificationsResponse {
  if (isReadAllNotificationsResponse(value)) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    isReadAllNotificationsResponse(
      (value as WrappedReadAllNotificationsResponse).data,
    )
  ) {
    return (value as WrappedReadAllNotificationsResponse)
      .data as ReadAllNotificationsResponse;
  }

  throw new Error("Invalid read-all notifications response shape");
}

export async function readAllNotifications(): Promise<ReadAllNotificationsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Access token is missing");
  }

  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  const rawData: unknown = await response.json();

  return normalizeReadAllNotificationsResponse(rawData);
}