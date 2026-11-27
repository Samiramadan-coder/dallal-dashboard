import "server-only";

import { cache } from "react";
import { api, type QueryParams } from "@/lib/api/client";
import { getAllCountries, resolveAdminCountries } from "@/lib/admin";
import type { AdminRow, AdminsResponse, RolesResponse } from "@/types/roles";
import type { Locale } from "@/types/shared";

// Roles with their permissions, plus the permission matrix. Cached per
// request, so both roles pages can call it
export const getRoles = cache(async () => {
  const response = await api.get<RolesResponse>("/api/v1/admin/roles", {
    next: { tags: ["roles"] },
  });
  return response.data;
});

// "verification_officer" → "Verification Officer", for roles the API
// didn't return a label for
function humanize(slug: string): string {
  return slug
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// One page of admins, with countries and role labels resolved. `query` is
// the table's filters, page and sort (see components/roles/admins/search-params)
export async function getAdmins(query: QueryParams, locale: Locale) {
  const [response, countries, { roles }] = await Promise.all([
    api.get<AdminsResponse>("/api/v1/admin/admins", {
      query,
      next: { tags: ["admins"] },
    }),
    getAllCountries(),
    getRoles(),
  ]);

  const labels = new Map(roles.map((role) => [role.name, role.label[locale]]));

  const admins: AdminRow[] = response.data.data.map((admin) => ({
    ...admin,
    resolvedCountries: resolveAdminCountries(admin, countries),
    roleLabels: admin.roles.map((name) => labels.get(name) ?? humanize(name)),
  }));

  return { admins, pagination: response.data.meta };
}
