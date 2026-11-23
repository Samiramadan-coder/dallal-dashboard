import { createElement, type ComponentType } from "react";
import {
  Bell,
  ChartColumn,
  Coins,
  CreditCard,
  DollarSign,
  FileText,
  Flag,
  Globe,
  HandCoins,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  ListFilter,
  Megaphone,
  MessagesSquare,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Users,
  Zap,
} from "lucide-react";
import type { DashboardNavigationItem } from "@/types/dashboard-layout";

const section = (key: string): DashboardNavigationItem => ({
  label: `sidebar.navigation.sections.${key}`,
  type: "label",
});

type LinkOptions = Pick<
  Extract<DashboardNavigationItem, { type: "link" }>,
  "permission" | "alert"
>;

const link = (
  key: string,
  href: string,
  icon: ComponentType<{ className?: string }>,
  options: LinkOptions = {},
): DashboardNavigationItem => ({
  type: "link",
  key,
  label: `sidebar.navigation.links.${key}`,
  href,
  icon: createElement(icon, { className: "size-4" }),
  ...options,
});

// Every page in the sidebar. Pages without `permission` are open to every
// admin: the API has no permission for them yet
export const navigation = (): DashboardNavigationItem[] => [
  section("main"),
  link("overview", "/", LayoutDashboard),
  link("analytics", "/analytics", ChartColumn),

  section("marketplace"),
  link("listings", "/listings", ListFilter, { permission: "listings.view" }),
  link("sellRequests", "/sell-requests", HandCoins, { alert: true }),
  link("market", "/market", ShoppingBag, { alert: true }),
  link("stores", "/stores", Store, { permission: "stores.view" }),
  link("deals", "/deals", Handshake),
  link("conversations", "/conversations", MessagesSquare),
  link("reviews", "/reviews", Star),

  section("people"),
  link("users", "/users", Users, { permission: "users.view" }),
  link("verifications", "/verifications", ShieldCheck, {
    permission: "verifications.view",
    alert: true,
  }),
  link("reports", "/reports", Flag, {
    permission: "reports.view",
    alert: true,
  }),
  link("support", "/support", LifeBuoy, {
    permission: "support.view",
    alert: true,
  }),

  section("revenue"),
  link("revenue", "/revenue", DollarSign, { permission: "revenue.view" }),
  link("subscriptions", "/subscriptions", CreditCard, {
    permission: "subscriptions.view",
  }),
  link("boosts", "/boosts", Zap),

  section("system"),
  link("metalPrices", "/metal-prices", Coins, {
    permission: "metal_prices.view",
  }),
  link("notifications", "/notifications", Bell, {
    permission: "notifications.view",
  }),
  link("cms", "/cms", FileText),
  link("site", "/site", Megaphone, { permission: "marketing.view" }),
  link("countries", "/countries", Globe, { permission: "countries.view" }),
  link("roles", "/roles", ShieldAlert, { permission: "roles.view" }),
  link("settings", "/settings", Settings, { permission: "settings.view" }),
  link("auditLog", "/audit-log", ScrollText, {
    permission: "audit_logs.view",
  }),
];

export function canSee(
  item: DashboardNavigationItem,
  permissions: readonly string[],
): boolean {
  if (item.type !== "link" || !item.permission) return true;
  const required = Array.isArray(item.permission)
    ? item.permission
    : [item.permission];
  return required.some((permission) => permissions.includes(permission));
}

// The sidebar for one admin: links they may open, and only the section
// labels that still have links under them
export function navigationFor(
  permissions: readonly string[],
): DashboardNavigationItem[] {
  const links = navigation().filter((item) => canSee(item, permissions));

  return links.filter((item, index) => {
    if (item.type === "link") return true;
    const next = links[index + 1];
    return next !== undefined && next.type === "link";
  });
}
