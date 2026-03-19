import mongoose, { Types } from "mongoose";
import { HttpError } from "../../shared/http-error.js";
import { UserModel } from "../users/users.model.js";
import { ConversationModel } from "./conversation.model.js";
import { MessageModel } from "./message.model.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  buildDirectConversationPairKey,
  toConversationDto,
  toMessageDto,
  type PopulatedConversationDocument,
} from "./chat.utils.js";
import type {
  ConversationDto,
  PaginatedConversationsDto,
  PaginatedMessagesDto,
  MessageDto,
} from "./chat.types.js";

interface PaginationInput {
  page: number;
  limit: number;
}

function calculatePagination(page: number, limit: number): { skip: number } {
  return {
    skip: (page - 1) * limit,
  };
}

async function ensureValidObjectId(
  id: string,
  fieldName: string,
): Promise<Types.ObjectId> {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `${fieldName} is invalid`);
  }

  return new Types.ObjectId(id);
}

async function ensureUserExists(userId: Types.ObjectId): Promise<void> {
  const userExists = await UserModel.exists({ _id: userId });

  if (!userExists) {
    throw new HttpError(404, "User not found");
  }
}


async function findConversationForParticipantOrThrow(
  conversationId: string,
  currentUserId: string,
): Promise<PopulatedConversationDocument> {
  const conversationObjectId = await ensureValidObjectId(
    conversationId,
    "conversationId",
  );
  const currentUserObjectId = await ensureValidObjectId(
    currentUserId,
    "currentUserId",
  );

  const conversation = await ConversationModel.findOne({
    _id: conversationObjectId,
    participants: currentUserObjectId,
  })
    .populate("participants", "username fullName avatarUrl")
    .exec();

  if (!conversation) {
    throw new HttpError(404, "Conversation not found");
  }

  return asPopulatedConversationDocument(conversation);
}

function getOtherParticipantId(
  participantIds: Types.ObjectId[],
  currentUserId: string,
): Types.ObjectId {
  const otherParticipant = participantIds.find(
    (participantId) => participantId.toString() !== currentUserId,
  );

  if (!otherParticipant) {
    throw new HttpError(500, "Conversation participant resolution failed");
  }

  return otherParticipant;
}

function asPopulatedConversationDocument(
  conversation: unknown,
): PopulatedConversationDocument {
  return conversation as PopulatedConversationDocument;
}

export async function createOrGetDirectConversation(
  currentUserId: string,
  participantId: string,
): Promise<ConversationDto> {
  const currentUserObjectId = await ensureValidObjectId(
    currentUserId,
    "currentUserId",
  );
  const participantObjectId = await ensureValidObjectId(
    participantId,
    "participantId",
  );

  if (currentUserObjectId.toString() === participantObjectId.toString()) {
    throw new HttpError(400, "Cannot create conversation with yourself");
  }

  await ensureUserExists(currentUserObjectId);
  await ensureUserExists(participantObjectId);

  const pairKey = buildDirectConversationPairKey(
    currentUserObjectId,
    participantObjectId,
  );

  let conversation = await ConversationModel.findOne({ pairKey })
    .populate("participants", "username fullName avatarUrl")
    .exec();

  if (!conversation) {
    try {
      conversation = await ConversationModel.create({
        participants: [currentUserObjectId, participantObjectId],
        pairKey,
        lastMessageText: null,
        lastMessageAt: null,
      });

      conversation = await ConversationModel.findById(conversation._id)
        .populate("participants", "username fullName avatarUrl")
        .exec();
    } catch (error: unknown) {
      const duplicateKeyError =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000;

      if (!duplicateKeyError) {
        throw error;
      }

      conversation = await ConversationModel.findOne({ pairKey })
        .populate("participants", "username fullName avatarUrl")
        .exec();
    }
  }

  if (!conversation) {
    throw new HttpError(500, "Conversation creation failed");
  }

  return toConversationDto(asPopulatedConversationDocument(conversation));
}

