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
