import type { RegisterFormValues } from "@/features/auth/schemas/register.schema";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterSuccessResponse = {
  ok: true;
  data: {
    token: string;
    user: AuthUser;
  };
};

export type RegisterErrorResponse = {
  ok?: false;
  message?: string;
  fieldErrors?: Partial<Record<keyof RegisterFormValues, string>>;
};

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function registerUser(
  values: RegisterFormValues,
): Promise<{
  response: Response;
  data: RegisterResponse;
}> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const data: RegisterResponse = await response.json();

  return { response, data };
}