"use client";

import { SidebarMenuButton, useSidebar } from "../ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { useFormatter, useTranslations } from "next-intl";
import type { DashboardNavigationLinkItem } from "@/types/dashboard-layout";
import { cn } from "@/lib/utils";

export default function SidebarNavLink({
  item,
  count,
}: {
  item: DashboardNavigationLinkItem;
  // Badge number; nothing shows when it's missing or 0
  count?: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("layout");
  const format = useFormatter();
  const { isMobile, setOpenMobile } = useSidebar();
  const normalizedPathname = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  const isActive =
    item.href === "/"
      ? normalizedPathname === "/"
      : normalizedPathname === item.href ||
        normalizedPathname.startsWith(`${item.href}/`);

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {/* Gold marker on the start edge of the current page */}
      {isActive && (
        <span
          aria-hidden
          className="absolute inset-s-0 top-1/2 z-10 h-5 w-0.75 -translate-y-1/2 rounded-e-full bg-sidebar-primary"
        />
      )}
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="h-9 rounded-lg ps-3 pe-2.5 text-[13px] font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary/15 data-[active=true]:font-medium data-[active=true]:text-sidebar-primary data-[active=true]:[&_svg]:stroke-[2.2] [&_svg]:stroke-[1.8]"
      >
        <Link
          href={item.href}
          className="flex items-center gap-3"
          onClick={handleClick}
        >
          {item.icon}
          <span className="flex-1 truncate">{t(item.label)}</span>

          {count !== undefined && count > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums group-data-[collapsible=icon]:hidden",
                item.alert
                  ? "bg-destructive text-sidebar-foreground"
                  : "bg-sidebar-primary/15 text-sidebar-primary",
              )}
            >
              {format.number(count)}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </>
  );
}
