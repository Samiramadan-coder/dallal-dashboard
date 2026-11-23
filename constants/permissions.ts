import type { PermissionActionOf, PermissionModuleName } from "@/types/roles";

type ActionList = {
  readonly [M in PermissionModuleName]: readonly PermissionActionOf<M>[];
};

// Each section's actions at runtime, used to build `can` objects (see
// requirePageAccess). Mirrors PermissionMap in types/roles.ts, which mirrors
// GET /api/v1/admin/roles → `matrix`: add new actions in both places.
// A typo or a missing section is a type error
export const PERMISSION_ACTIONS: ActionList = {
  countries: ["view", "create", "edit", "delete"],
  admins: ["view", "create", "edit", "delete"],
  roles: ["view", "create", "edit", "delete"],
  audit_logs: ["view"],
  catalog: ["view", "create", "edit", "delete"],
  users: ["view", "edit", "sanction"],
  verifications: ["view", "review", "view_documents"],
  stores: ["view", "edit", "suspend"],
  listings: ["view", "review", "edit"],
  reports: ["view", "handle"],
  metal_prices: ["view", "edit"],
  subscriptions: ["view", "edit"],
  revenue: ["view"],
  marketing: ["view", "edit"],
  notifications: ["view", "send"],
  support: ["view", "reply"],
  settings: ["view", "edit"],
};
