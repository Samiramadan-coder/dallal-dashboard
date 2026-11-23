import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { getAdminCountries, getCurrentAdmin } from "@/lib/admin";
import { navigation } from "@/constants/dashboard-layout";
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
  const countries = await getAdminCountries(admin);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        side={locale === "ar" ? "right" : "left"}
        collapsible="icon"
        className="border-e border-gray-200 z-50"
      >
        <SidebarContent className="bg-[#0f4a31]">
          <SidebarGroup className="p-0">
            <SidebarLogo />
            <SidebarMenu className="p-2">
              {navigation().map((item) => (
                <SidebarMenuItem key={item.label}>
                  {item.type === "link" ? (
                    <SidebarNavLink item={item} />
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
