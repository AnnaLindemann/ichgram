import mongoose, { Types } from "mongoose";
import { HttpError } from "../../shared/http-error.js";
import { NotificationModel } from "./notifications.model.js";
import type {
  NotificationEntityType,
  NotificationType,
} from "./notifications.types.js";

interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  postId?: string | null;
  conversationId?: string | null;
}

interface ListNotificationsInput {
  userId: string;
  limit: number;
  cursor?: string;
}

function toObjectId(id: string): Types.ObjectId {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "invalid object id");
  }

  return new Types.ObjectId(id);
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  if (input.recipientId === input.actorId) {
    return;
  }

  await NotificationModel.create({
    recipientId: toObjectId(input.recipientId),
    actorId: toObjectId(input.actorId),
    type: input.type,
    entityType: input.entityType,
    entityId: toObjectId(input.entityId),
    postId: input.postId ? toObjectId(input.postId) : null,
    conversationId: input.conversationId
      ? toObjectId(input.conversationId)
      : null,
    isRead: false,
    readAt: null,
  });
}

export async function listNotifications(input: ListNotificationsInput) {
  const filter: {
    recipientId: Types.ObjectId;
    _id?: { $lt: Types.ObjectId };
  } = {
    recipientId: toObjectId(input.userId),
  };

  if (input.cursor) {
    filter._id = { $lt: toObjectId(input.cursor) };
  }

  const notifications = await NotificationModel.find(filter)
    .sort({ _id: -1 })
    .limit(input.limit + 1)
    .populate("actorId", "username fullName avatarUrl")
    .exec();

  const hasMore = notifications.length > input.limit;
  const items = hasMore ? notifications.slice(0, input.limit) : notifications;
  const nextCursor = hasMore ? items[items.length - 1]?._id.toString() ?? null : null;

  return {
    items,
    nextCursor,
  };
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
) {
  const updated = await NotificationModel.findOneAndUpdate(
    {
      _id: toObjectId(notificationId),
      recipientId: toObjectId(userId),
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
    },
  )
    .populate("actorId", "username fullName avatarUrl")
    .exec();

  if (!updated) {
    throw new HttpError(404, "notification not found");
  }

  return updated;
}

export async function markAllNotificationsAsRead(userId: string) {
  const result = await NotificationModel.updateMany(
    {
      recipientId: toObjectId(userId),
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  ).exec();

  return {
    updatedCount: result.modifiedCount,
  };
}

export async function getUnreadNotificationsCount(userId: string) {
  const count = await NotificationModel.countDocuments({
    recipientId: toObjectId(userId),
    isRead: false,
  }).exec();

  return {
    unreadCount: count,
  };
}