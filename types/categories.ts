import z from "zod";
import type { T } from "./shared";

export type Translated = {
  en: string;
  ar: string;
};

export const AUDIENCES = ["merchant", "individual_market"] as const;
export type CategoryAudience = (typeof AUDIENCES)[number];

// "live" follows the gold price, "fixed" is set by the seller
export const PRICING_MODES = ["live", "fixed"] as const;
export type PricingMode = (typeof PRICING_MODES)[number];

// Icon keys the API uses for categories
export const CATEGORY_ICONS = [
  "ring",
  "bar",
  "diamond",
  "watch",
  "gem",
  "tools",
  "silver",
  "smartwatch",
  "accessory",
  "antique",
  "beads",
] as const;

// Category-specific exceptions. Known keys are listed; others may appear
export type CategoryRules = {
  // Shown on the category's listings, e.g. "Accessory — not gold"
  badge?: Translated;
  // Field keys sellers can't use here, e.g. ["karat"]
  forbidden_fields?: string[];
  // Every listing goes to review before it's published
  always_review?: boolean;
  // Key of the field whose upload marks the material as certified
  certified_when?: string;
  [key: string]: unknown;
};

export type Category = {
  id: number;
  key: string;
  name: Translated;
  audience: CategoryAudience;
  pricing_mode: PricingMode;
  icon: string | null;
  image: string | null;
  rules: CategoryRules | null;
  sort: number;
  is_active: boolean;
  types_count: number;
  fields_count: number;
};

export type CategoryType = {
  id: number;
  category_id: number;
  key: string;
  name: Translated;
  sort: number;
  is_active: boolean;
};

export const FIELD_TYPES = [
  "text",
  "number",
  "unit_number",
  "select",
  "bool",
  "file",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldOption = {
  value: string;
  label: Translated;
};

// A unit a number can be entered in; `factor` converts it to the base unit
export type FieldUnit = {
  value: string;
  label: Translated;
  factor: number;
};

// Limits on a field's answer. Known keys are listed; others may appear
export type FieldValidation = {
  min?: number;
  max?: number;
  // Key of another field this one can't exceed (net weight ≤ gross weight)
  lte_field?: string;
  // Allowed file extensions, for "file" fields
  mimes?: string[];
  max_files?: number;
  [key: string]: unknown;
};

export type CategoryField = {
  id: number;
  category_id: number;
  key: string;
  label: Translated;
  type: FieldType;
  // Only for "select"
  options: FieldOption[] | null;
  // Only for "unit_number"
  units: FieldUnit[] | null;
  required: boolean;
  filterable: boolean;
  hidden_from_public: boolean;
  validation: FieldValidation | null;
  // Shown only when other fields have these values, e.g. { has_stones: true }
  show_if: Record<string, unknown> | null;
  audience: CategoryAudience | null;
  sort: number;
  is_active: boolean;
};

// GET /admin/catalog/categories/{id}; the counts come back null here
export type CategoryDetail = Omit<Category, "types_count" | "fields_count"> & {
  types: CategoryType[];
  fields: CategoryField[];
};

// --- Forms -----------------------------------------------------------------

const translatedSchema = (t: T) =>
  z.object({
    en: z.string().trim().min(1, t("errors.required")),
    ar: z.string().trim().min(1, t("errors.required")),
  });

// Keys the API identifies things by: "old_coin", "gross_weight"
const keySchema = (t: T) =>
  z
    .string()
    .trim()
    .min(1, t("errors.required"))
    .regex(/^[a-z][a-z0-9_]*$/, t("errors.keyInvalid"));

// POST /admin/catalog/categories
export const createCategorySchema = (t: T) =>
  z.object({
    key: keySchema(t),
    name: translatedSchema(t),
    audience: z.enum(AUDIENCES),
    pricing_mode: z.enum(PRICING_MODES),
  });

export type CreateCategoryValues = z.infer<
  ReturnType<typeof createCategorySchema>
>;

// PUT /admin/catalog/categories/{id}: the category's own data
export const categoryDetailsSchema = (t: T) =>
  z.object({
    name: translatedSchema(t),
    icon: z.string().nullable(),
    // Empty number inputs come through as NaN, which z.number() rejects
    sort: z
      .number({ error: t("errors.required") })
      .int()
      .min(1, t("errors.sortMin")),
    pricing_mode: z.enum(PRICING_MODES),
    // The current image URL, a newly picked file, or "" / null for none
    image: z
      .union([
        z.string(),
        z
          .instanceof(Blob)
          .refine((file) => file.size <= 1024 * 1024, t("errors.imageSize")),
      ])
      .nullable(),
  });

export type CategoryDetailsValues = z.infer<
  ReturnType<typeof categoryDetailsSchema>
>;

// POST /admin/catalog/categories/{id}/types
export const newTypeSchema = (t: T) =>
  z.object({ key: keySchema(t), name: translatedSchema(t) });

export type NewTypeValues = z.infer<ReturnType<typeof newTypeSchema>>;

// POST /admin/catalog/fields
export const newFieldSchema = (t: T) =>
  z.object({
    key: keySchema(t),
    label: translatedSchema(t),
    type: z.enum(FIELD_TYPES),
    // Always arrays in the form; only the one the type uses is sent
    options: z.array(
      z.object({ value: z.string(), label: translatedSchema(t) }),
    ),
    units: z.array(
      z.object({
        value: z.string(),
        label: translatedSchema(t),
        factor: z
          .number({ error: t("errors.required") })
          .positive(t("errors.factorPositive")),
      }),
    ),
    required: z.boolean(),
    filterable: z.boolean(),
    hidden_from_public: z.boolean(),
  });

export type NewFieldValues = z.infer<ReturnType<typeof newFieldSchema>>;

export type CreateFieldPayload = {
  category_id: number;
  key: string;
  label: Translated;
  type: FieldType;
  required: boolean;
  filterable: boolean;
  hidden_from_public: boolean;
  options?: FieldOption[];
  units?: FieldUnit[];
};

// --- Individual market rules ----------------------------------------------

// GET /admin/catalog/market-rules: one rule per category and country
export type MarketRule = {
  id: number;
  category: { id: number; key: string };
  country: { id: number; code: string };
  // Highest price an individual seller may ask; null for no cap
  max_price_individual: number | null;
  currency: string;
  requires_review: boolean;
};

// Prices are kept as text so an empty input means "no cap"
export const marketRulesSchema = (t: T) =>
  z.object({
    categories: z.array(
      z.object({
        category_id: z.number(),
        countries: z.array(
          z.object({
            country_id: z.number(),
            max_price: z
              .string()
              .trim()
              .refine(
                (value) => value === "" || Number(value) >= 0,
                t("errors.priceInvalid"),
              ),
            requires_review: z.boolean(),
          }),
        ),
      }),
    ),
  });

export type MarketRulesValues = z.infer<ReturnType<typeof marketRulesSchema>>;
