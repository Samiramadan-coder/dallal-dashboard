import { getLocale } from "next-intl/server";
import { getAllCountries, getCurrentAdmin } from "@/lib/admin";
import { getAdmins, getRoles } from "@/lib/roles";
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
  const [{ page }, locale] = await Promise.all([searchParams, getLocale()]);

  // getRoles and getAllCountries are cached per request, so getAdmins
  // reuses these results instead of fetching again
  const [{ admins, pagination }, { roles }, countries, me] = await Promise.all([
    getAdmins(Math.max(1, Number(page) || 1), locale),
    getRoles(),
    getAllCountries(),
    // Cached per request; the layout already fetched it
    getCurrentAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <CreateAdmin roles={roles} countries={countries} />
      </div>

      <DataPreview
        admins={admins}
        pagination={pagination}
        currentAdminId={me.id}
      />
    </div>
  );
}
