import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";
import type { Permission } from "./roles";
import type { ReactNode } from "react";

// Every page in the sidebar. One id per page, used by the sidebar
// (constants/dashboard-layout), requirePage, PageHeader and the counts.
// Add a page here first; each place that needs it then shows a type error
export type NavigationKey =
  | "overview"
  | "analytics"
  | "listings"
  | "sellRequests"
  | "market"
  | "stores"
  | "deals"
  | "conversations"
  | "reviews"
  | "users"
  | "verifications"
  | "reports"
  | "support"
  | "revenue"
  | "subscriptions"
  | "boosts"
  | "metalPrices"
  | "notifications"
  | "cms"
  | "site"
  | "countries"
  | "roles"
  | "settings"
  | "auditLog";

// Sidebar group headings
export type NavigationSectionKey =
  "main" | "marketplace" | "people" | "revenue" | "system";

// A message key under "layout" (e.g. "sidebar.navigation.links.users"), so a
// link without a translation fails the build
export type LayoutMessageKey = MessageKeys<
  Messages["layout"],
  NestedKeyOf<Messages["layout"]>
>;

export type DashboardNavigationItem =
  | {
      type: "link";
      // Stable id, used for counts (see lib/sidebar-counts)
      key: NavigationKey;
      label: LayoutMessageKey;
      href: string;
      icon: ReactNode;
      // Shown only if the admin has this permission (or any of the list).
      // Leave it out for pages every admin can open
      permission?: Permission | Permission[];
      // Count badge turns red: the items need someone to act
      alert?: boolean;
    }
  | {
      type: "label";
      key: NavigationSectionKey;
      label: LayoutMessageKey;
    };

export type DashboardNavigationLinkItem = Extract<
  DashboardNavigationItem,
  { type: "link" }
>;

// A sidebar section with the links under it; the sidebar renders these
export type DashboardNavigationGroup = {
  key: NavigationSectionKey;
  label: LayoutMessageKey;
  links: DashboardNavigationLinkItem[];
};

// Badge numbers by link key. Missing or 0 shows no badge
export type SidebarCounts = Partial<Record<NavigationKey, number>>;
