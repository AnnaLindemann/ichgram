export type CommentAuthorDto = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type CommentDto = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthorDto;
};

export type GetCommentsSuccessResponse = {
  ok: true;
  data: CommentDto[];
};

export type GetCommentsErrorResponse = {
  ok: false;
  error: string;
};

export type GetCommentsApiResponse =
  | GetCommentsSuccessResponse
  | GetCommentsErrorResponse;

export type CreateCommentSuccessResponse = {
  ok: true;
  data: CommentDto;
};

export type CreateCommentErrorResponse = {
  ok: false;
  error: string;
};

export type CreateCommentApiResponse =
  | CreateCommentSuccessResponse
  | CreateCommentErrorResponse;

export type CreateCommentInput = {
  content: string;
};