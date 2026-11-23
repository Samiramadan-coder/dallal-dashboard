"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import CreateEdit from "./create-edit";
import CitiesPanel from "./cities-panel";
import EditBtn from "../reusable/edit-btn";
import { Country } from "@/types/countries";
import type { Can } from "@/types/roles";
import { Locale, Pagination } from "@/types/shared";
import { useLocale, useTranslations } from "next-intl";
import DeleteBtn from "../reusable/delete-btn";
import { deleteCountry } from "@/lib/actions/countries";
import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";
import { DataTable, DataTableColumn } from "../reusable/data-table";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("Countries");

  // Nothing allowed: drop the column instead of leaving it empty
  const hasActions = can.edit || can.delete;

  const columns: DataTableColumn[] = [
    { label: t("Table.name") },
    { label: t("Table.code") },
    { label: t("Table.dialCode") },
    { label: t("Table.cities") },
    ...(hasActions ? [{ label: t("Table.actions") }] : []),
  ];

  return (
    <DataTable
      columns={columns}
      countUnit={t("Title")}
      rowsCount={pagination.total}
      pagination={pagination}
    >
      {countries.map((country) => (
        <CountryRow
          key={country.id}
          country={country}
          can={can}
          columnsCount={columns.length}
        />
      ))}
    </DataTable>
  );
}

function CountryRow({
  country,
  can,
  columnsCount,
}: {
  country: Country;
  can: Can<"countries">;
  columnsCount: number;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Countries");
  const tCommon = useTranslations("Common");
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Keeps the panel mounted after the first open, so closing and reopening
  // doesn't refetch (and later keeps cities added or deleted in place)
  const [opened, setOpened] = useState(false);

  const hasActions = can.edit || can.delete;
  const panelId = `country-${country.id}-cities`;

  function toggle() {
    setExpanded((value) => !value);
    setOpened(true);
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={expanded ? t("Cities.hide") : t("Cities.show")}
              onClick={toggle}
              className="-ms-1.5 text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "transition-transform",
                  // Points toward the text when closed, down when open
                  !expanded && "-rotate-90 rtl:rotate-90",
                )}
              />
            </Button>
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
        <TableCell className="tabular-nums">
          {country.cities_count ?? "—"}
        </TableCell>
        {/* Trimmed padding keeps the button row as tall as text rows */}
        {hasActions && (
          <TableCell className="py-2.25!">
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

                    if (!result.ok) {
                      toast.error(result.message || t("errorOccurred"));
                      return;
                    }

                    toast.success(
                      result.data.message || tCommon("DeletedSuccessfully"),
                    );
                  }}
                />
              )}
            </div>
          </TableCell>
        )}
      </TableRow>

      {opened && (
        <TableRow
          id={panelId}
          hidden={!expanded}
          className="bg-muted/30 hover:bg-muted/30"
        >
          <TableCell colSpan={columnsCount} className="ps-12!">
            <CitiesPanel
              countryId={country.id}
              expectedCount={country.cities_count}
              canEdit={can.edit}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
