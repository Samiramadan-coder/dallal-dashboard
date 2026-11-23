"use client";

import { cn } from "@/lib/utils";
import { Gem } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { useTranslations } from "next-intl";
import { Separator } from "../ui/separator";

export default function SidebarLogo() {
  const { state } = useSidebar();
  const isSidebarOpen = state === "expanded";
  const t = useTranslations("layout");

  return (
    <>
      <div className="py-3 px-4 flex items-center gap-4">
        <div className="bg-primary p-2 rounded-xl">
          <Gem className="size-4 text-popover" />
        </div>
        <div className={cn("flex flex-col", { hidden: !isSidebarOpen })}>
          <p className="text-[11px] font-bold tracking-widest uppercase text-primary">
            {t("sidebar.brandName")}
          </p>
          <p className="text-[10px] text-sidebar-foreground/40">
            {t("sidebar.brandSubtitle")}
          </p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />
    </>
  );
}
