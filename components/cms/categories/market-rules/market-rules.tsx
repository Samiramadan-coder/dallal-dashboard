"use client";

import { useId } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  refreshMarketRules,
  updateMarketRule,
} from "@/lib/actions/market-rules";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type SubmitHandler,
  type UseFormRegister,
} from "react-hook-form";
import {
  marketRulesSchema,
  type Category,
  type MarketRule,
  type MarketRulesValues,
} from "@/types/categories";
import type { Country } from "@/types/countries";
import type { Locale } from "@/types/shared";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SaveBar from "../list/editor/save-bar";

// One box per individual-market category and live country, filled from the
// saved rule when there is one
function toValues(
  categories: Category[],
  countries: Country[],
  rules: MarketRule[],
): MarketRulesValues {
  return {
    categories: categories.map((category) => ({
      category_id: category.id,
      countries: countries.map((country) => {
        const rule = rules.find(
          (r) => r.category.id === category.id && r.country.id === country.id,
        );
        return {
          country_id: country.id,
          max_price: rule?.max_price_individual?.toString() ?? "",
          requires_review: rule?.requires_review ?? false,
        };
      }),
    })),
  };
}

// Limits on what individual sellers can post: a price cap per country for
// each individual-market category, and whether listings go to review
export default function MarketRules({
  categories: allCategories,
  countries: allCountries,
  rules,
}: {
  categories: Category[];
  countries: Country[];
  rules: MarketRule[];
}) {
  const t = useTranslations("Cms.categories.marketRules");
  const tCommon = useTranslations("Common");
  const locale = useLocale() as Locale;

  // Merchants have no caps, and only live countries take listings
  const categories = allCategories.filter(
    (category) => category.audience === "individual_market",
  );
  const countries = allCountries.filter((country) => country.status === "live");

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, dirtyFields },
  } = useForm<MarketRulesValues>({
    resolver: zodResolver(marketRulesSchema((key) => t(key as never))),
    defaultValues: toValues(categories, countries, rules),
  });

  const onSubmit: SubmitHandler<MarketRulesValues> = async (data) => {
    // Only the boxes the admin changed are sent, one request each
    const changed = data.categories.flatMap((category, i) =>
      category.countries
        .map((country, j) => ({ category, country, i, j }))
        .filter(({ i, j }) => {
          const dirty = dirtyFields.categories?.[i]?.countries?.[j];
          return dirty?.max_price || dirty?.requires_review;
        }),
    );

    let failed = 0;
    for (const { category, country, i, j } of changed) {
      const result = await updateMarketRule({
        category_id: category.category_id,
        country_id: country.country_id,
        // An empty price means no cap
        max_price_individual:
          country.max_price === "" ? null : Number(country.max_price),
        requires_review: country.requires_review,
      });

      if (!result.ok) {
        failed += 1;
        setError(`categories.${i}.countries.${j}.max_price`, {
          type: "server",
          message:
            result.fieldErrors?.max_price_individual ||
            result.message ||
            tCommon("UpdateFailed"),
        });
      }
    }

    await refreshMarketRules();

    if (failed > 0) {
      // Keep the edits so the failed boxes can be fixed and saved again;
      // saving again resends the ones that worked, which is harmless
      toast.error(tCommon("UpdateFailed"));
      return;
    }

    toast.success(tCommon("UpdatedSuccessfully"));
    // The saved values become the new baseline for "Discard"
    reset(data);
  };

  return (
    <section
      aria-labelledby="market-rules-title"
      className="flex flex-col gap-5 rounded-xl border bg-card p-5"
    >
      <header className="flex flex-col gap-0.5">
        <h2
          id="market-rules-title"
          className="text-base font-semibold text-foreground"
        >
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      {categories.length === 0 || countries.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
          {categories.length === 0 ? t("noCategories") : t("noCountries")}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <ul className="flex flex-col divide-y">
            {categories.map((category, index) => (
              <li key={category.id} className="py-5 first:pt-0 last:pb-0">
                <CategoryCaps
                  index={index}
                  name={category.name[locale]}
                  countries={countries}
                  control={control}
                  register={register}
                  errors={errors}
                />
              </li>
            ))}
          </ul>

          <SaveBar
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            onDiscard={() => reset()}
          />
        </form>
      )}
    </section>
  );
}

function CategoryCaps({
  index,
  name,
  countries,
  control,
  register,
  errors,
}: {
  index: number;
  name: string;
  countries: Country[];
  control: Control<MarketRulesValues>;
  register: UseFormRegister<MarketRulesValues>;
  errors: FieldErrors<MarketRulesValues>;
}) {
  const t = useTranslations("Cms.categories.marketRules");
  const locale = useLocale() as Locale;
  const id = useId();

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-4 text-sm font-semibold text-foreground">
        {name}
      </legend>

      <div className="flex flex-wrap gap-x-6 gap-y-5">
        {countries.map((country, i) => {
          const inputId = `${id}-${country.id}`;
          const error =
            errors.categories?.[index]?.countries?.[i]?.max_price;

          return (
            <div key={country.id} className="flex flex-col gap-2">
              <label
                htmlFor={inputId}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
              >
                <Image
                  src={country.flag}
                  alt=""
                  width={16}
                  height={12}
                  className="h-3 w-4 rounded-xs object-cover"
                />
                {country.name[locale]}
              </label>

              <div className="flex items-center gap-2">
                <Input
                  {...register(
                    `categories.${index}.countries.${i}.max_price`,
                  )}
                  id={inputId}
                  type="number"
                  min={0}
                  inputMode="decimal"
                  placeholder={t("noCap")}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  className="h-10 w-32"
                />
                <span className="text-xs text-muted-foreground">
                  {country.currency}
                </span>
              </div>
              {error?.message && (
                <p id={`${inputId}-error`} className="text-xs text-destructive">
                  {error.message}
                </p>
              )}

              <Controller
                control={control}
                name={`categories.${index}.countries.${i}.requires_review`}
                render={({ field }) => (
                  <label
                    htmlFor={`${inputId}-review`}
                    className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Switch
                      id={`${inputId}-review`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                      size="sm"
                      className="data-checked:bg-secondary"
                    />
                    {t("requiresReview")}
                  </label>
                )}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
