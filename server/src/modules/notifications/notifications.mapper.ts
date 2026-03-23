import type { NotificationDocument } from "./notifications.model.js";
import type { PublicNotification } from "./notifications.types.js";

type ObjectIdLike = {
  toString(): string;
};

type PopulatedActor = {
  _id: ObjectIdLike;
  username?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
};

type PopulatedPost = {
  _id: ObjectIdLike;
  imageUrl?: string | null;
};

export type NotificationWithActorAndPost = NotificationDocument & {
  actorId: PopulatedActor;
  postId: ObjectIdLike | PopulatedPost | null;
};

function getPostId(
  post: NotificationWithActorAndPost["postId"],
): string | null {
  if (!post) {
    return null;
  }

  if (typeof post === "object" && "_id" in post) {
    return post._id.toString();
  }

  return String(post);
}

function getPostPreviewImageUrl(
  post: NotificationWithActorAndPost["postId"],
): string | null {
  if (!post) {
    return null;
  }

  if (typeof post === "object" && "imageUrl" in post) {
    return post.imageUrl ?? null;
  }

  return null;
}

export function toPublicNotification(
  notification: NotificationWithActorAndPost,
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
    postId: getPostId(notification.postId),
    postPreviewImageUrl: getPostPreviewImageUrl(notification.postId),
    conversationId: notification.conversationId
      ? notification.conversationId.toString()
      : null,
    isRead: notification.isRead,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  };
}