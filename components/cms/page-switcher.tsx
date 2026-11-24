"use client";

import {
  CircleHelp,
  FileText,
  LayoutGrid,
  List,
  type LucideIcon,
} from "lucide-react";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGES: { href: string; label: string; icon: LucideIcon }[] = [
  {
    href: "/cms",
    label: "staticPages",
    icon: FileText,
  },
  {
    href: "/cms/categories",
    label: "categories",
    icon: LayoutGrid,
  },
  {
    href: "/cms/lists-management",
    label: "listsManagement",
    icon: List,
  },
  {
    href: "/cms/faq",
    label: "faq",
    icon: CircleHelp,
  },
];

export default function PageSwitcher() {
  const t = useTranslations("Cms.switcher");
  const pathname = usePathname();

  return (
    // Controlled by the URL (next-intl's usePathname has no locale prefix):
    // each trigger is a Link, so navigating is what changes the active tab
    <Tabs value={pathname}>
      <TabsList
        aria-label={t("label")}
        className="h-auto group-data-horizontal/tabs:h-auto max-w-full gap-1 overflow-x-auto overflow-y-hidden rounded-xl p-1.5"
      >
        {PAGES.map(({ href, label, icon: Icon }) => (
          <TabsTrigger
            key={href}
            value={href}
            asChild
            className="h-9 flex-none gap-2 rounded-lg px-3.5 text-muted-foreground data-active:bg-card data-active:font-semibold data-active:text-secondary dark:data-active:text-secondary"
          >
            <Link href={href}>
              <Icon aria-hidden />
              {t(label)}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
