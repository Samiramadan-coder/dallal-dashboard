import "server-only";

import { api } from "@/lib/api/client";
import type { Country } from "@/types/countries";
import type { ApiResponse, Pagination } from "@/types/shared";

// One page of countries for the countries table. Mutations in
// lib/actions/countries.ts and lib/actions/cities.ts refresh the tag
export async function getCountries(page: number) {
  const response = await api.get<
    ApiResponse<{ data: Country[]; meta: Pagination }>
  >("/api/v1/admin/countries", {
    query: { page },
    next: { tags: ["countries"] },
  });

  return { countries: response.data.data, pagination: response.data.meta };
}
