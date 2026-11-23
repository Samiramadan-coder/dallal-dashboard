"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/roles", label: "roles" },
  { href: "/roles/admins", label: "admins" },
] as const;

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
    <nav aria-label={t("label")} className="flex items-center gap-1.5">
      {pages.map((page) => {
        // next-intl's usePathname has no locale prefix
        const isActive = pathname === page.href;

        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40",
              isActive
                ? "border-secondary bg-secondary font-semibold text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {t(page.label)}
          </Link>
        );
      })}
    </nav>
  );
}
