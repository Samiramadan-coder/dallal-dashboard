import z from "zod";
import type { Country } from "./countries";
import type { ApiResponse, Pagination, T } from "./shared";

export type Metal = "gold" | "silver" | "platinum";

export type PriceStatus = "published" | "rejected" | "superseded";

// One price per gram for a market, as returned by GET /api/v1/admin/prices
export type MetalPrice = {
  id: number;
  country: { id: number; code: string };
  metal: Metal;
  // "24", "925", "999", …
  karat: string;
  // Localized by Accept-Language, e.g. "Gold 21K"
  label: string;
  price_per_gram: {
    amount: number;
    currency: string;
    formatted: string;
  };
  // Move from the price it replaces, in percent; null for the first one
  change_pct: number | null;
  spot_usd_oz: number;
  source: string;
  status: PriceStatus;
  status_label: string;
  // ISO 8601
  priced_at: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
};

export type MetalPricesResponse = ApiResponse<{
  data: MetalPrice[];
  meta: Pagination;
}>;

// A held price with its market resolved from the countries list
export type HeldPriceRow = Omit<MetalPrice, "country"> & {
  country: Country | null;
};

// GET /api/v1/admin/metal-sources
export type MetalSourcesResponse = ApiResponse<{
  market_open: boolean;
  refresh_minutes: number;
  // A feed move above this percent is held for review
  guard_percent: number;
  sources: {
    id: number;
    country: { id: number; code: string; name: string; currency: string };
    type: string;
    type_label: string;
    reference_name: string | null;
    margins: Record<string, number>;
    last_fetched_at: string | null;
    last_error: string | null;
    overrides: unknown[];
  }[];
}>;

export type MetalSource = MetalSourcesResponse["data"]["sources"][number];

// One grade's live price, split into feed price and margin
export type GradePrice = {
  metal: Metal;
  karat: string;
  label: string;
  currency: string;
  // Feed price before the country margin
  baseAmount: number;
  // Percent added on top of the feed price
  margin: number;
  // What the site shows
  siteAmount: number;
};

// "Set manual price" form: replaces the feed price of one grade until it
// expires. Valid empty number inputs come through as NaN
export const manualPriceSchema = (t: T) =>
  z.object({
    karat: z.string().min(1, t("fields.grade.required")),
    price_per_gram: z
      .number({ error: t("fields.price.required") })
      .positive(t("fields.price.positive")),
    reason: z
      .string()
      .trim()
      .min(1, t("fields.reason.required"))
      .max(500, t("fields.reason.maxLength")),
    // datetime-local value ("2026-11-25T22:00"); empty for no expiry
    expires_at: z.string(),
  });

export type ManualPriceFormValues = z.infer<
  ReturnType<typeof manualPriceSchema>
>;

// POST /api/v1/admin/prices/override
export type ManualPricePayload = {
  country_id: number;
  metal: Metal;
  karat: string;
  price_per_gram: number;
  reason: string;
  // ISO 8601
  expires_at?: string;
};
