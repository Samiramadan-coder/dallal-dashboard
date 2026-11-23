import DataPreview from "@/components/roles/admins/data-preview";
import { api } from "@/lib/api/client";
import { getAllCountries, resolveAdminCountries } from "@/lib/admin";
import type { AdminRow, AdminsResponse } from "@/types/roles";

type SearchParams = {
  page?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page } = await searchParams;

  const [response, countries] = await Promise.all([
    api.get<AdminsResponse>("/api/v1/admin/admins", {
      query: { page: page ?? 1 },
      next: { tags: ["admins"] },
    }),
    getAllCountries(),
  ]);

  const admins: AdminRow[] = response.data.data.map((admin) => ({
    ...admin,
    resolvedCountries: resolveAdminCountries(admin, countries),
  }));

  return <DataPreview admins={admins} pagination={response.data.meta} />;
}
