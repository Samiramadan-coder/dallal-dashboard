// Weight units a price can be shown in, in grams. The API prices per gram
export const PRICE_UNITS = {
  gram: 1,
  tola: 11.6638038,
  ounce: 31.1034768,
  kilo: 1000,
} as const;

export type PriceUnit = keyof typeof PRICE_UNITS;

export function isPriceUnit(value: unknown): value is PriceUnit {
  return typeof value === "string" && value in PRICE_UNITS;
}

// The API's countries carry no time zone; these are the markets priced so far
export const MARKET_TIME_ZONES: Record<string, string> = {
  AE: "Asia/Dubai",
  SA: "Asia/Riyadh",
  KW: "Asia/Kuwait",
  QA: "Asia/Qatar",
  BH: "Asia/Bahrain",
  OM: "Asia/Muscat",
};
