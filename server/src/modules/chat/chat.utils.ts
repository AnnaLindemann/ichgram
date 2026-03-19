import { Types } from "mongoose";
import type { ConversationDocument } from "./conversation.model.js";
import type { MessageDocument } from "./message.model.js";
import type { ChatParticipantDto, ConversationDto, MessageDto } from "./chat.types.js";

export interface ParticipantLike {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface PopulatedConversationDocument
  extends Omit<ConversationDocument, "participants"> {
  participants: ParticipantLike[];
}

export function buildDirectConversationPairKey(
  firstUserId: string | Types.ObjectId,
  secondUserId: string | Types.ObjectId,
): string {
  const normalizedIds = [firstUserId.toString(), secondUserId.toString()].sort();

  return normalizedIds.join(":");
}

export function toChatParticipantDto(participant: ParticipantLike): ChatParticipantDto {
  return {
    id: participant._id.toString(),
    username: participant.username,
    fullName: participant.fullName,
    avatarUrl: participant.avatarUrl ?? null,
  };
}

export function toConversationDto(
  conversation: PopulatedConversationDocument,
): ConversationDto {
  return {
    id: conversation._id.toString(),
    participants: conversation.participants.map(toChatParticipantDto),
    lastMessageText: conversation.lastMessageText,
    lastMessageAt: conversation.lastMessageAt
      ? conversation.lastMessageAt.toISOString()
      : null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function toMessageDto(message: MessageDocument): MessageDto {
  return {
    id: message._id.toString(),
    conversationId: message.conversationId.toString(),
    senderId: message.senderId.toString(),
    text: message.text,
    isRead: message.isRead,
    isDeleted: message.isDeleted,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}