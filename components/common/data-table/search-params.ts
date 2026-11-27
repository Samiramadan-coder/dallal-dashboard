import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

// URL state shared by every server-mode table. Imported from "nuqs/server"
// so the server page (createLoader) and the client table (useQueryStates)
// parse the URL with the very same parsers

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];
// Hand-edited ?per_page=100000 must not reach the API
const MAX_PAGE_SIZE = 100;

export const paginationSearchParams = {
  page: parseAsInteger.withDefault(1),
  per_page: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
};

export const loadPaginationSearchParams = createLoader(paginationSearchParams);

export function paginationQuery(p: { page: number; per_page: number }) {
  return {
    page: Math.max(1, p.page),
    per_page: Math.min(MAX_PAGE_SIZE, Math.max(1, p.per_page)),
  };
}

// Sorting. The URL keeps short, stable names (?sort=name&dir=desc) so
// shared links survive a backend rename; only API_SORT_PARAMS below maps
// them to what the API expects
export const SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export const sortSearchParams = {
  // The column's sort key (ColumnMeta.sortKey, else the column id)
  sort: parseAsString,
  dir: parseAsStringLiteral(SORT_DIRECTIONS).withDefault("asc"),
};

// TODO(backend): placeholder names until the API's sort params are agreed.
// Change them here only; every table goes through sortQuery()
export const API_SORT_PARAMS = { by: "sort_by", dir: "sort_dir" } as const;

export function sortQuery(s: {
  sort: string | null;
  dir: SortDirection;
}): Record<string, string> {
  if (!s.sort) return {};
  return { [API_SORT_PARAMS.by]: s.sort, [API_SORT_PARAMS.dir]: s.dir };
}

// Pagination + sorting: what DataTable itself reads and writes in server mode
export const tableSearchParams = {
  ...paginationSearchParams,
  ...sortSearchParams,
};
