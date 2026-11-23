"use client";

import { SidebarMenuButton, useSidebar } from "../ui/sidebar";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { DashboardNavigationLinkItem } from "@/types/dashboard-layout";
import { Badge } from "../ui/badge";

export default function SidebarNavLink({
  item,
}: {
  item: DashboardNavigationLinkItem;
}) {
  const pathname = usePathname();
  const t = useTranslations("layout");
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
          className="absolute start-0 top-1/2 z-10 h-5 w-0.75 -translate-y-1/2 rounded-e-full bg-sidebar-primary"
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
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{t(item.label)}</span>
          </div>

          {item.count && (
            <Badge className="ms-auto bg-amber-100! text-amber-700! text-[10px] w-5 h-5">
              {item.count}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </>
  );
}
