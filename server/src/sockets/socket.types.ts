import type { Socket } from "socket.io";
import type { PublicNotification } from "../modules/notifications/notifications.types.js";

export interface AuthenticatedSocketData {
  userId: string;
}

export interface ServerToClientEvents {
  "socket:ready": (payload: { userId: string; socketId: string }) => void;
  "message:new": (payload: {
    conversationId: string;
    message: {
      id: string;
      conversationId: string;
      senderId: string;
      text: string;
      createdAt: string;
      isRead: boolean;
    };
  }) => void;
  "notification:new": (payload: {
    notification: PublicNotification;
  }) => void;
  "message:deleted": (payload: {
    conversationId: string;
    messageId: string;
  }) => void;
  "message:read": (payload: {
    conversationId: string;
    readerId: string;
  }) => void;
}

export interface ClientToServerEvents {
  "chat:join": (conversationId: string) => void;
  "chat:leave": (conversationId: string) => void;
}

export type AuthenticatedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  AuthenticatedSocketData
>;