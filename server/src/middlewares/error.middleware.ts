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
    const fieldErrors: Record<string, string> = {};

    for (const issue of err.issues) {
      const fieldName = issue.path[0];

      if (typeof fieldName === "string" && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
    }

    res.status(400).json({
      ok: false,
      message: "Validation failed",
      fieldErrors,
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      ok: false,
      message: err.message,
      fieldErrors: err.fieldErrors,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      ok: false,
      message: err.message || "Internal error",
    });
    return;
  }

  res.status(500).json({
    ok: false,
    message: "Internal error",
  });
}