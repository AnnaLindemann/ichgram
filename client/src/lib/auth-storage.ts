const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

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

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}