import type { LoginFormValues } from "../schemas/login.schemas";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  bio: string;
  website: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginSuccessResponse = {
  ok: true;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type LoginErrorResponse = {
  ok?: false;
  message?: string;
  fieldErrors?: Partial<Record<keyof LoginFormValues, string>>;
};

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function loginUser(
  values: LoginFormValues,
): Promise<{
  response: Response;
  data: LoginResponse;
}> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const data: LoginResponse = await response.json();

  return { response, data };
}