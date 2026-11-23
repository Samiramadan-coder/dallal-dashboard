"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/roles", label: "roles" },
  { href: "/roles/admins", label: "admins" },
] as const;

export default function PageSwitcher() {
  const t = useTranslations("Roles.switcher");
  const pathname = usePathname();
  const normalizedPathname =
    pathname.replace(/^\/(en|ar)(?=\/|$)/, "").replace(/\/$/, "") || "/";

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1.5">
      {PAGES.map((page) => {
        const isActive = normalizedPathname === page.href;

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
