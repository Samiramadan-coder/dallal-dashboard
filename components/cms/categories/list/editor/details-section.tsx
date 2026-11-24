"use client";

import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";

import {
  CATEGORY_ICONS,
  PRICING_MODES,
  categoryDetailsSchema,
  type CategoryDetail,
  type CategoryDetailsValues,
} from "@/types/categories";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useId } from "react";
import { toast } from "sonner";
import SaveBar from "./save-bar";
import SectionCard from "./section-card";
import type { Locale } from "@/types/shared";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck } from "lucide-react";
import { toFormData } from "@/lib/api/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCategory } from "@/lib/actions/categories";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import CompactImageUploader from "@/components/form/compact-image-uploader";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";

function toValues(category: CategoryDetail): CategoryDetailsValues {
  return {
    name: category.name,
    icon: category.icon,
    sort: category.sort,
    pricing_mode: category.pricing_mode,
    image: category.image,
  };
}

// The category's own data: image, names, icon, order and pricing. Who can
// post, the key and special rules are shown but can't be changed here
export default function DetailsSection({
  category,
}: {
  category: CategoryDetail;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const id = useId();

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CategoryDetailsValues>({
    resolver: zodResolver(categoryDetailsSchema((key) => t(key as never))),
    defaultValues: toValues(category),
  });

  const pricingMode = useWatch({ control, name: "pricing_mode" });

  const onSubmit: SubmitHandler<CategoryDetailsValues> = async (data) => {
    const { image, ...rest } = data;
    // Only a newly picked file is uploaded; an unchanged image (its URL) or
    // a removed one isn't sent
    const result = await updateCategory(
      category.id,
      toFormData({ ...rest, ...(image instanceof Blob ? { image } : {}) }),
    );

    if (!result.ok) {
      // Laravel keys like "name.en" are what setError expects
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof CategoryDetailsValues, {
          type: "server",
          message,
        });
      });
      toast.error(result.message || tCommon("UpdateFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("UpdatedSuccessfully"));
    // The saved values become the new baseline for "Discard"
    reset(data);
  };

  return (
    <SectionCard
      title={t("sections.details.title")}
      description={t("sections.details.description")}
      defaultOpen
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        <CompactImageUploader
          control={control}
          name="image"
          label={t("image")}
          hint={t("imageHint")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField
            required
            id={`${id}-name-en`}
            label={t("nameEn")}
            error={errors.name?.en}
          >
            <Input
              {...register("name.en")}
              {...fieldA11yProps(`${id}-name-en`, errors.name?.en)}
              dir="ltr"
              className="h-9"
            />
          </LabeledField>

          <LabeledField
            required
            id={`${id}-name-ar`}
            label={t("nameAr")}
            error={errors.name?.ar}
          >
            <Input
              {...register("name.ar")}
              {...fieldA11yProps(`${id}-name-ar`, errors.name?.ar)}
              dir="rtl"
              className="h-9"
            />
          </LabeledField>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
          <LabeledField id={`${id}-pricing`} label={t("pricingMode")}>
            <Controller
              control={control}
              name="pricing_mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={`${id}-pricing`}
                    onBlur={field.onBlur}
                    aria-describedby={`${id}-pricing-hint`}
                    className="h-9 w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {t(`pricingModes.${mode}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p
              id={`${id}-pricing-hint`}
              className="text-xs text-muted-foreground"
            >
              {t(`pricingModeHints.${pricingMode}`)}
            </p>
          </LabeledField>

          <LabeledField id={`${id}-icon`} label={t("icon")}>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={`${id}-icon`}
                    onBlur={field.onBlur}
                    className="h-9 w-full"
                  >
                    <SelectValue placeholder={t("iconPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Keep an icon the API sent that isn't in the known list */}
                    {[
                      ...new Set<string>([
                        ...CATEGORY_ICONS,
                        ...(field.value ? [field.value] : []),
                      ]),
                    ].map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {t.has(`icons.${icon}`) ? t(`icons.${icon}`) : icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </LabeledField>

          <LabeledField
            required
            id={`${id}-sort`}
            label={t("sort")}
            error={errors.sort}
          >
            <Input
              {...register("sort", { valueAsNumber: true })}
              {...fieldA11yProps(`${id}-sort`, errors.sort)}
              type="number"
              min={1}
              className="h-9"
            />
          </LabeledField>
        </div>

        {/* Fixed when the category was created */}
        <dl className="grid gap-4 rounded-lg bg-muted/50 p-3 text-xs sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="font-medium text-foreground">{t("whoCanPost")}</dt>
            <dd className="flex items-center gap-1.5 text-muted-foreground">
              <Lock aria-hidden className="size-3.5 shrink-0" />
              {t(`audienceLocked.${category.audience}`)}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-medium text-foreground">{t("key")}</dt>
            <dd className="flex items-center gap-1.5 text-muted-foreground">
              <Lock aria-hidden className="size-3.5 shrink-0" />
              <code dir="ltr">{category.key}</code>
            </dd>
          </div>
        </dl>

        <RulesList category={category} />

        <SaveBar
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onDiscard={() => reset()}
        />
      </form>
    </SectionCard>
  );
}

// The category's exceptions (badge, forbidden fields, review, certificate)
// in plain words. Read-only; only the rules the dashboard knows are listed
function RulesList({ category }: { category: CategoryDetail }) {
  const t = useTranslations("Cms.categories.form.rules");
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const rules = category.rules;
  if (!rules) return null;

  // Rules point at fields by key; show their names when this category has them
  const fieldName = (key: string) =>
    category.fields.find((field) => field.key === key)?.label[locale] ?? key;

  const lines: string[] = [];
  if (rules.badge) lines.push(t("badge", { text: rules.badge[locale] }));
  if (rules.forbidden_fields?.length) {
    lines.push(
      t("forbiddenFields", {
        fields: format.list(rules.forbidden_fields.map(fieldName)),
      }),
    );
  }
  if (rules.always_review) lines.push(t("alwaysReview"));
  if (rules.certified_when) {
    lines.push(t("certifiedWhen", { field: fieldName(rules.certified_when) }));
  }
  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <ShieldCheck aria-hidden className="size-4 text-primary" />
        {t("title")}
      </p>
      <ul className="flex list-disc flex-col gap-1 ps-6 text-xs text-muted-foreground">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
