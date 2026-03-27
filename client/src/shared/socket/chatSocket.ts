import { io, type Socket } from "socket.io-client";

import { getAuthToken } from "@/lib/auth-storage";
import type {
  MessageDeletedSocketPayload,
  MessageReadSocketPayload,
  NewMessageSocketPayload,
  MessageUpdatedSocketPayload,
  SocketReadyPayload,
} from "@/features/chat/types/chat.types";
import type { NotificationItem } from "@/features/notifications/types/notification.types";

type NotificationNewPayload = {
  notification: NotificationItem;
};

type ServerToClientEvents = {
  "socket:ready": (payload: SocketReadyPayload) => void;
  "message:new": (payload: NewMessageSocketPayload) => void;
  "message:updated": (payload: MessageUpdatedSocketPayload) => void;
  "message:deleted": (payload: MessageDeletedSocketPayload) => void;
  "message:read": (payload: MessageReadSocketPayload) => void;
  "notification:new": (payload: NotificationNewPayload) => void;
};

type ClientToServerEvents = {
  "chat:join": (conversationId: string) => void;
  "chat:leave": (conversationId: string) => void;
};

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: ChatSocket | null = null;

function getSocketUrl(): string {
  return import.meta.env.VITE_API_URL;
}

export function connectChatSocket(): ChatSocket | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(getSocketUrl(), {
    transports: ["websocket"],
    auth: {
      token: `Bearer ${token}`,
    },
  });

  return socketInstance;
}

export function getChatSocket(): ChatSocket | null {
  return socketInstance;
}

export function disconnectChatSocket(): void {
  if (!socketInstance) {
    return;
  }

  socketInstance.disconnect();
  socketInstance = null;
}

export function joinConversationRoom(conversationId: string): void {
  if (!socketInstance) {
    return;
  }

  socketInstance.emit("chat:join", conversationId);
}

export function leaveConversationRoom(conversationId: string): void {
  if (!socketInstance) {
    return;
  }

  socketInstance.emit("chat:leave", conversationId);
}

export function onSocketReady(
  handler: (payload: SocketReadyPayload) => void,
): () => void {
  if (!socketInstance) {
    return () => undefined;
  }

  socketInstance.on("socket:ready", handler);

  return () => {
    socketInstance?.off("socket:ready", handler);
  };
}

export function onNewMessage(
  handler: (payload: NewMessageSocketPayload) => void,
): () => void {
  if (!socketInstance) {
    return () => undefined;
  }

  socketInstance.on("message:new", handler);

  return () => {
    socketInstance?.off("message:new", handler);
  };
}

export function onMessageUpdated(
  handler: (payload: MessageUpdatedSocketPayload) => void,
): () => void {
  if (!socketInstance) {
    return () => undefined;
  }

  socketInstance.on("message:updated", handler);

  return () => {
    socketInstance?.off("message:updated", handler);
  };
}

export function onMessageDeleted(
  handler: (payload: MessageDeletedSocketPayload) => void,
): () => void {
  if (!socketInstance) {
    return () => undefined;
  }

  socketInstance.on("message:deleted", handler);

  return () => {
    socketInstance?.off("message:deleted", handler);
  };
}

export function onMessageRead(
  handler: (payload: MessageReadSocketPayload) => void,
): () => void {
  if (!socketInstance) {
    return () => undefined;
  }

  socketInstance.on("message:read", handler);

  return () => {
    socketInstance?.off("message:read", handler);
  };
}

export function onNewNotification(
  handler: (payload: NotificationNewPayload) => void,
): () => void {
  if (!socketInstance) {
    return () => undefined;
  }

  socketInstance.on("notification:new", handler);

  return () => {
    socketInstance?.off("notification:new", handler);
  };
}
