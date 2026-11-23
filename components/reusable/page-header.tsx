import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { cn } from "@/lib/utils";
import PageGuide from "./page-guide";

export type PageHeaderKey =
  | "overview"
  | "analytics"
  | "listings"
  | "sellRequests"
  | "market"
  | "stores"
  | "deals"
  | "conversations"
  | "reviews"
  | "users"
  | "verifications"
  | "reports"
  | "support"
  | "revenue"
  | "subscriptions"
  | "boosts"
  | "metalPrices"
  | "notifications"
  | "cms"
  | "site"
  | "countries"
  | "roles"
  | "settings"
  | "auditLog";

type PageHeaderProps = {
  page: PageHeaderKey;
  // Replaces the page's subtitle, e.g. today's date on the overview
  subtitle?: ReactNode;
  // Page controls, shown after the help button
  actions?: ReactNode;
  className?: string;
};

// The white bar at the top of every page: title, subtitle, help and the
// page's own controls. It bleeds over the layout's padding to the edges
export default async function PageHeader({
  page,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  const t = await getTranslations("pageHeaders");

  return (
    <header
      className={cn(
        "-mx-4 -mt-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-4 sm:-mx-6 sm:-mt-6 sm:mb-6 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg font-bold leading-tight text-foreground">
          {t(`pages.${page}.title`)}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {subtitle ?? t(`pages.${page}.subtitle`)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PageGuide page={page} title={t(`pages.${page}.title`)} />
        {actions}
      </div>
    </header>
  );
}

// Labelled dropdown for page controls. Not wired up yet
export async function HeaderSelect({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      {label}
      <select
        defaultValue={defaultValue}
        className="h-8 min-w-36 rounded-lg border border-border bg-card px-2.5 text-[13px] font-medium text-foreground outline-none focus-visible:border-secondary focus-visible:ring-3 focus-visible:ring-secondary/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
