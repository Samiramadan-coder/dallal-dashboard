import type { Country } from "./countries";
import type { ApiResponse, Pagination } from "./shared";

// One recorded admin action, as returned by GET /api/v1/admin/audit-logs
export type AuditLog = {
  id: number;
  admin: {
    id: number;
    name: string;
    email: string;
  } | null;
  // "<subject>.<verb>", e.g. "admin.created", "role.updated"
  action: string;
  // "admin" | "role" | …
  subject_type: string;
  subject_id: number | null;
  // Snapshots of the record around the change; null when it didn't exist
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  // null: the action isn't tied to one country
  country_id: number | null;
  ip: string | null;
  // ISO 8601
  created_at: string;
};

export type AuditLogsResponse = ApiResponse<{
  data: AuditLog[];
  meta: Pagination;
}>;

// An entry ready to render: country matched to the country list
export type AuditLogRow = AuditLog & {
  country: Country | null;
};

// Filters GET /api/v1/admin/audit-logs takes. All optional; the page reads
// them from the URL (?admin_id=1&action=role.updated&from=2026-11-01)
export type AuditLogFilters = {
  admin_id?: number;
  // A full action ("role.updated"); the API matches it partially
  action?: string;
  subject_type?: string;
  subject_id?: number;
  country_id?: number;
  // YYYY-MM-DD, both days included
  from?: string;
  to?: string;
};

// An admin to pick in the "Admin" filter
export type AuditLogAdminOption = {
  id: number;
  name: string;
};
