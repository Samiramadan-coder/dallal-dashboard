import Image from "next/image";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";
import EmptyState from "@/components/reusable/empty-state";
import { ScrollTextIcon } from "lucide-react";
import type { AuditLogRow } from "@/types/audit-log";
import type { Locale, Pagination } from "@/types/shared";
import AuditLogDetailsDrawer from "./details-drawer";
import { subjectName, useAuditLabels } from "./use-audit-labels";

export default function DataPreview({
  logs,
  pagination,
  filtered,
}: {
  logs: AuditLogRow[];
  pagination: Pagination;
  // Some filter is on: the empty state says nothing matched
  filtered: boolean;
}) {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const t = useTranslations("AuditLog");
  const { actionLabel, subjectLabel } = useAuditLabels();

  const columns: DataTableColumn[] = [
    { label: t("table.when") },
    { label: t("table.admin") },
    { label: t("table.action") },
    { label: t("table.target") },
    { label: t("table.country") },
    { label: t("table.ip") },
    { label: t("table.details"), className: "w-12 text-center" },
  ];

  return (
    <DataTable
      columns={columns}
      countUnit={t("title")}
      rowsCount={pagination.total}
      pagination={pagination}
      empty={
        filtered ? (
          <EmptyState variant="filtered" title={t("emptyFiltered")} />
        ) : (
          <EmptyState icon={ScrollTextIcon} title={t("empty")} />
        )
      }
    >
      {logs.map((log) => {
        const name = subjectName(log, locale);

        return (
          <TableRow key={log.id}>
            <TableCell className="whitespace-nowrap">
              {format.dateTime(new Date(log.created_at), {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>

            <TableCell>
              {log.admin ? (
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">
                    {log.admin.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {log.admin.email}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span>{actionLabel(log.action)}</span>
                {log.reason && (
                  <span className="text-[11px] text-muted-foreground">
                    {log.reason}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-secondary">
                  {subjectLabel(log.subject_type)}
                  {log.subject_id !== null && ` #${log.subject_id}`}
                </span>
                {name && (
                  <span className="text-[11px] text-muted-foreground">
                    {name}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell>
              {log.country ? (
                <span
                  title={log.country.name[locale]}
                  className="flex items-center gap-1.5"
                >
                  <Image
                    src={log.country.flag}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-5 rounded-xs object-cover"
                  />
                  {log.country.code}
                </span>
              ) : (
                t("allCountries")
              )}
            </TableCell>

            <TableCell className="font-mono text-xs">{log.ip ?? "—"}</TableCell>

            <TableCell className="text-center">
              <AuditLogDetailsDrawer log={log} />
            </TableCell>
          </TableRow>
        );
      })}
    </DataTable>
  );
}
