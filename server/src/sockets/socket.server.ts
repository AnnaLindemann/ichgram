import type { Server as HttpServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { ConversationModel } from "../modules/chat/conversation.model.js";
import { authenticateSocket } from "./socket.auth.js";
import { registerSocket, unregisterSocket } from "./socket.registry.js";
import type { AuthenticatedSocket } from "./socket.types.js";

let ioInstance: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    handleConnection(socket as AuthenticatedSocket);
  });

  ioInstance = io;

  return io;
}

export function getIo(): Server {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized");
  }

  return ioInstance;
}

function handleConnection(socket: AuthenticatedSocket): void {
  const { userId } = socket.data;

  registerSocket(userId, socket.id);

  socket.join(getUserRoom(userId));

  socket.on("chat:join", async (conversationId: string) => {
    if (typeof conversationId !== "string" || conversationId.trim() === "") {
      return;
    }

    const canJoin = await canJoinConversation(userId, conversationId);

    if (!canJoin) {
      return;
    }

    socket.join(getConversationRoom(conversationId));
  });

  socket.on("chat:leave", (conversationId: string) => {
    if (typeof conversationId !== "string" || conversationId.trim() === "") {
      return;
    }

    socket.leave(getConversationRoom(conversationId));
  });

  socket.on("disconnect", () => {
    unregisterSocket(socket.id);
  });

  socket.emit("socket:ready", {
    userId,
    socketId: socket.id,
  });
}

async function canJoinConversation(
  userId: string,
  conversationId: string,
): Promise<boolean> {
  if (!mongoose.isValidObjectId(conversationId)) {
    return false;
  }

  if (!mongoose.isValidObjectId(userId)) {
    return false;
  }

  const conversation = await ConversationModel.exists({
    _id: conversationId,
    participants: userId,
  });

  return Boolean(conversation);
}

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getConversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}