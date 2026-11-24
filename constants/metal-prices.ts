import type { Metal } from "@/types/metal-prices";

// Display order of the metal tables (and of the grades inside lib)
export const METALS: Metal[] = ["gold", "silver", "platinum"];

// The gold grades shown as big cards at the top of the prices page: the
// two a visitor sees first on the site
export const HEADLINE_GOLD_KARATS = ["24", "22"];

// Weight units a price can be shown in, as grams per unit. The API only
// prices per gram, so the page multiplies by these. "ounce" is the troy
// ounce metals are traded in, not the everyday 28.35 g one
export const PRICE_UNITS = {
  gram: 1,
  tola: 11.6638038,
  ounce: 31.1034768,
  kilo: 1000,
} as const;

export type PriceUnit = keyof typeof PRICE_UNITS;

// Guards ?unit= from the URL, which can be anything
export function isPriceUnit(value: unknown): value is PriceUnit {
  return typeof value === "string" && value in PRICE_UNITS;
}

// The API's countries carry no time zone, so the market clock uses this map.
// Add a country here when it gets a price source; until then its clock
// falls back to the viewer's own time zone
export const MARKET_TIME_ZONES: Record<string, string> = {
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  KW: "Asia/Kuwait",
  QA: "Asia/Qatar",
  BH: "Asia/Bahrain",
  OM: "Asia/Muscat",
};
