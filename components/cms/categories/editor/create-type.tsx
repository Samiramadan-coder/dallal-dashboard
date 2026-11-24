"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { newTypeSchema, type NewTypeValues } from "@/types/categories";
import { createCategoryType } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import { useAutoKey } from "./use-auto-key";

const EMPTY_TYPE: NewTypeValues = { key: "", name: { en: "", ar: "" } };

// Adds one type to a category, then refreshes the category's saved lists
export default function CreateType({
  categoryId,
  reload,
}: {
  categoryId: number;
  reload: () => Promise<boolean>;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const {
    register,
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewTypeValues>({
    resolver: zodResolver(newTypeSchema((key) => t(key as never))),
    defaultValues: EMPTY_TYPE,
  });

  const autoKey = useAutoKey((key) => setValue("key", key));
  const nameEn = register("name.en");
  const key = register("key");

  const onSubmit: SubmitHandler<NewTypeValues> = async (data) => {
    const result = await createCategoryType(categoryId, data);

    if (!result.ok) {
      // Laravel keys like "name.en" are what setError expects
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof NewTypeValues, { type: "server", message });
      });
      toast.error(result.message || tCommon("CreationFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("CreatedSuccessfully"));
    await reload();
    reset(EMPTY_TYPE);
    autoKey.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-secondary hover:text-secondary"
        >
          <Plus />
          {t("addType")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-lg"
      >
        <Header title={t("addType")} description={t("addTypeDescription")} />

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
                {...nameEn}
                onChange={(event) => {
                  autoKey.follow(event.target.value);
                  return nameEn.onChange(event);
                }}
                {...fieldA11yProps(`${id}-name-en`, errors.name?.en)}
                dir="ltr"
                placeholder={t("typeNamePlaceholderEn")}
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
                placeholder={t("typeNamePlaceholderAr")}
                className="h-10 bg-background"
              />
            </LabeledField>
          </div>

          <LabeledField
            required
            id={`${id}-key`}
            label={t("typeKey")}
            error={errors.key}
          >
            <Input
              {...key}
              onChange={(event) => {
                autoKey.markEdited();
                return key.onChange(event);
              }}
              {...fieldA11yProps(`${id}-key`, errors.key)}
              dir="ltr"
              placeholder={t("typeKeyPlaceholder")}
              className="h-10 bg-background"
            />
            {!errors.key && (
              <p className="text-xs text-muted-foreground">{t("keyHint")}</p>
            )}
          </LabeledField>
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
