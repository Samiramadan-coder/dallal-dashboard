import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useTranslations } from "next-intl";
import { Pagination } from "@/types/shared";
import PaginationTemplate from "./pagination-template";

export type DataTableColumn = {
  label: string;
  className?: string;
};

interface DataTableProps {
  columns: DataTableColumn[];
  rowsCount: number;
  countUnit: string;
  children: React.ReactNode;
  onCheckboxChange?: (checked: boolean) => void;
  pagination?: Pagination;
}

// Cell padding lives here so every table lines up the same way; rows only
// style their content
export function DataTable({
  columns,
  rowsCount,
  countUnit,
  children,
  onCheckboxChange,
  pagination,
}: DataTableProps) {
  const t = useTranslations("Common");
  const hasPages = pagination !== undefined && pagination.last_page > 1;

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <Table
        className={cn(
          "[&_td]:px-4 [&_td]:py-3.5 [&_td]:text-[13px] [&_td]:text-foreground/70 [&_th]:px-4",
          onCheckboxChange &&
            "[&_td:first-child]:w-8 [&_td:first-child]:pe-0 [&_th:first-child]:w-8 [&_th:first-child]:pe-0",
        )}
      >
        <TableHeader className="bg-muted/60">
          <TableRow className="border-border/60 hover:bg-transparent">
            {onCheckboxChange && (
              <TableHead>
                <Checkbox onCheckedChange={onCheckboxChange} />
              </TableHead>
            )}

            {columns.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-9 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase",
                  column.className,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="[&_tr]:border-border/50">{children}</TableBody>
      </Table>

      {hasPages && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {t("Showing")}{" "}
            <span className="font-semibold text-foreground">
              {pagination.from}
            </span>{" "}
            {t("To")}{" "}
            <span className="font-semibold text-foreground">
              {pagination.to}
            </span>{" "}
            {t("Of")}{" "}
            <span className="font-semibold text-foreground">
              {pagination.total || rowsCount}
            </span>{" "}
            {countUnit}
          </p>

          <PaginationTemplate
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
          />
        </div>
      )}
    </div>
  );
}
