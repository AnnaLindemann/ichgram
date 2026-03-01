import { Outlet } from "react-router-dom";
import { SidebarNav } from "@/shared/navigation/SidebarNav";
import { MobileBottomNav } from "@/shared/navigation/MobileBottomNav";
import { MobileTopBar } from "@/shared/navigation/MobileTopBar";

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <MobileTopBar />

      <div className="flex min-h-dvh w-full">
        <SidebarNav />

        <main className="flex-1 px-4 py-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] lg:pb-4">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}