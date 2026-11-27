import type { RowData } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match TanStack's signature
  interface ColumnMeta<TData extends RowData, TValue> {
    // Name in the "Columns" menu; falls back to a string `header`, then the id
    label?: string;
    // Applied to the header and body cells of the column
    className?: string;
    // Name sent to the API when sorting by this column; defaults to the id
    sortKey?: string;
    // Explanation behind an ⓘ after the header (see reusable/info-tip)
    tip?: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- must match TanStack's signature
  interface TableMeta<TData extends RowData> {
    // DOM id of a row's expanded panel, for aria-controls on its toggle
    expandedPanelId?: (rowId: string) => string;
  }
}

export type DataTableRowAction<T> = {
  label: string;
  icon?: LucideIcon;
  onSelect: (row: T) => void;
  variant?: "default" | "destructive";
  // Hide the action for some rows (e.g. "Delete" on your own account)
  hidden?: (row: T) => boolean;
  // Separator above it, unless it ends up the first visible item
  separatorBefore?: boolean;
};

// The API's pagination meta (types/shared Pagination has these and more)
export type DataTableMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
