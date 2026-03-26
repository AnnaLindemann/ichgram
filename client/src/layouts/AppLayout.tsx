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

type ActiveOverlay = "search" | "notifications" | null;

const UNREAD_NOTIFICATIONS_POLLING_MS = 10000;

export default function AppLayout() {
  const location = useLocation();
   const dispatch = useAppDispatch();

  const currentProfile = useAppSelector((state) => state.profile.currentProfile);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

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

    async function refreshUnreadNotificationsCount() {
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

    void refreshUnreadNotificationsCount();

    const intervalId = window.setInterval(() => {
      void refreshUnreadNotificationsCount();
    }, UNREAD_NOTIFICATIONS_POLLING_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  function handleNotificationRead() {
    setUnreadNotificationsCount((currentCount) =>
      currentCount > 0 ? currentCount - 1 : 0
    );
  }

  function handleAllNotificationsRead() {
    setUnreadNotificationsCount(0);
  }

  return (
    <div className="min-h-dvh bg-background">
      <MobileTopBar />

      <div className="flex min-h-dvh w-full">
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

        <main className="flex-1 px-4 py-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] lg:pb-4">
          <Outlet />
        </main>
      </div>

      <div className="hidden md:block">
        <Footer 
         onSearchClick={openSearch}
    onNotificationsClick={openNotifications}
    onCreateClick={openCreatePost}/>
      </div>

      <SearchPanel isOpen={isSearchOpen} onClose={closeOverlays} />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={closeOverlays}
        onNotificationRead={handleNotificationRead}
        onAllNotificationsRead={handleAllNotificationsRead}
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