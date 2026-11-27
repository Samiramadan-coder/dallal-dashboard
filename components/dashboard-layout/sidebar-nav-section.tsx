"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible } from "radix-ui";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import type {
  DashboardNavigationGroup,
  SidebarCounts,
} from "@/types/dashboard-layout";
import SidebarNavLink from "./sidebar-nav-link";
import { SidebarMenu, SidebarMenuItem, useSidebar } from "../ui/sidebar";

function isUnder(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// One sidebar section that opens and closes on its own. Starts open; the
// choice lasts while the layout stays mounted. In icon mode there's no
// heading to click, so every link stays visible
export default function SidebarNavSection({
  group,
  counts,
}: {
  group: DashboardNavigationGroup;
  counts: SidebarCounts;
}) {
  const t = useTranslations("layout");
  const pathname = usePathname();
  const { state, isMobile } = useSidebar();
  const [open, setOpen] = useState(true);

  const isIconMode = state === "collapsed" && !isMobile;
  const hasActiveLink = group.links.some((link) => isUnder(pathname, link.href));
  const contentId = `sidebar-section-${group.key}`;

  return (
    <Collapsible.Root
      open={isIconMode || open}
      onOpenChange={setOpen}
      className="flex flex-col"
    >
      {!isIconMode && (
        <Collapsible.Trigger
          aria-controls={contentId}
          className="group/section mb-1 mt-3 flex items-center justify-between rounded-md px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/35 outline-none transition-colors hover:text-sidebar-foreground/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex items-center gap-1.5">
            {t(group.label)}
            {/* Closed section still holding the current page */}
            {!open && hasActiveLink && (
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-sidebar-primary"
              />
            )}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3 transition-transform duration-200",
              !open && "-rotate-90 rtl:rotate-90",
            )}
          />
        </Collapsible.Trigger>
      )}

      <Collapsible.Content id={contentId}>
        <SidebarMenu className="gap-0.5">
          {group.links.map((link) => (
            <SidebarMenuItem key={link.key}>
              <SidebarNavLink item={link} count={counts[link.key]} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
