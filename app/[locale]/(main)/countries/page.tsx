import { http } from "@/lib/http";
import { Country } from "@/types/countries";
import { Pagination } from "@/types/shared";
import DataPreview from "@/components/countries/data-preview";
import { requirePageAccess } from "@/lib/permissions";

type SearchParams = {
  page?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Also checked by the layout. The admin is cached, so this costs no extra
  // request; it gives the page the action flags for the table
  const [{ can }, { page }] = await Promise.all([
    requirePageAccess("countries"),
    searchParams,
  ]);

  const { data, ok } = await http.get<{
    data: {
      data: Country[];
      meta: Pagination;
    };
  }>("/api/v1/admin/countries", {
    params: {
      page: page ?? "1",
    },
    next: {
      tags: ["countries"],
    },
  });

  // Caught by error.tsx
  if (!ok) {
    throw new Error("Failed to fetch countries");
  }

  return (
    <DataPreview
      countries={data.data.data}
      pagination={data.data.meta}
      can={can}
    />
  );
}
