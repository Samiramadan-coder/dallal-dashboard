import { http } from "@/lib/http";
import { Country } from "@/types/countries";
import { Pagination } from "@/types/shared";
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

  return <DataPreview countries={data.data.data} pagination={data.data.meta} />;
}
