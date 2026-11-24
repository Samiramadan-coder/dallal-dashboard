import "server-only";

import type {
  GradePrice,
  HeldPriceRow,
  MetalPrice,
  MetalPricesResponse,
  MetalSource,
  MetalSourcesResponse,
} from "@/types/metal-prices";

import { cache } from "react";
import { api } from "@/lib/api/client";
import { getAllCountries } from "@/lib/admin";
import { METALS, PRICE_UNITS, type PriceUnit } from "@/constants/metal-prices";

// Feed settings and one source per priced country. Cached per request:
// both the prices and held-for-review pages read it
export const getMetalSources = cache(async () => {
  const response = await api.get<MetalSourcesResponse>(
    "/api/v1/admin/metal-sources",
    { next: { tags: ["metal-sources"] } },
  );
  return response.data;
});

// Feed moves above the guard percent, waiting for an admin to approve or
// reject them.
// TODO: the API has no listing for held prices yet: /prices only accepts
// status published | rejected | superseded. Fetch them here once it does
async function fetchHeldPrices(): Promise<MetalPrice[]> {
  return [];
}

export async function getHeldPrices(): Promise<HeldPriceRow[]> {
  const [prices, countries] = await Promise.all([
    fetchHeldPrices(),
    getAllCountries(),
  ]);

  const byId = new Map(countries.map((country) => [country.id, country]));

  return prices.map((price) => ({
    ...price,
    country: byId.get(price.country.id) ?? null,
  }));
}

// The live price of every grade in one country, per gram, with the margin
// from its source.
// /prices keeps every past price too, newest first, so the first row seen
// for a grade is the live one. 100 rows covers the 8 grades many times over
export async function getCountryPrices(
  source: MetalSource,
): Promise<GradePrice[]> {
  const response = await api.get<MetalPricesResponse>("/api/v1/admin/prices", {
    query: {
      country_id: source.country.id,
      status: "published",
      per_page: 100,
    },
    next: { tags: ["metal-prices"] },
  });

  const latest = new Map<string, MetalPrice>();
  for (const price of response.data.data) {
    // Same key format as source.margins
    const key = `${price.metal}_${price.karat}`;
    if (!latest.has(key)) latest.set(key, price);
  }

  return [...latest.entries()]
    .map(([key, price]) => {
      const margin = source.margins[key] ?? 0;
      const siteAmount = price.price_per_gram.amount;

      return {
        metal: price.metal,
        karat: price.karat,
        label: price.label,
        currency: price.price_per_gram.currency,
        // site = base × (1 + margin%), so base = site ÷ (1 + margin%)
        baseAmount: siteAmount / (1 + margin / 100),
        margin,
        siteAmount,
      };
    })
    .sort(
      (a, b) =>
        METALS.indexOf(a.metal) - METALS.indexOf(b.metal) ||
        // Purest grade first: 24K before 22K, 999 before 925
        Number(b.karat) - Number(a.karat),
    );
}

// The same prices in another weight unit
export function toUnit(prices: GradePrice[], unit: PriceUnit): GradePrice[] {
  const grams = PRICE_UNITS[unit];

  return prices.map((price) => ({
    ...price,
    baseAmount: price.baseAmount * grams,
    siteAmount: price.siteAmount * grams,
  }));
}

// True when the feed hasn't answered within one refresh interval. The site
// then tells visitors that prices may be delayed. Kept out of components:
// Date.now() during render breaks React's purity rule
export function isSourceDelayed(
  source: MetalSource,
  refreshMinutes: number,
): boolean {
  if (!source.last_fetched_at) return true;
  const age = Date.now() - new Date(source.last_fetched_at).getTime();
  return age > refreshMinutes * 60_000;
}
