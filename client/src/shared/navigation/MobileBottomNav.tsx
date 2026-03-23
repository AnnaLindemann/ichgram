import { NavLink } from "react-router-dom";
import { navItems, type NavItem } from "./navItems";

function cn(...v: Array<string | false | undefined>) {
  return v.filter(Boolean).join(" ");
}

type RouteNavItem = NavItem & {
  kind: "route";
  to: string;
};

function isMobileRouteItem(item: NavItem): item is RouteNavItem {
  return item.showInMobileBottom !== false && item.kind === "route" && typeof item.to === "string";
}

export function MobileBottomNav() {
  const items = navItems.filter(isMobileRouteItem).slice(0, 5);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      )}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-xl transition",
                  "hover:bg-muted",
                  isActive && "bg-muted"
                )
              }
              aria-label={item.label}
            >
              <Icon className="h-6 w-6" />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}