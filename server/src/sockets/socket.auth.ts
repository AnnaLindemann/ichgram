import type { Socket } from "socket.io";
import type { ExtendedError } from "socket.io";
import { verifyToken } from "../shared/jwt.helper.js";

export function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void,
): void {
  try {
    const token = extractToken(socket);

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    const payload = verifyToken(token);

    if (typeof payload.id !== "string" || payload.id.trim() === "") {
      next(new Error("Unauthorized"));
      return;
    }

    socket.data.userId = payload.id;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}

function extractToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth.token;

  if (typeof authToken === "string" && authToken.trim() !== "") {
    return stripBearerPrefix(authToken);
  }

  const authorizationHeader = socket.handshake.headers.authorization;

  if (
    typeof authorizationHeader === "string" &&
    authorizationHeader.trim() !== ""
  ) {
    return stripBearerPrefix(authorizationHeader);
  }

  return null;
}

function stripBearerPrefix(value: string): string {
  return value.startsWith("Bearer ") ? value.slice(7) : value;
}