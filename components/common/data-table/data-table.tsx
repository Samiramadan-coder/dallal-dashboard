"use client";

import "./types";

import {
  Fragment,
  useId,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  EllipsisIcon,
  Settings2Icon,
  XIcon,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InfoTip from "@/components/reusable/info-tip";
import ExportButton from "./export-button";
import PaginationBar from "./pagination-bar";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  tableSearchParams,
} from "./search-params";
import type { DataTableMeta, DataTableRowAction } from "./types";

const SELECT_ID = "__select";
const ACTIONS_ID = "__actions";

// Clicks on these inside a row are the control's own, not "open the row"
const INTERACTIVE =
  "a, button, input, select, textarea, label, [role=menuitem], [role=menuitemcheckbox], [role=checkbox]";

// Opaque versions of the translucent muted tints: the sticky actions cell
// sits over scrolled content, so a see-through background would show it
const HEADER_BG = "bg-[color-mix(in_oklab,var(--muted)_70%,var(--card))]";
const ROW_HOVER_BG =
  "hover:bg-[color-mix(in_oklab,var(--muted)_55%,var(--card))]";
const ROW_SELECTED_BG =
  "data-[state=selected]:bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))]";

// Soft shadow on the sticky column's inner side; flipped for RTL
const STICKY_END_SHADOW =
  "shadow-[-8px_0_8px_-8px_color-mix(in_oklab,var(--foreground)_18%,transparent)] rtl:shadow-[8px_0_8px_-8px_color-mix(in_oklab,var(--foreground)_18%,transparent)]";

type Density = "comfortable" | "compact";

const CELL_PADDING: Record<Density, string> = {
  comfortable: "py-3.5",
  compact: "py-2",
};

// Same rule TanStack uses for a column's id
function defId<T>(def: ColumnDef<T, unknown>): string | undefined {
  if (def.id) return def.id;
  if ("accessorKey" in def && def.accessorKey !== undefined) {
    return String(def.accessorKey).replaceAll(".", "_");
  }
  return typeof def.header === "string" ? def.header : undefined;
}

function columnLabel<T>(column: Column<T, unknown>): string {
  const { meta, header } = column.columnDef;
  return meta?.label ?? (typeof header === "string" ? header : column.id);
}

