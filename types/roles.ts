import type { CurrentAdmin } from "./admin";
import type { Country } from "./countries";
import type { Pagination } from "./shared";

// GET /api/v1/admin/admins returns the same shape as /auth/me
export type Admin = CurrentAdmin;

export type AdminsResponse = {
  data: {
    data: Admin[];
    meta: Pagination;
  };
};

// An admin row with its countries already matched to the country list
export type AdminRow = Admin & {
  resolvedCountries: Country[];
};
