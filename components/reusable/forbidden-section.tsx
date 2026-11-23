"use client";

import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { navigation } from "@/constants/dashboard-layout";

// "No access to {section}", where section is the sidebar name of the page
// being opened. forbidden.tsx gets no props, so it's read from the URL
export default function ForbiddenSection() {
  const t = useTranslations("forbidden");
  const tLayout = useTranslations("layout");
  const pathname = usePathname();

  const item = navigation()
    .filter((entry) => entry.type === "link" && entry.href !== "/")
    .find(
      (entry) =>
        entry.type === "link" &&
        (pathname === entry.href || pathname.startsWith(`${entry.href}/`)),
    );

  return item
    ? t("title", { section: tLayout(item.label) })
    : t("titleGeneric");
}
