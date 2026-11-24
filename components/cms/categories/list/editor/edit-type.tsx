"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  editTypeSchema,
  type CategoryType,
  type EditTypeValues,
} from "@/types/categories";
import { updateCategoryType } from "@/lib/actions/categories";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import EditBtn from "@/components/reusable/edit-btn";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";

// Renames a saved type or turns it on/off. Its key can't change
export default function EditType({
  type,
  reload,
}: {
  type: CategoryType;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const defaultValues: EditTypeValues = {
    name: type.name,
    is_active: type.is_active,
  };

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditTypeValues>({
    resolver: zodResolver(editTypeSchema((key) => t(key as never))),
    defaultValues,
  });

  const onSubmit: SubmitHandler<EditTypeValues> = async (data) => {
    const result = await updateCategoryType(type.id, data);

    if (!result.ok) {
      // Laravel keys like "name.en" are what setError expects
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof EditTypeValues, { type: "server", message });
      });
      toast.error(result.message || tCommon("UpdateFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("UpdatedSuccessfully"));
    await reload();
    reset(data);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Reopening starts from the saved values, not a cancelled edit
        if (next) reset(defaultValues);
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <EditBtn aria-label={t("editType", { name: type.name[locale] })} />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-lg"
      >
        <Header title={t("editTypeTitle")} />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledField
              required
              id={`${id}-name-en`}
              label={t("typeNameEn")}
              error={errors.name?.en}
            >
              <Input
                {...register("name.en")}
                {...fieldA11yProps(`${id}-name-en`, errors.name?.en)}
                dir="ltr"
                className="h-10 bg-background"
              />
            </LabeledField>

            <LabeledField
              required
              id={`${id}-name-ar`}
              label={t("typeNameAr")}
              error={errors.name?.ar}
            >
              <Input
                {...register("name.ar")}
                {...fieldA11yProps(`${id}-name-ar`, errors.name?.ar)}
                dir="rtl"
                className="h-10 bg-background"
              />
            </LabeledField>
          </div>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label
                htmlFor={`${id}-active`}
                className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {t("typeActive")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("typeActiveHint")}
                  </span>
                </span>
                <Switch
                  id={`${id}-active`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                  className="data-checked:bg-secondary"
                />
              </label>
            )}
          />
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
