import { getLocale } from "next-intl/server";
import { getAdmins } from "@/lib/roles";
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

  const { admins, pagination } = await getAdmins(
    Math.max(1, Number(page) || 1),
    locale,
  );

  return <DataPreview admins={admins} pagination={pagination} />;
}
