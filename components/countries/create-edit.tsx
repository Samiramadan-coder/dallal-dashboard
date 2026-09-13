"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import Input from "@/components/form/input";
import Switch from "@/components/form/switch";
import Footer from "@/components/form/footer";
import Header from "@/components/form/header";
import { postCountry } from "@/lib/countries";
import AddButton from "@/components/form/add-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { availableLocales } from "@/constants/shared";
import { useLocale, useTranslations } from "next-intl";
import { useFormLocale } from "@/hooks/use-form-locale";
import { useForm, SubmitHandler } from "react-hook-form";
import SingleFormImageUploader from "../form/single-image-uploader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LocaleFormSwitcher from "@/components/reusable/locale-form-switcher";
import { Country, CountryFormValues, countrySchema } from "@/types/countries";

type CreateEditProps = {
  country?: Country;
  trigger?: React.ReactNode;
};

export default function CreateEdit({ country, trigger }: CreateEditProps) {
  const locale = useLocale();
  const t = useTranslations("Countries");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const { activeLocale, changeLocale, dir, isArabic, tLive } =
    useFormLocale("Countries");

  const {
    control,
    register,
    setError,
    trigger: triggerValidation,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema((key) => tLive(key as never))),
    defaultValues: {
      flag: country?.flag ?? "",
      code: country?.code ?? "",
      name: country?.name ?? { en: "", ar: "" },
      is_active: country?.is_active || true,
    },
  });

  useEffect(() => {
    if (isSubmitted) void triggerValidation();
  }, [isSubmitted, triggerValidation, activeLocale]);

  const onSubmit: SubmitHandler<CountryFormValues> = async (data) => {
    const result = await postCountry(data, country?.id);

    if (result.success) {
      toast.success(result.message);
      form.current?.reset();
      return;
    }

    if (result.message) {
      toast.error(result.message);
    }

    if (result.errors) {
      Object.entries(result.errors).forEach(([field, message]) => {
        toast.error(message);
        setError(field as keyof CountryFormValues, {
          type: "server",
          message,
        });
      });
    }

    toast.error(tCommon("ErrorOccurred"));
  };

  return (
    <Sheet>
      {trigger ? (
        <SheetTrigger asChild>{trigger}</SheetTrigger>
      ) : (
        <AddButton label={t("AddCountry")} />
      )}

      <SheetContent
        showCloseButton={false}
        className="bg-white flex h-full flex-col sm:max-w-2xl"
        side={locale === "ar" ? "left" : "right"}
      >
        <Header
          title={t("AddCountry")}
          description={t("AddCountryDescription")}
        />

        <LocaleFormSwitcher
          locale={activeLocale}
          onChange={(locale) => {
            changeLocale(locale);
          }}
        />

        <div
          className={cn(`flex-1 overflow-auto px-4 pb-6 pt-2`, {
            "font-cairo": isArabic,
            "font-inter": !isArabic,
          })}
          dir={dir}
        >
          <form
            ref={form}
            onSubmit={(e) =>
              handleSubmit(onSubmit, (errors) => {
                {
                  if (activeLocale === "en") {
                    const hasArErrors = errors.name?.ar;
                    if (hasArErrors) {
                      changeLocale("ar");
                      return;
                    }
                  }

                  if (activeLocale === "ar") {
                    const hasEnErrors = errors.name?.en;
                    if (hasEnErrors) {
                      changeLocale("en");
                      return;
                    }
                  }
                }
              })(e)
            }
            className="space-y-6 relative"
          >
            <SingleFormImageUploader
              control={control}
              name="flag"
              label={tLive("Fields.Flag.label")}
              required
            />

            {availableLocales.map((lang) => (
              <Input<CountryFormValues>
                required
                key={lang}
                type="text"
                errors={errors}
                register={register}
                name={`name.${lang}`}
                label={tLive("Fields.Name.label")}
                placeholder={tLive("Fields.Name.placeholder")}
                className={`${activeLocale === lang ? "" : "hidden"}`}
              />
            ))}

            <Input<CountryFormValues>
              required
              type="text"
              errors={errors}
              register={register}
              name={`code`}
              label={tLive("Fields.Code.label")}
              placeholder={tLive("Fields.Code.placeholder")}
            />

            <Switch<CountryFormValues>
              name="is_active"
              control={control}
              label={tLive("Fields.IsActive.label")}
            />
          </form>
        </div>
        <Footer form={form} loading={isSubmitting} />
      </SheetContent>
    </Sheet>
  );
}
