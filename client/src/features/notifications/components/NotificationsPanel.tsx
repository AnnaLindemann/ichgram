import { useEffect, useMemo, useState } from "react";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import { getNotifications } from "../api/getNotifications";
import { readNotification } from "../api/readNotification";
import { readAllNotifications } from "../api/readAllNotifications";
import type { NotificationItem } from "../types/notification.types";

type NotificationsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead: () => void;
  onAllNotificationsRead: () => void;
};

type NotificationsState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; items: NotificationItem[] }
  | { status: "error"; message: string };

const NOTIFICATIONS_PANEL_POLLING_MS = 5000;

function getNotificationContent(notification: NotificationItem): string {
  switch (notification.type) {
    case "follow":
      return "started following.";
    case "like":
      return "liked your photo.";
    case "comment":
      return "commented on your photo.";
    case "message":
      return "sent you a message.";
    default:
      return "sent a notification.";
  }
}

type NotificationRowProps = {
  notification: NotificationItem;
  onRead: (notificationId: string) => void;
};

function NotificationRow({ notification, onRead }: NotificationRowProps) {
  const avatarFallback = notification.actor.username.charAt(0).toUpperCase();

  return (
    <li className="flex items-start gap-3">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#d9d9d9]">
        {notification.actor.avatarUrl ? (
          <img
            src={notification.actor.avatarUrl}
            alt={notification.actor.username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-black">
            {avatarFallback}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRead(notification.id)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="text-[16px] leading-5 text-black">
          <span className="font-semibold">{notification.actor.username}</span>{" "}
          {getNotificationContent(notification)}{" "}
          <span className="text-[#8e8e8e]">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </p>
      </button>

      {!notification.isRead ? (
        <div
          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0095f6]"
          aria-label="Unread notification"
          title="Unread notification"
        />
      ) : null}

      {notification.postPreviewImageUrl ? (
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[8px] bg-[#d9d9d9]">
          <img
            src={notification.postPreviewImageUrl}
            alt="Post preview"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </li>
  );
}

export function NotificationsPanel({
  isOpen,
  onClose,
  onNotificationRead,
  onAllNotificationsRead,
}: NotificationsPanelProps) {
  const [state, setState] = useState<NotificationsState>({ status: "loading" });
  const [isReadingAll, setIsReadingAll] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActive = true;

    async function loadNotifications(showLoading = false) {
      if (showLoading) {
        setState({ status: "loading" });
      }

      try {
        const result = await getNotifications();

        if (!isActive) {
          return;
        }

        if (result.items.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({ status: "ready", items: result.items });
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load notifications";

        setState((currentState) => {
          if (!showLoading && currentState.status === "ready") {
            return currentState;
          }

          return { status: "error", message };
        });
      }
    }

    void loadNotifications(true);

    const intervalId = window.setInterval(() => {
      void loadNotifications(false);
    }, NOTIFICATIONS_PANEL_POLLING_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isOpen]);

  async function handleRead(notificationId: string) {
    if (state.status !== "ready") {
      return;
    }

    const target = state.items.find((item) => item.id === notificationId);

    if (!target || target.isRead) {
      return;
    }

    try {
      const updatedNotification = await readNotification(notificationId);

      setState((currentState) => {
        if (currentState.status !== "ready") {
          return currentState;
        }

        const updatedItems = currentState.items.map((item) =>
          item.id === notificationId ? updatedNotification : item
        );

        return {
          status: "ready",
          items: updatedItems,
        };
      });

      onNotificationRead();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read";

      console.error(message);
    }
  }

  async function handleReadAll() {
    if (state.status !== "ready" || isReadingAll) {
      return;
    }

    const hasUnread = state.items.some((item) => !item.isRead);

    if (!hasUnread) {
      return;
    }

    try {
      setIsReadingAll(true);
      await readAllNotifications();

      setState((currentState) => {
        if (currentState.status !== "ready") {
          return currentState;
        }

        return {
          status: "ready",
          items: currentState.items.map((item) => ({
            ...item,
            isRead: true,
            readAt: item.readAt ?? new Date().toISOString(),
          })),
        };
      });

      onAllNotificationsRead();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read";

      console.error(message);
    } finally {
      setIsReadingAll(false);
    }
  }

  const content = useMemo(() => {
    if (state.status === "loading") {
      return (
        <div className="pt-2 text-[14px] text-[#8e8e8e]">
          Loading notifications...
        </div>
      );
    }

    if (state.status === "error") {
      return (
        <div className="pt-2 text-[14px] text-red-500">{state.message}</div>
      );
    }

    if (state.status === "empty") {
      return (
        <div className="pt-2 text-[14px] text-[#8e8e8e]">
          No notifications yet.
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-black">New</h3>

          {state.items.some((item) => !item.isRead) ? (
            <button
              type="button"
              onClick={handleReadAll}
              disabled={isReadingAll}
              className="text-[14px] font-medium text-[#0095f6] disabled:opacity-50"
            >
              {isReadingAll ? "Marking..." : "Mark all as read"}
            </button>
          ) : null}
        </div>

        <ul className="space-y-5">
          {state.items.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onRead={handleRead}
            />
          ))}
        </ul>
      </>
    );
  }, [state, isReadingAll]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications panel"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 lg:left-64"
      />

      <aside
        className="
          fixed inset-y-0 left-0 z-50 w-full bg-white
          lg:left-64 lg:w-[368px] lg:rounded-tr-[30px] lg:border-r lg:border-[#dbdbdb]
        "
      >
        <div className="flex h-full flex-col px-6 pt-6">
          <div className="mb-8 flex items-center justify-between lg:block">
            <h2 className="text-[32px] font-bold leading-none text-black">
              Notifications
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-black lg:hidden"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-6">{content}</div>
        </div>
      </aside>
    </>
  );
}