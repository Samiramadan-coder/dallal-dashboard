import Image from "next/image";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";
import type { AuditLogRow } from "@/types/audit-log";
import type { Locale, Pagination } from "@/types/shared";

// "two_factor_enabled" → "Two factor enabled", for actions without a label
function humanize(slug: string): string {
  const text = slug.replace(/[._-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The record's name from its snapshot: a localized label, or a plain name
function subjectName(log: AuditLogRow, locale: Locale): string | null {
  const snapshot = log.after ?? log.before;
  if (!snapshot) return null;

  const label = snapshot.label;
  if (label && typeof label === "object") {
    const localized = (label as Record<string, unknown>)[locale];
    if (typeof localized === "string" && localized) return localized;
  }

  return typeof snapshot.name === "string" && snapshot.name
    ? snapshot.name
    : null;
}

export default function DataPreview({
  logs,
  pagination,
}: {
  logs: AuditLogRow[];
  pagination: Pagination;
}) {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const t = useTranslations("AuditLog");

  const columns: DataTableColumn[] = [
    { label: t("table.when") },
    { label: t("table.admin") },
    { label: t("table.action") },
    { label: t("table.target") },
    { label: t("table.country") },
    { label: t("table.ip") },
  ];

  const actionLabel = (action: string) => {
    const key = `actions.${action}`;
    return t.has(key) ? t(key) : humanize(action);
  };

  const subjectLabel = (type: string) => {
    const key = `subjects.${type}`;
    return t.has(key) ? t(key) : humanize(type);
  };

  return (
    <DataTable
      columns={columns}
      countUnit={t("title")}
      rowsCount={pagination.total}
      pagination={pagination}
    >
      {logs.length === 0 && (
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={columns.length}
            className="py-10! text-center text-muted-foreground"
          >
            {t("empty")}
          </TableCell>
        </TableRow>
      )}

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
          </TableRow>
        );
      })}
    </DataTable>
  );
}
