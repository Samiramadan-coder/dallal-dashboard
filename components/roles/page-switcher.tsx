"use client";

import { ShieldCheck, UserCog, type LucideIcon } from "lucide-react";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGES: { href: string; label: "roles" | "admins"; icon: LucideIcon }[] =
  [
    { href: "/roles", label: "roles", icon: ShieldCheck },
    { href: "/roles/admins", label: "admins", icon: UserCog },
  ];

export default function PageSwitcher({
  // admins.view: without it the Admins tab would only lead to a 403
  showAdmins,
}: {
  showAdmins: boolean;
}) {
  const t = useTranslations("Roles.switcher");
  const pathname = usePathname();
  const pages = PAGES.filter((page) => showAdmins || page.label !== "admins");

  // A single tab has nothing to switch to
  if (pages.length < 2) return null;

  return (
    // Controlled by the URL (next-intl's usePathname has no locale prefix):
    // each trigger is a Link, so navigating is what changes the active tab
    <Tabs value={pathname}>
      <TabsList
        aria-label={t("label")}
        className="h-auto group-data-horizontal/tabs:h-auto max-w-full gap-1 overflow-x-auto overflow-y-hidden rounded-xl p-1.5"
      >
        {pages.map(({ href, label, icon: Icon }) => (
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
