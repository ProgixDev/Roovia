import {
  CreditCard,
  FileCheck2,
  Flag,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra terms the top bar's search finds this entry by, beyond its label. */
  keywords?: string[];
}

/**
 * Shell configuration, and it lives here rather than in the route on purpose:
 * `icon` holds a React component, which cannot be handed from a server
 * component to a client one as a prop. AdminDashboardDesign1's sidebar and
 * top bar both read this list by default so the rail and the search stay in
 * step; a client caller can still pass its own `items`.
 *
 * Only the overview is wired up. Every other entry is a "#" placeholder —
 * point it at a real route as you add the page behind it.
 */
export const DEFAULT_ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    keywords: ["dashboard", "stats", "bookings", "home"],
  },
  {
    href: "#",
    label: "Applications",
    icon: FileCheck2,
    keywords: ["documents", "verification", "signup", "approve"],
  },
  {
    href: "#",
    label: "Reports",
    icon: Flag,
    keywords: ["moderation", "flagged", "reviews", "comments"],
  },
  {
    href: "#",
    label: "Accounts",
    icon: Users,
    keywords: ["users", "profiles", "suspend", "ban"],
  },
  {
    href: "#",
    label: "Ads",
    icon: Megaphone,
    keywords: ["banner", "placement", "campaign", "promotion"],
  },
  {
    href: "#",
    label: "Content",
    icon: Newspaper,
    keywords: ["onboarding", "slides", "copy", "pages"],
  },
  {
    href: "#",
    label: "Subscriptions",
    icon: CreditCard,
    keywords: ["billing", "plan", "trial", "invoice"],
  },
  {
    href: "#",
    label: "Settings",
    icon: Settings,
    keywords: ["password", "email", "admins", "preferences"],
  },
];
