export interface ExplorePostAuthor {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface ExplorePost {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: ExplorePostAuthor;
}

export interface ExplorePostsMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  sort: string;
  order: "asc" | "desc";
}

export interface ExplorePostsResponse {
  ok: boolean;
  data: ExplorePost[];
  meta: ExplorePostsMeta;
}