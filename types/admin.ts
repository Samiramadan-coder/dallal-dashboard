import type { Permission, RoleName } from "./roles";

// A country the admin manages. The API returns an empty list when
// `all_countries` is true, so the exact item shape isn't confirmed yet
export type AdminCountry =
  string | { id?: number; code?: string; name?: string };

// GET /api/v1/admin/auth/me
export type CurrentAdmin = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: RoleName[];
  permissions: Permission[];
  countries: AdminCountry[];
  all_countries: boolean;
  two_factor_enabled: boolean;
  last_login_at: string | null;
};
