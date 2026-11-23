"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import Switch from "@/components/form/switch";
import LocationPicker, {
  type LocationValue,
} from "@/components/form/location-picker";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import { createCity, updateCity } from "@/lib/actions/cities";
import { City, CityFormValues, citySchema } from "@/types/countries";


const EMPTY = {
  name: { en: "", ar: "" },
  lat: NaN,
  lng: NaN,
  is_active: true,
} satisfies CityFormValues;

function toFormValues(city?: City): CityFormValues {
  if (!city) return EMPTY;
  return {
    name: { en: city.name.en, ar: city.name.ar },
    // Number(): the API may send decimals as strings
    lat: Number(city.lat),
    lng: Number(city.lng),
    is_active: city.is_active,
  };
}

// Six decimals is ~10 cm; map clicks give far more digits than that
function round(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

type CreateEditCityProps = {
  countryId: number;
  // Edit mode when given
  city?: City;
  // Replaces the default "Add city" button
  trigger?: React.ReactNode;
  // Where the map opens before a point is picked, e.g. an existing city
  mapCenter: LocationValue;
  // The saved city, when known. Adding without one means the list should
  // reload, since the new city's id is unknown
  onSaved: (city?: City) => void;
};

export default function CreateEditCity({
  countryId,
  city,
  trigger,
  mapCenter,
  onSaved,
}: CreateEditCityProps) {
  const t = useTranslations("Countries.Cities");
  const tCountries = useTranslations("Countries");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(city);

  const {
    control,
    register,
    reset,
    setError,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema((key) => tCountries(key as never))),
    defaultValues: toFormValues(city),
  });

  const [lat, lng] = useWatch({ control, name: ["lat", "lng"] });
  const hasPoint =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  const onSubmit: SubmitHandler<CityFormValues> = async (values) => {
    const result = city
      ? await updateCity(city.id, values)
      : await createCity(countryId, values);

    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof CityFormValues, { type: "server", message });
      });
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    toast.success(
      result.data.message ||
        tCommon(isEdit ? "UpdatedSuccessfully" : "CreatedSuccessfully"),
    );
    // Edit: what was sent is what's saved, even if the API returns nothing
    onSaved(result.data.city ?? (city && { ...city, ...values }));
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        // Every open starts from the saved city (or empty when adding), so
        // an abandoned draft doesn't come back
        if (value) reset(toFormValues(city));
      }}
    >
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            <Plus className="size-3" />
            {t("add")}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-xl"
      >
        <Header
          title={isEdit ? t("edit") : t("add")}
          description={isEdit ? t("editDescription") : t("addDescription")}
        />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <LabeledField
              required
              id="city-name-en"
              label={t("Fields.Name.labelEn")}
              error={errors.name?.en}
            >
              <Input
                {...register("name.en")}
                {...fieldA11yProps("city-name-en", errors.name?.en)}
                type="text"
                dir="ltr"
                placeholder={t("Fields.Name.placeholderEn")}
                className="h-10 bg-background font-inter"
              />
            </LabeledField>

            <LabeledField
              required
              id="city-name-ar"
              label={t("Fields.Name.labelAr")}
              error={errors.name?.ar}
            >
              <Input
                {...register("name.ar")}
                {...fieldA11yProps("city-name-ar", errors.name?.ar)}
                type="text"
                dir="rtl"
                placeholder={t("Fields.Name.placeholderAr")}
                className="h-10 bg-background font-cairo"
              />
            </LabeledField>
          </div>

          <div className="space-y-2">
            <div className="grid gap-5 sm:grid-cols-2">
              <LabeledField
                required
                id="city-lat"
                label={t("Fields.Lat.label")}
                error={errors.lat}
              >
                <Input
                  {...register("lat", { valueAsNumber: true })}
                  {...fieldA11yProps("city-lat", errors.lat)}
                  type="number"
                  step="any"
                  dir="ltr"
                  placeholder="25.3392"
                  className="h-10 bg-background tabular-nums"
                />
              </LabeledField>

              <LabeledField
                required
                id="city-lng"
                label={t("Fields.Lng.label")}
                error={errors.lng}
              >
                <Input
                  {...register("lng", { valueAsNumber: true })}
                  {...fieldA11yProps("city-lng", errors.lng)}
                  type="number"
                  step="any"
                  dir="ltr"
                  placeholder="56.35"
                  className="h-10 bg-background tabular-nums"
                />
              </LabeledField>
            </div>

            <p className="text-xs text-muted-foreground">{t("mapHint")}</p>

            {open && (
              <div className="overflow-hidden rounded-md border border-border">
                <LocationPicker
                  value={
                    hasPoint ? { latitude: lat, longitude: lng } : mapCenter
                  }
                  onChange={({ latitude, longitude }) => {
                    const options = { shouldValidate: true, shouldDirty: true };
                    setValue("lat", round(latitude), options);
                    setValue("lng", round(longitude), options);
                  }}
                />
              </div>
            )}
          </div>

          <Switch<CityFormValues>
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
