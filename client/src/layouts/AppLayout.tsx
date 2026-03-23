import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { SidebarNav } from "@/shared/navigation/SidebarNav";
import { MobileBottomNav } from "@/shared/navigation/MobileBottomNav";
import { MobileTopBar } from "@/shared/navigation/MobileTopBar";
import { SearchPanel } from "@/features/search/components/SearchPanel";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { getUnreadNotificationsCount } from "@/features/notifications/api/getUnreadNotificationsCount";
import { Footer } from "./footer";

type ActiveOverlay = "search" | "notifications" | null;

const UNREAD_NOTIFICATIONS_POLLING_MS = 10000;

export default function AppLayout() {
  const location = useLocation();
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const isSearchOpen = activeOverlay === "search";
  const isNotificationsOpen = activeOverlay === "notifications";

  const openSearch = () => setActiveOverlay("search");
  const openNotifications = () => setActiveOverlay("notifications");
  const closeOverlays = () => setActiveOverlay(null);

  useEffect(() => {
    closeOverlays();
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
          onSearchClick={openSearch}
          onNotificationsClick={openNotifications}
          onRouteItemClick={closeOverlays}
        />

        <main className="flex-1 px-4 py-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] lg:pb-4">
          <Outlet />
        </main>
      </div>

      <div className="hidden md:block">
        <Footer />
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
        onRouteItemClick={closeOverlays}
      />
    </div>
  );
}