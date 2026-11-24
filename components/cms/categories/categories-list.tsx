"use client";

import { useState } from "react";
import { Collapsible } from "radix-ui";
import { ChevronDown } from "lucide-react";
import CategoryPanel from "./category-panel";
import type { Locale } from "@/types/shared";
import { Switch } from "@/components/ui/switch";
import { useLocale, useTranslations } from "next-intl";
import type { Category, CategoryAudience } from "@/types/categories";

const AUDIENCES: CategoryAudience[] = ["merchant", "individual_market"];

export default function CategoriesList({
  categories,
}: {
  categories: Category[];
}) {
  const t = useTranslations("Cms.categories.list");

  return (
    <div className="flex flex-col gap-6">
      {AUDIENCES.map((audience) => {
        const items = categories.filter((c) => c.audience === audience);
        if (items.length === 0) return null;

        return (
          <section
            key={audience}
            aria-labelledby={`audience-${audience}`}
            className="flex flex-col gap-4 rounded-xl border bg-card p-5"
          >
            <header>
              <h2
                id={`audience-${audience}`}
                className="text-base font-semibold text-foreground"
              >
                {t(`audiences.${audience}.title`)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(`audiences.${audience}.subtitle`)}
              </p>
            </header>

            <ul className="flex flex-col gap-2">
              {items.map((category) => (
                <CategoryRow key={category.id} category={category} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const t = useTranslations("Cms.categories.list");
  const locale = useLocale() as Locale;
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <li>
      <Collapsible.Root
        onOpenChange={(open) => open && setHasOpened(true)}
        className="group/row rounded-xl border bg-card"
      >
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
            {category.sort}
          </span>

          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {category.name[locale]}
          </p>

          <Collapsible.Trigger
            aria-label={t("toggleFields", { name: category.name[locale] })}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
          >
            {t("fields", { count: category.fields_count })}
            <ChevronDown
              aria-hidden
              className="size-4 transition-transform group-data-[state=open]/row:rotate-180"
            />
          </Collapsible.Trigger>

          <span
            className={
              category.is_active
                ? "shrink-0 text-xs font-semibold text-secondary"
                : "shrink-0 text-xs font-semibold text-muted-foreground"
            }
          >
            {category.is_active ? t("active") : t("inactive")}
          </span>

          {/* Display only until the toggle endpoint is wired up */}
          <Switch
            checked={category.is_active}
            aria-label={t("toggleActive", { name: category.name[locale] })}
            className="data-checked:bg-secondary"
          />
        </div>

        {/* Mounted from the first open on and only hidden when closed, so
            the details aren't refetched and edits aren't lost */}
        <Collapsible.Content
          forceMount
          className="border-t px-4 py-4 data-[state=closed]:hidden"
        >
          {hasOpened && (
            <CategoryPanel
              categoryId={category.id}
              expectedFields={category.fields_count}
            />
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </li>
  );
}
