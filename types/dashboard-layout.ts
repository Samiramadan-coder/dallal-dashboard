import type { ReactNode } from "react";

export type DashboardNavigationItem =
  | {
      type: "link";
      // Stable id, used for counts (see lib/sidebar-counts)
      key: string;
      label: string;
      href: string;
      icon: ReactNode;
      // Shown only if the admin has this permission (or any of the list).
      // Leave it out for pages every admin can open
      permission?: string | string[];
      // Count badge turns red: the items need someone to act
      alert?: boolean;
    }
  | {
      type: "label";
      label: string;
    };

export type DashboardNavigationLinkItem = Extract<
  DashboardNavigationItem,
  { type: "link" }
>;

// Badge numbers by link key. Missing or 0 shows no badge
export type SidebarCounts = Partial<Record<string, number>>;
