import mongoose, {
  Schema,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";
import {
  notificationEntityTypes,
  notificationTypes,
  type NotificationEntityType,
  type NotificationType,
} from "./notifications.types.js";

export interface Notification {
  recipientId: Types.ObjectId;
  actorId: Types.ObjectId;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: Types.ObjectId;
  postId: Types.ObjectId | null;
  conversationId: Types.ObjectId | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;

type NotificationModelType = Model<Notification>;

const notificationSchema = new Schema<Notification, NotificationModelType>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: notificationTypes,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: notificationEntityTypes,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel =
  (mongoose.models.Notification as NotificationModelType | undefined) ??
  model<Notification, NotificationModelType>("Notification", notificationSchema);