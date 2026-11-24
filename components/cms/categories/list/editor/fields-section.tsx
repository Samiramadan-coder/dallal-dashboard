"use client";

import { useTranslations } from "next-intl";
import type { CategoryDetail } from "@/types/categories";
import SectionCard from "./section-card";
import FieldSummary from "./field-summary";
import CreateField from "./create-field";
import EditField from "./edit-field";
import DeleteAction from "./delete-action";
import { deleteCategoryField } from "@/lib/actions/categories";

// What sellers fill in when posting in this category. Read-only summaries;
// new fields are added from a dialog
export default function FieldsSection({
  category,
  reload,
}: {
  category: CategoryDetail;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tList = useTranslations("Cms.categories.list");
  const fields = [...category.fields].sort((a, b) => a.sort - b.sort);

  return (
    <SectionCard
      title={t("sections.fields.title")}
      description={t("sections.fields.description")}
      summary={tList("fieldsCount", { count: fields.length })}
      action={<CreateField categoryId={category.id} reload={reload} />}
    >
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-5 text-center text-xs text-muted-foreground">
          {t("noFields")}
        </p>
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2">
          {fields.map((field) => (
            <li key={field.id}>
              <FieldSummary
                field={field}
                allFields={fields}
                actions={
                  <>
                    <EditField field={field} reload={reload} />
                    <DeleteAction
                      remove={() => deleteCategoryField(field.id)}
                      reload={reload}
                    />
                  </>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
