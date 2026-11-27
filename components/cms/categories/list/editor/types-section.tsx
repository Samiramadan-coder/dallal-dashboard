"use client";

import { cn } from "@/lib/utils";
import EditType from "./edit-type";
import CreateType from "./create-type";
import SectionCard from "./section-card";
import DeleteAction from "./delete-action";
import type { Locale } from "@/types/shared";
import { useLocale, useTranslations } from "next-intl";
import type { CategoryDetail } from "@/types/categories";
import { deleteCategoryType } from "@/lib/actions/categories";

// The kinds of item a seller picks from in this category (Bar, Coin, …).
// Each can be renamed, turned off or deleted; new ones are added from a dialog
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
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <li
              key={type.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border py-1.5 ps-3 pe-1.5",
                !type.is_active && "border-dashed",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    type.is_active
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {type.name[locale]}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  <code dir="ltr">{type.key}</code>
                  {!type.is_active && <> · {tList("inactive")}</>}
                </span>
              </span>
              <EditType type={type} reload={reload} />
              <DeleteAction
                remove={(reason) => deleteCategoryType(type.id, reason)}
                reload={reload}
              />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
