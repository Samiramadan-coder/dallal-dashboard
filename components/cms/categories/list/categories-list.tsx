"use client";

import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { AUDIENCES, type Category } from "@/types/categories";
import type { Locale } from "@/types/shared";
import { reorderCategories } from "@/lib/actions/categories";
import { FolderOpenIcon } from "lucide-react";
import SortableList from "@/components/reusable/sortable-list";
import EmptyState from "@/components/reusable/empty-state";
import CategoryRow from "./category-row";
import CreateCategory from "./create-category";

// Categories grouped by who can post in them, each group sortable by
// dragging. Each group can be empty, so a category can always be added to it
export default function CategoriesList({
  categories,
}: {
  categories: Category[];
}) {
  const t = useTranslations("Cms.categories.list");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;

  const sorted = [...categories].sort((a, b) => a.sort - b.sort);
  const groups = AUDIENCES.map((audience) => ({
    audience,
    items: sorted.filter((c) => c.audience === audience),
  }));

  // The endpoint takes every category's id in order, so one group's new
  // order goes out together with the others as they are
  const reorder = async (audience: string, ids: number[]) => {
    const all = groups.flatMap((group) =>
      group.audience === audience ? ids : group.items.map((c) => c.id),
    );

    const result = await reorderCategories(all);
    if (!result.ok) {
      toast.error(result.message || tCommon("ReorderFailed"));
      return false;
    }
    toast.success(result.data.message || tCommon("ReorderedSuccessfully"));
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ audience, items }, groupIndex) => {
        // Numbers run on across groups: merchants 1–5, individuals 6–11
        const offset = groups
          .slice(0, groupIndex)
          .reduce((count, group) => count + group.items.length, 0);

        return (
          <section
            key={audience}
            aria-labelledby={`audience-${audience}`}
            className="flex flex-col gap-4 rounded-xl border bg-card p-5"
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id={`audience-${audience}`}
                  className="text-base font-semibold text-foreground"
                >
                  {t(`audiences.${audience}.title`)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t(`audiences.${audience}.subtitle`)}
                </p>
              </div>

              <CreateCategory audience={audience} />
            </header>

            {items.length === 0 ? (
              <EmptyState
                framed
                size="compact"
                icon={FolderOpenIcon}
                title={t("empty")}
              />
            ) : (
              // One list per audience, so a category can't be dragged into
              // the other one
              <SortableList
                id={`categories-${audience}`}
                items={items}
                onReorder={(ids) => reorder(audience, ids)}
                handleLabel={(category) =>
                  t("reorder", { name: category.name[locale] })
                }
                handleClassName="self-stretch rounded-e-none rounded-s-xl ps-3 pe-1"
                renderItem={(category, handle, index) => (
                  <CategoryRow
                    category={category}
                    position={offset + index + 1}
                    dragHandle={handle}
                  />
                )}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}
