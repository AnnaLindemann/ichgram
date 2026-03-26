import type { Socket } from "socket.io";
import type { PublicNotification } from "../modules/notifications/notifications.types.js";
import type { NewMessageRealtimePayload, MessageUpdatedRealtimePayload  } from "./realtime.gateway.js";

export interface AuthenticatedSocketData {
  userId: string;
}

export interface ServerToClientEvents {
  "socket:ready": (payload: { userId: string; socketId: string }) => void;
  "message:new": (payload: NewMessageRealtimePayload) => void;
  "notification:new": (payload: {
    notification: PublicNotification;
  }) => void;
  "message:updated": (payload: MessageUpdatedRealtimePayload) => void;
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