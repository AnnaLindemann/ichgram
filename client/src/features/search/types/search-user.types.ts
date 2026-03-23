export type SearchUser = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type SearchUsersSuccessResponse = {
  ok: true;
  data: {
    items: SearchUser[];
  };
};

export type SearchUsersErrorResponse = {
  ok: false;
  error?: string;
};

export type SearchUsersResponse =
  | SearchUsersSuccessResponse
  | SearchUsersErrorResponse;