export type Translated = {
  en: string;
  ar: string;
};

export type CategoryAudience = "merchant" | "individual_market";

// "live" follows the gold price, "fixed" is set by the seller
export type PricingMode = "live" | "fixed";

export type Category = {
  id: number;
  key: string;
  name: Translated;
  audience: CategoryAudience;
  pricing_mode: PricingMode;
  icon: string | null;
  image: string | null;
  // Category-specific flags (badge, forbidden_fields, always_review, …)
  rules: Record<string, unknown> | null;
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
  // e.g. { min, max, lte_field } or { mimes, max_files }
  validation: Record<string, unknown> | null;
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
