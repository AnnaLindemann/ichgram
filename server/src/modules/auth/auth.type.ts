import type { UserRole } from "../users/users.type.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole,
}