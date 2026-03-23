import type {
  ExplorePost,
  ExplorePostsResponse,
} from "../types/explore.types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function isExplorePostsResponse(value: unknown): value is ExplorePostsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ExplorePostsResponse>;

  return (
    typeof candidate.ok === "boolean" &&
    Array.isArray(candidate.data) &&
    typeof candidate.meta === "object" &&
    candidate.meta !== null
  );
}

function shufflePosts(posts: ExplorePost[]): ExplorePost[] {
  const result = [...posts];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    result[index] = result[randomIndex];
    result[randomIndex] = current;
  }

  return result;
}

export async function getExplorePosts(): Promise<ExplorePost[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/posts?page=1&limit=20&sort=createdAt&order=desc`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch explore posts");
  }

  const rawData: unknown = await response.json();

  if (!isExplorePostsResponse(rawData)) {
    throw new Error("Invalid explore posts response shape");
  }

  return shufflePosts(rawData.data);
}