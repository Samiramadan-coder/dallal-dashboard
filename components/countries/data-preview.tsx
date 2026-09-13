"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import CreateEdit from "./create-edit";
import EditBtn from "../reusable/edit-btn";
import { Country } from "@/types/countries";
import { Pagination } from "@/types/shared";
import { useLocale, useTranslations } from "next-intl";
import DeleteBtn from "../reusable/delete-btn";
import { deleteCountry } from "@/lib/countries";
import { TableCell, TableRow } from "../ui/table";
import { DataTable, DataTableColumn } from "../reusable/data-table";

export default function DataPreview({
  countries,
  pagination,
}: {
  countries: Country[];
  pagination: Pagination;
}) {
  const locale = useLocale();
  const t = useTranslations("Countries");
  const [loadingDelete, setLoadingDelete] = useState(false);

  const columns: DataTableColumn[] = [
    { label: t("Table.name") },
    { label: t("Table.code") },
    { label: t("Table.dialCode") },
    { label: t("Table.actions") },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        countUnit={t("Title")}
        rowsCount={pagination.total}
        pagination={pagination}
      >
        {countries.map((country) => (
          <TableRow key={country.code} className="border-[#f3f4f6]">
            <TableCell className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Image
                  src={country.flag}
                  alt={`${country.name} flag`}
                  width={24}
                  height={24}
                />
                <span className="font-semibold text-xs">
                  {country.name[locale]}
                </span>
              </div>
            </TableCell>
            <TableCell className="px-4 py-3">
              <span className="font-semibold text-xs">{country.code}</span>
            </TableCell>
            <TableCell className="px-4 py-3">
              <span className="font-semibold text-xs">{country.dial_code}</span>
            </TableCell>
            <TableCell className="px-4 py-3 space-x-2">
              <CreateEdit country={country} trigger={<EditBtn />} />
              <DeleteBtn
                loading={loadingDelete}
                onDelete={async () => {
                  setLoadingDelete(true);
                  const result = await deleteCountry(country.id);
                  setLoadingDelete(false);

                  if (result.success) {
                    toast.success(result.message);
                    return;
                  }

                  if (result.message) {
                    toast.error(result.message);
                    return;
                  }

                  toast.error(t("errorOccurred"));
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </>
  );
}
