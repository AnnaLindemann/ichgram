import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/assets/icons/Logo.svg";
import { cn } from "@/lib/utils";
import { navItems } from "./navItems";
import { logout } from "@/lib/logout";
import { LogOut } from "lucide-react";

type SidebarNavProps = {
  isSearchActive: boolean;
  isNotificationsActive: boolean;
  unreadNotificationsCount: number;
  profileAvatarUrl?: string | null;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onRouteItemClick: () => void;
  onCreateClick: () => void;
};

export function SidebarNav({
  isSearchActive,
  isNotificationsActive,
  unreadNotificationsCount,
  profileAvatarUrl,
  onSearchClick,
  onNotificationsClick,
  onRouteItemClick,
  onCreateClick,
}: SidebarNavProps) {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const topItems = navItems.filter(
    (item) =>
      item.showInSidebar &&
      item.id !== "profile" &&
      item.id !== "logout" // 
  );

  const profileItem = navItems.find(
    (item) => item.showInSidebar && item.id === "profile"
  );

  return (
    <aside className="hidden self-stretch border-r border-[#dbdbdb] lg:flex lg:w-64 lg:flex-col lg:bg-background">
      <div className="flex min-h-screen flex-1 flex-col px-4 py-6">
        

        <NavLink to="/" end className="mb-4 inline-flex items-center px-3">
          <img src={Logo} alt="Ichgram" className="h-14 w-auto" />
        </NavLink>

        {/* NAV */}
        <nav className="flex flex-col gap-2">
          {topItems.map((item) => {
            const DefaultIcon = item.icon;

            if (item.id === "search") {
              const Icon =
                isSearchActive && item.activeIcon ? item.activeIcon : DefaultIcon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onSearchClick}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors",
                    isSearchActive
                      ? "font-semibold text-black"
                      : "font-normal text-[#262626] hover:text-black"
                  )}
                >
                  <Icon className="h-6 w-6 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }

            if (item.id === "notifications") {
              const Icon =
                isNotificationsActive && item.activeIcon
                  ? item.activeIcon
                  : DefaultIcon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onNotificationsClick}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-3 text-base transition-colors",
                    isNotificationsActive
                      ? "font-semibold text-black"
                      : "font-normal text-[#262626] hover:text-black"
                  )}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-6 w-6 shrink-0" />
                    <span>{item.label}</span>
                  </span>

                  {unreadNotificationsCount > 0 && (
                    <span className="ml-3 inline-flex min-w-5 items-center justify-center rounded-full bg-[#ff3040] px-1.5 text-[12px] font-semibold leading-5 text-white">
                      {unreadNotificationsCount > 99
                        ? "99+"
                        : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              );
            }

            if (item.id === "create") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onCreateClick}
                  className="flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors text-[#262626] hover:text-black"
                >
                  <item.icon className="h-6 w-6 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            }

            if (item.kind === "route" && item.to) {
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onRouteItemClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors",
                      isActive
                        ? "font-semibold text-black"
                        : "text-[#262626] hover:text-black"
                    )
                  }
                >
                  {({ isActive }) => {
                    const Icon =
                      isActive && item.activeIcon
                        ? item.activeIcon
                        : DefaultIcon;

                    return (
                      <>
                        <Icon className="h-6 w-6 shrink-0" />
                        <span>{item.label}</span>
                      </>
                    );
                  }}
                </NavLink>
              );
            }

            return null;
          })}
        </nav>


        {profileItem && profileItem.to && (
          <div className="pt-8">
            <NavLink
              to={profileItem.to}
              onClick={onRouteItemClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors",
                  isActive
                    ? "font-semibold text-black"
                    : "text-[#262626] hover:text-black"
                )
              }
            >
              {({ isActive }) => {
                const ProfileIcon =
                  isActive && profileItem.activeIcon
                    ? profileItem.activeIcon
                    : profileItem.icon;

                return (
                  <>
                    {profileAvatarUrl ? (
                      <img
                        src={profileAvatarUrl}
                        alt="My profile"
                        className={cn(
                          "h-6 w-6 rounded-full object-cover",
                          isActive ? "ring-2 ring-black" : ""
                        )}
                      />
                    ) : (
                      <ProfileIcon className="h-6 w-6" />
                    )}
                    <span>{profileItem.label}</span>
                  </>
                );
              }}
            </NavLink>
          </div>
        )}


        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 rounded-xl px-3 py-3 text-base text-[#262626] hover:text-black"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </aside>
  );
}