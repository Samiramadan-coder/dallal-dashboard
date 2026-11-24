import type { Country } from "./countries";
import type { ApiResponse, Pagination } from "./shared";

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
  // Move from the price it replaces, in percent
  change_pct: number;
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
