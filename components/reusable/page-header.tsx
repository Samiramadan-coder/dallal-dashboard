import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NavigationKey } from "@/types/dashboard-layout";
import PageGuide from "./page-guide";

// Same ids as the sidebar
export type PageHeaderKey = NavigationKey;

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
export function HeaderSelect({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    // The label wraps the trigger button, so it names it for screen readers
    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      {label}
      <Select defaultValue={defaultValue}>
        <SelectTrigger className="min-w-36 border-border bg-card text-[13px] font-medium text-foreground focus-visible:border-secondary focus-visible:ring-secondary/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
