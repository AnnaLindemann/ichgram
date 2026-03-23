import { NavLink } from "react-router-dom";
import Logo from "@/assets/icons/Logo.svg";
import { cn } from "@/lib/utils";
import { navItems } from "./navItems"

type SidebarNavProps = {
  onSearchClick: () => void;
};

export function SidebarNav({ onSearchClick }: SidebarNavProps) {
  const sidebarItems = navItems.filter((item) => item.showInSidebar);

  return (
    <aside className="hidden self-stretch border-r border-[#dbdbdb] lg:flex lg:w-64 lg:flex-col lg:bg-background">
      <div className="flex min-h-screen flex-1 flex-col px-4 py-6">
        <NavLink to="/" end className="mb-4 inline-flex items-center px-3">
          <img src={Logo} alt="Ichgram" className="h-14 w-auto" />
        </NavLink>

        <nav className="flex flex-col gap-2">
 {sidebarItems.map((item) => {
  const DefaultIcon = item.icon;

  if (item.kind === "action" && item.id === "search") {
    return (
      <button
        key={item.id}
        type="button"
        onClick={onSearchClick}
        className={cn(
          "flex items-center gap-4 rounded-xl px-3 py-3 text-base transition-colors",
          "font-normal text-[#262626] hover:text-black",
        )}
      >
        <DefaultIcon className="h-6 w-6 shrink-0" />
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
  }

  return null;
})}
        </nav>
      </div>
    </aside>
  );
}