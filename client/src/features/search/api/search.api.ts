import type {
  SearchUser,
  SearchUsersResponse,
} from "../types/search-user.types";

type SearchUsersResult =
  | { ok: true; data: SearchUser[] }
  | { ok: false; error: string };

export async function searchUsers(query: string): Promise<SearchUsersResult> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return { ok: true, data: [] };
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    limit: "8",
  });

  const response = await fetch(`/api/users/search?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const payload = (await response.json()) as SearchUsersResponse;

  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      error:
        "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "Failed to search users",
    };
  }

  return {
    ok: true,
    data: payload.data.items,
  };
}