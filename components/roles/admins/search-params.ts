import {
  createLoader,
  parseAsString,
  parseAsStringLiteral,
  type inferParserType,
} from "nuqs/server";

import {
  paginationQuery,
  paginationSearchParams,
  sortQuery,
  sortSearchParams,
} from "@/components/common/data-table/search-params";

// The admins table's URL: ?status=active&search=sara&page=2&sort=name&dir=desc.
// Shared by the server page (loader), the client filters (useQueryStates)
// and the export route, so all three read the URL the same way

export const ADMIN_STATUS_TABS = ["all", "active", "inactive"] as const;
export type AdminStatusTab = (typeof ADMIN_STATUS_TABS)[number];

export const adminsSearchParams = {
  status: parseAsStringLiteral(ADMIN_STATUS_TABS).withDefault("all"),
  search: parseAsString.withDefault(""),
  ...paginationSearchParams,
  ...sortSearchParams,
};

export type AdminsSearchParams = inferParserType<typeof adminsSearchParams>;

// Spread into every filter change: new filters start from page 1
export const RESET_PAGE = { page: null } as const;

export const loadAdminsSearchParams = createLoader(adminsSearchParams);

// URL state → GET /api/v1/admin/admins query. "all" and an empty search
// send nothing.
// TODO(backend): `status` and `search` are placeholder names (the API may
// want e.g. is_active=1/0 and q); rename them here once agreed
export function adminsApiQuery(params: AdminsSearchParams) {
  const search = params.search.trim();
  return {
    status: params.status === "all" ? undefined : params.status,
    search: search || undefined,
    ...paginationQuery(params),
    ...sortQuery(params),
  };
}
