import { createElement } from "react";
import { Globe, LayoutGrid } from "lucide-react";
import type { DashboardNavigationItem } from "@/types/dashboard-layout";

export const navigation = (): DashboardNavigationItem[] => [
  {
    label: "sidebar.navigation.overview",
    type: "label",
  },
  {
    label: "sidebar.navigation.dashboard",
    href: "/",
    type: "link",
    icon: createElement(LayoutGrid, { className: "size-4" }),
  },
  {
    label: "sidebar.navigation.system",
    type: "label",
  },
  {
    label: "sidebar.navigation.countries",
    type: "link",
    href: "/countries",
    icon: createElement(Globe, { className: "size-4" }),
  },
];
