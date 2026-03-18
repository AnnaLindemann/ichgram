import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../shared/http-error.js";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];

    res.status(400).json({
      ok: false,
      error: firstIssue?.message ?? "validation error",
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      ok: false,
      error: err.message,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      ok: false,
      error: err.message || "internal error",
    });
    return;
  }

  res.status(500).json({
    ok: false,
    error: "internal error",
  });
}