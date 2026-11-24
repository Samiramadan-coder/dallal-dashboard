import "server-only";

import type {
  GradePrice,
  HeldPriceRow,
  Metal,
  MetalPrice,
  MetalPricesResponse,
  MetalSource,
  MetalSourcesResponse,
} from "@/types/metal-prices";

import { cache } from "react";
import { api } from "@/lib/api/client";
import { getAllCountries } from "@/lib/admin";

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

const METAL_ORDER: Metal[] = ["gold", "silver", "platinum"];

// The live price of every grade in one country, with the margin from its
// source. /prices keeps old ones too, newest first, so the first row per
// grade is the live one
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
        baseAmount: siteAmount / (1 + margin / 100),
        margin,
        siteAmount,
      };
    })
    .sort(
      (a, b) =>
        METAL_ORDER.indexOf(a.metal) - METAL_ORDER.indexOf(b.metal) ||
        Number(b.karat) - Number(a.karat),
    );
}

// No successful fetch within one refresh interval: the site warns visitors
// that prices may be delayed
export function isSourceDelayed(
  source: MetalSource,
  refreshMinutes: number,
): boolean {
  if (!source.last_fetched_at) return true;
  const age = Date.now() - new Date(source.last_fetched_at).getTime();
  return age > refreshMinutes * 60_000;
}
