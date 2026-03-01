import { NavLink } from "react-router-dom";
import {navItems} from "./navItems"
import Logo from "@/assets/icons/Logo.svg"

function cn(...v: Array<string | false | undefined>){
 return v.filter(Boolean).join(" ")
}

export function SidebarNav(){
  const items = navItems.filter((x) => x.showInSidebar !== false)
 const topItems = items.filter((x) => x.to !== "/profile")
 const profileItem = items.find((x) => x.to === "/profile")

  return(
   <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:bg-background">
  <div className="flex h-[calc(100dvh-5rem)] flex-col border-r px-4 py-6">
        <NavLink to="/" className="mb-6 inline-flex items-center  gap-2">
        <img src={Logo} alt="Ichgram" className="h-10 px-4 w-auto"/>
        </NavLink>

    <nav className="flex flex-col gap-1">
          {topItems.map((item) => {
            const Icon = item.icon;
            return (
           <NavLink
  key={item.to}
  to={item.to}
  className={({ isActive }) => {
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
      "hover:bg-muted",
      isActive && "bg-muted font-medium"
    );
  }}
>
  <Icon className="h-5 w-5" />
  <span>{item.label}</span>
</NavLink>
            );
          })}
        </nav>
     {profileItem ? (() => {
  const ProfileIcon = profileItem.icon;
  return (
    <div className="pt-12">
      <NavLink
        to={profileItem.to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
            "hover:bg-muted",
            isActive && "bg-muted font-medium"
          )
        }
      >
        <ProfileIcon className="h-5 w-5" />
        <span>{profileItem.label}</span>
      </NavLink>
    </div>
  );
})() : null}
      </div>
    </aside>
  )
}