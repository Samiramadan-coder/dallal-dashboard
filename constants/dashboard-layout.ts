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

const link = (
  key: string,
  href: string,
  icon: ComponentType<{ className?: string }>,
): DashboardNavigationItem => ({
  label: `sidebar.navigation.links.${key}`,
  href,
  type: "link",
  icon: createElement(icon, { className: "size-4" }),
});

export const navigation = (): DashboardNavigationItem[] => [
  section("main"),
  link("overview", "/", LayoutDashboard),
  link("analytics", "/analytics", ChartColumn),

  section("marketplace"),
  link("listings", "/listings", ListFilter),
  link("sellRequests", "/sell-requests", HandCoins),
  link("market", "/market", ShoppingBag),
  link("stores", "/stores", Store),
  link("deals", "/deals", Handshake),
  link("conversations", "/conversations", MessagesSquare),
  link("reviews", "/reviews", Star),

  section("people"),
  link("users", "/users", Users),
  link("verifications", "/verifications", ShieldCheck),
  link("reports", "/reports", Flag),
  link("support", "/support", LifeBuoy),

  section("revenue"),
  link("revenue", "/revenue", DollarSign),
  link("subscriptions", "/subscriptions", CreditCard),
  link("boosts", "/boosts", Zap),

  section("system"),
  link("metalPrices", "/metal-prices", Coins),
  link("notifications", "/notifications", Bell),
  link("cms", "/cms", FileText),
  link("site", "/site", Megaphone),
  link("countries", "/countries", Globe),
  link("roles", "/roles", ShieldAlert),
  link("settings", "/settings", Settings),
  link("auditLog", "/audit-log", ScrollText),
];
