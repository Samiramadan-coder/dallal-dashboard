"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  editFieldSchema,
  type CategoryField,
  type EditFieldValues,
} from "@/types/categories";
import { updateCategoryField } from "@/lib/actions/categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import EditBtn from "@/components/reusable/edit-btn";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";

const FLAGS = ["required", "filterable"] as const;

// Changes a saved field's label and whether it's required / filterable.
// Its key, answer type and choices can't change here
export default function EditField({
  field,
  reload,
}: {
  field: CategoryField;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const defaultValues: EditFieldValues = {
    label: field.label,
    required: field.required,
    filterable: field.filterable,
  };

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditFieldValues>({
    resolver: zodResolver(editFieldSchema((key) => t(key as never))),
    defaultValues,
  });

  const onSubmit: SubmitHandler<EditFieldValues> = async (data) => {
    const result = await updateCategoryField(field.id, data);

    if (!result.ok) {
      // Laravel keys like "label.en" are what setError expects
      Object.entries(result.fieldErrors ?? {}).forEach(([key, message]) => {
        setError(key as keyof EditFieldValues, { type: "server", message });
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
        <EditBtn aria-label={t("editField", { name: field.label[locale] })} />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-lg"
      >
        <Header
          title={t("editFieldTitle")}
          description={t("editFieldDescription")}
        />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledField
              required
              id={`${id}-label-en`}
              label={t("fieldLabelEn")}
              error={errors.label?.en}
            >
              <Input
                {...register("label.en")}
                {...fieldA11yProps(`${id}-label-en`, errors.label?.en)}
                dir="ltr"
                className="h-10 bg-background"
              />
            </LabeledField>

            <LabeledField
              required
              id={`${id}-label-ar`}
              label={t("fieldLabelAr")}
              error={errors.label?.ar}
            >
              <Input
                {...register("label.ar")}
                {...fieldA11yProps(`${id}-label-ar`, errors.label?.ar)}
                dir="rtl"
                className="h-10 bg-background"
              />
            </LabeledField>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-sm font-medium text-foreground">
              {t("flagsTitle")}
            </legend>
            {FLAGS.map((flag) => (
              <Controller
                key={flag}
                control={control}
                name={flag}
                render={({ field: control }) => (
                  <label
                    htmlFor={`${id}-${flag}`}
                    className="flex cursor-pointer items-start gap-2.5"
                  >
                    <Checkbox
                      id={`${id}-${flag}`}
                      checked={control.value}
                      onCheckedChange={(checked) =>
                        control.onChange(checked === true)
                      }
                      onBlur={control.onBlur}
                      aria-describedby={`${id}-${flag}-hint`}
                      className="mt-0.5 data-checked:border-secondary data-checked:bg-secondary dark:data-checked:bg-secondary"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground">
                        {t(`flags.${flag}`)}
                      </span>
                      <span
                        id={`${id}-${flag}-hint`}
                        className="text-xs text-muted-foreground"
                      >
                        {t(`flagHints.${flag}`)}
                      </span>
                    </span>
                  </label>
                )}
              />
            ))}
          </fieldset>
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