export async function listMyConversations(
  currentUserId: string,
  pagination: PaginationInput,
): Promise<PaginatedConversationsDto> {
  const currentUserObjectId = await ensureValidObjectId(
    currentUserId,
    "currentUserId",
  );
  const { page, limit } = pagination;
  const { skip } = calculatePagination(page, limit);

  const [items, total] = await Promise.all([
    ConversationModel.find({ participants: currentUserObjectId })
      .populate("participants", "username fullName avatarUrl")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    ConversationModel.countDocuments({ participants: currentUserObjectId }),
  ]);

  return {
    items: items.map((conversation) =>
      toConversationDto(asPopulatedConversationDocument(conversation)),
    ),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function listConversationMessages(
  conversationId: string,
  currentUserId: string,
  pagination: PaginationInput,
): Promise<PaginatedMessagesDto> {
  const conversation = await findConversationForParticipantOrThrow(
    conversationId,
    currentUserId,
  );

  const { page, limit } = pagination;
  const { skip } = calculatePagination(page, limit);

  const [items, total] = await Promise.all([
    MessageModel.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    MessageModel.countDocuments({ conversationId: conversation._id }),
  ]);

  return {
    items: items.map(toMessageDto),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function sendMessageToConversation(
  conversationId: string,
  currentUserId: string,
  text: string,
): Promise<MessageDto> {
  const conversation = await findConversationForParticipantOrThrow(
    conversationId,
    currentUserId,
  );

  const currentUserObjectId = await ensureValidObjectId(
    currentUserId,
    "currentUserId",
  );

  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new HttpError(400, "text is required");
  }

  const message = await MessageModel.create({
    conversationId: conversation._id,
    senderId: currentUserObjectId,
    text: trimmedText,
    isRead: false,
    isDeleted: false,
    deletedAt: null,
  });

  await ConversationModel.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessageText: trimmedText,
        lastMessageAt: message.createdAt,
      },
    },
  ).exec();

  const recipientId = getOtherParticipantId(
    conversation.participants.map(
      (participant) => new Types.ObjectId(participant._id),
    ),
    currentUserId,
  );

  try {
    await createNotification({
      recipientId: recipientId.toString(),
      actorId: currentUserId,
      type: "message",
      entityType: "message",
      entityId: message._id.toString(),
      conversationId: conversation._id.toString(),
    });
  } catch (error: unknown) {
    console.error("Failed to create message notification", error);
  }

  return toMessageDto(message);
}

export async function deleteOwnMessage(
  messageId: string,
  currentUserId: string,
): Promise<MessageDto> {
  const messageObjectId = await ensureValidObjectId(messageId, "messageId");
  const currentUserObjectId = await ensureValidObjectId(
    currentUserId,
    "currentUserId",
  );

  const message = await MessageModel.findById(messageObjectId).exec();

  if (!message) {
    throw new HttpError(404, "Message not found");
  }

  if (message.senderId.toString() !== currentUserObjectId.toString()) {
    throw new HttpError(403, "You can delete only your own messages");
  }

  if (message.isDeleted) {
    return toMessageDto(message);
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.text = "[deleted message]";

  await message.save();

  return toMessageDto(message);
}

export async function markConversationMessagesAsRead(
  conversationId: string,
  currentUserId: string,
): Promise<{ updatedCount: number }> {
  const conversation = await findConversationForParticipantOrThrow(
    conversationId,
    currentUserId,
  );

  const currentUserObjectId = await ensureValidObjectId(
    currentUserId,
    "currentUserId",
  );

  const otherParticipantId = getOtherParticipantId(
    conversation.participants.map(
      (participant) => new Types.ObjectId(participant._id),
    ),
    currentUserId,
  );

  const result = await MessageModel.updateMany(
    {
      conversationId: conversation._id,
      senderId: otherParticipantId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  ).exec();

  return {
    updatedCount: result.modifiedCount,
  };
}