import { Suspense } from "react";
import { http } from "@/lib/http";
import { LoaderIcon } from "lucide-react";
import { Country } from "@/types/countries";
import { Pagination } from "@/types/shared";
import CreateEdit from "@/components/countries/create-edit";
import DataPreview from "@/components/countries/data-preview";

type SearchParams = {
  page?: number;
};

async function GetCountries({
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

  if (!ok) {
    throw new Error("Failed to fetch countries");
  }

  console.log(data);

  return <DataPreview countries={data.data.data} pagination={data.data.meta} />;
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateEdit />
      </div>

      <Suspense fallback={<LoaderIcon className="animate-spin" />}>
        <GetCountries searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
