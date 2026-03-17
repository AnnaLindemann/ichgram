import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/jwt.helper.js";

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      ok: false,
      error: "invalid authorization header",
    });
    return;
  }

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      ok: false,
      error: "invalid or expired token",
    });
  }
}