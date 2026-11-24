"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Lock, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import {
  PRICING_MODES,
  createCategorySchema,
  type CategoryAudience,
  type CreateCategoryValues,
} from "@/types/categories";
import { createCategory } from "@/lib/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import { useAutoKey } from "../editor/use-auto-key";

// Adds a category to one audience's section. Icon, image, fields and types
// are set afterwards from the category's row
export default function CreateCategory({
  audience,
}: {
  audience: CategoryAudience;
}) {
  const t = useTranslations("Cms.categories.list");
  const tForm = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const defaultValues: CreateCategoryValues = {
    key: "",
    name: { en: "", ar: "" },
    audience,
    pricing_mode: "fixed",
  };

  const {
    control,
    register,
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema((key) => tForm(key as never))),
    defaultValues,
  });

  const autoKey = useAutoKey((key) => setValue("key", key));
  const pricingMode = useWatch({ control, name: "pricing_mode" });
  const nameEnField = register("name.en");
  const keyField = register("key");

  const onSubmit: SubmitHandler<CreateCategoryValues> = async (data) => {
    const result = await createCategory(data);

    if (!result.ok) {
      // Laravel keys like "name.en" are what setError expects
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof CreateCategoryValues, {
          type: "server",
          message,
        });
      });
      toast.error(result.message || tCommon("CreationFailed"));
      return;
    }

    toast.success(result.data.message || tCommon("CreatedSuccessfully"));
    reset(defaultValues);
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
          {t("addCategory")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-xl"
      >
        <Header
          title={t("addCategory")}
          description={t("addCategoryDescription")}
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
              id="category-name-en"
              label={t("create.nameEn")}
              error={errors.name?.en}
            >
              <Input
                {...nameEnField}
                onChange={(event) => {
                  autoKey.follow(event.target.value);
                  return nameEnField.onChange(event);
                }}
                {...fieldA11yProps("category-name-en", errors.name?.en)}
                dir="ltr"
                className="h-10 bg-background"
              />
            </LabeledField>

            <LabeledField
              required
              id="category-name-ar"
              label={t("create.nameAr")}
              error={errors.name?.ar}
            >
              <Input
                {...register("name.ar")}
                {...fieldA11yProps("category-name-ar", errors.name?.ar)}
                dir="rtl"
                className="h-10 bg-background"
              />
            </LabeledField>
          </div>

          <LabeledField
            required
            id="category-key"
            label={t("create.key")}
            error={errors.key}
          >
            <Input
              {...keyField}
              onChange={(event) => {
                autoKey.markEdited();
                return keyField.onChange(event);
              }}
              {...fieldA11yProps("category-key", errors.key)}
              dir="ltr"
              placeholder={t("create.keyPlaceholder")}
              className="h-10 bg-background"
            />
            {!errors.key && (
              <p className="text-xs text-muted-foreground">
                {t("create.keyHint")}
              </p>
            )}
          </LabeledField>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                {t("create.audience")}
              </p>
              {/* Set by the section the category is added from */}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock aria-hidden className="size-3.5 shrink-0" />
                {t(`audiences.${audience}.title`)}
              </p>
            </div>

            <LabeledField
              id="category-pricing"
              label={t("create.pricingMode")}
              error={errors.pricing_mode}
            >
              <Controller
                control={control}
                name="pricing_mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="category-pricing"
                      onBlur={field.onBlur}
                      className="h-10 w-full bg-background"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICING_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {tForm(`pricingModes.${mode}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                {tForm(`pricingModeHints.${pricingMode}`)}
              </p>
            </LabeledField>
          </div>
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
