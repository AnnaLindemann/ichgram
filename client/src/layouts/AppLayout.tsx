import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { SidebarNav } from "@/shared/navigation/SidebarNav";
import { MobileBottomNav } from "@/shared/navigation/MobileBottomNav";
import { MobileTopBar } from "@/shared/navigation/MobileTopBar";
import { SearchPanel } from "@/features/search/components/SearchPanel";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { getUnreadNotificationsCount } from "@/features/notifications/api/getUnreadNotificationsCount";
import { Footer } from "./footer";
import { CreatePostDialog } from "@/features/posts/components/CreatePostDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";
import {
  connectChatSocket,
  disconnectChatSocket,
  onNewNotification,
} from "@/shared/socket/chatSocket";
import type { NotificationItem } from "@/features/notifications/types/notification.types";

type ActiveOverlay = "search" | "notifications" | null;

export default function AppLayout() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const currentProfile = useAppSelector((state) => state.profile.currentProfile);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<NotificationItem | null>(null);

  const isSearchOpen = activeOverlay === "search";
  const isNotificationsOpen = activeOverlay === "notifications";

  const openSearch = () => setActiveOverlay("search");
  const openNotifications = () => setActiveOverlay("notifications");
  const closeOverlays = () => setActiveOverlay(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const openCreatePost = () => {
    closeOverlays();
    setIsCreatePostOpen(true);
  };

  useEffect(() => {
    if (!currentProfile) {
      void dispatch(fetchMyProfile());
    }
  }, [currentProfile, dispatch]);

  useEffect(() => {
    closeOverlays();
    setIsCreatePostOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let isActive = true;

    async function fetchInitialUnreadCount() {
      try {
        const count = await getUnreadNotificationsCount();

        if (!isActive) {
          return;
        }

        setUnreadNotificationsCount(count);
      } catch {
        if (!isActive) {
          return;
        }
      }
    }

    void fetchInitialUnreadCount();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const socket = connectChatSocket();

    if (!socket) {
      return;
    }

    const offNewNotification = onNewNotification((payload) => {
      setUnreadNotificationsCount((current) => current + 1);
      setLatestNotification(payload.notification);
    });

    return () => {
      offNewNotification();
      disconnectChatSocket();
    };
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    let isActive = true;

    async function syncUnreadCount() {
      try {
        const count = await getUnreadNotificationsCount();

        if (!isActive) {
          return;
        }

        setUnreadNotificationsCount(count);
      } catch {
        if (!isActive) {
          return;
        }
      }
    }

    void syncUnreadCount();

    return () => {
      isActive = false;
    };
  }, [isNotificationsOpen]);

  function handleNotificationRead() {
    setUnreadNotificationsCount((current) => (current > 0 ? current - 1 : 0));
  }

  function handleAllNotificationsRead() {
    setUnreadNotificationsCount(0);
  }

  return (
    <div className="min-h-dvh bg-background">
      <MobileTopBar />

  <div className="flex min-h-dvh w-full">
  <div className="hidden lg:block fixed left-0 top-0 h-screen w-[240px]">
    <SidebarNav
      isSearchActive={isSearchOpen}
      isNotificationsActive={isNotificationsOpen}
      unreadNotificationsCount={unreadNotificationsCount}
      profileAvatarUrl={currentProfile?.user.avatarUrl ?? null}
      onSearchClick={openSearch}
      onNotificationsClick={openNotifications}
      onRouteItemClick={closeOverlays}
      onCreateClick={openCreatePost}
    />
  </div>

  <main className="flex-1 px-4 py-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] lg:ml-[285px] lg:pb-4">
    <Outlet />
  </main>
</div>

      <div className="hidden md:block">
        <Footer
          onSearchClick={openSearch}
          onNotificationsClick={openNotifications}
          onCreateClick={openCreatePost}
        />
      </div>

      <SearchPanel isOpen={isSearchOpen} onClose={closeOverlays} />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={closeOverlays}
        onNotificationRead={handleNotificationRead}
        onAllNotificationsRead={handleAllNotificationsRead}
        latestNotification={latestNotification}
      />

      <MobileBottomNav
        unreadNotificationsCount={unreadNotificationsCount}
        onSearchClick={openSearch}
        onNotificationsClick={openNotifications}
        onCreateClick={openCreatePost}
        onRouteItemClick={closeOverlays}
      />

      <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </div>
  );
}
