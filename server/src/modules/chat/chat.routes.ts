import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  createDirectConversationController,
  deleteOwnMessageController,
  listConversationMessagesController,
  listMyConversationsController,
  markConversationMessagesAsReadController,
  sendMessageToConversationController,
} from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.post("/conversations/direct", asyncHandler(createDirectConversationController));
chatRouter.get("/conversations", asyncHandler(listMyConversationsController));
chatRouter.get("/conversations/:id/messages", asyncHandler(listConversationMessagesController));
chatRouter.post("/conversations/:id/messages", asyncHandler(sendMessageToConversationController));
chatRouter.patch(
  "/conversations/:id/read",
  asyncHandler(markConversationMessagesAsReadController),
);
chatRouter.delete("/messages/:id", asyncHandler(deleteOwnMessageController));