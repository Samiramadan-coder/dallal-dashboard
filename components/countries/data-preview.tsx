"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import CreateEdit from "./create-edit";
import EditBtn from "../reusable/edit-btn";
import { Country } from "@/types/countries";
import type { Can } from "@/types/roles";
import { Locale, Pagination } from "@/types/shared";
import { useLocale, useTranslations } from "next-intl";
import DeleteBtn from "../reusable/delete-btn";
import { deleteCountry } from "@/lib/countries";
import { TableCell, TableRow } from "../ui/table";
import { DataTable, DataTableColumn } from "../reusable/data-table";

export default function DataPreview({
  countries,
  pagination,
  can,
}: {
  countries: Country[];
  pagination: Pagination;
  // Hides buttons the admin may not use; the API rejects them anyway
  can: Can<"countries">;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Countries");
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Nothing allowed: drop the column instead of leaving it empty
  const hasActions = can.edit || can.delete;

  const columns: DataTableColumn[] = [
    { label: t("Table.name") },
    { label: t("Table.code") },
    { label: t("Table.dialCode") },
    ...(hasActions ? [{ label: t("Table.actions") }] : []),
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
          <TableRow key={country.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Image
                  src={country.flag}
                  alt=""
                  width={20}
                  height={14}
                  className="h-3.5 w-5 rounded-xs object-cover"
                />
                <span className="font-semibold text-foreground">
                  {country.name[locale]}
                </span>
              </div>
            </TableCell>
            <TableCell>{country.code}</TableCell>
            <TableCell dir="ltr" className="text-start tabular-nums">
              {country.dial_code}
            </TableCell>
            {/* Trimmed padding keeps the button row as tall as text rows */}
            {hasActions && (
              <TableCell className="py-[9px]!">
                <div className="flex items-center gap-1">
                  {/* Editing includes turning the country on or off */}
                  {can.edit && (
                    <CreateEdit country={country} trigger={<EditBtn />} />
                  )}
                  {can.delete && (
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

                        toast.error(result.message || t("errorOccurred"));
                      }}
                    />
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </DataTable>
    </>
  );
}
