"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGES: {
  href: string;
  label: "prices" | "heldForReview" | "marginHours" | "historyLogs";
}[] = [
  {
    href: "/metal-prices",
    label: "prices",
  },
  {
    href: "/metal-prices/held-for-review",
    label: "heldForReview",
  },
  {
    href: "/metal-prices/margin-hours",
    label: "marginHours",
  },
  {
    href: "/metal-prices/history-logs",
    label: "historyLogs",
  },
];

export default function PageSwitcher() {
  const t = useTranslations("MetalPrices.switcher");
  const pathname = usePathname();

  return (
    // Controlled by the URL (next-intl's usePathname has no locale prefix):
    // each trigger is a Link, so navigating is what changes the active tab
    <Tabs value={pathname}>
      <TabsList
        variant="line"
        aria-label={t("label")}
        className="h-auto group-data-horizontal/tabs:h-auto w-full justify-start gap-2 overflow-x-auto overflow-y-hidden border-b border-border p-0"
      >
        {PAGES.map(({ href, label }) => (
          <TabsTrigger
            key={href}
            value={href}
            asChild
            className="h-11 flex-none gap-2 px-4 text-muted-foreground after:bg-secondary group-data-horizontal/tabs:after:bottom-0 data-active:font-semibold data-active:text-secondary dark:data-active:text-secondary"
          >
            <Link href={href}>{t(label)}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
