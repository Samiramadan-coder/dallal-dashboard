import "server-only";

import { api, type QueryParams } from "@/lib/api/client";
import type { Country } from "@/types/countries";
import type { ApiResponse, Pagination } from "@/types/shared";

// One page of countries for the countries table; `query` is its page and
// sort (see components/countries/search-params). Mutations in
// lib/actions/countries.ts and lib/actions/cities.ts refresh the tag
export async function getCountries(query: QueryParams) {
  const response = await api.get<
    ApiResponse<{ data: Country[]; meta: Pagination }>
  >("/api/v1/admin/countries", {
    query,
    next: { tags: ["countries"] },
  });

  return { countries: response.data.data, pagination: response.data.meta };
}
