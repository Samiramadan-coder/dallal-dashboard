import z from "zod";
import type { CurrentAdmin } from "./admin";
import type { Country } from "./countries";
import type { ApiResponse, Locale, Pagination, T } from "./shared";

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

// Every dashboard section and the actions it supports, as returned by
// GET /api/v1/admin/roles → `matrix`. Update this when the API adds one
type PermissionMap = {
  countries: "view" | "create" | "edit" | "delete";
  admins: "view" | "create" | "edit" | "delete";
  roles: "view" | "create" | "edit" | "delete";
  audit_logs: "view";
  catalog: "view" | "create" | "edit" | "delete";
  users: "view" | "edit" | "sanction";
  verifications: "view" | "review" | "view_documents";
  stores: "view" | "edit" | "suspend";
  listings: "view" | "review" | "edit";
  reports: "view" | "handle";
  metal_prices: "view" | "edit";
  subscriptions: "view" | "edit";
  revenue: "view";
  marketing: "view" | "edit";
  notifications: "view" | "send";
  support: "view" | "reply";
  settings: "view" | "edit";
};

// "countries" | "admins" | …
export type PermissionModuleName = keyof PermissionMap;

// The actions one section supports, e.g. PermissionActionOf<"users">
// is "view" | "edit" | "sanction"
export type PermissionActionOf<M extends PermissionModuleName> =
  PermissionMap[M];

// Any action in any section: "view" | "create" | … | "reply"
export type PermissionAction = PermissionActionOf<PermissionModuleName>;

// A full permission name, e.g. "listings.review". Only real pairs are
// allowed: "revenue.edit" is a type error
export type Permission = {
  [M in PermissionModuleName]: `${M}.${PermissionActionOf<M>}`;
}[PermissionModuleName];

// One cell of the matrix. `name` and `action` always agree with the section
export type PermissionItem<
  M extends PermissionModuleName = PermissionModuleName,
> = {
  [K in M]: {
    [A in PermissionActionOf<K>]: {
      name: `${K}.${A}`;
      action: A;
      // Localized by Accept-Language
      label: string;
    };
  }[PermissionActionOf<K>];
}[M];

// One row of the matrix: a dashboard section and the actions it supports.
// Narrowing on `module` narrows `permissions` too
export type PermissionModule = {
  [M in PermissionModuleName]: {
    module: M;
    // Localized by Accept-Language
    label: string;
    permissions: PermissionItem<M>[];
  };
}[PermissionModuleName];

/* ------------------------------------------------------------------ */
/* Roles                                                               */
/* ------------------------------------------------------------------ */

// Roles the platform ships with. They can't be edited or deleted
export type SystemRoleName =
  | "super_admin"
  | "moderator"
  | "support"
  | "verification_officer"
  | "finance"
  | "marketing";

// A system role or a custom one. `(string & {})` keeps autocomplete for
// the system names while still accepting custom slugs
export type RoleName = SystemRoleName | (string & {});

type RoleBase = {
  id: number;
  label: Record<Locale, string>;
  permissions: Permission[];
  admins_count: number;
};

// GET /api/v1/admin/roles → `roles`. Checking `is_system` narrows `name`
export type Role =
  | (RoleBase & { is_system: true; name: SystemRoleName })
  | (RoleBase & { is_system: false; name: string });

// Add-role form. The API needs at least one permission
export const roleSchema = (t: T) =>
  z.object({
    label: z.object({
      en: z.string().trim().min(1, t("Fields.LabelEn.required")),
      ar: z.string().trim().min(1, t("Fields.LabelAr.required")),
    }),
    // Slug the API stores the role under, e.g. "ksa_reviewer"
    name: z
      .string()
      .trim()
      .min(1, t("Fields.Name.required"))
      .regex(/^[a-z][a-z0-9_]*$/, t("Fields.Name.format")),
    permissions: z
      .array(z.custom<Permission>((value) => typeof value === "string"))
      .min(1, t("Fields.Permissions.required")),
  });

export type RoleFormValues = z.infer<ReturnType<typeof roleSchema>>;

// POST /api/v1/admin/roles
export type CreateRolePayload = RoleFormValues;

// PUT /api/v1/admin/roles/{id}
export type UpdateRolePayload = {
  permissions: Permission[];
};

export type RolesResponse = ApiResponse<{
  roles: Role[];
  matrix: PermissionModule[];
}>;

/* ------------------------------------------------------------------ */
/* Admins                                                              */
/* ------------------------------------------------------------------ */

// GET /api/v1/admin/admins returns the same shape as /auth/me
export type Admin = CurrentAdmin;

export type AdminsResponse = ApiResponse<{
  data: Admin[];
  meta: Pagination;
}>;

// An admin row, ready to render: countries matched to the country list and
// role slugs swapped for their labels
export type AdminRow = Admin & {
  resolvedCountries: Country[];
  roleLabels: string[];
};
