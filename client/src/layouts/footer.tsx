import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FooterKey = "home" | "search" | "explore" | "messages" | "notifications" | "create";

const ITEMS: ReadonlyArray<{ key: FooterKey; label: string }> = [
  { key: "home", label: "Home" },
  { key: "search", label: "Search" },
  { key: "explore", label: "Explore" },
  { key: "messages", label: "Messages" },
  { key: "notifications", label: "Notifications" },
  { key: "create", label: "Create" },
];

function titleFor(key: FooterKey): string {
  // Minimal: one title line is enough
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function Footer(): React.ReactElement {
  const [open, setOpen] = React.useState<boolean>(false);
  const [active, setActive] = React.useState<FooterKey>("home");

  return (
    <footer className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* Links row */}
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {ITEMS.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant="link"
              className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground no-underline"
              onClick={() => {
                setActive(item.key);
                setOpen(true);
              }}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ICHgram
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{titleFor(active)}</DialogTitle>
              <DialogDescription>Coming soon.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}