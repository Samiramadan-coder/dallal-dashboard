"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CategoryDetail } from "@/types/categories";
import type { Locale } from "@/types/shared";
import { cn } from "@/lib/utils";
import SectionCard from "./section-card";
import CreateType from "./create-type";

// The kinds of item a seller picks from in this category (Bar, Coin, …).
// Read-only chips; new types are added from a dialog
export default function TypesSection({
  category,
  reload,
}: {
  category: CategoryDetail;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tList = useTranslations("Cms.categories.list");
  const locale = useLocale() as Locale;
  const types = [...category.types].sort((a, b) => a.sort - b.sort);

  return (
    <SectionCard
      title={t("sections.types.title")}
      description={t("sections.types.description")}
      summary={tList("typesCount", { count: types.length })}
      action={<CreateType categoryId={category.id} reload={reload} />}
    >
      {types.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-5 text-center text-xs text-muted-foreground">
          {t("noTypes")}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {types.map((type) => (
            <li
              key={type.id}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
                !type.is_active && "border-dashed text-muted-foreground",
              )}
            >
              <span className="font-medium">{type.name[locale]}</span>
              <code dir="ltr" className="text-muted-foreground">
                {type.key}
              </code>
              {!type.is_active && <span>· {tList("inactive")}</span>}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
