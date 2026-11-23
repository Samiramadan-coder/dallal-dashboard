import { getCountries } from "@/lib/countries";
import { requirePageAccess } from "@/lib/permissions";
import DataPreview from "@/components/countries/data-preview";

type SearchParams = {
  page?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page } = await searchParams;

  // Also checked by the layout; here it gives the action flags
  const [{ can }, { countries, pagination }] = await Promise.all([
    requirePageAccess("countries"),
    getCountries(Number(page) || 1),
  ]);

  return (
    <DataPreview countries={countries} pagination={pagination} can={can} />
  );
}
