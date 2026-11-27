"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon, ScrollTextIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import type { AuditLogRow } from "@/types/audit-log";
import type { Locale, Pagination } from "@/types/shared";
import DataTable from "@/components/common/data-table/data-table";
import type { DataTableRowAction } from "@/components/common/data-table/types";
import EmptyState from "@/components/reusable/empty-state";
import AuditLogDetailsDrawer from "./details-drawer";
import { subjectName, useAuditLabels } from "./use-audit-labels";

export default function DataPreview({
  logs,
  meta,
  filtered,
  toolbar,
}: {
  logs: AuditLogRow[];
  meta: Pagination;
  // Some filter is on: the empty state says nothing matched
  filtered: boolean;
  // The filters (built on the server, which knows the admin's permissions)
  toolbar: React.ReactNode;
}) {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const t = useTranslations("AuditLog");
  const tCommon = useTranslations("Common");
  const { actionLabel, subjectLabel } = useAuditLabels();

  // Kept after closing, so the drawer can animate out with its content
  const [viewing, setViewing] = useState<AuditLogRow>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns = useMemo<ColumnDef<AuditLogRow>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: t("table.when"),
        // Newest first is the API's default; this flips it
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {format.dateTime(new Date(row.original.created_at), {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        id: "admin",
        header: t("table.admin"),
        meta: { className: "min-w-40" },
        cell: ({ row }) =>
          row.original.admin ? (
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">
                {row.original.admin.name}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {row.original.admin.email}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "action",
        header: t("table.action"),
        meta: { className: "min-w-48 max-w-80 whitespace-normal" },
        cell: ({ row }) => (
          <span className="flex flex-col gap-0.5">
            <span>{actionLabel(row.original.action)}</span>
            {row.original.reason && (
              <span className="line-clamp-2 text-[11px] text-muted-foreground">
                {row.original.reason}
              </span>
            )}
          </span>
        ),
      },
      {
        id: "target",
        header: t("table.target"),
        cell: ({ row }) => {
          const log = row.original;
          const name = subjectName(log, locale);
          return (
            <span className="flex flex-col gap-0.5">
              <span className="font-mono text-xs text-secondary">
                {subjectLabel(log.subject_type)}
                {log.subject_id !== null && ` #${log.subject_id}`}
              </span>
              {name && (
                <span className="text-[11px] text-muted-foreground">
                  {name}
                </span>
              )}
            </span>
          );
        },
      },
      {
        id: "country",
        header: t("table.country"),
        cell: ({ row }) =>
          row.original.country ? (
            <span
              title={row.original.country.name[locale]}
              className="flex items-center gap-1.5"
            >
              <Image
                src={row.original.country.flag}
                alt=""
                width={20}
                height={14}
                className="h-3.5 w-5 rounded-xs object-cover"
              />
              {row.original.country.code}
            </span>
          ) : (
            t("allCountries")
          ),
      },
      {
        accessorKey: "ip",
        header: t("table.ip"),
        cell: ({ row }) => (
          <span dir="ltr" className="font-mono text-xs">
            {row.original.ip ?? "—"}
          </span>
        ),
      },
    ],
    [t, format, locale, actionLabel, subjectLabel],
  );

  const open = (log: AuditLogRow) => {
    setViewing(log);
    setDrawerOpen(true);
  };

  const rowActions = useMemo<DataTableRowAction<AuditLogRow>[]>(
    () => [
      {
        label: tCommon("drawer.open"),
        icon: EyeIcon,
        onSelect: (log) => {
          setViewing(log);
          setDrawerOpen(true);
        },
      },
    ],
    [tCommon],
  );

  return (
    <>
      <DataTable
        data={logs}
        meta={meta}
        columns={columns}
        getRowId={(log) => String(log.id)}
        toolbar={toolbar}
        rowActions={rowActions}
        onRowClick={open}
        emptyState={
          filtered ? (
            <EmptyState variant="filtered" title={t("emptyFiltered")} />
          ) : (
            <EmptyState icon={ScrollTextIcon} title={t("empty")} />
          )
        }
      />

      {viewing && (
        <AuditLogDetailsDrawer
          key={viewing.id}
          log={viewing}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}
    </>
  );
}
