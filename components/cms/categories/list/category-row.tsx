"use client";

import { useState } from "react";
import { Collapsible } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Category } from "@/types/categories";
import type { Locale } from "@/types/shared";
import { cn } from "@/lib/utils";
import CategoryPanel from "./editor/category-panel";

// One category: a summary line that opens its editor underneath
export default function CategoryRow({ category }: { category: Category }) {
  const t = useTranslations("Cms.categories.list");
  const locale = useLocale() as Locale;
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <Collapsible.Root
      onOpenChange={(open) => open && setHasOpened(true)}
      className="group/row rounded-xl border bg-card transition-shadow data-[state=open]:shadow-sm"
    >
      <Collapsible.Trigger className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-start transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-secondary/40 group-data-[state=open]/row:rounded-b-none">
        <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
          {category.sort}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {category.name[locale]}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {t("summary", {
              types: category.types_count,
              fields: category.fields_count,
            })}
          </span>
        </span>

        <span className="hidden shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline">
          {t(`pricing.${category.pricing_mode}`)}
        </span>

        {/* Turning a category on or off isn't available yet, so this is a
            status, not a switch */}
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 text-xs font-semibold",
            category.is_active ? "text-secondary" : "text-muted-foreground",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              category.is_active ? "bg-secondary" : "bg-muted-foreground/50",
            )}
          />
          {category.is_active ? t("active") : t("inactive")}
        </span>

        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/row:rotate-180"
        />
      </Collapsible.Trigger>

      {/* Mounted from the first open on and only hidden when closed, so the
          details aren't refetched and unsaved edits aren't lost */}
      <Collapsible.Content
        forceMount
        className="rounded-b-xl border-t bg-muted/30 p-3 data-[state=closed]:hidden sm:p-4"
      >
        {hasOpened && (
          <CategoryPanel
            categoryId={category.id}
            expectedFields={category.fields_count}
          />
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
