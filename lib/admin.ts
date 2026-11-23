import "server-only";

import { cache } from "react";
import { api } from "@/lib/api/client";
import type { Country } from "@/types/countries";
import type { AdminCountry, CurrentAdmin } from "@/types/admin";

// The signed-in admin. Cached per request, so layouts and pages can all
// call it. A 401 redirects to sign-in (see lib/api/client)
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin> => {
  const response = await api.get<{ data: CurrentAdmin }>(
    "/api/v1/admin/auth/me",
  );
  return response.data;
});

function matches(country: Country, assigned: AdminCountry): boolean {
  if (typeof assigned === "string") return assigned === country.code;
  return assigned.id === country.id || assigned.code === country.code;
}

// Every country on the platform. Cached per request
export const getAllCountries = cache(async (): Promise<Country[]> => {
  const response = await api.get<{ data: { data: Country[] } }>(
    "/api/v1/admin/countries",
  );
  return response.data.data;
});

// The countries an admin works on, picked from `countries`.
// `all_countries` admins get every country that is live on the platform
export function resolveAdminCountries(
  admin: Pick<CurrentAdmin, "all_countries" | "countries">,
  countries: Country[],
): Country[] {
  if (admin.all_countries) {
    return countries.filter((country) => country.status === "live");
  }
  return countries.filter((country) =>
    admin.countries.some((assigned) => matches(country, assigned)),
  );
}

// The countries the signed-in admin works on
export const getAdminCountries = cache(
  async (admin: CurrentAdmin): Promise<Country[]> =>
    resolveAdminCountries(admin, await getAllCountries()),
);
