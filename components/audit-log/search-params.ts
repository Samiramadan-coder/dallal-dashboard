import {
  createLoader,
  parseAsInteger,
  parseAsString,
  type inferParserType,
} from "nuqs/server";

import {
  paginationQuery,
  paginationSearchParams,
  sortQuery,
  sortSearchParams,
} from "@/components/common/data-table/search-params";
import type { AuditLogFilters } from "@/types/audit-log";

// The audit log's URL: ?admin_id=1&action=role.updated&from=2026-11-01&page=2.
// Shared by the server page (loader) and the client filters

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z_]+$/;
const ACTION = /^[a-z_]+(\.[a-z_]+)?$/;

export const auditLogSearchParams = {
  admin_id: parseAsInteger,
  subject_type: parseAsString,
  action: parseAsString,
  // No control sets it; it comes from links such as a record's "History"
  subject_id: parseAsInteger,
  country_id: parseAsInteger,
  from: parseAsString,
  to: parseAsString,
  ...paginationSearchParams,
  ...sortSearchParams,
};

export type AuditLogSearchParams = inferParserType<typeof auditLogSearchParams>;

// The filters alone (no page or sort), all set to null: "Clear filters"
export const CLEAR_FILTERS = {
  admin_id: null,
  subject_type: null,
  action: null,
  subject_id: null,
  country_id: null,
  from: null,
  to: null,
  page: null,
} as const;

export const RESET_PAGE = { page: null } as const;

export const loadAuditLogSearchParams = createLoader(auditLogSearchParams);

const positive = (value: number | null) =>
  value !== null && Number.isInteger(value) && value > 0 ? value : undefined;

const matching = (value: string | null, pattern: RegExp) =>
  value && pattern.test(value) ? value : undefined;

// The filters with anything malformed dropped, so a hand-edited link shows
// an unfiltered log instead of the API's 422
export function auditLogFilters(params: AuditLogSearchParams): AuditLogFilters {
  return {
    admin_id: positive(params.admin_id),
    action: matching(params.action, ACTION),
    subject_type: matching(params.subject_type, SLUG),
    subject_id: positive(params.subject_id),
    country_id: positive(params.country_id),
    from: matching(params.from, DATE),
    to: matching(params.to, DATE),
  };
}

export function hasAuditLogFilters(filters: AuditLogFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined);
}

// URL state → GET /api/v1/admin/audit-logs query
export function auditLogApiQuery(params: AuditLogSearchParams) {
  const filters = auditLogFilters(params);
  return {
    ...filters,
    // The API reads a bare date as midnight, which would leave the chosen
    // day out
    to: filters.to && `${filters.to} 23:59:59`,
    ...paginationQuery(params),
    ...sortQuery(params),
  };
}
