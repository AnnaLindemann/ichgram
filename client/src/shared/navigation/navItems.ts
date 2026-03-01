import type { LucideIcon } from "lucide-react";
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, User } from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
   showInSidebar?: boolean;   
  showInMobileBottom?: boolean; 
}

export const navItems: NavItem[] = [
  {label: "Home", to: "/", icon: Home, showInSidebar: true, showInMobileBottom: true },
  {label: "Search", to: "/search", icon: Search, showInSidebar: true, showInMobileBottom: true},
  {label: "Explore", to: "/explore", icon: Compass, showInSidebar: true, showInMobileBottom: true},
  {label: "Messages", to: "/messages", icon:MessageCircle, showInSidebar: true, showInMobileBottom: true},
  {label: "Notifications", to: "/notifications", icon: Heart,showInSidebar: true, showInMobileBottom: true },
  {label: "Create", to: "/create", icon: PlusSquare, showInSidebar: true, showInMobileBottom: true},
  {label: "Profile", to:"/profile", icon:User, showInSidebar: true, showInMobileBottom: true}
]