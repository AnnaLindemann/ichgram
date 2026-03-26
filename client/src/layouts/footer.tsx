import * as React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

type FooterItem =
  | {
      key: "home" | "explore" | "messages";
      label: string;
      type: "link";
      to: string;
    }
  | {
      key: "search" | "notifications" | "create";
      label: string;
      type: "action";
      onClick: () => void;
    };

type FooterProps = {
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onCreateClick: () => void;
};

export function Footer({
  onSearchClick,
  onNotificationsClick,
  onCreateClick,
}: FooterProps): React.ReactElement {
  const items: ReadonlyArray<FooterItem> = [
    { key: "home", label: "Home", type: "link", to: "/" },
    { key: "search", label: "Search", type: "action", onClick: onSearchClick },
    { key: "explore", label: "Explore", type: "link", to: "/explore" },
    { key: "messages", label: "Messages", type: "link", to: "/messages" },
    {
      key: "notifications",
      label: "Notifications",
      type: "action",
      onClick: onNotificationsClick,
    },
    { key: "create", label: "Create", type: "action", onClick: onCreateClick },
  ];

  return (
    <footer className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <nav
          aria-label="Footer"
          className="mx-auto grid w-full max-w-[560px] grid-cols-6 items-center text-center"
        >
          {items.map((item) => {
            if (item.type === "link") {
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "text-xs font-normal no-underline transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              );
            }

            return (
              <Button
                key={item.key}
                type="button"
                variant="link"
                className="h-auto justify-center p-0 text-xs font-normal text-muted-foreground no-underline hover:text-foreground"
                onClick={item.onClick}
              >
                {item.label}
              </Button>
            );
          })}
        </nav>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ICHgram
        </p>
      </div>
    </footer>
  );
}