import type { ComponentType } from "react";
import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
} from "lucide-react";

type IconComponent = ComponentType<{ className?: string }>;

function HomeFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3.7 4 10v10a1 1 0 0 0 1 1h4.5a.5.5 0 0 0 .5-.5V15a2 2 0 0 1 4 0v5.5a.5.5 0 0 0 .5.5H19a1 1 0 0 0 1-1V10l-8-6.3Z" />
    </svg>
  );
}

function SearchFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" />
      <rect
        x="15.2"
        y="14.4"
        width="6.8"
        height="2.4"
        rx="1.2"
        transform="rotate(45 15.2 14.4)"
        fill="currentColor"
      />
    </svg>
  );
}

function CompassFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M14.9 9.1 13 13l-3.9 1.9L11 11l3.9-1.9Z"
        fill="white"
        stroke="white"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessagesFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3C6.477 3 2 7.03 2 12c0 2.143.832 4.11 2.223 5.657c.12.134.187.31.187.49v2.546a.8.8 0 0 0 1.13.73l2.775-1.234a.82.82 0 0 1 .522-.042c1.007.278 2.082.428 3.203.428c5.523 0 10-4.03 10-9s-4.477-9-10-9Z" />
      <path
        d="M7.7 13.35 10.58 10.3a1.2 1.2 0 0 1 1.72-.03l1.54 1.44c.22.206.56.206.78 0l2.08-1.95"
        fill="none"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21s-6.716-4.35-9.428-8.03C.923 10.75 1.3 7.62 3.76 5.91c2.25-1.56 5.05-.95 6.74 1.1 1.69-2.05 4.49-2.66 6.74-1.1 2.46 1.71 2.837 4.84 1.188 7.06C18.716 16.65 12 21 12 21Z" />
    </svg>
  );
}

function UserFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 12a4.25 4.25 0 1 0 0-8.5A4.25 4.25 0 0 0 12 12Zm0 2c-4.42 0-8 2.46-8 5.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1c0-3.04-3.58-5.5-8-5.5Z" />
    </svg>
  );
}

export type NavItem = {
  id: string;
  label: string;
  icon: IconComponent;
  activeIcon?: IconComponent;
  kind: "route" | "action";
  to?: string;
  showInSidebar?: boolean;
  showInMobileBottom?: boolean;
};

export const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    kind: "route",
    to: "/",
    icon: Home,
    activeIcon: HomeFilledIcon,
    showInSidebar: true,
    showInMobileBottom: true,
  },
  {
    id: "search",
    label: "Search",
    kind: "action",
    icon: Search,
    activeIcon: SearchFilledIcon,
    showInSidebar: true,
    showInMobileBottom: false,
  },
  {
    id: "explore",
    label: "Explore",
    kind: "route",
    to: "/explore",
    icon: Compass,
    activeIcon: CompassFilledIcon,
    showInSidebar: true,
    showInMobileBottom: true,
  },
  {
    id: "messages",
    label: "Messages",
    kind: "route",
    to: "/messages",
    icon: MessageCircle,
    activeIcon: MessagesFilledIcon,
    showInSidebar: true,
    showInMobileBottom: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    kind: "route",
    to: "/notifications",
    icon: Heart,
    activeIcon: HeartFilledIcon,
    showInSidebar: true,
    showInMobileBottom: true,
  },
  {
    id: "create",
    label: "Create",
    kind: "route",
    to: "/create",
    icon: PlusSquare,
    showInSidebar: true,
    showInMobileBottom: true,
  },
  {
    id: "profile",
    label: "Profile",
    kind: "route",
    to: "/profile",
    icon: User,
    activeIcon: UserFilledIcon,
    showInSidebar: true,
    showInMobileBottom: true,
  },
];