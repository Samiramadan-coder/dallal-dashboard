"use client";

import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Collapsible } from "radix-ui";
import { ChevronDown } from "lucide-react";
import type { Locale } from "@/types/shared";
import { Switch } from "@/components/ui/switch";
import { toFormData } from "@/lib/api/form-data";
import type { Category } from "@/types/categories";
import CategoryPanel from "./editor/category-panel";
import { useLocale, useTranslations } from "next-intl";
import { updateCategory } from "@/lib/actions/categories";

// Turns a category on or off through the category update request. Flips
// right away and goes back if the request fails
function ActiveSwitch({ category }: { category: Category }) {
  const t = useTranslations("Cms.categories.list");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const [active, setActive] = useState(category.is_active);
  const [saving, setSaving] = useState(false);

  const toggle = async (next: boolean) => {
    setActive(next);
    setSaving(true);
    const result = await updateCategory(
      category.id,
      toFormData({ is_active: next }),
    );
    setSaving(false);

    if (!result.ok) {
      setActive(!next);
      toast.error(result.message || tCommon("UpdateFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("UpdatedSuccessfully"));
  };

  return (
    <label className="flex shrink-0 cursor-pointer items-center gap-2 py-3 ps-1 pe-4">
      <span
        className={cn(
          "text-xs font-semibold",
          active ? "text-secondary" : "text-muted-foreground",
        )}
      >
        {active ? t("active") : t("inactive")}
      </span>
      <Switch
        checked={active}
        disabled={saving}
        onCheckedChange={toggle}
        aria-label={t("toggleActive", { name: category.name[locale] })}
        className="data-checked:bg-secondary"
      />
    </label>
  );
}

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
      <div className="flex items-center">
        <Collapsible.Trigger className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-s-xl py-3 ps-4 pe-3 text-start transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-secondary/40 group-data-[state=open]/row:rounded-es-none">
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

          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/row:rotate-180"
          />
        </Collapsible.Trigger>

        {/* Outside the trigger, so switching doesn't open the row */}
        <ActiveSwitch category={category} />
      </div>

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
