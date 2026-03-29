import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/assets/icons/Logo.svg";
import { LogOut, User } from "lucide-react";
import { logout } from "@/lib/logout";

function cn(...v: Array<string | false | undefined>) {
  return v.filter(Boolean).join(" ");
}

export function MobileTopBar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>

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
      </div>
    </header>
  );
}