"use client";

import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import type { CategoryDetail } from "@/types/categories";
import type { Locale } from "@/types/shared";
import {
  deleteCategoryField,
  reorderCategoryFields,
} from "@/lib/actions/categories";
import SortableList from "@/components/reusable/sortable-list";
import SectionCard from "./section-card";
import FieldSummary from "./field-summary";
import CreateField from "./create-field";
import EditField from "./edit-field";
import DeleteAction from "./delete-action";

// What sellers fill in when posting in this category, one per row in the
// order sellers see them. Drag to reorder; add, edit and delete from dialogs
export default function FieldsSection({
  category,
  reload,
}: {
  category: CategoryDetail;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tList = useTranslations("Cms.categories.list");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const fields = [...category.fields].sort((a, b) => a.sort - b.sort);

  const reorder = async (ids: number[]) => {
    const result = await reorderCategoryFields(ids);
    if (!result.ok) {
      toast.error(result.message || tCommon("ReorderFailed"));
      return false;
    }
    toast.success(result.data.message || tCommon("ReorderedSuccessfully"));
    // So the saved sort orders come back with the fields
    await reload();
    return true;
  };

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
        <SortableList
          id={`fields-${category.id}`}
          items={fields}
          onReorder={reorder}
          handleLabel={(field) =>
            tList("reorder", { name: field.label[locale] })
          }
          handleClassName="size-6"
          renderItem={(field, handle) => (
            <FieldSummary
              field={field}
              allFields={fields}
              dragHandle={handle}
              actions={
                <>
                  <EditField field={field} reload={reload} />
                  <DeleteAction
                    remove={(reason) => deleteCategoryField(field.id, reason)}
                    reload={reload}
                  />
                </>
              }
            />
          )}
        />
      )}
    </SectionCard>
  );
}
