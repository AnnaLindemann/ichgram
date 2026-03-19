import type { Request, Response } from "express";
import {
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notifications.service.js";
import { toPublicNotification } from "./notifications.mapper.js";
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from "./notifications.schemas.js";

export async function getNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const query = listNotificationsQuerySchema.parse(req.query);

  const result = await listNotifications({
  userId: req.user!.id,
  limit: query.limit,
  ...(query.cursor ? { cursor: query.cursor } : {}),
});

  res.status(200).json({
    ok: true,
    data: {
      items: result.items.map((item) => toPublicNotification(item)),
      nextCursor: result.nextCursor,
    },
  });
}

export async function getNotificationsUnreadCount(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await getUnreadNotificationsCount(req.user!.id);

  res.status(200).json({
    ok: true,
    data: result,
  });
}

export async function readNotification(
  req: Request,
  res: Response,
): Promise<void> {
  const params = notificationIdParamSchema.parse(req.params);

  const updated = await markNotificationAsRead(req.user!.id, params.id);

  res.status(200).json({
    ok: true,
    data: toPublicNotification(updated),
  });
}

export async function readAllNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await markAllNotificationsAsRead(req.user!.id);

  res.status(200).json({
    ok: true,
    data: result,
  });
}