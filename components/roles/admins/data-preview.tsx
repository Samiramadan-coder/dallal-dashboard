import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";
import type { Country } from "@/types/countries";
import type { AdminRow, Can, Role } from "@/types/roles";
import type { Pagination } from "@/types/shared";
import { UsersIcon } from "lucide-react";
import EmptyState from "@/components/reusable/empty-state";
import StatusBadge from "@/components/reusable/status-badge";
import AdminActions from "./admin-actions";

export default function DataPreview({
  admins,
  pagination,
  currentAdminId,
  roles,
  countries,
  can,
}: {
  admins: AdminRow[];
  pagination: Pagination;
  // The signed-in admin can't deactivate or delete their own account here
  currentAdminId: number;
  // Options for the edit dialog
  roles: Role[];
  countries: Country[];
  // Hides buttons the admin may not use; the API rejects them anyway
  can: Can<"admins">;
}) {
  const locale = useLocale();
  const t = useTranslations("Roles.admins");

  // Nothing allowed: drop the column instead of leaving it empty
  const hasActions = can.edit || can.delete;

  const columns: DataTableColumn[] = [
    { label: t("table.admin") },
    { label: t("table.email") },
    { label: t("table.role") },
    { label: t("table.countries") },
    { label: t("table.status") },
    ...(hasActions ? [{ label: t("table.actions"), className: "w-24" }] : []),
  ];

  return (
    <DataTable
      columns={columns}
      countUnit={t("title")}
      rowsCount={pagination.total}
      pagination={pagination}
      empty={
        <EmptyState
          icon={UsersIcon}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      }
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
            <StatusBadge status={admin.is_active ? "active" : "inactive"} />
          </TableCell>

          {/* Button row: trimmed padding keeps it as tall as text rows */}
          {hasActions && (
            <TableCell className="py-2.25!">
              {admin.id === currentAdminId ? (
                <span className="text-xs text-muted-foreground">
                  {t("you")}
                </span>
              ) : (
                <AdminActions
                  admin={admin}
                  roles={roles}
                  countries={countries}
                  can={can}
                />
              )}
            </TableCell>
          )}
        </TableRow>
      ))}
    </DataTable>
  );
}
