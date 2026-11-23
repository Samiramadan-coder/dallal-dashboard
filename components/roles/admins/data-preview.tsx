import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";
import type { AdminRow } from "@/types/roles";
import type { Pagination } from "@/types/shared";
import { cn } from "@/lib/utils";
import AdminActions from "./admin-actions";

export default function DataPreview({
  admins,
  pagination,
  currentAdminId,
}: {
  admins: AdminRow[];
  pagination: Pagination;
  // The signed-in admin can't deactivate or delete their own account here
  currentAdminId: number;
}) {
  const locale = useLocale();
  const t = useTranslations("Roles.admins");

  const columns: DataTableColumn[] = [
    { label: t("table.admin") },
    { label: t("table.email") },
    { label: t("table.role") },
    { label: t("table.countries") },
    { label: t("table.status") },
    { label: t("table.actions"), className: "w-24" },
  ];

  return (
    <DataTable
      columns={columns}
      countUnit={t("title")}
      rowsCount={pagination.total}
      pagination={pagination}
    >
      {admins.map((admin) => (
        <TableRow key={admin.id}>
          <TableCell>
            <span className="font-semibold text-foreground">{admin.name}</span>
          </TableCell>

          <TableCell>{admin.email}</TableCell>

          <TableCell>
            {admin.roleLabels.join(locale === "ar" ? "، " : ", ")}
          </TableCell>

          <TableCell>
            {admin.resolvedCountries.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                {admin.resolvedCountries.map((country) => (
                  <span
                    key={country.id}
                    title={country.name[locale]}
                    className="flex items-center gap-1.5"
                  >
                    <Image
                      src={country.flag}
                      alt=""
                      width={20}
                      height={14}
                      className="h-3.5 w-5 rounded-xs object-cover"
                    />
                    {country.code}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{t("noCountries")}</span>
            )}
          </TableCell>

          <TableCell>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                admin.is_active
                  ? "bg-secondary/10 text-secondary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  admin.is_active ? "bg-secondary" : "bg-muted-foreground/60",
                )}
              />
              {admin.is_active ? t("status.active") : t("status.inactive")}
            </span>
          </TableCell>

          {/* Button row: trimmed padding keeps it as tall as text rows */}
          <TableCell className="py-[9px]!">
            {admin.id === currentAdminId ? (
              <span className="text-xs text-muted-foreground">{t("you")}</span>
            ) : (
              <AdminActions admin={admin} />
            )}
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  );
}
