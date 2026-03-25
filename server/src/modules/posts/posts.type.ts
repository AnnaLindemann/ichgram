export type CreatePostInput = {
  authorId: string;
  imageUrl: string;
  caption: string;
};

export type PostAuthorDto = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type PostDto = {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  isFollowingAuthor: boolean;
  author: PostAuthorDto;
};

export type CreatePostResponse = {
  ok: true;
  data: PostDto;
};

export type ListPostsMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  sort: "createdAt";
  order: "asc" | "desc";
};

export type ListPostsResponse = {
  ok: true;
  data: PostDto[];
  meta: ListPostsMeta;
};