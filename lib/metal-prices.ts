import "server-only";

import { cache } from "react";

import { api } from "@/lib/api/client";
import { getAllCountries } from "@/lib/admin";
import type {
  HeldPriceRow,
  MetalPrice,
  MetalSourcesResponse,
} from "@/types/metal-prices";

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
