import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { getSidebarCounts } from "@/lib/sidebar-counts";
import { navigationGroupsFor } from "@/constants/dashboard-layout";
import { getAdminCountries, getCurrentAdmin } from "@/lib/admin";
import SidebarLogo from "@/components/dashboard-layout/sidebar-logo";
import DashboardHeader from "@/components/dashboard-layout/dashboard-header";
import SidebarNavSection from "@/components/dashboard-layout/sidebar-nav-section";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, admin] = await Promise.all([getLocale(), getCurrentAdmin()]);

  const [countries, counts] = await Promise.all([
    getAdminCountries(admin),
    getSidebarCounts(),
  ]);

  // Shell is exactly one screen tall and only the content area scrolls, so
  // there is never a blank strip below the page
  return (
    <SidebarProvider defaultOpen className="h-dvh overflow-hidden">
      <Sidebar
        side={locale === "ar" ? "right" : "left"}
        collapsible="icon"
        className="border-e border-gray-200 z-50"
      >
        {/* Logo stays put; only the links scroll */}
        <SidebarHeader className="gap-0 bg-secondary p-0">
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent className="bg-secondary">
          <SidebarGroup className="px-2.5 py-2">
            {navigationGroupsFor(admin.permissions).map((group) => (
              <SidebarNavSection
                key={group.key}
                group={group}
                counts={counts}
              />
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="h-full min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden bg-background">
        <DashboardHeader
          admin={admin}
          countries={countries}
          notificationsCount={counts.notifications}
        />
        <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <div className="min-w-0 w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
