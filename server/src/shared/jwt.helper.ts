import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "../modules/auth/auth.type.js";

type JwPayload = {
  id: string;
  email: string;
  username: string;
};

function getJwtSecret(): string{
  const secret = process.env.JWT_SECRET;

  if(typeof secret !== "string" || secret.trim() === "") {
    throw new Error("JWT_SECRET is not configured")
  }
  return secret
}


export function signTocken(user: AuthenticatedUser): string {
  const payload: JwPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const secret = getJwtSecret();

  return jwt.sign(payload, secret, {
    expiresIn: "7d"
  })
}

export function verifyTocken(tocken: string): JwPayload {
  const secret = getJwtSecret();
  const decoded = jwt.verify(tocken,secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload")
  }
  const payload = decoded as JwPayload;

  return payload;
}