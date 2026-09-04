import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

/**
 * The admin section gets its own shell, deliberately not the site header and
 * footer. No sidebar here: each admin screen owns its rail and top bar as
 * part of its design (see AdminDashboardDesign1), so a second design can
 * replace the whole thing — chrome included — by swapping one import in the
 * route.
 *
 * Wrap the returned tree in your auth guard once there is one — every route
 * under /admin passes through here.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
