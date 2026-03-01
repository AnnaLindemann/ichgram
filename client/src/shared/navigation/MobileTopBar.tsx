import { NavLink } from "react-router-dom";
import Logo from "@/assets/icons/Logo.svg";
import { User } from "lucide-react";

function cn(...v: Array<string | false | undefined>) {
  return v.filter(Boolean).join(" ");
}

export function MobileTopBar() {
  return (
    <header
      className={cn(
        "lg:hidden sticky top-0 z-40",
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <NavLink to="/" className="inline-flex items-center">
          <img src={Logo} alt="Ichgram" className="h-7 w-auto" />
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
              "hover:bg-muted",
              isActive && "bg-muted"
            )
          }
          aria-label="Profile"
        >
          <User className="h-5 w-5" />
        </NavLink>
      </div>
    </header>
  );
}