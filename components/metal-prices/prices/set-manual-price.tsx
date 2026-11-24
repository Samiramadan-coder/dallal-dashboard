"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import { setManualPrice } from "@/lib/actions/metal-prices";
import {
  manualPriceSchema,
  type GradePrice,
  type ManualPriceFormValues,
  type Metal,
} from "@/types/metal-prices";

const FIELDS = ["karat", "price_per_gram", "reason", "expires_at"] as const;

// Replaces the feed price of one grade of `metal` in one country.
// `grades` are per gram, whatever unit the page shows
export default function SetManualPrice({
  countryId,
  countryName,
  metal,
  grades,
}: {
  countryId: number;
  countryName: string;
  metal: Metal;
  grades: GradePrice[];
}) {
  const t = useTranslations("MetalPrices.prices.manualPrice");
  const tMetals = useTranslations("MetalPrices.prices.metals");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const empty: ManualPriceFormValues = {
    karat: grades[0]?.karat ?? "",
    price_per_gram: NaN,
    reason: "",
    expires_at: "",
  };

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManualPriceFormValues>({
    resolver: zodResolver(manualPriceSchema((key) => t(key as never))),
    defaultValues: empty,
  });

  const karat = useWatch({ control, name: "karat" });
  const selected = grades.find((grade) => grade.karat === karat);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset(empty);
  };

  const onSubmit: SubmitHandler<ManualPriceFormValues> = async (values) => {
    const result = await setManualPrice({
      country_id: countryId,
      metal,
      karat: values.karat,
      price_per_gram: values.price_per_gram,
      reason: values.reason,
      // datetime-local has no zone: it is the admin's own local time
      expires_at: values.expires_at
        ? new Date(values.expires_at).toISOString()
        : undefined,
    });

    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        const key = FIELDS.find((name) => field === name);
        if (key) setError(key, { type: "server", message });
      });
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    toast.success(result.data.message || t("success"));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 bg-card px-3 text-xs font-semibold"
        >
          {t("button")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-lg"
      >
        <Header
          title={t("title", { metal: tMetals(metal) })}
          description={t("description", { country: countryName })}
        />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <div className="grid items-start gap-5 sm:grid-cols-2">
            <Controller
              control={control}
              name="karat"
              render={({ field, fieldState }) => (
                <LabeledField
                  required
                  id="manual-price-grade"
                  label={t("fields.grade.label")}
                  error={fieldState.error}
                >
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      {...fieldA11yProps(
                        "manual-price-grade",
                        fieldState.error,
                      )}
                      onBlur={field.onBlur}
                      className="h-10 w-full bg-background"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.karat} value={grade.karat}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </LabeledField>
              )}
            />

            <LabeledField
              required
              id="manual-price-amount"
              label={t("fields.price.label", {
                currency: selected?.currency ?? "",
              })}
              error={errors.price_per_gram}
            >
              <Input
                {...register("price_per_gram", { valueAsNumber: true })}
                {...fieldA11yProps(
                  "manual-price-amount",
                  errors.price_per_gram,
                )}
                type="number"
                step="any"
                min={0}
                dir="ltr"
                className="h-10 bg-background"
              />
              {selected && (
                <p className="text-xs text-muted-foreground">
                  {t("fields.price.hint", {
                    price: format.number(selected.siteAmount, {
                      style: "currency",
                      currency: selected.currency,
                    }),
                  })}
                </p>
              )}
            </LabeledField>
          </div>

          <LabeledField
            required
            id="manual-price-reason"
            label={t("fields.reason.label")}
            error={errors.reason}
          >
            <Textarea
              {...register("reason")}
              {...fieldA11yProps("manual-price-reason", errors.reason)}
              placeholder={t("fields.reason.placeholder")}
              className="min-h-20 bg-background"
            />
            <p className="text-xs text-muted-foreground">
              {t("fields.reason.hint")}
            </p>
          </LabeledField>

          <LabeledField
            id="manual-price-expires"
            label={t("fields.expires.label")}
            error={errors.expires_at}
          >
            <Input
              {...register("expires_at")}
              {...fieldA11yProps("manual-price-expires", errors.expires_at)}
              type="datetime-local"
              dir="ltr"
              className="h-10 bg-background"
            />
            <p className="text-xs text-muted-foreground">
              {t("fields.expires.hint")}
            </p>
          </LabeledField>
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
