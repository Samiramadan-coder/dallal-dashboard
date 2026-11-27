import type { SearchParams } from "nuqs/server";
import { getLocale } from "next-intl/server";

import { getAllCountries } from "@/lib/admin";
import { getAdmins, getRoles } from "@/lib/roles";
import { requirePageAccess } from "@/lib/permissions";
import CreateAdmin from "@/components/roles/admins/create-admin";
import AdminsTable from "@/components/roles/admins/admins-table";
import {
  adminsApiQuery,
  loadAdminsSearchParams,
} from "@/components/roles/admins/search-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 403 without admins.view (the layout already required roles.view).
  // `admin` is the signed-in one, cached since the layout fetched it
  const { admin: me, can } = await requirePageAccess("admins");

  const [params, locale] = await Promise.all([
    loadAdminsSearchParams(searchParams),
    getLocale(),
  ]);

  // getRoles and getAllCountries are cached per request, so getAdmins
  // reuses these results instead of fetching again
  const [{ admins, pagination }, { roles }, countries] = await Promise.all([
    getAdmins(adminsApiQuery(params), locale),
    getRoles(),
    getAllCountries(),
  ]);

  return (
    <div className="flex flex-col gap-3">
      {can.create && (
        <div className="flex justify-end">
          <CreateAdmin roles={roles} countries={countries} />
        </div>
      )}

      <AdminsTable
        admins={admins}
        meta={pagination}
        currentAdminId={me.id}
        roles={roles}
        countries={countries}
        can={can}
      />
    </div>
  );
}
