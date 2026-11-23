import z from "zod";
import { T } from "./shared";

export const countrySchema = (t: T) =>
  z.object({
    name: z.object({
      en: z
        .string()
        .min(1, t("Fields.Name.required"))
        .min(3, t("Fields.Name.minLength")),
      ar: z
        .string()
        .min(1, t("Fields.Name.required"))
        .min(3, t("Fields.Name.minLength")),
    }),
    code: z
      .string()
      .min(1, t("Fields.Code.required"))
      .min(2, t("Fields.Code.minLength")),

    flag: z.union([
      z.string().min(1, t("Fields.Flag.required")),
      z
        .instanceof(Blob)
        .refine((file) => file.size > 0, t("Fields.Flag.required"))
        .refine((file) => file.size <= 1024 * 1024, t("Fields.Flag.fileSize")),
    ]),

    is_active: z.boolean(),
  });

export type CountryFormValues = z.infer<ReturnType<typeof countrySchema>>;

export type Country = {
  code: string;
  dial_code: string;
  flag: string;
  id: number;
  is_active: boolean;
  // "live" | "coming_soon" | …
  status?: string;
  cities_count?: number;
  name: {
    en: string;
    ar: string;
  };
};

// Valid empty number inputs come through as NaN, which z.number() rejects
export const citySchema = (t: T) =>
  z.object({
    name: z.object({
      en: z.string().trim().min(1, t("Cities.Fields.Name.required")),
      ar: z.string().trim().min(1, t("Cities.Fields.Name.required")),
    }),
    lat: z
      .number({ error: t("Cities.Fields.Lat.required") })
      .min(-90, t("Cities.Fields.Lat.invalid"))
      .max(90, t("Cities.Fields.Lat.invalid")),
    lng: z
      .number({ error: t("Cities.Fields.Lng.required") })
      .min(-180, t("Cities.Fields.Lng.invalid"))
      .max(180, t("Cities.Fields.Lng.invalid")),
    is_active: z.boolean(),
  });

export type CityFormValues = z.infer<ReturnType<typeof citySchema>>;

export type City = {
  id: number;
  country_id: number;
  name: {
    en: string;
    ar: string;
  };
  lat: number;
  lng: number;
  is_active: boolean;
  sort: number;
};
