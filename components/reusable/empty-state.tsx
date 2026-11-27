import type { LucideIcon } from "lucide-react";
import { InboxIcon, SearchXIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import ClearFiltersButton from "./clear-filters-button";

// "Nothing here" for lists, tables and panels; the sibling of ErrorState.
//   <EmptyState icon={GlobeIcon} title={t("empty")} />
//   <DataTable empty={<EmptyState ... />} …>   (DataTable adds the row)
// variant "filtered": data exists but no row matches the filters, so it
// offers to clear them. Works in server and client components
export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "empty",
  size = "default",
  framed = false,
  keepParams,
  className,
}: {
  icon?: LucideIcon;
  // Defaults to the generic "No data yet" / "No matching results"
  title?: string;
  description?: string;
  // e.g. a "Create" button; replaces "Clear filters" when given
  action?: React.ReactNode;
  variant?: "empty" | "filtered";
  // "compact" for panels, sheets and summaries
  size?: "default" | "compact";
  // Dashed card around it, for use outside a table
  framed?: boolean;
  // Search params "Clear filters" keeps, e.g. a tab
  keepParams?: readonly string[];
  className?: string;
}) {
  const t = useTranslations("Common.empty");
  const filtered = variant === "filtered";
  const Icon = icon ?? (filtered ? SearchXIcon : InboxIcon);
  const compact = size === "compact";

  const resolvedAction =
    action ?? (filtered ? <ClearFiltersButton keep={keepParams} /> : null);

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12",
        framed && "rounded-xl border border-dashed border-border bg-card",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          compact ? "size-8" : "size-10",
        )}
      >
        <Icon className={compact ? "size-4" : "size-5"} />
      </span>

      <div className="space-y-1">
        <p
          className={cn(
            "font-semibold text-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {title ?? (filtered ? t("filteredTitle") : t("title"))}
        </p>
        {(description || filtered) && (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
            {description ?? t("filteredDescription")}
          </p>
        )}
      </div>

      {resolvedAction}
    </div>
  );
}
