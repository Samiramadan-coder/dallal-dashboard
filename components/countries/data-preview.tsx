"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  GlobeIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { deleteCountry } from "@/lib/actions/countries";
import type { Country } from "@/types/countries";
import type { Can } from "@/types/roles";
import type { Locale, Pagination } from "@/types/shared";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/data-table/data-table";
import type { DataTableRowAction } from "@/components/common/data-table/types";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import EmptyState from "@/components/reusable/empty-state";
import StatusBadge from "@/components/reusable/status-badge";
import CitiesPanel from "./cities-panel";
import CreateEdit from "./create-edit";

export default function DataPreview({
  countries,
  meta,
  can,
}: {
  countries: Country[];
  meta: Pagination;
  // Hides actions the admin may not use; the API rejects them anyway
  can: Can<"countries">;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Countries");
  const tCommon = useTranslations("Common");

  // Same pattern as the admins table: a fresh form per opening, kept
  // mounted while it closes
  const [editing, setEditing] = useState<{ country: Country; opening: number }>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState<Country>();

  const openEdit = useCallback((country: Country) => {
    setEditing((current) => ({
      country,
      opening: (current?.opening ?? 0) + 1,
    }));
    setEditOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Country>[]>(
    () => [
      {
        id: "name",
        accessorFn: (country) => country.name[locale],
        header: t("Table.name"),
        enableSorting: true,
        enableHiding: false,
        meta: { className: "min-w-48" },
        cell: ({ row, table }) => {
          const expanded = row.getIsExpanded();
          return (
            <span className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-expanded={expanded}
                aria-controls={table.options.meta?.expandedPanelId?.(row.id)}
                aria-label={expanded ? t("Cities.hide") : t("Cities.show")}
                onClick={row.getToggleExpandedHandler()}
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
                src={row.original.flag}
                alt=""
                width={20}
                height={14}
                className="h-3.5 w-5 rounded-xs object-cover"
              />
              <span className="font-semibold text-foreground">
                {row.original.name[locale]}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "code",
        header: t("Table.code"),
        enableSorting: true,
      },
      {
        accessorKey: "dial_code",
        header: t("Table.dialCode"),
        cell: ({ row }) => (
          <span dir="ltr" className="tabular-nums">
            {row.original.dial_code}
          </span>
        ),
      },
      {
        accessorKey: "cities_count",
        header: t("Table.cities"),
        enableSorting: true,
        meta: { className: "tabular-nums" },
        cell: ({ row }) => row.original.cities_count ?? "—",
      },
      {
        id: "status",
        accessorFn: (country) =>
          country.status ?? (country.is_active ? "active" : "inactive"),
        header: t("Table.status"),
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
    ],
    [t, locale],
  );

  const rowActions = useMemo(() => {
    const actions: DataTableRowAction<Country>[] = [];
    if (can.edit) {
      // Editing includes turning the country on or off
      actions.push({
        label: tCommon("Edit"),
        icon: PencilIcon,
        onSelect: openEdit,
      });
    }
    if (can.delete) {
      actions.push({
        label: tCommon("Delete"),
        icon: Trash2Icon,
        variant: "destructive",
        separatorBefore: true,
        onSelect: setDeleting,
      });
    }
    return actions;
  }, [can.edit, can.delete, tCommon, openEdit]);

  async function remove(reason: string) {
    if (!deleting) return false;
    const result = await deleteCountry(deleting.id, reason);

    if (!result.ok) {
      toast.error(result.message || t("errorOccurred"));
      return false;
    }

    toast.success(result.data.message || tCommon("DeletedSuccessfully"));
  }

  return (
    <>
      <DataTable
        data={countries}
        meta={meta}
        columns={columns}
        getRowId={(country) => String(country.id)}
        rowActions={rowActions}
        renderExpanded={(country) => (
          <div className="ps-8">
            <CitiesPanel
              countryId={country.id}
              expectedCount={country.cities_count}
              canEdit={can.edit}
            />
          </div>
        )}
        emptyState={
          <EmptyState
            icon={GlobeIcon}
            title={t("empty.title")}
            description={t("empty.description")}
          />
        }
      />

      {editing && (
        <CreateEdit
          key={`${editing.country.id}-${editing.opening}`}
          country={editing.country}
          trigger={null}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      <ConfirmDialog
        open={deleting !== undefined}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        tone="destructive"
        icon={Trash2Icon}
        title={tCommon("DeleteTitle")}
        description={
          deleting
            ? t("deleteDescription", { name: deleting.name[locale] })
            : tCommon("DeleteConfirmation")
        }
        confirmLabel={tCommon("Delete")}
        onConfirm={remove}
      />
    </>
  );
}
