import type { Request, Response } from "express";
import { HttpError } from "../../shared/http-error.js";
import {
  createDirectConversationSchema,
  listConversationsQuerySchema,
  listMessagesQuerySchema,
  objectIdParamSchema,
  sendMessageSchema,
} from "./chat.schemas.js";
import {
  createOrGetDirectConversation,
  deleteOwnMessage,
  listConversationMessages,
  listMyConversations,
  markConversationMessagesAsRead,
  sendMessageToConversation,
} from "./chat.service.js";

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
  };
};

function getAuthenticatedUserId(req: AuthenticatedRequest): string {
  const userId = req.user?.id;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  return userId;
}

export async function createDirectConversationController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const currentUserId = getAuthenticatedUserId(req);
  const { participantId } = createDirectConversationSchema.parse(req.body);

  const conversation = await createOrGetDirectConversation(currentUserId, participantId);

  res.status(200).json({
    ok: true,
    data: conversation,
  });
}

export async function listMyConversationsController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const currentUserId = getAuthenticatedUserId(req);
  const pagination = listConversationsQuerySchema.parse(req.query);

  const result = await listMyConversations(currentUserId, pagination);

  res.status(200).json({
    ok: true,
    data: result,
  });
}

export async function listConversationMessagesController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const currentUserId = getAuthenticatedUserId(req);
  const { id: conversationId } = objectIdParamSchema.parse(req.params);
  const pagination = listMessagesQuerySchema.parse(req.query);

  const result = await listConversationMessages(conversationId, currentUserId, pagination);

  res.status(200).json({
    ok: true,
    data: result,
  });
}

export async function sendMessageToConversationController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const currentUserId = getAuthenticatedUserId(req);
  const { id: conversationId } = objectIdParamSchema.parse(req.params);
  const { text } = sendMessageSchema.parse(req.body);

  const message = await sendMessageToConversation(conversationId, currentUserId, text);

  res.status(201).json({
    ok: true,
    data: message,
  });
}

export async function deleteOwnMessageController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const currentUserId = getAuthenticatedUserId(req);
  const { id: messageId } = objectIdParamSchema.parse(req.params);

  const message = await deleteOwnMessage(messageId, currentUserId);

  res.status(200).json({
    ok: true,
    data: message,
  });
}

export async function markConversationMessagesAsReadController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const currentUserId = getAuthenticatedUserId(req);
  const { id: conversationId } = objectIdParamSchema.parse(req.params);

  const result = await markConversationMessagesAsRead(conversationId, currentUserId);

  res.status(200).json({
    ok: true,
    data: result,
  });
}