export type DataTableProps<T> = {
  data: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack's own ColumnDef<T, any> convention: each column has its own value type
  columns: ColumnDef<T, any>[];
  getRowId?: (row: T, index: number) => string;
  // Above the toolbar, e.g. status tabs
  header?: ReactNode;
  // Start of the toolbar: search, filters. The table never filters on its
  // own; the caller does (URL → server)
  toolbar?: ReactNode;
  // App path of a file download (the basePath is added for you)
  exportUrl?: string;
  rowActions?: DataTableRowAction<T>[];
  selectable?: boolean;
  bulkActions?: (selected: T[], clearSelection: () => void) => ReactNode;
  // Column ids hidden until the admin turns them on
  defaultHidden?: string[];
  // Given → server mode: `data` is one page and page / per_page / sort live
  // in the URL. Omitted → client mode: the table pages and sorts `data`
  meta?: DataTableMeta;
  pageSizeOptions?: number[];
  // Client mode only; server mode reads per_page from the URL
  defaultPageSize?: number;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  // Panel under a row, opened with row.toggleExpanded() from a cell (use
  // table.options.meta.expandedPanelId(row.id) for its aria-controls).
  // Stays mounted once opened, so reopening doesn't refetch its data
  renderExpanded?: (row: T) => ReactNode;
  // false for short fixed lists: no pagination bar, every row shows
  paginated?: boolean;
  // false hides the ⚙ menu (density, columns), e.g. for small tables
  settings?: boolean;
  className?: string;
};

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  header,
  toolbar,
  exportUrl,
  rowActions,
  selectable = false,
  bulkActions,
  defaultHidden,
  meta,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  emptyState,
  onRowClick,
  renderExpanded,
  paginated = true,
  settings = true,
  className,
}: DataTableProps<T>) {
  const t = useTranslations("DataTable");
  const serverMode = meta !== undefined;
  const tableId = useId();

  // Server mode: every change is a new URL, which re-renders the server
  // page with the next slice of data. The transition keeps the old rows on
  // screen (dimmed) until the new ones arrive, instead of a blank table
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useQueryStates(tableSearchParams, {
    shallow: false,
    startTransition,
  });

  const [density, setDensity] = useState<Density>("comfortable");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => Object.fromEntries((defaultHidden ?? []).map((id) => [id, false])),
  );
  const [clientSorting, setClientSorting] = useState<SortingState>([]);
  const [clientPagination, setClientPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // A new page (or a refresh after an edit) drops the selection: those
  // rows may be gone, and hidden selected rows would make bulk actions lie
  const [expanded, setExpanded] = useState<ExpandedState>({});
  // Rows opened at least once keep their panel mounted (hidden when closed)
  const [mountedPanels, setMountedPanels] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  function onExpandedChange(updater: Updater<ExpandedState>) {
    const next = typeof updater === "function" ? updater(expanded) : updater;
    setExpanded(next);
    if (next === true) return;
    const opened = Object.keys(next).filter((id) => next[id]);
    if (opened.some((id) => !mountedPanels.has(id))) {
      setMountedPanels(new Set([...mountedPanels, ...opened]));
    }
  }

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectionData, setSelectionData] = useState(data);
  if (selectionData !== data) {
    setSelectionData(data);
    setRowSelection({});
  }

  const actions = useMemo(() => rowActions ?? [], [rowActions]);

  const allColumns = useMemo(() => {
    const result: ColumnDef<T, unknown>[] = [];

    if (selectable) {
      result.push({
        id: SELECT_ID,
        enableHiding: false,
        enableSorting: false,
        meta: { className: "w-10 pe-0" },
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(value === true)
            }
            aria-label={t("selectAll")}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(value === true)}
            aria-label={t("selectRow")}
          />
        ),
      });
    }

    result.push(...(columns as ColumnDef<T, unknown>[]));

    if (actions.length > 0) {
      result.push({
        id: ACTIONS_ID,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">{t("actions")}</span>,
        meta: { className: "w-12 text-center" },
        cell: ({ row }) => (
          <RowActionsMenu row={row.original} actions={actions} />
        ),
      });
    }

    return result;
  }, [columns, selectable, actions, t]);

  // Server sorting is whatever the URL says, matched back to a column
  const serverSorting = useMemo<SortingState>(() => {
    if (!query.sort) return [];
    const def = allColumns.find(
      (column) => (column.meta?.sortKey ?? defId(column)) === query.sort,
    );
    const id = def && defId(def);
    return id ? [{ id, desc: query.dir === "desc" }] : [];
  }, [allColumns, query.sort, query.dir]);

  const sorting = serverMode ? serverSorting : clientSorting;

  function onSortingChange(updater: Updater<SortingState>) {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (!serverMode) {
      setClientSorting(next);
      return;
    }

    const first = next[0];
    if (!first) {
      void setQuery({ sort: null, dir: null, page: null });
      return;
    }
    const def = allColumns.find((column) => defId(column) === first.id);
    void setQuery({
      sort: def?.meta?.sortKey ?? first.id,
      dir: first.desc ? "desc" : "asc",
      // A new order starts from the top
      page: null,
    });
  }

  const pagination: PaginationState = serverMode
    ? { pageIndex: meta.current_page - 1, pageSize: meta.per_page }
    : clientPagination;

  // TanStack returns new functions on every render by design, which the
  // React Compiler can't memoize safely; this component doesn't rely on it
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, columnVisibility, rowSelection, pagination, expanded },
    meta: {
      expandedPanelId: (rowId) => `${tableId}-${rowId}-expanded`,
    },
    getRowCanExpand: () => renderExpanded !== undefined,
    onExpandedChange,
    // Expanding a row mustn't jump back to page 1 in client mode
    autoResetExpanded: false,
    // Sorting is opt-in per column (`enableSorting: true`), since in server
    // mode it only works for fields the API can sort by
    defaultColumn: { enableSorting: false, sortDescFirst: false },
    enableRowSelection: selectable,
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: serverMode ? undefined : setClientPagination,
    manualPagination: serverMode,
    manualSorting: serverMode,
    pageCount: serverMode ? meta.last_page : undefined,
    autoResetPageIndex: !serverMode,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverMode ? undefined : getSortedRowModel(),
    getPaginationRowModel:
      serverMode || !paginated ? undefined : getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && !column.id.startsWith("__"));
  const selectedRows = table.getSelectedRowModel().rows;
  const clearSelection = () => table.resetRowSelection();

  const total = serverMode ? meta.total : data.length;
  const page = pagination.pageIndex + 1;
  const pageCount = serverMode ? meta.last_page : table.getPageCount();

  function changePage(next: number) {
    if (serverMode) void setQuery({ page: next === 1 ? null : next });
    else table.setPageIndex(next - 1);
  }

  function changePageSize(next: number) {
    if (serverMode) void setQuery({ per_page: next, page: null });
    else setClientPagination({ pageIndex: 0, pageSize: next });
  }

  function handleRowClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    row: T,
  ) {
    if (!onRowClick) return;
    const target = event.target as Element;
    // React bubbles clicks from portals (the row menu, dialogs it opens)
    // up to the row, though they aren't inside it in the DOM
    if (!event.currentTarget.contains(target)) return;
    if (target.closest(INTERACTIVE)) return;
    onRowClick(row);
  }

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      {header && <div className="border-b border-border">{header}</div>}

      {/* Toolbar, or the bulk bar while rows are selected */}
      {selectedRows.length > 0 ? (
        <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))] px-4 py-2.5">
          <span
            className="text-sm font-semibold text-foreground"
            aria-live="polite"
          >
            {t("selected", { count: selectedRows.length })}
          </span>
          <span aria-hidden className="h-5 w-px bg-border" />
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {bulkActions?.(
              selectedRows.map((row) => row.original),
              clearSelection,
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
          >
            <XIcon />
            {t("clearSelection")}
          </Button>
        </div>
      ) : toolbar || exportUrl || settings ? (
        <div className="flex min-h-14 flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {toolbar}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {exportUrl && <ExportButton url={exportUrl} />}
            {settings && (
              <TableSettings
                density={density}
                onDensityChange={setDensity}
                columns={hideableColumns}
              />
            )}
          </div>
        </div>
      ) : null}

      <Table
        aria-busy={isPending || undefined}
        className={cn(
          "min-w-max border-separate border-spacing-0 transition-opacity",
          isPending && "opacity-60",
        )}
      >
        <TableHeader className="[&_tr]:border-0">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="border-0 hover:bg-transparent">
              {group.headers.map((headerCell) => {
                const column = headerCell.column;
                const sorted = column.getIsSorted();
                const sticky = column.id === ACTIONS_ID;

                return (
                  <TableHead
                    key={headerCell.id}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : column.getCanSort()
                            ? "none"
                            : undefined
                    }
                    className={cn(
                      "h-10 border-b border-border px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                      HEADER_BG,
                      sticky && ["sticky inset-e-0 z-10", STICKY_END_SHADOW],
                      column.columnDef.meta?.className,
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {headerCell.isPlaceholder ? null : column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={column.getToggleSortingHandler()}
                          className="-mx-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          {flexRender(
                            column.columnDef.header,
                            headerCell.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ArrowUpIcon className="size-3" aria-hidden />
                          ) : sorted === "desc" ? (
                            <ArrowDownIcon className="size-3" aria-hidden />
                          ) : (
                            <ArrowUpDownIcon
                              className="size-3 opacity-50"
                              aria-hidden
                            />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          column.columnDef.header,
                          headerCell.getContext(),
                        )
                      )}
                      {column.columnDef.meta?.tip && (
                        <InfoTip
                          content={column.columnDef.meta.tip}
                          className="size-3.5 [&_svg]:size-3"
                        />
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={visibleColumns.length}
                className="p-0 whitespace-normal"
              >
                {emptyState ?? (
                  <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {t("noResults")}
                  </p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={
                    onRowClick
                      ? (event) => handleRowClick(event, row.original)
                      : undefined
                  }
                  className={cn(
                    "group/row border-0 bg-card",
                    ROW_HOVER_BG,
                    ROW_SELECTED_BG,
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const sticky = cell.column.id === ACTIONS_ID;

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "border-b border-border/60 px-4 text-[13px] text-foreground/80 group-last/row:border-b-0",
                          CELL_PADDING[density],
                          // Selected rows: 2px accent bar on the start edge
                          index === 0 &&
                            "relative group-data-[state=selected]/row:before:absolute group-data-[state=selected]/row:before:inset-y-0 group-data-[state=selected]/row:before:inset-s-0 group-data-[state=selected]/row:before:w-0.5 group-data-[state=selected]/row:before:bg-primary",
                          sticky && [
                            "sticky inset-e-0 z-10 bg-inherit py-0",
                            STICKY_END_SHADOW,
                          ],
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {renderExpanded && mountedPanels.has(row.id) && (
                  <TableRow
                    id={`${tableId}-${row.id}-expanded`}
                    hidden={!row.getIsExpanded()}
                    className={cn("border-0 hover:bg-transparent", HEADER_BG)}
                  >
                    <TableCell
                      colSpan={visibleColumns.length}
                      className="border-b border-border/60 px-4 py-3 whitespace-normal group-last/row:border-b-0"
                    >
                      {renderExpanded(row.original)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>

      {paginated && total > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          pageSize={pagination.pageSize}
          total={total}
          pageSizeOptions={pageSizeOptions}
          onPageChange={changePage}
          onPageSizeChange={changePageSize}
        />
      )}
    </div>
  );
}

// The ⋯ menu of one row; renders nothing if every action is hidden for it
function RowActionsMenu<T>({
  row,
  actions,
}: {
  row: T;
  actions: DataTableRowAction<T>[];
}) {
  const t = useTranslations("DataTable");
  const visible = actions.filter((action) => !action.hidden?.(row));
  if (visible.length === 0) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("rowActions")}
          className="text-muted-foreground hover:text-foreground"
        >
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {visible.map((action, index) => {
          const Icon = action.icon;
          return (
            <Fragment key={action.label}>
              {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.variant}
                onSelect={() => action.onSelect(row)}
              >
                {Icon && <Icon />}
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ⚙ menu: row density and which columns show
function TableSettings<T>({
  density,
  onDensityChange,
  columns,
}: {
  density: Density;
  onDensityChange: (density: Density) => void;
  columns: Column<T, unknown>[];
}) {
  const t = useTranslations("DataTable");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={t("tableSettings")}
          title={t("tableSettings")}
        >
          <Settings2Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>{t("density")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={density}
          onValueChange={(value) => onDensityChange(value as Density)}
        >
          {(["comfortable", "compact"] as const).map((value) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              // Stay open, so both choices can be compared
              onSelect={(event) => event.preventDefault()}
            >
              {t(value)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        {columns.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("columns")}</DropdownMenuLabel>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(value)}
                onSelect={(event) => event.preventDefault()}
              >
                {columnLabel(column)}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
