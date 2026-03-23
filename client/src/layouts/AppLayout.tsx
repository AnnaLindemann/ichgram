import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarNav } from "@/shared/navigation/SidebarNav";
import { MobileBottomNav } from "@/shared/navigation/MobileBottomNav";
import { MobileTopBar } from "@/shared/navigation/MobileTopBar";
import { SearchPanel } from "@/features/search/comonents/SearchPanel";
import { Footer } from "./footer";

export default function AppLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      <MobileTopBar />

      <div className="flex min-h-dvh w-full">
        <SidebarNav onSearchClick={() => setIsSearchOpen(true)} />

        <main className="flex-1 px-4 py-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] lg:pb-4">
          <Outlet />
        </main>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      <MobileBottomNav />

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}