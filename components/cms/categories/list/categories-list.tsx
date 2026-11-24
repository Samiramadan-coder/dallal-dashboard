"use client";

import CategoryRow from "./category-row";
import { useTranslations } from "next-intl";
import CreateCategory from "./create-category";
import { AUDIENCES, type Category } from "@/types/categories";

// Categories grouped by who can post in them. Each group can be empty, so a
// category can always be added to it
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
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((category) => (
                  <li key={category.id}>
                    <CategoryRow category={category} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
