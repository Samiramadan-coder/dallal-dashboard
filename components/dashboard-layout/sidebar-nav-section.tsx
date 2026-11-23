"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useSidebar } from "../ui/sidebar";

export default function SidebarNavSection({ label }: { label: string }) {
  const { state } = useSidebar();
  const t = useTranslations("layout");
  const isSidebarOpen = state === "expanded";

  return (
    <p
      className={cn(
        "mb-2 mt-3 px-3 text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/35",
        { hidden: !isSidebarOpen },
      )}
    >
      {t(label)}
    </p>
  );
}
