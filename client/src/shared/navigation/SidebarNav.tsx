import { NavLink } from "react-router-dom";
import { navItems } from "./navItems";
import Logo from "@/assets/icons/Logo.svg";

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function SidebarNav() {
  const items = navItems.filter((item) => item.showInSidebar !== false);
  const topItems = items.filter((item) => item.to !== "/profile");
  const profileItem = items.find((item) => item.to === "/profile");

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-background">
      <div className="flex h-screen flex-col border-r border-[#dbdbdb] px-4 py-6">
        <NavLink to="/" end className="mb-4 inline-flex items-center px-3">
          <img src={Logo} alt="Ichgram" className="h-14 w-auto" />
        </NavLink>

        <nav className="flex flex-col gap-2">
          {topItems.map((item) => {
            const DefaultIcon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors",
                    isActive
                      ? "font-semibold text-black"
                      : "font-normal text-[#262626] hover:text-black",
                  )
                }
              >
                {({ isActive }) => {
                  const Icon =
                    isActive && item.activeIcon ? item.activeIcon : DefaultIcon;

                  return (
                    <>
                      <Icon className="h-6 w-6 shrink-0" />
                      <span>{item.label}</span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>

        {profileItem ? (
          <div className="mt-auto pt-6">
            <NavLink
              to={profileItem.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors",
                  isActive
                    ? "font-semibold text-black"
                    : "font-normal text-[#262626] hover:text-black",
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
                    <ProfileIcon className="h-6 w-6 shrink-0" />
                    <span>{profileItem.label}</span>
                  </>
                );
              }}
            </NavLink>
          </div>
        ) : null}
      </div>
    </aside>
  );
}