import type { SearchParams } from "nuqs/server";

import { getCountries } from "@/lib/countries";
import { requirePageAccess } from "@/lib/permissions";
import DataPreview from "@/components/countries/data-preview";
import {
  countriesApiQuery,
  loadCountriesSearchParams,
} from "@/components/countries/search-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await loadCountriesSearchParams(searchParams);

  // Also checked by the layout; here it gives the action flags
  const [{ can }, { countries, pagination }] = await Promise.all([
    requirePageAccess("countries"),
    getCountries(countriesApiQuery(params)),
  ]);

  return <DataPreview countries={countries} meta={pagination} can={can} />;
}
