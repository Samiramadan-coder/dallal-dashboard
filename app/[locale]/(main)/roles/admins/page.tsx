import { getLocale } from "next-intl/server";
import { getAllCountries } from "@/lib/admin";
import { getAdmins, getRoles } from "@/lib/roles";
import { requirePageAccess } from "@/lib/permissions";
import CreateAdmin from "@/components/roles/admins/create-admin";
import DataPreview from "@/components/roles/admins/data-preview";

type SearchParams = {
  page?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 403 without admins.view (the layout already required roles.view).
  // `admin` is the signed-in one, cached since the layout fetched it
  const { admin: me, can } = await requirePageAccess("admins");

  const [{ page }, locale] = await Promise.all([searchParams, getLocale()]);

  // getRoles and getAllCountries are cached per request, so getAdmins
  // reuses these results instead of fetching again
  const [{ admins, pagination }, { roles }, countries] = await Promise.all([
    getAdmins(Math.max(1, Number(page) || 1), locale),
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

      <DataPreview
        admins={admins}
        pagination={pagination}
        currentAdminId={me.id}
        can={can}
      />
    </div>
  );
}
