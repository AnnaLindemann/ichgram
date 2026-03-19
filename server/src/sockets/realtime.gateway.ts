import type { PublicNotification } from "../modules/notifications/notifications.types.js";
import { getIo, getConversationRoom, getUserRoom } from "./socket.server.js";

export interface NewMessageRealtimePayload {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string;
    isRead: boolean;
  };
}

export interface NewNotificationRealtimePayload {
  notification: PublicNotification;
}

export function emitNewMessage(
  conversationId: string,
  payload: NewMessageRealtimePayload,
): void {
  const io = getIo();

  io.to(getConversationRoom(conversationId)).emit("message:new", payload);
}

export function emitNewNotification(
  userId: string,
  payload: NewNotificationRealtimePayload,
): void {
  const io = getIo();

  io.to(getUserRoom(userId)).emit("notification:new", payload);
}

export function emitMessageDeleted(
  conversationId: string,
  payload: { conversationId: string; messageId: string },
): void {
  const io = getIo();

  io.to(getConversationRoom(conversationId)).emit("message:deleted", payload);
}

export function emitMessagesRead(
  conversationId: string,
  payload: { conversationId: string; readerId: string },
): void {
  const io = getIo();

  io.to(getConversationRoom(conversationId)).emit("message:read", payload);
}