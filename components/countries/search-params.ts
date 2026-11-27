import { createLoader, type inferParserType } from "nuqs/server";

import {
  paginationQuery,
  paginationSearchParams,
  sortQuery,
  sortSearchParams,
} from "@/components/common/data-table/search-params";

// The countries table's URL: ?page=2&per_page=50&sort=code. No filters yet
export const countriesSearchParams = {
  ...paginationSearchParams,
  ...sortSearchParams,
};

export type CountriesSearchParams = inferParserType<
  typeof countriesSearchParams
>;

export const loadCountriesSearchParams = createLoader(countriesSearchParams);

// URL state → GET /api/v1/admin/countries query
export function countriesApiQuery(params: CountriesSearchParams) {
  return { ...paginationQuery(params), ...sortQuery(params) };
}
