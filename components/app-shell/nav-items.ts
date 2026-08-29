import {
  ClipboardList,
  Home,
  Inbox,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/engagements", label: "Engagements", icon: ClipboardList },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
