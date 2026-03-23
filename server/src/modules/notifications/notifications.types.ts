export const notificationTypes = ["follow", "like", "comment", "message"] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const notificationEntityTypes = ["follow", "like", "comment", "message"] as const;
export type NotificationEntityType = (typeof notificationEntityTypes)[number];

export interface PublicNotificationActor {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface PublicNotification {
  id: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  recipientId: string;
  actor: PublicNotificationActor;
  postId: string | null;
  postPreviewImageUrl: string | null;
  conversationId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}