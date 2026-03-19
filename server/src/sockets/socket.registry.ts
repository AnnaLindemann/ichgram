const userSockets = new Map<string, Set<string>>();
const socketToUser = new Map<string, string>();

export function registerSocket(userId: string, socketId: string): void {
  const existingSockets = userSockets.get(userId) ?? new Set<string>();

  existingSockets.add(socketId);
  userSockets.set(userId, existingSockets);
  socketToUser.set(socketId, userId);
}

export function unregisterSocket(socketId: string): void {
  const userId = socketToUser.get(socketId);

  if (!userId) {
    return;
  }

  socketToUser.delete(socketId);

  const existingSockets = userSockets.get(userId);

  if (!existingSockets) {
    return;
  }

  existingSockets.delete(socketId);

  if (existingSockets.size === 0) {
    userSockets.delete(userId);
  }
}

export function getSocketIdsByUserId(userId: string): string[] {
  return Array.from(userSockets.get(userId) ?? []);
}

export function getUserIdBySocketId(socketId: string): string | null {
  return socketToUser.get(socketId) ?? null;
}

export function isUserOnline(userId: string): boolean {
  const sockets = userSockets.get(userId);

  return typeof sockets !== "undefined" && sockets.size > 0;
}