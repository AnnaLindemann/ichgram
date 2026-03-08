import type { AuthenticatedUser } from "../modules/auth/auth.type.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {}