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
  name: {
    en: string;
    ar: string;
  };
};
