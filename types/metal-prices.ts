import z from "zod";
import type { Country } from "./countries";
import type { ApiResponse, Pagination, T } from "./shared";

export type Metal = "gold" | "silver" | "platinum";

// The only values GET /prices accepts in ?status=. There is no "held" one
// yet, see fetchHeldPrices in lib/metal-prices
export type PriceStatus = "published" | "rejected" | "superseded";

// One price per gram for a market, as returned by GET /api/v1/admin/prices.
// The endpoint keeps every price ever fetched, newest first
export type MetalPrice = {
  id: number;
  country: { id: number; code: string };
  metal: Metal;
  // The grade: karat for gold ("24", "21", …), fineness for silver and
  // platinum ("999", "925")
  karat: string;
  // Localized by Accept-Language, e.g. "Gold 21K"
  label: string;
  // The price the site shows, margin included
  price_per_gram: {
    amount: number;
    currency: string;
    // Formatted by the API in its own locale style, e.g. "16.444 ر.ع"
    formatted: string;
  };
  // Move from the price it replaced, in percent; null for the first one
  change_pct: number | null;
  // World price in USD per troy ounce the row was computed from
  spot_usd_oz: number;
  // "provider" for the feed
  source: string;
  status: PriceStatus;
  status_label: string;
  // ISO 8601
  priced_at: string;
  // Admin id and time, once someone approved or rejected the price
  reviewed_by: number | null;
  reviewed_at: string | null;
};

export type MetalPricesResponse = ApiResponse<{
  data: MetalPrice[];
  meta: Pagination;
}>;

// A held price with its market resolved from the countries list, which
// carries the flag and both names the price row lacks
export type HeldPriceRow = Omit<MetalPrice, "country"> & {
  country: Country | null;
};

// One country's price source, from GET /api/v1/admin/metal-sources
export type MetalSource = {
  id: number;
  // `name` is localized by Accept-Language
  country: { id: number; code: string; name: string; currency: string };
  // "global": world price + country margin
  type: string;
  type_label: string;
  reference_name: string | null;
  // Keyed "<metal>_<karat>", e.g. "gold_24". The API doesn't say whether
  // a value is a percent or a fixed amount; the dashboard reads it as a
  // percent (the only kind seen so far)
  margins: Record<string, number>;
  // ISO 8601; null if the feed never answered
  last_fetched_at: string | null;
  last_error: string | null;
  // Manual prices in force; shape unknown until one is set
  overrides: unknown[];
};

export type MetalSourcesResponse = ApiResponse<{
  // One flag for every market, not per country
  market_open: boolean;
  // How often the feed is polled
  refresh_minutes: number;
  // A feed move above this percent is held for review
  guard_percent: number;
  sources: MetalSource[];
}>;

// One grade's live price, split into feed price and margin. Built by
// getCountryPrices; amounts are per gram until the page scales them
export type GradePrice = {
  metal: Metal;
  karat: string;
  label: string;
  currency: string;
  // Feed price before the margin; worked back from the site price, since
  // the API only returns the final one
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
  // ISO 8601; left out for no expiry
  expires_at?: string;
};
