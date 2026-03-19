import type { NotificationDocument } from "./notifications.model.js";
import type { PublicNotification } from "./notifications.types.js";

type PopulatedActor = {
  _id: { toString(): string };
  username?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

export type NotificationWithActor = NotificationDocument & {
  actorId: PopulatedActor;
};

export function toPublicNotification(
  notification: NotificationWithActor,
): PublicNotification {
  return {
    id: notification._id.toString(),
    type: notification.type,
    entityType: notification.entityType,
    entityId: notification.entityId.toString(),
    recipientId: notification.recipientId.toString(),
    actor: {
      id: notification.actorId._id.toString(),
      username: notification.actorId.username ?? "",
      fullName: notification.actorId.fullName ?? null,
      avatarUrl: notification.actorId.avatarUrl ?? null,
    },
    postId: notification.postId ? notification.postId.toString() : null,
    conversationId: notification.conversationId
      ? notification.conversationId.toString()
      : null,
    isRead: notification.isRead,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  };
}