import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  getNotificationsUnreadCount,
  readAllNotifications,
  readNotification,
} from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", asyncHandler(getNotifications));
notificationsRouter.get("/unread-count", asyncHandler(getNotificationsUnreadCount));
notificationsRouter.patch("/read-all", asyncHandler(readAllNotifications));
notificationsRouter.patch("/:id/read", asyncHandler(readNotification));