import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";
import type { AdminRow } from "@/types/roles";
import type { Locale, Pagination } from "@/types/shared";

export default function DataPreview({
  admins,
  pagination,
}: {
  admins: AdminRow[];
  pagination: Pagination;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Roles.admins");
  const tRoles = useTranslations("layout.header.roles");

  const columns: DataTableColumn[] = [
    { label: t("table.admin") },
    { label: t("table.email") },
    { label: t("table.role") },
    { label: t("table.countries") },
  ];

  // Falls back to the raw key for roles that have no translation yet
  const roleLabel = (role: string) =>
    tRoles.has(role as never) ? tRoles(role as never) : role;

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
            <span className="font-semibold text-foreground">
              {admin.name}
            </span>
          </TableCell>

          <TableCell>
            {admin.email}
          </TableCell>

          <TableCell>
            {admin.roles.map(roleLabel).join(locale === "ar" ? "، " : ", ")}
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
              <span className="text-muted-foreground">
                {t("noCountries")}
              </span>
            )}
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  );
}
