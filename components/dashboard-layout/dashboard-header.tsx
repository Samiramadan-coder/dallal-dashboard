"use client";

import { Earth } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { CurrentAdmin } from "@/types/admin";
import type { Country } from "@/types/countries";
import { SidebarTrigger } from "../ui/sidebar";
import AccountMenu from "./account-menu";
import { LocaleSwitcher } from "./locale-switcher";
import NotificationsBell from "./notifications-bell";

type DashboardHeaderProps = {
  admin: CurrentAdmin;
  countries: Country[];
  notificationsCount?: number;
};

export default function DashboardHeader({
  admin,
  countries,
  notificationsCount,
}: DashboardHeaderProps) {
  const t = useTranslations("layout");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger
          className="-ms-1 md:hidden"
          aria-label={t("sidebar.toggleExpand")}
          title={t("sidebar.toggleExpand")}
        />

        <Earth
          className="hidden size-3.5 shrink-0 text-muted-foreground sm:block"
          aria-hidden
        />
        <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:inline">
          {t("header.yourCountries")}
        </span>

        <ul className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
          {countries.map((country) => (
            <li
              key={country.id}
              title={locale === "ar" ? country.name.ar : country.name.en}
              className="flex shrink-0 items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny API-hosted flag */}
              <img
                src={country.flag}
                alt=""
                className="h-2.5 w-3.5 rounded-[2px] object-cover"
              />
              {country.code}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {admin.permissions.includes("notifications.view") && (
          <NotificationsBell count={notificationsCount} />
        )}
        <LocaleSwitcher />
        <AccountMenu admin={admin} />
      </div>
    </header>
  );
}
