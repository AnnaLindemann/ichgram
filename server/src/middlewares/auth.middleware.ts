import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../modules/auth/auth.type.js";
import { verifyTocken } from "../shared/jwt.helper.js";



export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorizationHeader = req.headers.authorization;

  if (typeof authorizationHeader !== "string" || authorizationHeader.trim() === ""){
    res.status(401).json({ok: false, error: "authorization header is required"});
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if(scheme !== "Bearer" || typeof token !== "string" || token.trim() === ""){
    res.status(401).json({ok: false, error: "invalid authorization format"});
    return;
  }

try{
  const payload = verifyTocken(token);

  const authenticatedUser: AuthenticatedUser = {
    id: payload.id,
    email: payload.email,
    username: payload.username,
  };
  req.user = authenticatedUser;
  next()
} catch{
  res.status(401).json({ok: false, error: "invalid or expired token"  })
}


}