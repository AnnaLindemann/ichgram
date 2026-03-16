import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "../modules/auth/auth.type.js";
import type { UserRole } from "../modules/users/users.type.js";

type JwtPayload = {
  id: string;
  email: string;
  username: string;
  role: UserRole,
};

function getJwtSecret(): string{
  const secret = process.env.JWT_SECRET;

  if(typeof secret !== "string" || secret.trim() === "") {
    throw new Error("JWT_SECRET is not configured")
  }
  return secret
}


export function signToken(user: AuthenticatedUser): string {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const secret = getJwtSecret();

  return jwt.sign(payload, secret, {
    expiresIn: "7d"
  })
}

export function verifyToken(tocken: string): JwtPayload {
  const secret = getJwtSecret();
  const decoded = jwt.verify(tocken,secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload")
  }
  const payload = decoded as JwtPayload;

  return payload;
}