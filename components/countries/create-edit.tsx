"use client";

import { toast } from "sonner";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import Switch from "@/components/form/switch";
import Footer from "@/components/form/footer";
import Header from "@/components/form/header";
import { postCountry } from "@/lib/countries";
import AddButton from "@/components/form/add-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm, SubmitHandler } from "react-hook-form";
import SingleFormImageUploader from "../form/single-image-uploader";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Country, CountryFormValues, countrySchema } from "@/types/countries";

type CreateEditProps = {
  country?: Country;
  trigger?: React.ReactNode;
};

export default function CreateEdit({ country, trigger }: CreateEditProps) {
  const t = useTranslations("Countries");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(country);

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema((key) => t(key as never))),
    defaultValues: {
      flag: country?.flag ?? "",
      code: country?.code ?? "",
      name: country?.name ?? { en: "", ar: "" },
      is_active: country?.is_active ?? true,
    },
  });

  const onSubmit: SubmitHandler<CountryFormValues> = async (data) => {
    const result = await postCountry(data, country?.id);

    if (result.success) {
      toast.success(result.message);
      // Keep edited values; start a fresh form after adding
      if (!isEdit) reset();
      setOpen(false);
      return;
    }

    if (result.errors) {
      Object.entries(result.errors).forEach(([field, message]) => {
        setError(field as keyof CountryFormValues, {
          type: "server",
          message,
        });
      });
    }

    toast.error(result.message || tCommon("ErrorOccurred"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <AddButton label={t("AddCountry")} />
      )}

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-xl"
      >
        <Header
          title={isEdit ? t("EditCountry") : t("AddCountry")}
          description={
            isEdit ? t("EditCountryDescription") : t("AddCountryDescription")
          }
        />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <SingleFormImageUploader
            control={control}
            name="flag"
            label={t("Fields.Flag.label")}
            hint={t("Fields.Flag.hint")}
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledField
              required
              id="name-en"
              label={t("Fields.Name.labelEn")}
              error={errors.name?.en}
            >
              <Input
                {...register("name.en")}
                {...fieldA11yProps("name-en", errors.name?.en)}
                type="text"
                dir="ltr"
                placeholder={t("Fields.Name.placeholderEn")}
                className="h-10 bg-background font-inter"
              />
            </LabeledField>

            <LabeledField
              required
              id="name-ar"
              label={t("Fields.Name.labelAr")}
              error={errors.name?.ar}
            >
              <Input
                {...register("name.ar")}
                {...fieldA11yProps("name-ar", errors.name?.ar)}
                type="text"
                dir="rtl"
                placeholder={t("Fields.Name.placeholderAr")}
                className="h-10 bg-background font-cairo"
              />
            </LabeledField>
          </div>

          <LabeledField
            required
            id="code"
            label={t("Fields.Code.label")}
            error={errors.code}
          >
            <Input
              {...register("code")}
              {...fieldA11yProps("code", errors.code)}
              type="text"
              dir="ltr"
              placeholder={t("Fields.Code.placeholder")}
              className="h-10 bg-background uppercase"
            />
          </LabeledField>

          <Switch<CountryFormValues>
            name="is_active"
            control={control}
            label={t("Fields.IsActive.label")}
          />
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
