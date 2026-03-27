import { http } from "@/shared/api/http";

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
  const res = await http.patch<unknown>("/api/notifications/read-all");

  return normalizeReadAllNotificationsResponse(res.data);
}
