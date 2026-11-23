import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { getSidebarCounts } from "@/lib/sidebar-counts";
import { navigationFor } from "@/constants/dashboard-layout";
import { getAdminCountries, getCurrentAdmin } from "@/lib/admin";
import SidebarLogo from "@/components/dashboard-layout/sidebar-logo";
import SidebarNavLink from "@/components/dashboard-layout/sidebar-nav-link";
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

  return (
    <SidebarProvider defaultOpen>
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
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0.5 px-2.5 py-2">
              {navigationFor(admin.permissions).map((item) => (
                <SidebarMenuItem key={item.label}>
                  {item.type === "link" ? (
                    <SidebarNavLink item={item} count={counts[item.key]} />
                  ) : (
                    <SidebarNavSection label={item.label} />
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen min-w-0 flex-1 flex flex-col bg-background">
        <DashboardHeader admin={admin} countries={countries} />
        <main className="min-w-0 w-full overflow-x-hidden flex-1 p-4 sm:p-6">
          <div className="min-w-0 w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
