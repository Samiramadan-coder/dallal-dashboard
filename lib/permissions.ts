import "server-only";

import { forbidden } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import { navigation } from "@/constants/dashboard-layout";
import { PERMISSION_ACTIONS } from "@/constants/permissions";
import type { CurrentAdmin } from "@/types/admin";
import type { NavigationKey } from "@/types/dashboard-layout";
import type {
  Can,
  Permission,
  PermissionActionOf,
  PermissionModuleName,
} from "@/types/roles";

// The API is the real gate: it rejects anything the admin isn't allowed to
// do. These checks only decide what the dashboard shows

type PermissionCheck = Permission | readonly Permission[];

// True if `granted` has the permission, or any one of a list
export function hasPermission(
  granted: readonly Permission[],
  required: PermissionCheck,
): boolean {
  const list: readonly Permission[] =
    typeof required === "string" ? [required] : required;
  return list.some((permission) => granted.includes(permission));
}

// Stops the request with a 403 (rendered by (main)/forbidden.tsx) unless
// the signed-in admin has the permission, or any one of a list.
// Returns the admin, so callers don't fetch it again
export async function requirePermission(
  required: PermissionCheck,
): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!hasPermission(admin.permissions, required)) forbidden();
  return admin;
}

// requirePermission("<section>.view"), plus a flag for every action the
// section supports, for the page to hand to its client components:
//   const { can } = await requirePageAccess("countries");
//   {can.create && <CreateEdit />}
// Cheap to call from both a layout and its page: the admin is cached
export async function requirePageAccess<M extends PermissionModuleName>(
  section: M,
): Promise<{ admin: CurrentAdmin; can: Can<M> }> {
  const admin = await requirePermission(`${section}.view` as Permission);
  const actions: readonly PermissionActionOf<M>[] = PERMISSION_ACTIONS[section];

  const can = Object.fromEntries(
    actions.map((action) => [
      action,
      admin.permissions.includes(`${section}.${action}` as Permission),
    ]),
  ) as Can<M>;

  return { admin, can };
}

// For pages with no actions yet: the same check the sidebar uses to hide
// the page's link, so a hidden link is also a closed page. Pages without a
// permission in constants/dashboard-layout are open to every admin
export async function requirePage(key: NavigationKey): Promise<void> {
  const item = navigation().find(
    (entry) => entry.type === "link" && entry.key === key,
  );
  if (!item || item.type !== "link") {
    throw new Error(`No sidebar link with key "${key}"`);
  }
  if (item.permission) await requirePermission(item.permission);
}
